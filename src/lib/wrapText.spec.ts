import wrapText from "./wrapText";

describe("wrapText", () => {
  it("doesn't wrap text if not needed", () => {
    expect(wrapText("one line of text", 90)).toEqual(["one line of text"]);
  });

  it("wraps with newlines", () => {
    expect(wrapText("one line\nof text", 90)).toEqual(["one line", "of text"]);
  });

  it("wraps with newlines and widths", () => {
    expect(wrapText("one line of\ntext", 9)).toEqual([
      "one line",
      "of",
      "text",
    ]);
  });

  it("trims whitespace at the end of lines", () => {
    expect(wrapText(" two \n lines ", 90)).toEqual([" two", " lines"]);
  });

  it("doesn't trim whitespace around wraps", () => {
    expect(wrapText("two     lines", 5)).toEqual(["two", "lines"]);
  });

  it("hard-cuts words that are too long to fit into one wrap", () => {
    expect(wrapText("Supercalifragilisticexpialidocious!", 5)).toEqual([
      "Super",
      "calif",
      "ragil",
      "istic",
      "expia",
      "lidoc",
      "ious!",
    ]);
  });

  it("hard-cuts words in sentences that are too long to fit into one wrap", () => {
    expect(
      wrapText("the Supercalifragilisticexpialidocious dude a dud", 5)
    ).toEqual([
      "the",
      "Super",
      "calif",
      "ragil",
      "istic",
      "expia",
      "lidoc",
      "ious",
      "dude",
      "a dud",
    ]);
  });
});
