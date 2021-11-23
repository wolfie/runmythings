import { Key, useInput } from "ink";
import { Styles } from "ink/build/styles";
import React from "react";
import Scrollbox from "./Scrollbox";
import os from "os";
import useProcess, { ExitHandler } from "../useProcess";

type Line = [type: "stdout" | "stderr" | "restart", line: string];

const hasCtrl = (key: Key): boolean =>
  (os.platform() === "darwin" && key.meta) || key.ctrl;

export type ProcessProps = Styles & {
  cmd: string;
  hasFocus: boolean;
};
const Process: React.FC<ProcessProps> = ({ cmd, hasFocus, ...styles }) => {
  const [lines, setLines] = React.useState<Line[]>([]);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [scrollboxHeight, setScrollboxHeight] = React.useState(0);

  const iohandler = (chunk: Buffer) => {
    const string = chunk.toString("utf-8");
    const lines = string.split("\n").filter((line) => line.length > 0);
    setLines((stdout) => [
      ...stdout,
      ...lines.map<Line>((line) => ["stdout", line]),
    ]);
  };

  const onExit = React.useMemo<ExitHandler>(
    () => (exitCode, signal) =>
      setLines((lines) => [
        ...lines,
        ["restart", `Exited with ${exitCode}/${signal}`],
      ]),
    [setLines]
  );

  const process = useProcess({
    cmd,
    stdoutHandler: iohandler,
    stderrHandler: iohandler,
    onExit,
  });

  const restart = () => {
    (process.status === "running" || process.status === "killed") &&
      process.restart();
    console.log(process.status);
  };
  const kill = () => {
    process.status === "running" && process.kill();
    console.log(process.status);
  };

  useInput((input, key) => {
    if (hasCtrl(key)) {
      switch (input) {
        case "r":
          return restart();
        case "k":
          return kill();
      }
    }

    if (!hasFocus) return;

    switch (input) {
      case "r":
        return restart();
      case "k":
        return kill();
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

  const pageful = Math.max(1, scrollboxHeight - 5);
  const scroll = (amount: number) => () =>
    setScrollTop((scrollTop) => scrollTop + amount);
  const scrollDown = scroll(2);
  const pageDown = scroll(pageful);
  const scrollUp = scroll(-2);
  const pageUp = scroll(-pageful);
  const home = () => setScrollTop(0);
  const end = () => setScrollTop(Infinity);

  return (
    <Scrollbox
      {...styles}
      lines={lines.map(([type, text]) =>
        type === "restart"
          ? { color: "black", backgroundColor: "red", text }
          : type === "stderr"
          ? { color: "red", text }
          : { text }
      )}
      hasFocus={hasFocus}
      scrollTop={scrollTop}
      onScrollTopUpdated={setScrollTop}
      onBoxHeightUpdated={setScrollboxHeight}
    />
  );
};

export default Process;

process.on("uncaughtException", (e, o) => {
  console.log({ e, o });
});
