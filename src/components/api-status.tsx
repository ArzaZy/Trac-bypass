"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { formatTime } from "@/lib/utils";
import type { RequestEventDetail, StatusResponse } from "@/types/api";

const NO_RESPONSE = new Set(["network", "timeout"]);

export function ApiStatus() {
  const [cfg, setCfg] = useState<StatusResponse | null>(null);
  const [cfgError, setCfgError] = useState(false);
  const [checkedAt, setCheckedAt] = useState<number | null>(null);
  const [last, setLast] = useState<RequestEventDetail | null>(null);
  const [upstream, setUpstream] = useState<RequestEventDetail | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/status", { cache: "no-store" });
      setCfg(await r.json());
      setCfgError(false);
    } catch {
      setCfg(null);
      setCfgError(true);
    }
    setCheckedAt(Date.now());
  }, []);

  useEffect(() => {
    load();
    const onReq = (e: Event) => {
      const d = (e as CustomEvent<RequestEventDetail>).detail;
      setLast(d);
      if (d.source === "upstream") setUpstream(d);
    };
    window.addEventListener("trac:request", onReq);
    return () => window.removeEventListener("trac:request", onReq);
  }, [load]);

  const integration = cfgError
    ? "Unknown (status endpoint unreachable)"
    : !cfg ? "Checking…"
    : cfg.configured ? `Configured (${cfg.mode === "admin" ? "server key" : "personal key"})`
    : cfg.mode === "admin" ? "Not configured: server key missing" : "Not configured";

  const up = !upstream
    ? "Not checked"
    : NO_RESPONSE.has(upstream.code ?? "") ? "No response on the last request"
    : "Responded on the last request";

  const rows: Array<[string, string]> = [
    ["Website", cfgError ? "Offline or unreachable" : "Online"],
    ["Integration", integration],
    ["Upstream API", up],
    ["Last request", last ? `${last.ok ? "Succeeded" : `Failed (${last.code})`} at ${formatTime(last.at)}` : "None in this session"],
    ["Configuration checked", checkedAt ? formatTime(checkedAt) : "—"],
  ];

  return (
    <section id="status" className="mx-auto max-w-3xl px-5 py-20">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-4xl sm:text-5xl">API status</h2>
        <Button type="button" variant="secondary" onClick={load} aria-label="Recheck configuration">
          <RefreshCw size={16} aria-hidden /> Recheck
        </Button>
      </div>
      <dl className="mt-8 divide-y divide-bone/10 border-y border-bone/10">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
            <dt className="text-sm text-bone/55">{k}</dt>
            <dd className="font-mono text-sm sm:text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-bone/45">
        Rechecking only reads this site&apos;s configuration. Upstream status comes from requests you actually make, so no quota is spent on checks. Remaining quota is not shown because the provider offers no way to read it.
      </p>
    </section>
  );
}
