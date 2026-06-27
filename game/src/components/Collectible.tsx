import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { CollectibleData } from "../game/types";
import { COLORS } from "../game/constants";
import { useGameStore } from "../state/gameStore";

/** A spinning golden fruit. Hides itself once the store marks it collected. */
export function Collectible({ data }: { data: CollectibleData }) {
  const ref = useRef<Group>(null);
  const collected = useGameStore((s) => s.collected.has(data.id));

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 2.5;
  });

  if (collected) return null;

  return (
    <group ref={ref} position={[data.x, data.y, 0]}>
      <mesh castShadow>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color={COLORS.collectible}
          emissive={COLORS.collectible}
          emissiveIntensity={0.35}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>
      {/* little leaf */}
      <mesh position={[0.1, 0.34, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.08, 0.22, 6]} />
        <meshStandardMaterial color={COLORS.platformTop} />
      </mesh>
    </group>
  );
}
