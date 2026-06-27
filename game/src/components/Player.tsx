import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { useSim } from "../game/sim";
import { COLORS, PLAYER } from "../game/constants";

/**
 * The hero — an original low-poly "jungle explorer" built from primitives.
 * Reads its transform from the shared sim every frame (no React state).
 */
export function Player() {
  const sim = useSim();
  const group = useRef<Group>(null);
  const legs = useRef<Group>(null);

  useFrame((stateThree) => {
    const g = group.current;
    if (!g) return;
    const p = sim.player;
    g.position.x = p.x;
    g.position.y = p.y;
    g.rotation.y = p.facing === 1 ? 0.25 : -0.25;
    // spin while shot out of a barrel
    g.rotation.z = p.inBarrel ? stateThree.clock.elapsedTime * 8 : 0;

    // little running leg wiggle when moving on the ground
    if (legs.current) {
      const moving = Math.abs(p.vx) > 0.5 && p.grounded;
      legs.current.rotation.x = moving
        ? Math.sin(stateThree.clock.elapsedTime * 18) * 0.6
        : 0;
    }
  });

  return (
    <group ref={group}>
      {/* body */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <capsuleGeometry args={[PLAYER.width / 2, PLAYER.height * 0.45, 4, 12]} />
        <meshStandardMaterial color={COLORS.player} />
      </mesh>
      {/* belly patch */}
      <mesh position={[0, -0.05, PLAYER.depth / 2 - 0.05]}>
        <circleGeometry args={[0.28, 16]} />
        <meshStandardMaterial color={COLORS.playerAccent} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, PLAYER.height / 2 + 0.05, 0]}>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshStandardMaterial color={COLORS.player} />
      </mesh>
      {/* eyes */}
      <mesh position={[0.14, PLAYER.height / 2 + 0.1, 0.28]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#16110a" />
      </mesh>
      <mesh position={[-0.14, PLAYER.height / 2 + 0.1, 0.28]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#16110a" />
      </mesh>
      {/* explorer cap */}
      <mesh position={[0, PLAYER.height / 2 + 0.34, 0]}>
        <coneGeometry args={[0.36, 0.3, 12]} />
        <meshStandardMaterial color={COLORS.platformTop} />
      </mesh>
      {/* legs */}
      <group ref={legs} position={[0, -PLAYER.height / 2, 0]}>
        <mesh castShadow position={[0.18, -0.1, 0]}>
          <boxGeometry args={[0.2, 0.35, 0.2]} />
          <meshStandardMaterial color={COLORS.barrelBand} />
        </mesh>
        <mesh castShadow position={[-0.18, -0.1, 0]}>
          <boxGeometry args={[0.2, 0.35, 0.2]} />
          <meshStandardMaterial color={COLORS.barrelBand} />
        </mesh>
      </group>
    </group>
  );
}
