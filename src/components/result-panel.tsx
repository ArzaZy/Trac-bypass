"use client";
import { Copy, ExternalLink, RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "./ui/button";
import { useToast } from "./ui/toast";
import { copyText } from "@/lib/utils";
import { safeResultUrl } from "@/lib/validation";

export function ResultPanel({ result, onAnother }: { result: string; onAnother: () => void }) {
  const toast = useToast();
  const safe = safeResultUrl(result);

  return (
    <div className="result-flash mt-6 rounded border border-bone/15 p-4 sm:p-5">
      <p className="font-mono text-xs text-ember">PROCESS COMPLETED</p>
      <p className="mt-4 text-xs text-bone/50">YOUR RESULT</p>
      <p className="mt-1 break-all font-mono text-sm leading-relaxed text-bone" data-testid="result-url">{result}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={async () => toast.show((await copyText(result)) ? "Copied to clipboard" : "Copy failed. Select the text and copy it manually.")}
        >
          <Copy size={16} aria-hidden /> Copy Result
        </Button>
        {safe ? (
          <ButtonLink href={safe} target="_blank" rel="noopener noreferrer" variant="secondary">
            <ExternalLink size={16} aria-hidden /> Open Result
          </ButtonLink>
        ) : (
          <Button type="button" variant="secondary" disabled>
            <ExternalLink size={16} aria-hidden /> Open Result
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onAnother}>
          <RotateCcw size={16} aria-hidden /> Process Another Link
        </Button>
      </div>
    </div>
  );
}
