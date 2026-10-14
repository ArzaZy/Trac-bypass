import "server-only";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import type { NextRequest } from "next/server";

function ipv4Blocked(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) || // link-local + cloud metadata (169.254.169.254)
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast / reserved
  );
}

function ipv6Blocked(raw: string): boolean {
  const ip = raw.toLowerCase();
  if (ip === "::" || ip === "::1") return true;
  const hex = ip.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return ipv4Blocked(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  const dotted = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return ipv4Blocked(dotted[1]);
  const first = parseInt(ip.split(":")[0] || "0", 16);
  if ((first & 0xfe00) === 0xfc00) return true; // unique local fc00::/7
  if ((first & 0xffc0) === 0xfe80) return true; // link-local fe80::/10
  if ((first & 0xff00) === 0xff00) return true; // multicast
  if (ip.startsWith("64:ff9b:")) return true; // NAT64, blocked conservatively
  return false;
}

function stripHost(hostname: string): string {
  let h = hostname.toLowerCase().replace(/\.$/, "");
  if (h.startsWith("[") && h.endsWith("]")) h = h.slice(1, -1);
  return h;
}

/** Synchronous host check: literal IPs, localhost, internal-style names. */
export function isBlockedHost(hostname: string): boolean {
  const h = stripHost(hostname);
  if (!h) return true;
  const v = isIP(h);
  if (v === 4) return ipv4Blocked(h);
  if (v === 6) return ipv6Blocked(h);
  if (!h.includes(".")) return true; // single-label hosts are internal
  return h === "localhost" || /\.(localhost|local|internal|localdomain|lan|home|corp|intranet)$/.test(h);
}

/**
 * Host check plus DNS resolution: every resolved address must be public.
 * Limits: the target is fetched by Bacon API, not by us, so DNS rebinding and
 * redirects on their side can't be controlled here. This is a pre-filter.
 */
export async function assertPublicTarget(u: URL): Promise<boolean> {
  if (isBlockedHost(u.hostname)) return false;
  const h = stripHost(u.hostname);
  if (isIP(h)) return true;
  try {
    const addrs = await lookup(h, { all: true });
    if (addrs.length === 0) return false;
    return addrs.every((a) => !(a.family === 4 ? ipv4Blocked(a.address) : ipv6Blocked(a.address)));
  } catch {
    return false;
  }
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** If TRAC_ALLOWED_ORIGINS is set, the Origin header must match one entry. */
export function originAllowed(req: NextRequest): boolean {
  const list = (process.env.TRAC_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (list.length === 0) return true;
  const origin = req.headers.get("origin");
  return !!origin && list.includes(origin.replace(/\/$/, ""));
}
