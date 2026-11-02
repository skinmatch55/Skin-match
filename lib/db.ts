import "server-only";
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;
let _sql: Sql | null = null;

/** Privileged connection (server only). Use asUser() for anything a user reads or changes. */
export function db(): Sql {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const local = /localhost|127\.0\.0\.1/.test(url);
  _sql = postgres(url, {
    prepare: false, // Supabase pooler (transaction mode)
    max: local ? 5 : 3,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: local ? false : "require",
    onnotice: () => {},
  });
  return _sql;
}

export type Tx = postgres.TransactionSql;

/**
 * Runs queries as the signed-in user: role "authenticated" + their id in the JWT claims,
 * so Row Level Security policies apply exactly like with the Supabase client.
 */
export async function asUser<T>(uid: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  const claims = JSON.stringify({ sub: uid, role: "authenticated" });
  return db().begin(async (tx) => {
    await tx`select set_config('request.jwt.claims', ${claims}, true), set_config('role', 'authenticated', true)`;
    return fn(tx);
  }) as Promise<T>;
}
