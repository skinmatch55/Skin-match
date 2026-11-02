// DEV ONLY: a tiny stand-in for Supabase Auth (GoTrue) so the funnel can be tested offline.
// Implements the endpoints supabase-js uses. Never deployed; production uses real Supabase Auth.
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import http from "http";
import postgres from "postgres";

const SECRET = "local-dev-jwt-secret-local-dev-jwt-secret";
const sql = postgres(process.env.DATABASE_URL || "postgres://postgres@127.0.0.1:54322/postgres");
await sql`alter table auth.users add column if not exists pw text`;
await sql`alter table auth.users add column if not exists meta jsonb default '{}'::jsonb`;
const refresh = new Map();

const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
function jwt(user) {
  const now = Math.floor(Date.now() / 1000);
  const h = b64({ alg: "HS256", typ: "JWT" });
  const p = b64({ sub: user.id, email: user.email, role: "authenticated", aud: "authenticated", iat: now, exp: now + 3600 });
  return `${h}.${p}.${createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64url")}`;
}
function verify(tok) {
  const [h, p, s] = (tok || "").split(".");
  if (!s || createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64url") !== s) return null;
  const c = JSON.parse(Buffer.from(p, "base64url").toString());
  return c.exp > Date.now() / 1000 ? c : null;
}
const userJson = (u) => ({ id: u.id, aud: "authenticated", role: "authenticated", email: u.email, email_confirmed_at: u.created_at, app_metadata: { provider: "email" }, user_metadata: u.meta || {}, identities: [{ id: u.id, provider: "email" }], created_at: u.created_at });
function session(u) {
  const rt = randomBytes(16).toString("hex");
  refresh.set(rt, u.id);
  return { access_token: jwt(u), token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: rt, user: userJson(u) };
}
const hash = (pw) => { const salt = randomBytes(8).toString("hex"); return salt + ":" + scryptSync(pw, salt, 32).toString("hex"); };
const check = (pw, h) => { const [salt, k] = (h || ":").split(":"); try { return timingSafeEqual(Buffer.from(k, "hex"), scryptSync(pw, salt, 32)); } catch { return false; } };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  let body = "";
  for await (const c of req) body += c;
  const data = body ? JSON.parse(body) : {};
  const send = (status, obj) => { res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" }); res.end(JSON.stringify(obj)); };
  if (req.method === "OPTIONS") return send(200, {});
  const p = url.pathname.replace(/^\/auth\/v1/, "");
  const bearer = (req.headers.authorization || "").replace(/^Bearer /, "");
  try {
    if (p === "/settings") return send(200, { external: { email: true, google: false }, mailer_autoconfirm: true });
    if (p === "/signup" && req.method === "POST") {
      const email = String(data.email || "").toLowerCase();
      if (!email || (data.password || "").length < 6) return send(422, { code: 422, error_code: "weak_password", msg: "Password should be at least 6 characters." });
      const [ex] = await sql`select id from auth.users where email = ${email}`;
      if (ex) return send(422, { code: 422, error_code: "user_already_exists", msg: "User already registered" });
      const [u] = await sql`insert into auth.users (id, email, pw) values (${randomUUID()}, ${email}, ${hash(data.password)}) returning *`;
      return send(200, session(u));
    }
    if (p === "/token") {
      const gt = url.searchParams.get("grant_type");
      if (gt === "password") {
        const [u] = await sql`select * from auth.users where email = ${String(data.email || "").toLowerCase()}`;
        if (!u || !check(data.password || "", u.pw)) return send(400, { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" });
        return send(200, session(u));
      }
      if (gt === "refresh_token") {
        const id = refresh.get(data.refresh_token);
        if (!id) return send(400, { code: 400, error_code: "refresh_token_not_found", msg: "Invalid Refresh Token" });
        const [u] = await sql`select * from auth.users where id = ${id}`;
        return send(200, session(u));
      }
    }
    if (p === "/user") {
      const c = verify(bearer);
      if (!c) return send(401, { code: 401, error_code: "bad_jwt", msg: "invalid JWT" });
      const [u] = await sql`select * from auth.users where id = ${c.sub}`;
      if (!u) return send(404, { code: 404, msg: "User not found" });
      if (req.method === "PUT" && data.password) await sql`update auth.users set pw = ${hash(data.password)} where id = ${u.id}`;
      return send(200, userJson(u));
    }
    if (p === "/logout") return send(204, {});
    if (p === "/recover") { console.log("[local-auth] recovery email for", data.email); return send(200, {}); }
    const m = p.match(/^\/admin\/users\/([0-9a-f-]+)$/);
    if (m && req.method === "DELETE") { await sql`delete from auth.users where id = ${m[1]}`; return send(200, {}); }
    send(404, { msg: "not implemented in local-auth: " + p });
  } catch (e) { console.error(e); send(500, { msg: String(e) }); }
}).listen(54321, () => console.log("local-auth on :54321"));
