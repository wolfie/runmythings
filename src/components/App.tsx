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
    }

    switch (true) {
      case key.leftArrow:
        return focusPrev();
      case key.rightArrow:
        return focusNext();
    }
  });

  const [screenWidth, screenHeight] = useStdoutDimensions();
  const [focusIndex, setFocusIndex] = React.useState(0);

  const focusNext = () =>
    setFocusIndex((currentFocus) => (currentFocus + 1) % ports.length);
  const focusPrev = () =>
    setFocusIndex((currentFocus) => {
      let nextFocus = currentFocus - 1;
      if (nextFocus < 0) nextFocus = ports.length - 1;
      return nextFocus;
    });

  return (
    <Box width={screenWidth - 1} height={screenHeight - 1}>
      {ports.map((port, i) => (
        <Process
          key={port}
          cmd={["node", "./echoLoop.js"]}
          width="33.33%"
          hasFocus={focusIndex === i}
        />
      ))}
    </Box>
  );
};

export default App;
