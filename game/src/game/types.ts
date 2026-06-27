// Shared geometry + level data types.

/** Axis-aligned bounding box expressed by its center and half-extents (XY plane). */
export interface AABB {
  x: number; // center x
  y: number; // center y
  hw: number; // half width
  hh: number; // half height
}

export interface PlatformData {
  /** center x */
  x: number;
  /** center y */
  y: number;
  /** full width */
  w: number;
  /** full height */
  h: number;
}

export interface CollectibleData {
  id: string;
  x: number;
  y: number;
}

export interface EnemyData {
  id: string;
  /** patrol center x */
  x: number;
  /** ground y the enemy walks on (its base) */
  y: number;
  /** half-range of the patrol around x */
  range: number;
  speed: number;
}

export interface BarrelData {
  id: string;
  x: number;
  y: number;
  /** launch direction in degrees (0 = right, 90 = up) */
  angle: number;
  /** launch speed magnitude */
  power: number;
}

export interface HazardData {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LevelData {
  name: string;
  spawn: { x: number; y: number };
  bounds: { minX: number; maxX: number };
  platforms: PlatformData[];
  collectibles: CollectibleData[];
  enemies: EnemyData[];
  barrels: BarrelData[];
  hazards: HazardData[];
  goal: { x: number; y: number };
}
