import { execSync } from 'child_process';

export function createSession(name: string): void {
  execSync(`tmux new -s ${name} -d`);
  console.log(`SESSION CREATED: ${name}`);
}

export function killSession(name: string): void {
  execSync(`tmux kill-ses -t ${name}`);
  console.log(`SESSION TERMINATED: ${name}`);
}

export function execOnSession(session: string, command: string): void {
  execSync(`tmux send-keys -t ${session} "${command}" Enter`);
  console.log(`Executed on ${session}: ${command}`);
}
