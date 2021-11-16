import { useInput } from "ink";
import React from "react";
import runProcess from "../runProcess";
import Scrollbox, { ScrollboxProps } from "./Scrollbox";

type Line = [type: "stdout" | "stderr" | "restart", line: string];

export type ProcessProps = Omit<ScrollboxProps, "lines"> & {
  cmd: string[];
  hasFocus: boolean;
};
const Process: React.FC<ProcessProps> = ({
  cmd,
  hasFocus,
  ...scrollboxProps
}) => {
  const [stdout, setStdout] = React.useState<Line[]>([]);
  const [restartToken, setRestartToken] = React.useState(Symbol());

  useInput((input) => {
    if (!hasFocus) return;
    if (input === "r") {
      setRestartToken(Symbol());
      setStdout((stdout) => [...stdout, ["restart", "Restarting process"]]);
    }
  });

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
      lines={stdout.map((line) => line[1])}
      {...scrollboxProps}
      hasFocus={hasFocus}
    />
  );
};

export default Process;
