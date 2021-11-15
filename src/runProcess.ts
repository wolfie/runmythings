import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";

export type StdIoHandler = (chunk: Buffer) => void;
type RunningProcess = PromiseLike<{ exitCode: number }> & {
  kill: () => void;
  onStdout: (cb: StdIoHandler) => void;
  onStderr: (cb: StdIoHandler) => void;
  pid: () => number | undefined;
  restart: () => RunningProcess;
};

const runProcess = (cmd: string, ...args: string[]): RunningProcess => {
  let stderrHandler: StdIoHandler | undefined = undefined;
  let stdoutHandler: StdIoHandler | undefined = undefined;
  let prc: ChildProcessWithoutNullStreams | undefined = undefined;
  let requestedExit = false;

  const promise = new Promise<{ exitCode: number }>((resolve, reject) => {
    prc = spawn(cmd, args, {
      cwd: path.resolve(__dirname, ".."),
    });

    prc.stderr.on("data", (chunk) => stderrHandler && stderrHandler(chunk));
    prc.stdout.on("data", (chunk) => stdoutHandler && stdoutHandler(chunk));

    prc.on("exit", (exitCode) => {
      prc = undefined;
      if (exitCode === 0 || requestedExit)
        resolve({ exitCode: exitCode ?? -1 });
      else reject({ exitCode });
    });
  });

  const ths: RunningProcess = {
    ...promise,
    kill: () => {
      requestedExit = true;
      if (prc) prc.kill("SIGTERM");
    },
    onStderr: (handler) => {
      stderrHandler = handler;
    },
    onStdout: (handler) => {
      stdoutHandler = handler;
    },
    pid: () => prc?.pid,
    restart: () => {
      ths.kill();
      return runProcess(cmd, ...args);
    },
  };

  return ths;
};

export default runProcess;
