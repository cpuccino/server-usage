import { createSession, killSession, execOnSession } from './tmux';

const PORT = `7777`;
const WORLDPATH = `~/.local/share/Terraria/ModLoader/Worlds/`;
const TMODLOADER_START_CMD = `~/games/tmodloader/tModLoaderServer`;

export type GameConfig = {
  world: string;
  password: string;
  players: number;
};

export function startGameSession(GameConfig: GameConfig): void {
  createSession(GameConfig.world);
  const launchScript = `${TMODLOADER_START_CMD} -world ${WORLDPATH}${GameConfig.world}.wld -pass ${GameConfig.password} -players ${GameConfig.players} -port ${PORT} -upnp 1 -priority 1`;
  execOnSession(GameConfig.world, launchScript);
}

export function stopGameSession(GameConfig: GameConfig): void {
  killSession(GameConfig.world);
}
