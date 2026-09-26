import { describe, expect, it } from 'vitest'
import { LocalContentStore, WrongPinError } from './content'
import { buildMission, describeMistake, draftFromMission, draftProblems, emptyDraft, parseQuestions, parseVocabulary, sanitizeMissions } from './custom'
import { createRng } from './random'
import { generateTasks } from './tasks'

class MemoryStorage {
  private items = new Map<string, string>()
  getItem(key: string) {
    return this.items.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.items.set(key, value)
  }
  removeItem(key: string) {
    this.items.delete(key)
  }
}

describe('parseVocabulary', () => {
  it('reads word pairs with alternatives and reports bad lines', () => {
    const { items, errorLines } = parseVocabulary('the saddle = der Sattel\n\nthe tail = der Schweif / der Schwanz\nkaputt\ngrey / gray ; grau')
    expect(items).toEqual([
      { word: 'the saddle', de: 'der Sattel' },
      { word: 'the tail', de: 'der Schweif', deAlt: ['der Schwanz'] },
      { word: 'grey', de: 'grau', wordAlt: ['gray'] },
    ])
    expect(errorLines).toEqual([4])
  })
})

describe('parseQuestions', () => {
  it('reads questions with alternative and wrong answers', () => {
    const { items, errorLines } = parseQuestions('Hauptstadt von Frankreich = Paris | Lyon | Nizza\n3 + 4 = 7 / sieben\nohne Antwort =')
    expect(items).toEqual([
      { prompt: 'Hauptstadt von Frankreich', answer: 'Paris', options: ['Paris', 'Lyon', 'Nizza'] },
      { prompt: '3 + 4', answer: '7', alternatives: ['sieben'] },
    ])
    expect(errorLines).toEqual([3])
  })
})

describe('custom missions', () => {
  it('turns a vocabulary draft into a playable mission and back', () => {
    const draft = { ...emptyDraft('french'), title: 'Vokabeltest Montag', text: 'le chat = die Katze\nle chien = der Hund\nla maison = das Haus', count: 20 }
    expect(draftProblems(draft)).toEqual([])
    const mission = buildMission(draft, () => 'custom-1')
    expect(mission).toMatchObject({ id: 'custom-1', custom: true, track: 'french', type: 'vocabulary', subtitle: '3 Vokabeln · ins Deutsche' })
    const tasks = generateTasks(mission, createRng(1))
    expect(tasks).toHaveLength(3)
    expect(tasks[0].hint).toBe('Was heißt das auf Deutsch?')
    expect(tasks.every((task) => task.choices.includes(task.answer))).toBe(true)

    const again = draftFromMission(mission)
    expect(again).toMatchObject({ id: 'custom-1', title: 'Vokabeltest Montag', kind: 'vocabulary' })
    expect(parseVocabulary(again.text).items).toEqual(parseVocabulary(draft.text).items)
    expect(describeMistake('vocab:custom-1:le chat', [mission])).toBe('le chat (Französisch)')
  })

  it('builds quiz and 1×1 missions', () => {
    const quiz = buildMission({ ...emptyDraft('german'), title: 'Fragen', kind: 'quiz', text: 'Hund = der | die | das\nKatze = die | der | das' })
    expect(generateTasks(quiz, createRng(2)).every((task) => task.choices.length === 3)).toBe(true)
    const times = buildMission({ ...emptyDraft('math'), title: 'Siebener', kind: 'multiplication', factors: [7], mode: 'input' })
    expect(times.subtitle).toBe('1×1 mit 7')
    expect(generateTasks(times, createRng(3))).toHaveLength(10)
  })

  it('explains what is missing', () => {
    expect(draftProblems({ ...emptyDraft('english'), text: 'nur eins = one' })).toEqual([
      'Bitte gib der Mission einen Namen.',
      'Bitte trage mindestens zwei Einträge ein.',
    ])
    expect(draftProblems({ ...emptyDraft('math'), title: 'x', kind: 'multiplication' })).toEqual(['Bitte wähle mindestens eine 1×1-Reihe.'])
  })

  it('drops broken missions from storage', () => {
    const good = buildMission({ ...emptyDraft('english'), title: 'Gut', text: 'a = b\nc = d' })
    expect(sanitizeMissions([good, { id: 'x' }, null, { ...good, track: 'unbekannt' }])).toEqual([good])
    expect(sanitizeMissions('kaputt')).toEqual([])
  })

  it('describes remembered mistakes', () => {
    expect(describeMistake('1x1:8x7')).toBe('8 × 7')
    expect(describeMistake('vocab:stable:horse')).toBe('horse (Englisch)')
    expect(describeMistake('quiz:artikel:Hund')).toBe('Hund (Deutsch)')
  })
})

describe('LocalContentStore', () => {
  it('needs the PIN to change missions or the PIN', async () => {
    const store = new LocalContentStore(new MemoryStorage() as unknown as Storage)
    expect(await store.load()).toEqual({ hasPin: false, missions: [] })
    await store.setPin(null, '2468')
    expect(await store.checkPin('2468')).toBe(true)
    await expect(store.saveMissions('1111', [])).rejects.toBeInstanceOf(WrongPinError)
    await expect(store.setPin(null, '1111')).rejects.toBeInstanceOf(WrongPinError)
    const mission = buildMission({ ...emptyDraft('english'), title: 'Test', text: 'a = b\nc = d' })
    await store.saveMissions('2468', [mission])
    expect((await store.load()).missions).toEqual([mission])
  })
})
