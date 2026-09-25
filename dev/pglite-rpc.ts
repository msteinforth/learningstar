import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'

export interface RpcError {
  code: string
  message: string
  details: string | null
  hint: string | null
}

export type RpcResult = { data: unknown; error: null } | { data: null; error: RpcError }

export type Rpc = (fn: string, args: Record<string, unknown>) => Promise<RpcResult>

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/

/**
 * In-memory Postgres with the Supabase schema, answering RPC calls the way
 * Supabase's REST API does. Used by the tests and the local dev backend.
 * Calls run as the `anon` role so that missing grants show up here too.
 */
export async function createPgliteBackend(schemaPath = new URL('../supabase/schema.sql', import.meta.url)) {
  const db = new PGlite()
  await db.exec(`create role anon nologin; create role authenticated nologin;`)
  await db.exec(readFileSync(schemaPath, 'utf8'))

  const rpc: Rpc = async (fn, args) => {
    const names = Object.keys(args)
    if (![fn, ...names].every((name) => IDENTIFIER.test(name))) {
      return { data: null, error: { code: 'PGRST202', message: 'Invalid function or argument name', details: null, hint: null } }
    }
    const values = names.map((name) => {
      const value = args[name]
      return value !== null && typeof value === 'object' ? JSON.stringify(value) : value
    })
    const call = `select public.${fn}(${names.map((name, i) => `${name} => $${i + 1}`).join(', ')}) as result`
    try {
      const result = await db.transaction(async (tx) => {
        await tx.exec('set local role anon')
        return tx.query<{ result: unknown }>(call, values)
      })
      return { data: result.rows[0]?.result ?? null, error: null }
    } catch (error) {
      const pgError = error as { code?: string; message?: string; detail?: string; hint?: string }
      return {
        data: null,
        error: { code: pgError.code ?? 'XX000', message: pgError.message ?? String(error), details: pgError.detail ?? null, hint: pgError.hint ?? null },
      }
    }
  }

  return { db, rpc }
}
