import { Box, BoxProps, measureElement, Text, TextProps } from "ink";
import React from "react";
import clamp from "../lib/clamp";
import wrapText from "../lib/wrapText";

type Line =
  | string
  | ({ text: string } & Pick<TextProps, "color" | "backgroundColor">);

export type ScrollPos = number | "top" | "bottom";
export type ScrollboxProps = BoxProps & {
  lines: Line[];
  scrollTop: ScrollPos;
  onScrollTopUpdated: (actualScrollTop: number) => void;
  onBoxHeightUpdated: (rows: number) => void;
  hasFocus: boolean;
};

const Scrollbox = ({
  lines,
  scrollTop,
  onScrollTopUpdated,
  hasFocus,
  onBoxHeightUpdated,
  ...boxProps
}: ScrollboxProps) => {
  const ref = React.useRef(null);
  const [boxHeight, setBoxHeight] = React.useState(0);
  const [boxWidth, setBoxWidth] = React.useState(0);

  const wrappedLines: Line[] = React.useMemo(
    () =>
      lines
        .map((line) =>
          typeof line === "string"
            ? wrapText(line, boxWidth)
            : wrapText(line.text, boxWidth).map((text) => ({ ...line, text }))
        )
        .flat(),
    [lines, boxWidth]
  );

  const maxScrollPos = Math.max(0, wrappedLines.length - boxHeight);
  const clampScroll = clamp(0, maxScrollPos);

  React.useEffect(() => {
    if (!ref.current) return;
    const { width, height } = measureElement(ref.current);
    setBoxHeight(height);
    setBoxWidth(width);
    onBoxHeightUpdated(height);

    // const debug = wrappedLines.filter(
    //   (line) => typeof line !== "string" && typeof line.color !== "undefined"
    // ).length;
    // debug && console.log(debug);
  }, [wrappedLines]);

  const rawScrollTop =
    scrollTop === "bottom"
      ? wrappedLines.length - boxHeight
      : scrollTop === "top"
      ? 0
      : scrollTop;

  const clampedScrollTop = clampScroll(rawScrollTop);
  const scrollTopPercentage = clampedScrollTop / maxScrollPos;

  const autoscrolledScrollTop =
    clampedScrollTop + 1 === maxScrollPos ? maxScrollPos : clampedScrollTop;

  if (rawScrollTop !== autoscrolledScrollTop)
    setTimeout(() => onScrollTopUpdated(autoscrolledScrollTop), 0);

  const visibleLines = wrappedLines.slice(
    autoscrolledScrollTop,
    autoscrolledScrollTop + boxHeight
  );

  return (
    <Box {...boxProps} borderStyle={hasFocus ? "double" : "single"}>
      <Box height="100%" ref={ref} flexDirection="column" flexGrow={1}>
        {visibleLines.map((line, i) =>
          typeof line === "string" ? (
            <Text key={i}>{line}</Text>
          ) : (
            <Text
              key={i}
              color={line.color}
              backgroundColor={line.backgroundColor}
            >
              {line.text}
            </Text>
          )
        )}
      </Box>
      {boxHeight < wrappedLines.length && (
        <Box width={1} flexDirection="column">
          <Box flexGrow={scrollTopPercentage}></Box>
          <Box>
            <Text>█</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Scrollbox;
