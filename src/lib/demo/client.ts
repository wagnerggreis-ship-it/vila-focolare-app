// ────────────────────────────────────────────────────────────────────────────
// Mock Supabase client — apenas para NEXT_PUBLIC_DEMO_MODE=true
// Não se conecta ao Supabase real. Retorna dados estáticos de src/lib/demo/data.ts
// ────────────────────────────────────────────────────────────────────────────

import { DEMO_DATA, DEMO_USER_ID, DEMO_EMAIL, DEMO_PASSWORD } from './data'

type Filter = { col: string; op: string; val: any }

class DemoQueryBuilder implements PromiseLike<any> {
  private _table: string
  private _filters: Filter[] = []
  private _limit?: number
  private _isSingle = false
  private _isCount = false
  private _isHead  = false

  constructor(table: string) {
    this._table = table
  }

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.count) this._isCount = true
    if (opts?.head)  this._isHead  = true
    return this
  }
  eq(col: string, val: any)           { this._filters.push({ col, op: 'eq',  val }); return this }
  neq(col: string, val: any)          { this._filters.push({ col, op: 'neq', val }); return this }
  in(col: string, val: any[])         { this._filters.push({ col, op: 'in',  val }); return this }
  gte(col: string, val: any)          { this._filters.push({ col, op: 'gte', val }); return this }
  gt(col: string, val: any)           { this._filters.push({ col, op: 'gt',  val }); return this }
  lt(col: string, val: any)           { this._filters.push({ col, op: 'lt',  val }); return this }
  lte(col: string, val: any)          { this._filters.push({ col, op: 'lte', val }); return this }
  is(col: string, val: any)           { this._filters.push({ col, op: 'is',  val }); return this }
  order(_col: string, _opts?: any)    { return this }
  limit(n: number)                    { this._limit = n; return this }

  single() {
    this._isSingle = true
    return this
  }

  // Mutações — retornam sucesso silencioso em demo mode
  insert(rows: any | any[]) {
    const row  = Array.isArray(rows) ? rows[0] : rows
    const data = { id: `demo-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...row }
    return {
      select: () => ({
        single: () => Promise.resolve({ data, error: null }),
        then:   (fn: any) => Promise.resolve({ data: [data], error: null }).then(fn),
      }),
      then: (fn: any) => Promise.resolve({ data, error: null }).then(fn),
      error: null,
    }
  }

  update(_data: any) {
    return {
      eq:  (_c: string, _v: any) => Promise.resolve({ data: null, error: null }),
      in:  (_c: string, _v: any) => Promise.resolve({ data: null, error: null }),
      neq: (_c: string, _v: any) => Promise.resolve({ data: null, error: null }),
    }
  }

  upsert(_data: any) {
    return Promise.resolve({ data: null, error: null })
  }

  delete() {
    return { eq: (_c: string, _v: any) => Promise.resolve({ data: null, error: null }) }
  }

  // PromiseLike — permite await
  then(onfulfilled: (v: any) => any, onrejected?: (e: any) => any) {
    return Promise.resolve(this._resolve()).then(onfulfilled, onrejected)
  }

  private _resolve() {
    const tableData = DEMO_DATA[this._table]
    if (!tableData) {
      if (this._isHead)   return { data: null, error: null, count: 0 }
      if (this._isSingle) return { data: null, error: null, count: null }
      return { data: [], error: null, count: 0 }
    }

    let result = [...tableData]

    for (const f of this._filters) {
      result = result.filter(row => {
        const v = row[f.col]
        switch (f.op) {
          case 'eq':  return v === f.val
          case 'neq': return v !== f.val
          case 'in':  return Array.isArray(f.val) && f.val.includes(v)
          case 'gte': return v != null && v >= f.val
          case 'gt':  return v != null && v >  f.val
          case 'lt':  return v != null && v <  f.val
          case 'lte': return v != null && v <= f.val
          case 'is':  return f.val === null ? (v == null) : v === f.val
          default:    return true
        }
      })
    }

    const count = result.length
    if (this._limit) result = result.slice(0, this._limit)
    if (this._isHead)   return { data: null,           error: null, count }
    if (this._isSingle) return { data: result[0] ?? null, error: null, count: null }
    return { data: result, error: null, count: this._isCount ? count : null }
  }
}

// ── Mock Auth ─────────────────────────────────────────────────────────────────
const demoUser = {
  id: DEMO_USER_ID,
  email: DEMO_EMAIL,
  created_at: new Date().toISOString(),
  user_metadata: { nome_completo: 'Dr. Wagner Reis' },
}

const demoAuth = {
  getUser: async () => ({ data: { user: demoUser }, error: null }),
  getSession: async () => ({ data: { session: { user: demoUser } }, error: null }),
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      return { data: { user: demoUser, session: {} }, error: null }
    }
    return { data: { user: null, session: null }, error: { message: 'Credenciais inválidas' } }
  },
  signOut: async () => ({ error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
}

// ── Factory ───────────────────────────────────────────────────────────────────
export function createDemoClient() {
  return {
    from: (table: string) => new DemoQueryBuilder(table),
    auth: demoAuth,
    // channel/realtime — no-op em demo
    channel: (_name: string) => ({
      on: () => ({ subscribe: () => {} }),
    }),
  }
}
