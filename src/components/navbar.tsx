"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "./ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "bypass", label: "Bypass" },
  { id: "status", label: "API Status" },
  { id: "faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const link = (id: string, label: string, mobile = false) => (
    <a
      key={id}
      href={`#${id}`}
      onClick={() => setOpen(false)}
      aria-current={active === id ? "true" : undefined}
      className={cn(
        "inline-flex items-center text-sm transition-colors",
        mobile ? "min-h-12 border-b border-bone/10 px-1" : "min-h-11 px-3",
        active === id ? "text-ember" : "text-bone/65 hover:text-bone",
      )}
    >
      {label}
    </a>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled || open ? "border-bone/10 bg-void/95" : "border-transparent bg-transparent",
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#home" className="font-mono text-sm font-medium tracking-[0.18em]">TRAC BYPASS</a>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => link(l.id, l.label))}
          <ButtonLink href="#bypass" magnetic className="ml-3 min-h-10">Launch App</ButtonLink>
        </div>
        <button
          type="button"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="border-t border-bone/10 px-5 pb-4 md:hidden">
          <div className="flex flex-col">{LINKS.map((l) => link(l.id, l.label, true))}</div>
          <ButtonLink href="#bypass" onClick={() => setOpen(false)} className="mt-4 w-full">Launch App</ButtonLink>
        </div>
      )}
    </header>
  );
}
