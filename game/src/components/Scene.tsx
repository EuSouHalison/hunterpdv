import { useMemo, useRef } from "react";
import { SimContext, createSim } from "../game/sim";
import type { Sim } from "../game/sim";
import { LEVEL_1 } from "../game/level";
import { useGameStore } from "../state/gameStore";
import { Lights } from "./Lights";
import { Background } from "./Background";
import { FollowCamera } from "./FollowCamera";
import { Simulation } from "./Simulation";
import { Player } from "./Player";
import { Platform } from "./Platform";
import { Collectible } from "./Collectible";
import { Enemy } from "./Enemy";
import { BarrelCannon } from "./BarrelCannon";
import { Hazard } from "./Hazard";
import { Goal } from "./Goal";

const level = LEVEL_1;

/**
 * One "life" of the level. Remounted whenever `runId` changes (respawn or
 * restart) via the `key` in <Scene>, which resets the sim to the spawn point.
 */
function LevelRun() {
  // Fresh, stable sim for the lifetime of this mount.
  const sim = useRef<Sim>(createSim(level)).current;

  return (
    <SimContext.Provider value={sim}>
      <FollowCamera level={level} />
      <Simulation level={level} />

      {level.platforms.map((p, i) => (
        <Platform key={i} data={p} />
      ))}
      {level.hazards.map((h) => (
        <Hazard key={h.id} data={h} />
      ))}
      {level.collectibles.map((c) => (
        <Collectible key={c.id} data={c} />
      ))}
      {level.enemies.map((e) => (
        <Enemy key={e.id} data={e} />
      ))}
      {level.barrels.map((b) => (
        <BarrelCannon key={b.id} data={b} />
      ))}
      <Goal x={level.goal.x} y={level.goal.y} />
      <Player />
    </SimContext.Provider>
  );
}

export function Scene() {
  const runId = useGameStore((s) => s.runId);

  // Register the collectible total once.
  useMemo(() => {
    useGameStore.getState().registerCollectibles(level.collectibles.length);
  }, []);

  return (
    <>
      <Lights />
      <Background />
      <LevelRun key={runId} />
    </>
  );
}
