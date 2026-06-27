import type { PlatformData } from "../game/types";
import { COLORS } from "../game/constants";

/** A solid platform: earthy block with a grassy top cap. */
export function Platform({ data }: { data: PlatformData }) {
  const depth = 4;
  return (
    <group position={[data.x, data.y, 0]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[data.w, data.h, depth]} />
        <meshStandardMaterial color={COLORS.platform} />
      </mesh>
      {/* grass cap */}
      <mesh position={[0, data.h / 2 + 0.06, 0]} receiveShadow>
        <boxGeometry args={[data.w + 0.04, 0.18, depth + 0.04]} />
        <meshStandardMaterial color={COLORS.platformTop} />
      </mesh>
    </group>
  );
}
