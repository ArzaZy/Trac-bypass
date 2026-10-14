import "server-only";
import type { BypassFailure, BypassResponse, ErrorCode } from "@/types/api";
import { MESSAGES } from "./messages";
import { safeResultUrl } from "./validation";

// Fixed on purpose: never configurable from env or user input.
const BACON_ENDPOINT = "https://baconbypass.online/bypass";

export function failure(code: ErrorCode, source: "app" | "upstream" = "app", retryAfter?: number): BypassFailure {
  return { ok: false, code, message: MESSAGES[code], source, ...(retryAfter ? { retryAfter } : {}) };
}

export async function callBacon(url: string, apikey: string, timeoutMs: number): Promise<BypassResponse> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(BACON_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, apikey }),
      cache: "no-store",
      redirect: "error",
      signal: ac.signal,
    });

    // Statuses are mapped from the documentation; upstream text is never echoed.
    if (res.status === 400) return failure("bad_request", "upstream");
    if (res.status === 403) return failure("invalid_key", "upstream");
    if (res.status === 429) return failure("rate_limited", "upstream");
    if (res.status >= 500) return failure("upstream", "upstream");
    if (res.status !== 200) return failure("unexpected", "upstream");

    let data: unknown;
    try {
      data = JSON.parse(await res.text());
    } catch {
      return failure("unexpected", "upstream");
    }
    if (typeof data !== "object" || data === null) return failure("unexpected", "upstream");
    const d = data as Record<string, unknown>;
    const success = d.status === "success" || d.success === true;
    const result = safeResultUrl(d.result);
    if (success && result) return { ok: true, result };
    return failure("unexpected", "upstream");
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return failure("timeout", "upstream");
    return failure("network", "upstream");
  } finally {
    clearTimeout(timer);
  }
}
