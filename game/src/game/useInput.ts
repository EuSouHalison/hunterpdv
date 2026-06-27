import { useEffect, useRef } from "react";

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  /** true only on the frame jump transitions from up -> down */
  jumpPressed: boolean;
}

const KEY_MAP: Record<string, keyof Omit<InputState, "jumpPressed">> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "jump",
  KeyW: "jump",
  Space: "jump",
};

/**
 * Lightweight keyboard input read through a ref so the physics loop can poll it
 * every frame without triggering React re-renders. `consumeJumpPressed` returns
 * (and clears) the edge-triggered jump, used together with a jump buffer.
 */
export function useInput() {
  const state = useRef<InputState>({
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
  });

  useEffect(() => {
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code];
      if (!action) return;
      e.preventDefault();
      if (action === "jump") {
        if (down && !state.current.jump) state.current.jumpPressed = true;
        state.current.jump = down;
      } else {
        state.current[action] = down;
      }
    };
    const downHandler = onKey(true);
    const upHandler = onKey(false);
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  const consumeJumpPressed = () => {
    if (state.current.jumpPressed) {
      state.current.jumpPressed = false;
      return true;
    }
    return false;
  };

  return { state, consumeJumpPressed };
}
