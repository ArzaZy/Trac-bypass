import { z } from "zod";

export const MAX_URL_LENGTH = 2048;

export type ParsedUrl = { ok: true; url: string } | { ok: false };

/** Standard URL parser based check, shared by browser and server. */
export function parseTargetUrl(input: string): ParsedUrl {
  // eslint-disable-next-line no-control-regex
  const cleaned = input.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!cleaned || cleaned.length > MAX_URL_LENGTH) return { ok: false };
  let u: URL;
  try {
    u = new URL(cleaned);
  } catch {
    return { ok: false };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return { ok: false };
  if (u.username || u.password) return { ok: false };
  if (!u.hostname) return { ok: false };
  return { ok: true, url: u.toString() };
}

/** Result links must be plain http(s) before they are shown as an "Open" link. */
export function safeResultUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 8192) return null;
  try {
    const u = new URL(value.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return value.trim();
  } catch {
    return null;
  }
}

export const bodySchema = z
  .object({
    url: z.string().max(MAX_URL_LENGTH),
    apikey: z.string().min(8).max(256).optional(),
  })
  .strict();
