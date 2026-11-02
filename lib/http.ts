import "server-only";
import { createHash } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "cache-control": "no-store" } });
}
export function fail(error: string, status = 400, extra?: Record<string, unknown>) {
  return json({ error, ...extra }, status);
}

export async function ipHash() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  return createHash("sha256").update(`${process.env.IP_SALT || "skinmatch"}:${ip}`).digest("hex").slice(0, 32);
}
