import { exec, ChildProcess } from "child_process";
import { SIGTERM } from "constants";
import React from "react";

export type StdIoHandler = (chunk: Buffer) => void;
export type RunningProcess = Promise<{ exitCode: number }> & {
  kill: () => void;
  onStdout: (cb: StdIoHandler) => void;
  onStderr: (cb: StdIoHandler) => void;
  pid: () => number | undefined;
  restart: () => RunningProcess;
};

export type SpawnError = Error & {
  errno: number;
  code: string;
  syscall: string;
  path: string;
  spawnargs: string[];
};

export const isSpawnError = (e: unknown): e is SpawnError =>
  typeof e === "object" && e !== null && typeof (e as any).errno === "number";

type ExitInfo = {
  code: number | null;
  signal: NodeJS.Signals | null;
};

type UseProcessState =
  | {
      status: "killed";
      exitInfo: ExitInfo;
      restart: () => void;
    }
  | {
      status: "running";
      restart: () => void;
      kill: () => void;
    };

export type ExitHandler = (
  exitCode: number | null,
  signal: NodeJS.Signals | null
) => void;
export type IoHandler = (buffer: Buffer) => void;

type UseProcessArgs = {
  cmd: string;
  stdoutHandler?: IoHandler;
  stderrHandler?: IoHandler;
  onExit?: ExitHandler;
};
const useProcess = ({
  cmd,
  stdoutHandler,
  stderrHandler,
  onExit,
}: UseProcessArgs): UseProcessState => {
  const [processInfo, setProcessInfo] =
    React.useState<{ process: ChildProcess; controller: AbortController }>();
  const [exitInfo, setExitInfo] = React.useState<ExitInfo>();
  const [restartSymbol, setRestartSymbol] = React.useState(Symbol());

  React.useEffect(() => {
    const controller = new AbortController();
    const newProcess = exec(cmd, {
      signal: controller.signal,
      maxBuffer: 1024 * 1024,
    });

    setProcessInfo({ process: newProcess, controller });
    setExitInfo(undefined);
  }, [restartSymbol]);

  React.useEffect(() => {
    if (!processInfo) return;
    return () => {
      processInfo.controller.abort();
    };
  }, [processInfo]);

  React.useEffect(() => {
    if (!processInfo) return;
    const exitListener = (
      code: number | null,
      signal: NodeJS.Signals | null
    ) => {
      setExitInfo({ code, signal });
      setProcessInfo(undefined);
    };
    processInfo.process.on("exit", exitListener);
    return () => {
      processInfo.process.off("exit", exitListener);
    };
  }, [processInfo]);

  React.useEffect(() => {
    if (!processInfo) return;
    stdoutHandler && processInfo.process.stdout?.on("data", stdoutHandler);
    stderrHandler && processInfo.process.stderr?.on("data", stderrHandler);

    return () => {
      stdoutHandler && processInfo.process.stdout?.off("data", stdoutHandler);
      stderrHandler && processInfo.process.stderr?.off("data", stderrHandler);
    };
  }, [processInfo, stdoutHandler, stderrHandler]);

  React.useEffect(() => {
    if (!processInfo || !onExit) return;
    processInfo.process.on("exit", onExit);
    return () => {
      processInfo.process.off("exit", onExit);
    };
  }, [processInfo, onExit]);

  return typeof exitInfo !== "undefined"
    ? {
        status: "killed",
        exitInfo,
        restart: () => setRestartSymbol(Symbol()),
      }
    : {
        status: "running",
        restart: () => setRestartSymbol(Symbol()),
        kill: () => setProcessInfo(undefined),
      };
};

export default useProcess;
