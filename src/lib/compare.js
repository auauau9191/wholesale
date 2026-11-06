import { useEffect, useState } from "react";

const KEY = "wholesale-compare";
const CHANGE = "wholesale-compare-change";
const MAX = 4;

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function write(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
  window.dispatchEvent(new Event(CHANGE));
}

/** The products a member has put side by side. Four at most. */
export function useCompare() {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    const sync = () => setIds(read());
    sync();
    window.addEventListener(CHANGE, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const atLimit = ids.length >= MAX;

  return {
    ids,
    atLimit,
    has: (id) => ids.includes(id),
    add: (id) => {
      const current = read();
      if (current.includes(id) || current.length >= MAX) return;
      write([...current, id]);
    },
    remove: (id) => write(read().filter((value) => value !== id)),
    clear: () => write([]),
  };
}