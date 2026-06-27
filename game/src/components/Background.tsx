import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

/**
 * Layered parallax backdrop: distant hills + tree silhouettes that drift more
 * slowly than the camera to fake depth. All procedural primitives.
 */
export function Background() {
  const far = useRef<Group>(null);
  const mid = useRef<Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    // Move each layer a fraction of the camera's x to create parallax.
    if (far.current) far.current.position.x = camera.position.x * 0.85;
    if (mid.current) mid.current.position.x = camera.position.x * 0.6;
  });

  const trees = Array.from({ length: 14 }).map((_, i) => i * 6 - 12);

  return (
    <group>
      {/* sky dome */}
      <mesh position={[0, 0, -30]}>
        <planeGeometry args={[400, 120]} />
        <meshBasicMaterial color="#7ec8e3" />
      </mesh>

      {/* far hills */}
      <group ref={far} position={[0, 0, -24]}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[i * 14 - 28, -6, 0]}>
            <circleGeometry args={[12, 24, 0, Math.PI]} />
            <meshBasicMaterial color="#6fae7e" />
          </mesh>
        ))}
      </group>

      {/* mid tree silhouettes */}
      <group ref={mid} position={[0, 0, -16]}>
        {trees.map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.8, 8, 0.5]} />
              <meshBasicMaterial color="#2f5d3a" />
            </mesh>
            <mesh position={[0, 5, 0]}>
              <sphereGeometry args={[2.6, 12, 12]} />
              <meshBasicMaterial color="#3c7a4b" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
