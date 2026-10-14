"use client";
import { motion, useReducedMotion } from "motion/react";
import { Embers } from "./embers";
import { ButtonLink } from "./ui/button";

const WORDS = ["Beyond", "the", "Ordinary."];

export function HeroSection() {
  const reduce = useReducedMotion();
  let idx = 0;
  return (
    <section id="home" className="relative isolate overflow-hidden px-5 pb-20 pt-32 sm:pt-44 md:pb-28">
      <div className="mist" aria-hidden />
      <Embers />
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs text-bone/60">TRAC BYPASS / URL PROCESSING</p>
        <h1
          aria-label="Beyond the Ordinary."
          className="mt-6 font-display text-[clamp(3.4rem,14vw,10rem)] leading-[0.92] tracking-tight"
        >
          {WORDS.map((word, wi) => (
            <span key={wi} aria-hidden className="mr-[0.22em] inline-block whitespace-nowrap">
              {[...word].map((ch, ci) => {
                const i = idx++;
                return reduce ? (
                  <span key={ci}>{ch}</span>
                ) : (
                  <motion.span
                    key={ci}
                    className="inline-block"
                    initial={{ opacity: 0, x: i % 2 ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 + i * 0.035, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {ch}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </h1>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-bone/65">
          A cleaner way to process your links.
          <br />
          Minimal interface. Precise execution.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#bypass" magnetic>Start Processing</ButtonLink>
          <ButtonLink href="#how" variant="secondary">How It Works</ButtonLink>
        </div>
      </div>
    </section>
  );
}
