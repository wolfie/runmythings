import { useInput } from "ink";
import { Styles } from "ink/build/styles";
import React from "react";
import runProcess from "../runProcess";
import Scrollbox from "./Scrollbox";

type Line = [type: "stdout" | "stderr" | "restart", line: string];

export type ProcessProps = Styles & {
  cmd: string[];
  hasFocus: boolean;
};
const Process: React.FC<ProcessProps> = ({ cmd, hasFocus, ...styles }) => {
  const [stdout, setStdout] = React.useState<Line[]>([]);
  const [restartToken, setRestartToken] = React.useState(Symbol());
  const [scrollTop, setScrollTop] = React.useState(0);
  const [scrollboxHeight, setScrollboxHeight] = React.useState(0);

  useInput((input, key) => {
    if (!hasFocus) return;

    switch (input) {
      case "r":
        return restart();
      case "[1~":
        return home();
      case "[4~":
        return end();
    }

    switch (true) {
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

  const restart = () => {
    setRestartToken(Symbol());
    setStdout((stdout) => [...stdout, ["restart", "Restarting process"]]);
  };

  const pageful = Math.max(1, scrollboxHeight - 5);
  const scroll = (amount: number) => () =>
    setScrollTop((scrollTop) => scrollTop + amount);
  const scrollDown = scroll(2);
  const pageDown = scroll(pageful);
  const scrollUp = scroll(-2);
  const pageUp = scroll(-pageful);
  const home = () => setScrollTop(0);
  const end = () => setScrollTop(Infinity);

  React.useEffect(() => {
    const process = runProcess(cmd[0], ...cmd.slice(1));
    process.onStdout((chunk) => {
      const string = chunk.toString("utf-8");
      const lines = string.split("\n").filter((line) => line.length > 0);
      setStdout((stdout) => [
        ...stdout,
        ...lines.map<Line>((line) => ["stdout", line]),
      ]);
    });
    return () => process.kill();
  }, [restartToken]);

  return (
    <Scrollbox
      {...styles}
      lines={stdout.map((line) => line[1])}
      hasFocus={hasFocus}
      scrollTop={scrollTop}
      onScrollTopUpdated={setScrollTop}
      onBoxHeightUpdated={setScrollboxHeight}
    />
  );
};

export default Process;
