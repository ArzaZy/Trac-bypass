"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ClipboardPaste, LoaderCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ResultPanel } from "./result-panel";
import { useToast } from "./ui/toast";
import { useHistory } from "@/lib/history";
import { submitBypass } from "@/lib/api-client";
import { parseTargetUrl } from "@/lib/validation";
import { MESSAGES } from "@/lib/messages";
import type { RequestEventDetail, StatusResponse } from "@/types/api";

type Phase = "idle" | "processing" | "success" | "error";

export function BypassPanel() {
  const [url, setUrl] = useState("");
  const [apikey, setApikey] = useState(""); // memory only: never persisted
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cfg, setCfg] = useState<StatusResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const toast = useToast();
  const history = useHistory();
  const reduce = useReducedMotion();

  const parsed = parseTargetUrl(url);
  const needsKey = cfg?.mode === "user";
  const keyOk = !needsKey || apikey.trim().length >= 8;
  const notConfigured = cfg ? !cfg.configured : false;
  const busy = phase === "processing";
  const canSubmit = parsed.ok && keyOk && !busy && !notConfigured;
  const urlError = touched && url.trim() !== "" && !parsed.ok ? MESSAGES.invalid_url : null;

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((r) => r.json())
      .then(setCfg)
      .catch(() => setCfg(null));
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!busy) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!parsed.ok || !canSubmit) return;
    setPhase("processing");
    setError(null);
    setResult(null);
    const ac = new AbortController();
    abortRef.current = ac;
    const res = await submitBypass(parsed.url, needsKey ? apikey.trim() : undefined, ac.signal);
    if (ac.signal.aborted) return;
    const detail: RequestEventDetail = { ok: res.ok, code: res.ok ? undefined : res.code, source: res.ok ? "upstream" : res.source, at: Date.now() };
    window.dispatchEvent(new CustomEvent("trac:request", { detail }));
    if (res.ok) {
      setResult(res.result);
      setPhase("success");
      if (history.enabled) history.add(parsed.url, res.result);
      toast.show("Process completed");
    } else {
      setError(res.message);
      setPhase("error");
    }
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text.trim());
      setTouched(true);
    } catch {
      toast.show("Clipboard access was blocked. Paste with Ctrl+V or long-press.");
    }
  }

  function reset() {
    setUrl("");
    setResult(null);
    setError(null);
    setPhase("idle");
    setTouched(false);
  }

  const badge =
    notConfigured ? "Not configured" : phase === "processing" ? "Processing" : phase === "success" ? "Completed" : phase === "error" ? "Failed" : "Ready";
  const live = notConfigured ? MESSAGES.not_configured : phase === "processing" ? "Processing your link." : phase === "success" ? "Process completed." : phase === "error" ? error ?? "" : "";

  return (
    <motion.div
      initial={reduce ? false : { clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
      whileInView={reduce ? undefined : { clipPath: "inset(0 0 0% 0)", opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <form onSubmit={onSubmit} noValidate className="spectral rounded-md bg-void p-4 sm:p-6" aria-labelledby="processor-label">
        <div className="flex items-center justify-between">
          <h2 id="processor-label" className="font-mono text-xs tracking-wide text-bone/70">LINK PROCESSOR</h2>
          <span className="inline-flex items-center gap-2 font-mono text-xs text-bone/70">
            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${busy ? "animate-pulse bg-ember" : phase === "success" ? "bg-ember" : "bg-bone/40"}`} />
            {badge}
          </span>
        </div>

        <div className="mt-6">
          <label htmlFor="url" className="text-sm text-bone/70">Link to process</label>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-ember">&gt;</span>
              <Input
                id="url"
                type="url"
                inputMode="url"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Paste your URL here..."
                value={url}
                disabled={busy}
                aria-invalid={urlError ? true : undefined}
                aria-describedby={urlError ? "url-error" : undefined}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => setTouched(true)}
                className="pl-8"
              />
            </div>
            <Button type="button" variant="secondary" onClick={paste} disabled={busy} aria-label="Paste from clipboard" className="w-12 px-0">
              <ClipboardPaste size={18} aria-hidden />
            </Button>
          </div>
          {urlError && <p id="url-error" role="alert" className="mt-2 text-sm text-bone">{urlError}</p>}
        </div>

        {needsKey && (
          <div className="mt-4">
            <label htmlFor="apikey" className="text-sm text-bone/70">Your API key</label>
            <Input
              id="apikey"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="Used for this request only"
              value={apikey}
              disabled={busy}
              onChange={(e) => setApikey(e.target.value)}
              className="mt-2"
            />
            <p className="mt-2 text-xs text-bone/50">Sent over HTTPS with the request. Not saved on the server or in your browser.</p>
          </div>
        )}

        {notConfigured && <p role="alert" className="mt-4 text-sm text-bone">{MESSAGES.not_configured}</p>}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" magnetic disabled={!canSubmit} aria-disabled={!canSubmit}>
            {busy ? <><LoaderCircle size={16} className="animate-spin" aria-hidden /> Processing</> : "Process Link"}
          </Button>
          <Button type="button" variant="ghost" onClick={reset} disabled={busy || (!url && phase === "idle")}>
            <X size={16} aria-hidden /> Clear
          </Button>
        </div>

        <div className="mt-5 min-h-[3.25rem]">
          {busy && (
            <div aria-hidden>
              <div className="indeterminate" />
              <p className="mt-3 font-mono text-xs text-bone/60">{elapsed}s elapsed. This can take up to 90 seconds.</p>
            </div>
          )}
          {phase === "error" && error && (
            <p className="rounded border border-bone/20 px-3 py-2 text-sm text-bone">
              <span className="font-mono text-ember">Error: </span>{error}
            </p>
          )}
        </div>
        <p className="sr-only" role="status" aria-live="polite">{live}</p>

        {phase === "success" && result && <ResultPanel result={result} onAnother={reset} />}
      </form>
    </motion.div>
  );
}
