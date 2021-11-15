import { Box, BoxProps, measureElement, Text } from "ink";
import React from "react";

const clamp = (min: number, max: number) => (n: number) =>
  Math.max(min, Math.min(max, n));

export type ScrollPos = number | "top" | "bottom";
type Props = BoxProps & {
  lines: string[];
  scrollTop: ScrollPos;
  onScrollClamped: (actualScrollTop: number) => void;
};

const Scrollbox = ({
  lines,
  scrollTop,
  onScrollClamped,
  ...boxProps
}: Props) => {
  const ref = React.useRef(null);
  const [boxHeight, setBoxHeight] = React.useState(0);

  const maxScrollPos = Math.max(0, lines.length - boxHeight);
  const clampScroll = clamp(0, maxScrollPos);

  React.useEffect(() => {
    if (!ref.current) return;
    const { height } = measureElement(ref.current);
    setBoxHeight(height);
  }, [lines]);

  const rawScrollTop =
    scrollTop === "bottom"
      ? lines.length - boxHeight
      : scrollTop === "top"
      ? 0
      : scrollTop;

  const clampedScrollTop = clampScroll(rawScrollTop);
  const scrollTopPercentage = clampedScrollTop / maxScrollPos;

  if (rawScrollTop !== clampedScrollTop)
    setTimeout(() => onScrollClamped(clampedScrollTop), 0);

  const visibleLines = lines.slice(
    clampedScrollTop,
    clampedScrollTop + boxHeight
  );

  return (
    <Box {...boxProps}>
      <Box height="100%" ref={ref} flexDirection="column" flexGrow={1}>
        {visibleLines.map((line, i) => (
          <Text key={i}>{line}</Text>
        ))}
      </Box>
      <Box width={1} flexDirection="column">
        <Box flexGrow={scrollTopPercentage}></Box>
        <Box>
          <Text>█</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Scrollbox;
