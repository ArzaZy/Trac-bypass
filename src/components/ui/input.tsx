import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-12 w-full rounded border border-bone/15 bg-bone/[0.03] px-3 font-mono text-sm text-bone placeholder:text-bone/35",
        "transition-colors focus:border-ember/70 focus:outline-none focus-visible:outline-none disabled:opacity-50",
        className,
      )}
    />
  );
}
