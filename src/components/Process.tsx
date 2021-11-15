import React from "react";
import runProcess from "../runProcess";
import Scrollbox, { ScrollboxProps } from "./Scrollbox";

type Line = [type: "stdout" | "stderr", line: string];

export type ProcessProps = Omit<ScrollboxProps, "lines"> & {
  cmd: string[];
};
const Process: React.FC<ProcessProps> = ({ cmd, ...scrollboxProps }) => {
  const [stdout, setStdout] = React.useState<Line[]>([]);

  React.useEffect(() => {
    const process = runProcess(cmd[0], ...cmd.slice(1));
    process.onStdout((chunk) => {
      const string = chunk.toString("utf-8");
      const lines = string.split("\n");
      setStdout((stdout) => [
        ...stdout,
        ...lines.map<Line>((line) => ["stdout", line]),
      ]);
    });
    return () => process.kill();
  }, []);

  return (
    <Scrollbox lines={stdout.map((line) => line[1])} {...scrollboxProps} />
  );
};

export default Process;
