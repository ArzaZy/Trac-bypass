export type ErrorCode =
  | "invalid_url"
  | "invalid_key"
  | "rate_limited"
  | "network"
  | "timeout"
  | "not_configured"
  | "unexpected"
  | "bad_request"
  | "upstream"
  | "forbidden_origin";

export type BypassSuccess = { ok: true; result: string };
export type BypassFailure = {
  ok: false;
  code: ErrorCode;
  message: string;
  /** "app" = rejected by Trac Bypass itself, "upstream" = came from Bacon API / the link to it. */
  source: "app" | "upstream";
  retryAfter?: number;
};
export type BypassResponse = BypassSuccess | BypassFailure;

export type AuthMode = "admin" | "user" | "none";
export type StatusResponse = { website: "online"; mode: AuthMode; configured: boolean };

export type HistoryItem = { id: string; url: string; result: string; at: number };

export type RequestEventDetail = { ok: boolean; code?: ErrorCode; source: "app" | "upstream"; at: number };
