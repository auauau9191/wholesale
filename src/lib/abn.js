/**
 * ABN checksum, the official test: subtract 1 from the first digit, multiply
 * the 11 digits by the weights, and the total must divide by 89.
 */
const WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

export function normaliseAbn(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function isValidAbn(value) {
  const abn = normaliseAbn(value);
  if (abn.length !== 11) return false;
  const digits = abn.split("").map(Number);
  digits[0] -= 1;
  const total = digits.reduce((sum, digit, i) => sum + digit * WEIGHTS[i], 0);
  return total % 89 === 0;
}
/** The first 11 digits typed, nothing else. */
export const abnDigits = (value) => normaliseAbn(value).slice(0, 11);

/** "51824753556" -> "51 824 753 556", the way it reads on an ABN record. */
export function formatAbn(value) {
  const d = abnDigits(value);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 8), d.slice(8, 11)].filter(Boolean).join(" ");
}
