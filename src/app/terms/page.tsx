import Link from "next/link";

export const metadata = { title: "Terms — TRAC BYPASS" };

export default function Terms() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-24 leading-relaxed text-bone/80">
      <Link href="/" className="font-mono text-sm text-ember">Back to TRAC BYPASS</Link>
      <h1 className="mt-6 font-display text-5xl text-bone">Terms</h1>
      <div className="mt-8 space-y-5">
        <p>Use TRAC BYPASS only with links and API keys you are allowed to use, and follow the terms of Bacon API.</p>
        <p>Do not use it to steal credentials, access accounts that are not yours, or get around protections you have no permission to bypass. Links to local or private network addresses are rejected.</p>
        <p>The service is provided as is. Results come from an upstream provider, may be slow or unavailable, and are not guaranteed. Requests are rate limited.</p>
      </div>
    </main>
  );
}
