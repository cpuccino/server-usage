import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

/**
 * Wrap spawn in promise to listen to spawn events
 */
export async function spawnPromise (command: string = '', spawnArgs: string[] = [], options: SpawnOptionsWithoutStdio = {}) {
  return new Promise((res, rej) => {
    const env = {
      ...options.env,
      PATH: `${process.env?.PATH}:${options.env?.PATH}`,
      HOME: process.env?.HOME
    };
    const execution = spawn(command, spawnArgs, { ...options, env });

    const stdoutBuffer: string[] = [];
    const stderrBuffer: string[] = [];

    execution.stdout.on('data', (d) => {
      const data = d.toString();
      stdoutBuffer.push(data);
      console.log(data);
    });

    execution.stderr.on('data', (d) => {
      const data = d.toString();
      stderrBuffer.push(data);
      console.error(data);
    });

    execution.on('close', (code) => {
      if (stdoutBuffer.length) {
        console.info(stdoutBuffer.join('\n'));
      }

      if (stderrBuffer.length) {
        console.error(stderrBuffer.join('\n'));
      }

      return code === 0
        ? res(`Child process exited with code ${code})`)
        : rej(new Error(`${command} [${spawnArgs.join(',')}] exited with code ${code}`));
    });
  });
};

module.exports = { spawnPromise };