import type { AABB } from "./types";

/** True when two AABBs overlap on the XY plane. */
export function aabbOverlap(a: AABB, b: AABB): boolean {
  return (
    Math.abs(a.x - b.x) < a.hw + b.hw && Math.abs(a.y - b.y) < a.hh + b.hh
  );
}

export interface CollisionResult {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
}

/**
 * Resolve a moving AABB (the player) against a set of static solid AABBs.
 * Resolves the vertical axis first, then the horizontal axis, which is the
 * classic and most stable ordering for a platformer character.
 *
 * `nextX/nextY` is the desired position after integration; velocities are the
 * current velocities and get zeroed on the axis where a collision happens.
 */
export function resolveCollisions(
  hw: number,
  hh: number,
  prevX: number,
  nextX: number,
  nextY: number,
  vx: number,
  vy: number,
  solids: AABB[],
): CollisionResult {
  let grounded = false;

  // --- Vertical pass (move along Y first, keep X at previous position) ---
  let y = nextY;
  const movedBox: AABB = { x: prevX, y, hw, hh };
  for (const s of solids) {
    movedBox.y = y;
    if (!aabbOverlap(movedBox, s)) continue;
    if (vy <= 0) {
      // falling -> land on top of the solid
      y = s.y + s.hh + hh;
      grounded = true;
    } else {
      // moving up -> bonk head on the underside
      y = s.y - s.hh - hh;
    }
    vy = 0;
  }

  // --- Horizontal pass (now with the resolved Y) ---
  let x = nextX;
  const hBox: AABB = { x, y, hw, hh };
  for (const s of solids) {
    hBox.x = x;
    if (!aabbOverlap(hBox, s)) continue;
    if (vx > 0) {
      x = s.x - s.hw - hw;
    } else if (vx < 0) {
      x = s.x + s.hw + hw;
    }
    vx = 0;
  }

  return { x, y, vx, vy, grounded };
}
