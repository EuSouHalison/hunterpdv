import { useFrame, useThree } from "@react-three/fiber";
import { useSim } from "../game/sim";
import type { LevelData } from "../game/types";

const VIEW_HALF_WIDTH = 9; // how much of the level is visible to each side

/**
 * Side-scroll 2.5D camera: fixed Y/Z, eases toward the player on X, clamped to
 * the level bounds so we never see past the edges.
 */
export function FollowCamera({ level }: { level: LevelData }) {
  const sim = useSim();
  const { camera } = useThree();

  useFrame((_, dt) => {
    const target = Math.max(
      level.bounds.minX + VIEW_HALF_WIDTH,
      Math.min(level.bounds.maxX - VIEW_HALF_WIDTH, sim.player.x),
    );
    // critically-damped-ish smoothing, framerate independent
    const k = 1 - Math.pow(0.0015, dt);
    camera.position.x += (target - camera.position.x) * k;
    camera.position.y += (4.5 - camera.position.y) * k;
    camera.position.z = 18;
    camera.lookAt(camera.position.x, 3, 0);
  });

  return null;
}
