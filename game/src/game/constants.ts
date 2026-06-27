// Tunable gameplay constants. All values are in world units / seconds.

export const PHYSICS = {
  gravity: -38, // downward acceleration
  maxFallSpeed: -26, // terminal velocity (negative)
  moveSpeed: 9, // horizontal run speed
  acceleration: 70, // how quickly we reach moveSpeed
  airControl: 0.55, // fraction of ground acceleration while airborne
  groundFriction: 60, // deceleration when no input on ground
  jumpSpeed: 15.5, // initial upward velocity of a jump
  // Forgiving platformer "game feel" timers (seconds):
  coyoteTime: 0.1, // can still jump shortly after leaving a ledge
  jumpBuffer: 0.12, // a jump pressed slightly before landing still fires
  // Fixed timestep used for the physics integration.
  fixedDt: 1 / 120,
  maxFrameDt: 1 / 20, // clamp huge frame deltas (tab switches) to avoid tunneling
} as const;

export const PLAYER = {
  width: 0.8,
  height: 1.3,
  depth: 0.8,
  stompBounce: 12, // upward velocity after bopping an enemy
} as const;

export const GAME = {
  startLives: 3,
  fallLimitY: -12, // falling below this counts as a pit death
} as const;

// A calm jungle-tribute palette (all original colours, no copied assets).
export const COLORS = {
  sky: "#7ec8e3",
  fog: "#bfe3c8",
  player: "#e8743b",
  playerAccent: "#fff1d6",
  platform: "#6b4b2f",
  platformTop: "#4caf50",
  collectible: "#ffd23f",
  enemy: "#9b59b6",
  enemyAccent: "#2c1338",
  barrel: "#b5651d",
  barrelBand: "#3a2410",
  goal: "#ffd23f",
  hazard: "#c0392b",
} as const;
