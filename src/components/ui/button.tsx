"use client";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const variants: Record<Variant, string> = {
  primary: "bg-ember text-void hover:bg-ember/90",
  secondary: "border border-bone/20 text-bone hover:border-bone/40 hover:bg-bone/5",
  ghost: "text-bone/70 hover:text-bone hover:bg-bone/5",
};

/** Small pointer-follow offset. Mouse only, never on touch, never with reduced motion. */
function useMagnet(enabled: boolean) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const active = enabled && !reduce;
  return {
    style: active ? { x: sx, y: sy } : undefined,
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (!active || e.pointerType !== "mouse") return;
      const r = e.currentTarget.getBoundingClientRect();
      x.set(Math.max(-6, Math.min(6, (e.clientX - (r.left + r.width / 2)) * 0.12)));
      y.set(Math.max(-4, Math.min(4, (e.clientY - (r.top + r.height / 2)) * 0.18)));
    },
    onPointerLeave: () => {
      x.set(0);
      y.set(0);
    },
  };
}

export function Button({
  variant = "primary",
  magnetic = false,
  className,
  ...props
}: Omit<React.ComponentProps<typeof motion.button>, "style"> & { variant?: Variant; magnetic?: boolean }) {
  const m = useMagnet(magnetic);
  return <motion.button {...m} {...props} className={cn(base, variants[variant], className)} />;
}

export function ButtonLink({
  variant = "primary",
  magnetic = false,
  className,
  ...props
}: Omit<React.ComponentProps<typeof motion.a>, "style"> & { variant?: Variant; magnetic?: boolean }) {
  const m = useMagnet(magnetic);
  return <motion.a {...m} {...props} className={cn(base, variants[variant], className)} />;
}
