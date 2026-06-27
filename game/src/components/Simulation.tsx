import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useSim, PLAYER_HW, PLAYER_HH } from "../game/sim";
import { resolveCollisions, aabbOverlap } from "../game/physics";
import { PHYSICS, PLAYER, GAME } from "../game/constants";
import { useInput } from "../game/useInput";
import { useGameStore } from "../state/gameStore";
import type { LevelData } from "../game/types";

const ENEMY_HALF = 0.45;
const COLLECT_RADIUS = 0.9;
const BARREL_HALF = 0.7;

/**
 * Headless component: owns the authoritative game loop. It mutates the shared
 * `sim` object in place (no React state for high-frequency values) and only
 * touches the zustand store for discrete events (collect / damage / win).
 * Mounted before the visual entities so they read freshly-updated values.
 */
export function Simulation({ level }: { level: LevelData }) {
  const sim = useSim();
  const { state: input, consumeJumpPressed } = useInput();

  // Forgiving-jump timers, kept in a ref alongside the fixed-step accumulator.
  const t = useRef({ coyote: 0, buffer: 0, accumulator: 0 });

  useFrame((_, rawDelta) => {
    const phase = useGameStore.getState().phase;
    if (phase !== "playing") return;

    // Clamp the frame delta then run the sim in fixed sub-steps for stability.
    const frameDelta = Math.min(rawDelta, PHYSICS.maxFrameDt);
    t.current.accumulator += frameDelta;

    while (t.current.accumulator >= PHYSICS.fixedDt) {
      t.current.accumulator -= PHYSICS.fixedDt;
      step(PHYSICS.fixedDt);
    }
  });

  function step(dt: number) {
    const p = sim.player;

    // ---- enemies patrol ----
    for (const e of level.enemies) {
      const es = sim.enemies[e.id];
      if (!es.alive) continue;
      es.x += es.dir * e.speed * dt;
      if (es.x > e.x + e.range) {
        es.x = e.x + e.range;
        es.dir = -1;
      } else if (es.x < e.x - e.range) {
        es.x = e.x - e.range;
        es.dir = 1;
      }
    }

    if (p.barrelCooldown > 0) p.barrelCooldown -= dt;

    // ---- barrel cannon ----
    if (p.inBarrel) {
      const b = level.barrels.find((bb) => bb.id === p.inBarrel)!;
      p.x = b.x;
      p.y = b.y;
      p.vx = 0;
      p.vy = 0;
      if (consumeJumpPressed()) {
        const rad = (b.angle * Math.PI) / 180;
        p.vx = Math.cos(rad) * b.power;
        p.vy = Math.sin(rad) * b.power;
        p.facing = p.vx >= 0 ? 1 : -1;
        p.inBarrel = null;
        p.barrelCooldown = 0.6;
      }
      return; // skip normal physics while loaded
    }

    // ---- horizontal input ----
    const dir = (input.current.right ? 1 : 0) - (input.current.left ? 1 : 0);
    const control = p.grounded ? 1 : PHYSICS.airControl;
    if (dir !== 0) {
      p.vx += dir * PHYSICS.acceleration * control * dt;
      p.vx = Math.max(-PHYSICS.moveSpeed, Math.min(PHYSICS.moveSpeed, p.vx));
      p.facing = dir > 0 ? 1 : -1;
    } else if (p.grounded) {
      // friction to a stop
      const drop = PHYSICS.groundFriction * dt;
      if (Math.abs(p.vx) <= drop) p.vx = 0;
      else p.vx -= Math.sign(p.vx) * drop;
    }

    // ---- gravity ----
    p.vy += PHYSICS.gravity * dt;
    if (p.vy < PHYSICS.maxFallSpeed) p.vy = PHYSICS.maxFallSpeed;

    // ---- jump with coyote time + input buffering ----
    if (consumeJumpPressed()) t.current.buffer = PHYSICS.jumpBuffer;
    else t.current.buffer = Math.max(0, t.current.buffer - dt);

    if (p.grounded) t.current.coyote = PHYSICS.coyoteTime;
    else t.current.coyote = Math.max(0, t.current.coyote - dt);

    if (t.current.buffer > 0 && t.current.coyote > 0) {
      p.vy = PHYSICS.jumpSpeed;
      t.current.buffer = 0;
      t.current.coyote = 0;
      p.grounded = false;
    }

    // ---- integrate + collide ----
    const nextX = p.x + p.vx * dt;
    const nextY = p.y + p.vy * dt;
    const res = resolveCollisions(
      PLAYER_HW,
      PLAYER_HH,
      p.x,
      nextX,
      nextY,
      p.vx,
      p.vy,
      sim.solids,
    );
    p.x = res.x;
    p.y = res.y;
    p.vx = res.vx;
    p.vy = res.vy;
    p.grounded = res.grounded;

    const playerBox = { x: p.x, y: p.y, hw: PLAYER_HW, hh: PLAYER_HH };

    // ---- collectibles ----
    const store = useGameStore.getState();
    for (const c of level.collectibles) {
      if (store.collected.has(c.id)) continue;
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      if (dx * dx + dy * dy < COLLECT_RADIUS * COLLECT_RADIUS) {
        store.collect(c.id, 100);
      }
    }

    // ---- barrel capture ----
    if (p.barrelCooldown <= 0) {
      for (const b of level.barrels) {
        const box = { x: b.x, y: b.y, hw: BARREL_HALF, hh: BARREL_HALF };
        if (aabbOverlap(playerBox, box)) {
          p.inBarrel = b.id;
          break;
        }
      }
    }

    // ---- enemies: stomp vs hit ----
    for (const e of level.enemies) {
      const es = sim.enemies[e.id];
      if (!es.alive) continue;
      const cy = e.y + ENEMY_HALF;
      const box = { x: es.x, y: cy, hw: ENEMY_HALF, hh: ENEMY_HALF };
      if (!aabbOverlap(playerBox, box)) continue;
      const fallingOnTop = p.vy <= 0 && p.y - PLAYER_HH > cy - 0.15;
      if (fallingOnTop) {
        es.alive = false;
        p.vy = PLAYER.stompBounce;
        store.collect(`stomp-${e.id}`, 150);
      } else {
        damage();
        return;
      }
    }

    // ---- hazards ----
    for (const h of level.hazards) {
      const box = { x: h.x, y: h.y, hw: h.w / 2, hh: h.h / 2 };
      if (aabbOverlap(playerBox, box)) {
        damage();
        return;
      }
    }

    // ---- pit death ----
    if (p.y < GAME.fallLimitY) {
      damage();
      return;
    }

    // ---- goal ----
    const goalBox = { x: level.goal.x, y: level.goal.y + 1, hw: 0.9, hh: 1.2 };
    if (aabbOverlap(playerBox, goalBox)) {
      store.win();
    }
  }

  function damage() {
    // loseLife bumps runId, which remounts the level/sim at the spawn point.
    useGameStore.getState().loseLife();
  }

  return null;
}
