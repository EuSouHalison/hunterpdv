import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Scene } from "./components/Scene";
import { Hud } from "./components/Hud";
import { COLORS } from "./game/constants";

export default function App() {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 4.5, 18], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[COLORS.sky]} />
        <fog attach="fog" args={[COLORS.fog, 30, 70]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Hud />
    </>
  );
}
