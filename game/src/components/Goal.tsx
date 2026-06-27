import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import { COLORS } from "../game/constants";

/** End-of-level totem with a slowly bobbing star on top. */
export function Goal({ x, y }: { x: number; y: number }) {
  const star = useRef<Mesh>(null);
  const group = useRef<Group>(null);

  useFrame((stateThree) => {
    if (star.current) {
      star.current.rotation.y += 0.03;
      star.current.position.y = 2.6 + Math.sin(stateThree.clock.elapsedTime * 2) * 0.15;
    }
  });

  return (
    <group ref={group} position={[x, y, 0]}>
      {/* pole */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 2.4, 10]} />
        <meshStandardMaterial color={COLORS.barrelBand} />
      </mesh>
      {/* banner */}
      <mesh position={[0.6, 1.9, 0]}>
        <boxGeometry args={[1, 0.6, 0.05]} />
        <meshStandardMaterial color={COLORS.platformTop} />
      </mesh>
      {/* star */}
      <mesh ref={star} position={[0, 2.6, 0]} castShadow>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={COLORS.goal}
          emissive={COLORS.goal}
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}
