import { useGameStore } from "../state/gameStore";

const CONTROLS = [
  "← → / A D — mover",
  "Espaço / W / ↑ — pular",
  "Entre no barril e pule para ser lançado",
];

export function Hud() {
  const phase = useGameStore((s) => s.phase);
  const lives = useGameStore((s) => s.lives);
  const score = useGameStore((s) => s.score);
  const collectedCount = useGameStore((s) => s.collected.size);
  const total = useGameStore((s) => s.totalCollectibles);
  const start = useGameStore((s) => s.start);
  const restart = useGameStore((s) => s.restart);

  // collected includes "stomp-*" pseudo ids; show only real fruit progress
  const fruit = Math.min(collectedCount, total);

  return (
    <div className="hud">
      {phase === "playing" && (
        <>
          <div className="hud__top">
            <div className="hud__pill hud__hearts">
              {"❤".repeat(lives)}
              <span style={{ opacity: 0.35 }}>{"♡".repeat(Math.max(0, 3 - lives))}</span>
            </div>
            <div className="hud__pill">🍌 {fruit}/{total}</div>
            <div className="hud__pill">★ {score}</div>
          </div>
          <div className="hud__hint">{CONTROLS[0]} · {CONTROLS[1]}</div>
        </>
      )}

      {phase === "ready" && (
        <div className="overlay">
          <h1>Jungle Leap</h1>
          <p>
            Um platformer 3D original inspirado nos clássicos de plataforma da
            selva. Corra, pule, derrote inimigos pulando em cima deles, colete as
            frutas douradas e chegue ao totem no fim da fase.
          </p>
          <div className="overlay__controls">
            {CONTROLS.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <button className="btn" onClick={start}>
            Jogar
          </button>
        </div>
      )}

      {phase === "won" && (
        <div className="overlay">
          <h1 className="win">Fase Concluída! 🎉</h1>
          <p>
            Você chegou ao totem com {fruit} de {total} frutas e {score} pontos.
          </p>
          <button className="btn" onClick={restart}>
            Jogar de novo
          </button>
        </div>
      )}

      {phase === "lost" && (
        <div className="overlay">
          <h1 className="lose">Game Over</h1>
          <p>Suas vidas acabaram. Pontuação final: {score}.</p>
          <button className="btn" onClick={restart}>
            Tentar de novo
          </button>
        </div>
      )}
    </div>
  );
}
