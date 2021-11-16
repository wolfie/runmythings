import React from "react";
import { Box, useApp, useInput } from "ink";
import useStdoutDimensions from "ink-use-stdout-dimensions";
import Process from "./Process";

const ports = [8080, 8081, 8082];

const App = () => {
  const { exit } = useApp();
  useInput((input, key) => {
    // console.log(input);
    switch (input) {
      case "q":
        return exit();
      case "[1~":
        return home();
      case "[4~":
        return end();
    }

    switch (true) {
      case key.leftArrow:
        return focusPrev();
      case key.rightArrow:
        return focusNext();
      case key.downArrow:
        return scrollDown();
      case key.pageDown:
        return pageDown();
      case key.upArrow:
        return scrollUp();
      case key.pageUp:
        return pageUp();
    }
  });

  const [screenWidth, screenHeight] = useStdoutDimensions();
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [scrollPositions, setScrollPositions] = React.useState(
    ports.map((_) => 0)
  );

  const setScrollPosition = (top: number, i: number) =>
    setScrollPositions((scrollPositions) => ({ ...scrollPositions, [i]: top }));
  const modifyScrollPosition = (topChange: number, i: number) =>
    setScrollPositions((scrollPositions) => ({
      ...scrollPositions,
      [i]: scrollPositions[i] + topChange,
    }));

  const focusNext = () =>
    setFocusIndex((currentFocus) => (currentFocus + 1) % ports.length);
  const focusPrev = () =>
    setFocusIndex((currentFocus) => {
      let nextFocus = currentFocus - 1;
      if (nextFocus < 0) nextFocus = ports.length - 1;
      return nextFocus;
    });

  const pageful = Math.max(1, screenHeight - 5);
  const scroll = (amount: number) => () =>
    modifyScrollPosition(amount, focusIndex);
  const scrollDown = scroll(2);
  const pageDown = scroll(pageful);
  const scrollUp = scroll(-2);
  const pageUp = scroll(-pageful);
  const home = () => setScrollPosition(0, focusIndex);
  const end = () => setScrollPosition(Infinity, focusIndex);

  return (
    <Box width={screenWidth - 1} height={screenHeight - 1}>
      {ports.map((port, i) => (
        <Process
          key={port}
          cmd={["node", "./echoLoop.js"]}
          borderStyle={focusIndex === i ? "double" : "single"}
          width="33.33%"
          scrollTop={scrollPositions[i]}
          onScrollTopUpdated={(actualScrollTop) =>
            setScrollPosition(actualScrollTop, i)
          }
        />
      ))}
    </Box>
  );
};

export default App;
