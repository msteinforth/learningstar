/**
 * Lokales Test-Backend, das sich wie Supabase verhält (nur RPC-Aufrufe).
 * Die Daten liegen im Arbeitsspeicher und sind nach einem Neustart weg.
 *
 *   npm run dev:backend
 *   VITE_SUPABASE_URL=http://localhost:54321 VITE_SUPABASE_KEY=dev npm run dev
 */
import { createServer } from 'node:http'
import { createPgliteBackend } from './pglite-rpc.ts'

const port = Number(process.env.PORT ?? 54321)
const { rpc } = await createPgliteBackend()

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (request.method === 'OPTIONS') {
    response.writeHead(204).end()
    return
  }

  const match = request.url?.match(/^\/rest\/v1\/rpc\/([a-z_]+)/)
  if (request.method !== 'POST' || !match) {
    response.writeHead(404).end()
    return
  }

  let body = ''
  for await (const chunk of request) body += chunk
  let args: Record<string, unknown>
  try {
    args = body ? JSON.parse(body) : {}
  } catch {
    response.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ message: 'Invalid JSON' }))
    return
  }

  const { data, error } = await rpc(match[1], args)
  response.writeHead(error ? 400 : 200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(error ?? data))
})

server.listen(port, () => console.log(`LearningStar-Test-Backend läuft auf http://localhost:${port}`))
