"use client";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/toast";
import { useHistory } from "@/lib/history";
import { copyText, formatTime } from "@/lib/utils";
import { safeResultUrl } from "@/lib/validation";

export function HistoryPanel() {
  const { items, enabled, setEnabled, remove, clear } = useHistory();
  const toast = useToast();

  return (
    <div className="mt-10 border-t border-bone/10 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm text-bone">Local history</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-bone/55">
            Off by default. When on, links and results are saved in this browser on your device only, and never sent to the server.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Save history on this device"
          onClick={() => setEnabled(!enabled)}
          className="relative mt-1 inline-flex h-11 w-14 shrink-0 items-center justify-center"
        >
          <span className={`flex h-6 w-11 items-center rounded-full border px-0.5 transition-colors ${enabled ? "border-ember bg-ember/20" : "border-bone/25"}`}>
            <span className={`h-4 w-4 rounded-full transition-transform ${enabled ? "translate-x-5 bg-ember" : "bg-bone/50"}`} />
          </span>
          <span className="sr-only">{enabled ? "On" : "Off"}</span>
        </button>
      </div>

      {items.length > 0 && (
        <>
          <ul className="mt-4 divide-y divide-bone/10">
            {items.map((it) => {
              const safe = safeResultUrl(it.result);
              return (
                <li key={it.id} className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-mono text-xs text-bone/90">{it.result}</p>
                    <p className="mt-1 break-all text-xs text-bone/40">from {it.url} · {formatTime(it.at)}</p>
                  </div>
                  <div className="flex shrink-0">
                    <Button type="button" variant="ghost" className="w-11 px-0" aria-label="Copy result" onClick={async () => toast.show((await copyText(it.result)) ? "Copied to clipboard" : "Copy failed")}>
                      <Copy size={16} aria-hidden />
                    </Button>
                    {safe && (
                      <a href={safe} target="_blank" rel="noopener noreferrer" aria-label="Open result" className="inline-flex h-11 w-11 items-center justify-center rounded text-bone/70 hover:bg-bone/5 hover:text-bone">
                        <ExternalLink size={16} aria-hidden />
                      </a>
                    )}
                    <Button type="button" variant="ghost" className="w-11 px-0" aria-label="Delete this item" onClick={() => remove(it.id)}>
                      <Trash2 size={16} aria-hidden />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          <Button type="button" variant="secondary" className="mt-3" onClick={() => { clear(); toast.show("History cleared"); }}>
            Clear all history
          </Button>
        </>
      )}
    </div>
  );
}
