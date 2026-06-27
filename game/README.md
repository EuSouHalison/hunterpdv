# 🌴 Jungle Leap

An **original** 3D side-scrolling platformer prototype built with **Three.js +
React Three Fiber**, created as a tribute to the *feel* of classic jungle
platformers.

> **Not affiliated with Nintendo / Rare.** This is original work — all art,
> level design, characters, and code are original primitives and layouts. No
> sprites, music, characters, or level designs from *Donkey Kong Country* (or any
> other game) are used or reproduced.

## Tech stack

- **Vite** + **React 19** + **TypeScript** (standalone, isolated from the PDV app)
- **three**, **@react-three/fiber**, **@react-three/drei**
- **zustand** for low-frequency game state (lives / score / phase)

## Run it

```bash
cd game
npm install
npm run dev      # open the printed http://localhost:5173
npm run build    # typecheck + production build
```

## Controls

| Action | Keys |
| ------ | ---- |
| Move   | `←` `→` or `A` `D` |
| Jump   | `Space`, `W` or `↑` |
| Barrel | walk in, then press Jump to blast off |

## Gameplay (Level 1 — "Canopy Run")

- Run and jump across ground and floating ledges separated by pits.
- Collect the spinning **golden fruit** for points.
- **Stomp** enemies from above to defeat them; touching them from the side costs
  a life. You start with **3 lives**.
- Hop over the **spikes**.
- Step into the **barrel cannon** and press jump to be launched up to a bonus
  fruit.
- Reach the **goal totem** to clear the level.

## Architecture notes (R3F best practices)

- A single `<Canvas>`; HUD is a DOM overlay for crisp text.
- **High-frequency transforms never live in React state.** The authoritative
  loop lives in `Simulation.tsx` and mutates a shared `sim` object in place;
  visual components read it in their own `useFrame`. zustand holds only discrete
  state (score / lives / phase) that the HUD subscribes to.
- Physics runs on a **fixed timestep** with a clamped frame delta to avoid
  tunneling. The character uses a custom **kinematic AABB** controller with
  coyote-time and jump-buffering for tight platformer feel.
- Respawn/restart is a clean **remount** keyed on `runId`.

## Project layout

```
src/
  App.tsx                 Canvas + HUD
  state/gameStore.ts      zustand store
  game/
    constants.ts          tunable physics / colours
    types.ts              shared geometry + level types
    physics.ts            AABB overlap + collision resolution
    useInput.ts           keyboard input (ref-based)
    sim.ts                shared mutable simulation state + context
    level.ts              Level 1 data
  components/
    Simulation.tsx        authoritative game loop (headless)
    Player.tsx FollowCamera.tsx Platform.tsx Collectible.tsx
    Enemy.tsx BarrelCannon.tsx Hazard.tsx Goal.tsx
    Lights.tsx Background.tsx Scene.tsx Hud.tsx
```
