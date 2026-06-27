import type { HazardData } from "../game/types";
import { COLORS } from "../game/constants";

/** A row of spikes. Touching it costs a life. */
export function Hazard({ data }: { data: HazardData }) {
  const count = Math.max(2, Math.round(data.w / 0.4));
  const step = data.w / count;
  return (
    <group position={[data.x, data.y, 0]}>
      {Array.from({ length: count }).map((_, i) => {
        const px = -data.w / 2 + step / 2 + i * step;
        return (
          <mesh key={i} position={[px, 0, 0]} castShadow>
            <coneGeometry args={[step / 2.2, data.h * 1.4, 4]} />
            <meshStandardMaterial color={COLORS.hazard} metalness={0.4} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}
