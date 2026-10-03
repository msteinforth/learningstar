import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('schema.sql in the Supabase SQL editor', () => {
  it('avoids "select … into" and "returning … into"', () => {
    // The dashboard mistakes them for CREATE TABLE and inserts
    // "ALTER TABLE … ENABLE ROW LEVEL SECURITY" into the function body.
    const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8')
    expect(schema).not.toMatch(/\b(select|returning)\b[^;]*\binto\b/i)
  })

  it('has no question marks', () => {
    // A "?" (e.g. the jsonb operator) makes the dashboard treat it as a parameter and split
    // the script at every semicolon, even inside function bodies.
    const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8')
    expect(schema).not.toContain('?')
  })
})
