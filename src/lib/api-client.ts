import type { BypassResponse, ErrorCode } from "@/types/api";
import { MESSAGES } from "./messages";
import { safeResultUrl } from "./validation";

function localFailure(code: ErrorCode): BypassResponse {
  return { ok: false, code, message: MESSAGES[code], source: "app" };
}

function isBypassResponse(d: unknown): d is BypassResponse {
  if (typeof d !== "object" || d === null) return false;
  const o = d as Record<string, unknown>;
  if (o.ok === true) return safeResultUrl(o.result) !== null;
  return o.ok === false && typeof o.code === "string" && typeof o.message === "string";
}

/** The browser only ever talks to /api/bypass on this site. */
export async function submitBypass(url: string, apikey: string | undefined, signal: AbortSignal): Promise<BypassResponse> {
  try {
    const res = await fetch("/api/bypass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apikey ? { url, apikey } : { url }),
      cache: "no-store",
      signal,
    });
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return localFailure("unexpected");
    }
    return isBypassResponse(data) ? data : localFailure("unexpected");
  } catch {
    return localFailure("network");
  }
}
