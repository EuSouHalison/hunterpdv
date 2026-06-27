import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { EnemyData } from "../game/types";
import { COLORS } from "../game/constants";
import { useSim } from "../game/sim";

/**
 * A waddling critter. Reads its live x / alive flag from the sim each frame.
 * Defeated enemies squash and disappear.
 */
export function Enemy({ data }: { data: EnemyData }) {
  const sim = useSim();
  const ref = useRef<Group>(null);

  useFrame((stateThree) => {
    const g = ref.current;
    if (!g) return;
    const es = sim.enemies[data.id];
    g.visible = es.alive;
    if (!es.alive) return;
    g.position.x = es.x;
    g.rotation.y = es.dir === 1 ? 0.4 : -0.4;
    // waddle
    g.rotation.z = Math.sin(stateThree.clock.elapsedTime * 8) * 0.12;
  });

  return (
    <group ref={ref} position={[data.x, data.y + 0.45, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color={COLORS.enemy} />
      </mesh>
      {/* spikey crest */}
      <mesh position={[0, 0.42, 0]}>
        <coneGeometry args={[0.18, 0.3, 8]} />
        <meshStandardMaterial color={COLORS.enemyAccent} />
      </mesh>
      {/* eyes */}
      <mesh position={[0.18, 0.1, 0.34]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.18, 0.1, 0.41]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  );
}
