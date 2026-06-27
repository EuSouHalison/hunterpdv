import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { BarrelData } from "../game/types";
import { COLORS } from "../game/constants";
import { useSim } from "../game/sim";

/**
 * Barrel cannon: walk in and it captures the player, then press jump to blast
 * off along its angle. Original take on a classic platformer device.
 */
export function BarrelCannon({ data }: { data: BarrelData }) {
  const sim = useSim();
  const ref = useRef<Group>(null);
  const hint = useRef<Group>(null);

  useFrame((stateThree) => {
    const loaded = sim.player.inBarrel === data.id;
    if (ref.current) {
      ref.current.rotation.z = loaded
        ? stateThree.clock.elapsedTime * 10
        : Math.sin(stateThree.clock.elapsedTime * 2) * 0.05;
    }
    if (hint.current) {
      hint.current.visible = loaded;
      hint.current.position.y = 1.9 + Math.sin(stateThree.clock.elapsedTime * 6) * 0.12;
    }
  });

  return (
    <group position={[data.x, data.y, 0]}>
      <group ref={ref} rotation={[0, 0, ((data.angle - 90) * Math.PI) / 180]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 1.4, 16]} />
          <meshStandardMaterial color={COLORS.barrel} />
        </mesh>
        {/* metal bands */}
        {[-0.45, 0, 0.45].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.63, 0.63, 0.12, 16]} />
            <meshStandardMaterial color={COLORS.barrelBand} metalness={0.6} />
          </mesh>
        ))}
        {/* muzzle ring showing the launch direction */}
        <mesh position={[0, 0.75, 0]}>
          <torusGeometry args={[0.45, 0.08, 8, 20]} />
          <meshStandardMaterial color={COLORS.collectible} />
        </mesh>
      </group>
      {/* "press jump" indicator: a bobbing arrow shown while loaded */}
      <group ref={hint} position={[0, 1.9, 0]} visible={false}>
        <mesh rotation={[0, 0, 0]}>
          <coneGeometry args={[0.3, 0.5, 4]} />
          <meshStandardMaterial
            color={COLORS.collectible}
            emissive={COLORS.collectible}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>
    </group>
  );
}
