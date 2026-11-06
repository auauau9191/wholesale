/** Dates read like "Fri 31 Oct". Fixed locale and zone so server and client match. */
export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatAud(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `A$${Number(value).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Factory prices are quoted in US$. */
export function formatUsd(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `US$${Number(value).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatQty(value) {
  if (value === null || value === undefined || value === "") return "—";
  return Number(value).toLocaleString("en-AU");
}

/** "20 Mar 2026", fixed zone. */
export function formatDayMonthYear(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** A whole-dollar amount: A$7,440. */
export function formatAudWhole(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `A$${Number(value).toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;
}

/** "Mar 2026", fixed zone so server and client agree. */
export function formatMonthYear(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-AU", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}