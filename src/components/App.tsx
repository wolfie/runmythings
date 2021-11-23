import React from "react";
import { Box, useApp, useInput } from "ink";
import useStdoutDimensions from "ink-use-stdout-dimensions";
import Process from "./Process";

type AppProps = {
  commands: string[];
};
const App: React.FC<AppProps> = ({ commands }) => {
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
    setFocusIndex((currentFocus) => (currentFocus + 1) % commands.length);
  const focusPrev = () =>
    setFocusIndex((currentFocus) => {
      let nextFocus = currentFocus - 1;
      if (nextFocus < 0) nextFocus = commands.length - 1;
      return nextFocus;
    });

  return (
    <Box width={screenWidth - 1} height={screenHeight - 1}>
      {commands.map((command, i) => (
        <Process
          key={command}
          cmd={command}
          width="33.33%"
          hasFocus={focusIndex === i}
        />
      ))}
    </Box>
  );
};

export default App;
