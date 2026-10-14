import Link from "next/link";

export const metadata = { title: "Privacy — TRAC BYPASS" };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-24 leading-relaxed text-bone/80">
      <Link href="/" className="font-mono text-sm text-ember">Back to TRAC BYPASS</Link>
      <h1 className="mt-6 font-display text-5xl text-bone">Privacy</h1>
      <div className="mt-8 space-y-5">
        <p>When you process a link, it is sent to this site&apos;s server and then to Bacon API, which opens it. Their handling of it is governed by their own terms.</p>
        <p>In personal-key mode, your API key is sent in the body of an HTTPS request, used for that one request and forwarded to Bacon API. This app does not store it, write it to logs, or save it in your browser.</p>
        <p>The server logs only an outcome label and a duration. It does not log links, keys or IP addresses. Your hosting provider may keep its own standard request logs. Rate limiting holds your IP address in server memory for about a minute.</p>
        <p>Local history is off by default. If you turn it on, links and results are saved in this browser&apos;s localStorage on your device only, never sent to our server, and you can delete them at any time.</p>
      </div>
    </main>
  );
}
