const STEPS = [
  { title: "Paste a link", body: "Your link is checked in the browser, then again on the server. Only public http and https addresses are accepted." },
  { title: "We send it to Bacon API", body: "Our server forwards it with the API key. The browser never contacts Bacon API directly and never sees a server key." },
  { title: "Receive the result", body: "A result appears only after Bacon API returns a successful response. Processing can take up to 90 seconds." },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="font-display text-4xl sm:text-5xl">How it works</h2>
      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="border-t border-bone/15 pt-5">
            <span className="font-mono text-xs text-ember">Step {i + 1}</span>
            <h3 className="mt-3 text-lg">{s.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-bone/60">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
