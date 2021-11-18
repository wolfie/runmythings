import splitQuotedString from "./splitQuotedString";

describe("splitQuotedString", () => {
  it("should split a non-quoted string on spaces", () => {
    expect(splitQuotedString("foo bar baz xyzzy")).toEqual([
      "foo",
      "bar",
      "baz",
      "xyzzy",
    ]);
  });

  it("should ignore multiple consecutive spaces", () => {
    expect(splitQuotedString("foo  bar    baz    xyzzy")).toEqual([
      "foo",
      "bar",
      "baz",
      "xyzzy",
    ]);
  });

  it("should let quoted texts be together", () => {
    expect(splitQuotedString('foo bar "baz xyzzy"')).toEqual([
      "foo",
      "bar",
      "baz xyzzy",
    ]);
  });

  it("should let multiple spaces within quotes be", () => {
    expect(splitQuotedString('foo bar "baz   xyzzy"')).toEqual([
      "foo",
      "bar",
      "baz   xyzzy",
    ]);
  });

  it("should let unbalanced quotes bleed to the end of the string", () => {
    expect(splitQuotedString('foo bar "baz xyzzy')).toEqual([
      "foo",
      "bar",
      "baz xyzzy",
    ]);
  });
});
