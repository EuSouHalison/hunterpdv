import { createContext, useContext } from "react";
import type { AABB, LevelData } from "./types";
import { PLAYER } from "./constants";

export interface PlayerSim {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  facing: 1 | -1;
  /** id of the barrel currently holding the player, or null */
  inBarrel: string | null;
  /** seconds before the player can be captured by a barrel again */
  barrelCooldown: number;
}

export interface EnemySim {
  x: number;
  dir: 1 | -1;
  alive: boolean;
}

export interface Sim {
  player: PlayerSim;
  enemies: Record<string, EnemySim>;
  solids: AABB[];
}

/** Build a fresh simulation snapshot from level data. */
export function createSim(level: LevelData): Sim {
  const enemies: Record<string, EnemySim> = {};
  for (const e of level.enemies) {
    enemies[e.id] = { x: e.x, dir: 1, alive: true };
  }
  const solids: AABB[] = level.platforms.map((p) => ({
    x: p.x,
    y: p.y,
    hw: p.w / 2,
    hh: p.h / 2,
  }));
  return {
    player: {
      x: level.spawn.x,
      y: level.spawn.y,
      vx: 0,
      vy: 0,
      grounded: false,
      facing: 1,
      inBarrel: null,
      barrelCooldown: 0,
    },
    enemies,
    solids,
  };
}

export const PLAYER_HW = PLAYER.width / 2;
export const PLAYER_HH = PLAYER.height / 2;

export const SimContext = createContext<Sim | null>(null);

export function useSim(): Sim {
  const sim = useContext(SimContext);
  if (!sim) throw new Error("useSim must be used inside <SimContext.Provider>");
  return sim;
}
