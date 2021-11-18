const splitQuotedString = (s: string) =>
  s
    .split('"')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s, i) => (i % 2 === 0 ? s.split(" ").filter(Boolean) : s))
    .flat();

export default splitQuotedString;
