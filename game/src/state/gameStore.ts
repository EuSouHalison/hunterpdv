import { create } from "zustand";
import { GAME } from "../game/constants";

export type Phase = "ready" | "playing" | "won" | "lost";

interface GameState {
  phase: Phase;
  lives: number;
  score: number;
  totalCollectibles: number;
  collected: Set<string>;
  /** bumped to force a full level remount / respawn */
  runId: number;

  start: () => void;
  registerCollectibles: (count: number) => void;
  collect: (id: string, points: number) => void;
  loseLife: () => void;
  win: () => void;
  restart: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "ready",
  lives: GAME.startLives,
  score: 0,
  totalCollectibles: 0,
  collected: new Set(),
  runId: 0,

  start: () => set({ phase: "playing" }),

  registerCollectibles: (count) => set({ totalCollectibles: count }),

  collect: (id, points) => {
    const { collected } = get();
    if (collected.has(id)) return;
    const next = new Set(collected);
    next.add(id);
    set((s) => ({ collected: next, score: s.score + points }));
  },

  loseLife: () =>
    set((s) => {
      const lives = s.lives - 1;
      if (lives <= 0) {
        return { lives: 0, phase: "lost" };
      }
      // respawn: keep score & collected items, remount entities
      return { lives, runId: s.runId + 1 };
    }),

  win: () => set({ phase: "won" }),

  restart: () =>
    set((s) => ({
      phase: "playing",
      lives: GAME.startLives,
      score: 0,
      collected: new Set(),
      runId: s.runId + 1,
    })),
}));
