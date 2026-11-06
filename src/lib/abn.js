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