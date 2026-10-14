import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-bone/10 px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm tracking-[0.18em]">TRAC BYPASS</p>
          <p className="mt-2 text-sm text-bone/55">Built with precision.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 text-sm text-bone/65">
          <Link href="/#home" className="inline-flex min-h-11 items-center hover:text-bone">Home</Link>
          <Link href="/#faq" className="inline-flex min-h-11 items-center hover:text-bone">FAQ</Link>
          <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-bone">Privacy</Link>
          <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-bone">Terms</Link>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-xs text-bone/40">© {new Date().getFullYear()} TRAC BYPASS</p>
    </footer>
  );
}
