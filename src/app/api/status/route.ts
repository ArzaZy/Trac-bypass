import { NextResponse } from "next/server";
import type { AuthMode, StatusResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/** Reports configuration only. It never calls Bacon API, so it can't spend quota. */
export async function GET() {
  const m = (process.env.TRAC_AUTH_MODE ?? "").trim().toLowerCase();
  const mode: AuthMode = m === "admin" || m === "user" ? m : "none";
  const configured = mode === "user" || (mode === "admin" && !!process.env.BACON_API_KEY?.trim());
  const body: StatusResponse = { website: "online", mode, configured };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
