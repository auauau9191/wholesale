/**
 * The sample tag: the brand mark. A rounded tag with a punched hole and two
 * short lines, in olive. Never letters in a square.
 */
export default function SampleTag({ className = "", tone = "ink" }) {
  const stroke = tone === "ink" ? "#38450f" : "#23290f";
  return (
    <svg
      viewBox="0 0 40 26"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 1h20.6c1.3 0 2.5.6 3.4 1.6l7 8.1c1 1.2 1 3 0 4.2l-7 8.1c-.9 1-2.1 1.6-3.4 1.6H7c-3.3 0-6-2.7-6-6V7c0-3.3 2.7-6 6-6Z"
        stroke={stroke}
        strokeWidth="2"
      />
      <circle cx="9.5" cy="13" r="2.6" stroke={stroke} strokeWidth="2" />
      <path d="M17 9.5h13.5M17 16.5h9" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}