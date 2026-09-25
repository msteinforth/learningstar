import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createPgliteBackend, type Rpc } from './pglite-rpc.ts'

type Backend = Awaited<ReturnType<typeof createPgliteBackend>>

const player = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
  id,
  name,
  avatar: '🐴',
  color: '#c0703a',
  createdAt: '2026-09-01T10:00:00.000Z',
  totalPoints: 0,
  missions: {},
  mistakes: {},
  ...extra,
})


async function ok(rpc: Rpc, fn: string, args: Record<string, unknown>) {
  const { data, error } = await rpc(fn, args)
  if (error) throw new Error(`${fn}: ${error.message}`)
  return data as any
}

describe('supabase schema', () => {
  let backend: Backend
  let code: string
  let LENA: string
  let TOM: string

  // Starting Postgres is slow, so the tests share one database and each gets its own family.
  beforeAll(async () => {
    backend = await createPgliteBackend()
  })

  beforeEach(async () => {
    code = (await ok(backend.rpc, 'create_family', { p_name: ' Familie Muster ' })).code
    LENA = crypto.randomUUID()
    TOM = crypto.randomUUID()
  })

  it('creates a family with a readable 8-character code', async () => {
    expect(code).toMatch(/^[A-HJKMNP-Z2-9]{8}$/)
    const joined = await ok(backend.rpc, 'join_family', { p_code: `${code.slice(0, 4).toLowerCase()}-${code.slice(4)}` })
    expect(joined).toEqual({ code, name: 'Familie Muster' })
  })

  it('rejects unknown family codes', async () => {
    const { error } = await backend.rpc('join_family', { p_code: 'NOPE1234' })
    expect(error?.message).toBe('family_not_found')
  })

  it('creates players idempotently and keeps imported points', async () => {
    await ok(backend.rpc, 'create_player', { p_code: code, p_player: player(LENA, 'Lena', { totalPoints: 42 }) })
    await ok(backend.rpc, 'create_player', { p_code: code, p_player: player(LENA, 'Lena', { totalPoints: 42 }) })
    const players = await ok(backend.rpc, 'list_players', { p_code: code })
    expect(players).toHaveLength(1)
    expect(players[0]).toMatchObject({ id: LENA, name: 'Lena', totalPoints: 42 })
  })

  it('does not let another family take over a player', async () => {
    await ok(backend.rpc, 'create_player', { p_code: code, p_player: player(LENA, 'Lena') })
    const other = (await ok(backend.rpc, 'create_family', { p_name: 'Andere' })).code
    const { error } = await backend.rpc('create_player', { p_code: other, p_player: player(LENA, 'Lena') })
    expect(error?.message).toBe('player_not_found')
    expect(await ok(backend.rpc, 'list_players', { p_code: other })).toEqual([])
    const save = await backend.rpc('save_progress', { p_code: other, p_player_id: LENA, p_mission_id: 'x', p_points: 5, p_missions: {}, p_mistakes: {} })
    expect(save.error?.message).toBe('player_not_found')
  })

  it('adds points on the server and ranks by points of the current week', async () => {
    await ok(backend.rpc, 'create_player', { p_code: code, p_player: player(LENA, 'Lena', { totalPoints: 100 }) })
    await ok(backend.rpc, 'create_player', { p_code: code, p_player: player(TOM, 'Tom') })

    const missions = { 'mission-a': { bestPoints: 12, passed: true } }
    const saved = await ok(backend.rpc, 'save_progress', { p_code: code, p_player_id: TOM, p_mission_id: 'mission-a', p_points: 12, p_missions: missions, p_mistakes: { k: 1 } })
    expect(saved).toMatchObject({ totalPoints: 12, missions, mistakes: { k: 1 } })
    await ok(backend.rpc, 'save_progress', { p_code: code, p_player_id: TOM, p_mission_id: 'mission-a', p_points: 8, p_missions: missions, p_mistakes: {} })
    await ok(backend.rpc, 'save_progress', { p_code: code, p_player_id: LENA, p_mission_id: 'mission-a', p_points: 5, p_missions: {}, p_mistakes: {} })

    // Points from last week count for the total only.
    await backend.db.exec(`update point_events set created_at = now() - interval '8 days' where player_id = '${LENA}'`)
    await ok(backend.rpc, 'save_progress', { p_code: code, p_player_id: LENA, p_mission_id: 'mission-a', p_points: 3, p_missions: {}, p_mistakes: {} })

    const board = await ok(backend.rpc, 'leaderboard', { p_code: code })
    expect(board.map((entry: any) => [entry.name, entry.weekPoints, entry.totalPoints])).toEqual([
      ['Tom', 20, 20],
      ['Lena', 3, 108],
    ])
  })

  it('refuses to spend more horseshoes than were collected', async () => {
    await ok(backend.rpc, 'create_player', { p_code: code, p_player: player(LENA, 'Lena', { totalPoints: 30 }) })
    const bow = { spent: 20, owned: ['hat-bow'], equipped: { hat: 'hat-bow' } }
    expect(await ok(backend.rpc, 'save_extras', { p_code: code, p_player_id: LENA, p_extras: bow })).toMatchObject({ extras: bow })
    const { error } = await backend.rpc('save_extras', { p_code: code, p_player_id: LENA, p_extras: { ...bow, spent: 31 } })
    expect(error?.message).toBe('not_enough_points')
    const imported = await backend.rpc('create_player', { p_code: code, p_player: player(TOM, 'Tom', { totalPoints: 5, extras: { spent: 50 } }) })
    expect(imported.error?.message).toBe('not_enough_points')
  })

  it('rejects implausible point values', async () => {
    await ok(backend.rpc, 'create_player', { p_code: code, p_player: player(LENA, 'Lena') })
    for (const points of [-5, 1000]) {
      const { error } = await backend.rpc('save_progress', { p_code: code, p_player_id: LENA, p_mission_id: 'x', p_points: points, p_missions: {}, p_mistakes: {} })
      expect(error).not.toBeNull()
    }
    expect((await ok(backend.rpc, 'get_player', { p_code: code, p_player_id: LENA })).totalPoints).toBe(0)
  })

  it('blocks direct table access and helper functions for the public role', async () => {
    const attempts = ['select * from players', 'select * from families', `select public.ls_family_id('${code}')`, `select public.ls_check_extras('{}', 0)`]
    for (const sql of attempts) {
      await expect(
        backend.db.transaction(async (tx) => {
          await tx.exec('set local role anon')
          await tx.query(sql)
        }),
      ).rejects.toThrow(/permission denied/)
    }
  })
})
