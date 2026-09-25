import { type FormEvent, useEffect, useRef, useState } from 'react'
import { isCorrectAnswer } from '../game/answers'
import { summarize } from '../game/progress'
import { createRng } from '../game/random'
import { maxTaskPoints, taskPoints } from '../game/scoring'
import { generateTasks } from '../game/tasks'
import type { Mission, MissionResult, Player, TaskResult } from '../game/types'
import { Horseshoe } from './Icons'

interface Props {
  mission: Mission
  player: Player
  onFinish: (result: MissionResult) => void
  onCancel: () => void
}

type Feedback = { kind: 'correct'; points: number } | { kind: 'retry' } | { kind: 'solution' } | null

const msSince = (start: number) => performance.now() - start

const CORRECT_PRAISE = ['Super!', 'Klasse!', 'Toll gesprungen!', 'Richtig!', 'Prima!', 'Wie ein Profi!']
const CORRECT_EMOJI = ['🎉', '⭐', '🥕', '🏆', '🌈', '🐴']

export function MissionPlay({ mission, player, onFinish, onCancel }: Props) {
  const [tasks] = useState(() => generateTasks(mission, createRng(Date.now()), player.mistakes))
  const [index, setIndex] = useState(0)
  const [attempt, setAttempt] = useState(1)
  const [input, setInput] = useState('')
  const [wrongChoices, setWrongChoices] = useState<string[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [results, setResults] = useState<TaskResult[]>([])
  const startedAt = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const task = tasks[index]
  const points = results.reduce((sum, result) => sum + result.points, 0)

  useEffect(() => {
    startedAt.current = performance.now()
  }, [index])

  useEffect(() => {
    if (feedback && feedback.kind !== 'retry') nextRef.current?.focus()
    else inputRef.current?.focus()
  }, [feedback, index])

  const check = (given: string) => {
    if (feedback && feedback.kind !== 'retry') return
    if (isCorrectAnswer(given, task.answer, task.alternatives)) {
      const earned = taskPoints(task.basePoints, attempt, msSince(startedAt.current))
      setResults([...results, { key: task.key, correct: true, points: earned }])
      setFeedback({ kind: 'correct', points: earned })
    } else if (attempt === 1) {
      setAttempt(2)
      setWrongChoices([given])
      setInput('')
      setFeedback({ kind: 'retry' })
    } else {
      setWrongChoices([...wrongChoices, given])
      setResults([...results, { key: task.key, correct: false, points: 0 }])
      setFeedback({ kind: 'solution' })
    }
  }

  const next = () => {
    if (index + 1 >= tasks.length) {
      onFinish(summarize(mission, results, tasks.reduce((sum, t) => sum + maxTaskPoints(t.basePoints), 0)))
      return
    }
    setIndex(index + 1)
    setAttempt(1)
    setInput('')
    setWrongChoices([])
    setFeedback(null)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (input.trim()) check(input)
  }

  const answered = feedback !== null && feedback.kind !== 'retry'
  const progress = (index + (answered ? 1 : 0)) / tasks.length

  const step = index + (answered ? 1 : 0)

  return (
    <main className={`screen play theme-${mission.track}`}>
      <header className="topbar">
        <button className="button ghost" onClick={onCancel}>
          ✕ Abbrechen
        </button>
        <span className="points-badge" aria-label={`${points} Hufeisen in dieser Runde`}>
          <span className="points">
            <Horseshoe /> {points}
          </span>
        </span>
      </header>

      <div className="course" aria-label={`Aufgabe ${index + 1} von ${tasks.length}`}>
        <div className="course-lane">
          <div className="course-fill" style={{ width: `calc(${progress * 100}% + 30px)` }} />
          {tasks.map((_, i) => (
            <span
              key={i}
              className={`hurdle ${i < step ? 'cleared' : ''}`}
              style={{ left: `${((i + 0.5) / tasks.length) * 100}%` }}
              aria-hidden="true"
            >
              <span className="bar" style={{ top: 4 }} />
              <span className="bar" style={{ top: 14 }} />
              <span className="post" style={{ left: 0 }} />
              <span className="post" style={{ right: 0 }} />
            </span>
          ))}
          <span className={`runner ${step > 0 ? (step % 2 ? 'jump' : 'jump-again') : ''}`} style={{ left: `${progress * 100}%` }} aria-hidden="true">
            {player.avatar}
          </span>
        </div>
        <span className="finish-flag" aria-hidden="true">
          🏁
        </span>
      </div>
      <p className="counter on-sky">
        {mission.title} · Hürde {index + 1} von {tasks.length}
      </p>

      <section className={`card task ${feedback?.kind === 'retry' ? 'shake' : ''}`} key={index}>
        <p className="task-hint">{feedback?.kind === 'retry' ? 'Fast! Versuch es noch einmal 💪' : task.hint}</p>
        <p className="task-prompt">{task.prompt}</p>

        {task.mode === 'choice' ? (
          <div className="choices">
            {task.choices.map((choice) => {
              const isAnswer = answered && choice === task.answer
              const isWrong = wrongChoices.includes(choice)
              return (
                <button
                  key={choice}
                  className={`choice ${isAnswer ? 'right' : ''} ${isWrong ? 'wrong' : ''}`}
                  disabled={answered || isWrong}
                  onClick={() => check(choice)}
                >
                  {choice}
                </button>
              )
            })}
          </div>
        ) : (
          <form className="answer-form" onSubmit={submit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={answered}
              inputMode={task.inputKind === 'number' ? 'numeric' : 'text'}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Deine Antwort"
              placeholder="?"
            />
            {!answered && (
              <button type="submit" className="button track" disabled={!input.trim()}>
                Prüfen
              </button>
            )}
          </form>
        )}
      </section>

      {feedback?.kind === 'correct' && (
        <span className="flying-points" key={`points-${index}`} aria-hidden="true">
          +{feedback.points} <Horseshoe size={40} />
        </span>
      )}

      <div role="status" aria-live="polite">
        {answered && (
          <div className={`feedback-sheet ${feedback?.kind === 'correct' ? 'good' : 'bad'}`}>
            <div className="feedback-inner">
              <span className="feedback-emoji" aria-hidden="true">
                {feedback?.kind === 'correct' ? CORRECT_EMOJI[index % CORRECT_EMOJI.length] : '🙈'}
              </span>
              <span className="feedback-text">
                {feedback?.kind === 'correct' ? (
                  <>
                    <strong>{CORRECT_PRAISE[index % CORRECT_PRAISE.length]}</strong>
                    <span>
                      +{feedback.points} Hufeisen für dich
                    </span>
                  </>
                ) : (
                  <>
                    <strong>Nicht ganz!</strong>
                    <span>
                      Richtig ist: <b>{task.answer}</b>
                    </span>
                  </>
                )}
              </span>
              <button ref={nextRef} className="button primary" onClick={next}>
                {index + 1 >= tasks.length ? 'Ins Ziel 🏁' : 'Weiter'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
