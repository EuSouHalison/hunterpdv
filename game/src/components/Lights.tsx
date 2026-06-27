/** Warm key light + soft fill, tuned for a sunny jungle look. */
export function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#bfe3c8", "#3a2a18", 0.5]} />
      <directionalLight
        position={[8, 18, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={30}
        shadow-camera-bottom={-15}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />
    </>
  );
}
