const wrapLine =
  (width: number) =>
  (str: string): string[] => {
    if (str.length <= width) return [str];

    const lines: string[] = [];
    let line = "";
    while (str) {
      const indexOfFirstSpace = str.indexOf(" ");
      if (
        indexOfFirstSpace > width ||
        (line === "" && indexOfFirstSpace === -1)
      ) {
        line && lines.push(line);
        lines.push(str.substr(0, width));
        str = str.substr(width);
        line = "";
      } else {
        const nextWord =
          indexOfFirstSpace !== -1 ? str.substr(0, indexOfFirstSpace) : str;

        if (nextWord.length + line.length + 1 > width) {
          lines.push(line);
          line = "";
        }
        line = line ? line + " " + nextWord : nextWord;
        str = indexOfFirstSpace !== -1 ? str.substr(indexOfFirstSpace + 1) : "";
      }
    }
    if (line) lines.push(line);
    return lines.map((lines) => lines.trimEnd()).filter((line) => !!line);
  };

const wrapText = (str: string, width: number) =>
  str
    .split("\n")
    .map((line) => line.trimEnd())
    .map(wrapLine(width))
    .flat();

export default wrapText;
