import { Box, BoxProps, measureElement, Text } from "ink";
import React from "react";

const clamp = (min: number, max: number) => (n: number) =>
  Math.max(min, Math.min(max, n));

export type ScrollPos = number | "top" | "bottom";
export type ScrollboxProps = BoxProps & {
  lines: string[];
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

  const maxScrollPos = Math.max(0, lines.length - boxHeight);
  const clampScroll = clamp(0, maxScrollPos);

  React.useEffect(() => {
    if (!ref.current) return;
    const { height } = measureElement(ref.current);
    setBoxHeight(height);
    onBoxHeightUpdated(height);
  }, [lines]);

  const rawScrollTop =
    scrollTop === "bottom"
      ? lines.length - boxHeight
      : scrollTop === "top"
      ? 0
      : scrollTop;

  const clampedScrollTop = clampScroll(rawScrollTop);
  const scrollTopPercentage = clampedScrollTop / maxScrollPos;

  const autoscrolledScrollTop =
    clampedScrollTop + 1 === maxScrollPos ? maxScrollPos : clampedScrollTop;

  if (rawScrollTop !== autoscrolledScrollTop)
    setTimeout(() => onScrollTopUpdated(autoscrolledScrollTop), 0);

  const visibleLines = lines.slice(
    autoscrolledScrollTop,
    autoscrolledScrollTop + boxHeight
  );

  return (
    <Box {...boxProps} borderStyle={hasFocus ? "double" : "single"}>
      <Box height="100%" ref={ref} flexDirection="column" flexGrow={1}>
        {visibleLines.map((line, i) => (
          <Text key={i}>{line}</Text>
        ))}
      </Box>
      {boxHeight < lines.length && (
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
