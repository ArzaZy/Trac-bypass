"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";

const FAQ = [
  ["What is Trac Bypass?", "A small web app that sends a link to Bacon API and shows the result it returns. It does not create results itself."],
  ["How does link processing work?", "The link is validated in your browser and on our server, then our server sends it to Bacon API. When Bacon API replies successfully, the result link appears here."],
  ["Why did my request fail?", "Common reasons are an invalid or non-public link, a rejected key, rate limiting, a timeout, or a problem on Bacon API's side. The error message under the button says which one applies."],
  ["Why is my API key rejected?", "Bacon API reports keys that are invalid, not yet redeemed or expired. Redeem the key with the provider first, then try again."],
  ["Is my API key stored?", "No. In personal-key mode it travels in the HTTPS request body, is forwarded for that single request and is not saved by this app, in its logs, or in your browser. In server-key mode the key lives only in a server environment variable."],
  ["Why can processing take longer?", "Bacon API can take up to 90 seconds. This site stops waiting after about 55 seconds, so a very slow link can end in a timeout. Requests are never retried automatically, to avoid processing a link twice."],
  ["What happens when the rate limit is exceeded?", "Each visitor can send 8 requests per minute and one at a time. Past that you get a message with how long to wait. Bacon API also has its own limits."],
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
      <h2 className="font-display text-4xl sm:text-5xl">FAQ</h2>
      <div className="mt-8 divide-y divide-bone/10 border-y border-bone/10">
        {FAQ.map(([q, a], i) => (
          <div key={q}>
            <h3>
              <button
                type="button"
                id={`faq-q-${i}`}
                aria-expanded={open === i}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-base"
              >
                {q}
                <Plus size={18} aria-hidden className={`shrink-0 text-ember transition-transform ${open === i ? "rotate-45" : ""}`} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="max-w-prose pb-5 text-sm leading-relaxed text-bone/65">{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
