export interface RpcError {
  message: string
  code?: string
}

export type Rpc = (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: RpcError | null }>

/** Thrown for failed server calls; `message` is shown to the kids. */
export class BackendError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

const MESSAGES: Record<string, string> = {
  family_not_found: 'Diesen Familien-Code gibt es nicht. Bitte prüfe die Eingabe.',
  player_not_found: 'Dieser Spieler gehört nicht zu deiner Familie.',
}

export async function call<T>(rpc: Rpc, fn: string, args: Record<string, unknown>): Promise<T> {
  let result: Awaited<ReturnType<Rpc>>
  try {
    result = await rpc(fn, args)
  } catch {
    result = { data: null, error: { message: 'network' } }
  }
  if (result.error) {
    const known = MESSAGES[result.error.message]
    throw new BackendError(
      known ? result.error.message : 'unavailable',
      known ?? 'Der Familien-Server ist gerade nicht erreichbar. Bist du mit dem Internet verbunden?',
    )
  }
  return result.data as T
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY ?? ''

/** True when the app was built with Supabase settings (see README). */
export const backendConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)

let rpcPromise: Promise<Rpc> | null = null

/** Loads the Supabase client on first use, so the app stays small without a backend. */
export function getRpc(): Promise<Rpc> {
  if (!backendConfigured) return Promise.reject(new BackendError('not_configured', 'Es ist kein Familien-Server eingerichtet.'))
  rpcPromise ??= import('@supabase/supabase-js').then(({ createClient }) => {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    return async (fn, args) => {
      const { data, error } = await client.rpc(fn, args)
      return { data, error: error ? { message: error.message, code: error.code } : null }
    }
  })
  return rpcPromise
}

/** RPC function that loads the Supabase client lazily on the first call. */
export const lazyRpc: Rpc = async (fn, args) => (await getRpc())(fn, args)
