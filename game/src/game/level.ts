import type { LevelData, PlatformData } from "./types";

// Helper: define a platform by its TOP surface height (more intuitive when
// authoring a level than the geometric center).
function plat(x: number, top: number, w: number, h: number): PlatformData {
  return { x, y: top - h / 2, w, h };
}

/**
 * Level 1 — "Canopy Run".
 * An original left-to-right course: solid ground segments and floating ledges
 * separated by jumpable gaps (fall in a gap = pit death), patrolling enemies,
 * a spike hazard, an optional barrel-cannon boost to a high bonus fruit, and a
 * goal totem at the end. No layouts, art, or audio are copied from any
 * existing game.
 */
export const LEVEL_1: LevelData = {
  name: "Canopy Run",
  spawn: { x: 0, y: 2 },
  bounds: { minX: -2, maxX: 62 },

  platforms: [
    plat(6, 0, 16, 2), // G1 starting ground   (-2 .. 14)
    plat(18, 1.5, 4, 1), // P1 ledge            (16 .. 20)
    plat(24, 1.5, 4, 1), // P2 ledge            (22 .. 26)
    plat(33, 0, 10, 2), // G2 mid ground        (28 .. 38)
    plat(43, 2, 4, 1), // P3 ledge              (41 .. 45)
    plat(54, 0, 12, 2), // G3 final ground      (48 .. 60)
  ],

  collectibles: [
    { id: "c1", x: 4, y: 1.5 },
    { id: "c2", x: 8, y: 1.5 },
    { id: "c3", x: 12, y: 2 },
    { id: "c4", x: 18, y: 3 },
    { id: "c5", x: 24, y: 3 },
    { id: "c6", x: 31, y: 1.5 },
    { id: "c7", x: 33, y: 7 }, // high bonus, reachable via the barrel
    { id: "c8", x: 43, y: 3.6 },
    { id: "c9", x: 51, y: 1.5 },
    { id: "c10", x: 57, y: 1.5 },
  ],

  enemies: [
    { id: "e1", x: 9, y: 0, range: 3, speed: 2 },
    { id: "e2", x: 33, y: 0, range: 4, speed: 2.6 },
    { id: "e3", x: 52, y: 0, range: 3, speed: 2 },
  ],

  barrels: [
    // Sits on G2; fires the player almost straight up to grab the bonus fruit.
    { id: "b1", x: 33, y: 1.2, angle: 90, power: 17 },
  ],

  hazards: [
    // Spikes near the right edge of G2 — jump over them.
    { id: "h1", x: 37, y: 0.3, w: 1.6, h: 0.6 },
  ],

  goal: { x: 57, y: 0 },
};
