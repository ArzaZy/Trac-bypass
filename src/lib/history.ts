"use client";
import { useCallback, useEffect, useState } from "react";
import type { HistoryItem } from "@/types/api";

const KEY = "trac.history.v1";
const ENABLED = "trac.history.enabled";
const EVENT = "trac:history";
const MAX_ITEMS = 50;

function read(): HistoryItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((i) => i && typeof i.url === "string" && typeof i.result === "string") : [];
  } catch {
    return [];
  }
}

function write(items: HistoryItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    /* storage unavailable: history simply doesn't persist */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [enabled, setEnabledState] = useState(false);

  const refresh = useCallback(() => {
    setItems(read());
    try {
      setEnabledState(localStorage.getItem(ENABLED) === "1");
    } catch {
      setEnabledState(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return {
    items,
    enabled,
    setEnabled(v: boolean) {
      try {
        localStorage.setItem(ENABLED, v ? "1" : "0");
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    },
    add(url: string, result: string) {
      write([{ id: crypto.randomUUID(), url, result, at: Date.now() }, ...read()]);
    },
    remove(id: string) {
      write(read().filter((i) => i.id !== id));
    },
    clear() {
      write([]);
    },
  };
}
