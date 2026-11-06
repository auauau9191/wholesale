/** The tag's punched code block: a mark, not a link. */
export default function TagMark({ seed = "S07", className = "" }) {
  let state = 7;
  for (let index = 0; index < seed.length; index += 1) {
    state = (state * 31 + seed.charCodeAt(index)) % 100003;
  }
  const cells = [];
  for (let row = 0; row < 11; row += 1) {
    for (let column = 0; column < 11; column += 1) {
      const finder =
        (row < 3 && column < 3) || (row < 3 && column > 7) || (row > 7 && column < 3);
      state = (state * 1103515245 + 12345) % 2147483648;
      if (finder || state % 5 > 1) cells.push(`${row}-${column}`);
    }
  }
  return (
    <svg viewBox="0 0 11 11" className={className} aria-hidden="true" fill="currentColor">
      {cells.map((key) => {
        const [row, column] = key.split("-");
        return <rect key={key} x={column} y={row} width="1" height="1" />;
      })}
    </svg>
  );
}