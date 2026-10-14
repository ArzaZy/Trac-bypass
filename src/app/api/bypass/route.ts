import { NextRequest, NextResponse } from "next/server";
import type { BypassResponse, ErrorCode } from "@/types/api";
import { bodySchema, parseTargetUrl } from "@/lib/validation";
import { assertPublicTarget, getClientIp, originAllowed } from "@/lib/security";
import { acquire, rateLimit, release } from "@/lib/rate-limit";
import { callBacon, failure } from "@/lib/bacon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel function limit. Keep the upstream timeout below this value.
export const maxDuration = 60;

const MAX_BODY_BYTES = 4096;
const HTTP_STATUS: Record<ErrorCode, number> = {
  invalid_url: 400,
  bad_request: 400,
  invalid_key: 403,
  forbidden_origin: 403,
  rate_limited: 429,
  not_configured: 503,
  network: 502,
  upstream: 502,
  unexpected: 502,
  timeout: 504,
};

function respond(body: BypassResponse) {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  let status = 200;
  if (!body.ok) {
    status = HTTP_STATUS[body.code];
    if (body.retryAfter) headers["Retry-After"] = String(body.retryAfter);
  }
  return NextResponse.json(body, { status, headers });
}

function log(code: string, started: number) {
  // Minimal log: no URL, no key, no IP.
  console.info(JSON.stringify({ scope: "bypass", outcome: code, ms: Date.now() - started }));
}

export async function POST(req: NextRequest) {
  const started = Date.now();
  const mode = (process.env.TRAC_AUTH_MODE ?? "").trim().toLowerCase();
  const adminKey = process.env.BACON_API_KEY?.trim();

  if (!originAllowed(req)) return respond(failure("forbidden_origin"));
  if (mode !== "admin" && mode !== "user") return respond(failure("not_configured"));
  if (mode === "admin" && !adminKey) return respond(failure("not_configured"));

  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return respond(failure("bad_request"));
  }
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return respond(failure("bad_request"));

  const ip = getClientIp(req);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    log("rate_limited", started);
    return respond(failure("rate_limited", "app", rl.retryAfter));
  }

  let raw: unknown;
  try {
    const text = await req.text();
    if (Buffer.byteLength(text) > MAX_BODY_BYTES) return respond(failure("bad_request"));
    raw = JSON.parse(text);
  } catch {
    return respond(failure("bad_request"));
  }

  const body = bodySchema.safeParse(raw);
  if (!body.success) {
    const keyProblem = body.error.issues.some((i) => i.path[0] === "apikey");
    return respond(failure(keyProblem ? "invalid_key" : "bad_request"));
  }

  const target = parseTargetUrl(body.data.url);
  if (!target.ok) return respond(failure("invalid_url"));
  if (!(await assertPublicTarget(new URL(target.url)))) return respond(failure("invalid_url"));

  const apikey = mode === "admin" ? adminKey! : body.data.apikey;
  if (!apikey) return respond(failure("invalid_key"));

  if (!acquire(ip)) return respond(failure("rate_limited", "app", 5));

  try {
    const timeoutMs = Math.min(Number(process.env.TRAC_TIMEOUT_MS) || 55_000, 58_000);
    // No automatic retry: a retry could process the same link twice.
    const result = await callBacon(target.url, apikey, timeoutMs);
    log(result.ok ? "success" : result.code, started);
    return respond(result);
  } finally {
    release(ip);
  }
}
