import { useEffect, useRef, useState } from 'react';

import type { HeroContent } from '../../../content';
import { readBestScore, writeBestScore } from '../../../game/black-hole/rules';
import type { BlackHoleGameController, BlackHoleGameState } from '../../../game/black-hole/types';
import DialogCloseButton from '../bits/DialogCloseButton';

type BlackHoleGameModalProps = {
  content: HeroContent['game'];
  isOpen: boolean;
  onRequestClose: () => void;
};

export default function BlackHoleGameModal({
  content,
  isOpen,
  onRequestClose,
}: BlackHoleGameModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const gameHostRef = useRef<HTMLButtonElement>(null);
  const controllerRef = useRef<BlackHoleGameController | null>(null);
  const [gameState, setGameState] = useState<BlackHoleGameState>('loading');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      gameHostRef.current?.focus({ preventScroll: true });
    }
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !gameHostRef.current) return undefined;

    let cancelled = false;
    let controller: BlackHoleGameController | null = null;
    const storedBest = readBestScore(window.localStorage);
    setBest(storedBest);
    setScore(0);
    setGameState('loading');

    void import('../../../game/black-hole/runtime').then(({ mountBlackHoleGame }) => {
      if (cancelled || !gameHostRef.current) return;

      controller = mountBlackHoleGame({
        parent: gameHostRef.current,
        initialBest: storedBest,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        onStateChange: setGameState,
        onScoreChange: setScore,
        onBestChange: (nextBest) => {
          setBest(nextBest);
          writeBestScore(window.localStorage, nextBest);
        },
      });
      controllerRef.current = controller;
    });

    const handleVisibilityChange = () => {
      if (document.hidden) controllerRef.current?.pause();
      else controllerRef.current?.resume();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      controller?.destroy();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [isOpen]);

  const closeDialog = () => dialogRef.current?.close();

  return (
    <dialog
      id="black-hole-game-dialog"
      className="black-hole-dialog"
      aria-labelledby="black-hole-game-title"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onClose={onRequestClose}
    >
      <article className="black-hole-panel" data-game-state={gameState}>
        <header className="black-hole-header">
          <div>
            <p>{content.eyebrow}</p>
            <h2 id="black-hole-game-title">{content.title}</h2>
          </div>
          <DialogCloseButton label={content.closeLabel} onClick={closeDialog} />
        </header>

        <div className="black-hole-stage-shell">
          <div className="black-hole-hud" aria-label={`${content.scoreLabel}: ${score}`}>
            <span>
              {content.scoreLabel}{' '}
              <strong data-game-score>{score.toString().padStart(4, '0')}</strong>
            </span>
            <span>
              {content.bestLabel} <strong data-game-best>{best.toString().padStart(4, '0')}</strong>
            </span>
          </div>

          <button
            className="black-hole-game-host"
            ref={gameHostRef}
            type="button"
            aria-label={content.canvasLabel}
            aria-keyshortcuts="Space W ArrowUp"
            onPointerDown={() => controllerRef.current?.action()}
            onKeyDown={(event) => {
              if (![' ', 'ArrowUp', 'w', 'W'].includes(event.key)) return;
              event.preventDefault();
              event.stopPropagation();
              controllerRef.current?.action();
            }}
          />

          {gameState === 'loading' && (
            <div className="black-hole-message" role="status">
              <p>{content.loadingLabel}</p>
            </div>
          )}

          {gameState === 'ready' && (
            <div className="black-hole-message" role="status">
              <strong>{content.readyTitle}</strong>
              <p>{content.instructions}</p>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="black-hole-message black-hole-message-gameover" role="status">
              <strong>{content.gameOverTitle}</strong>
              <p>
                {content.scoreLabel}: {score} · {content.bestLabel}: {best}
              </p>
              <button
                className="black-hole-retry ps-control ps-control-cross"
                type="button"
                data-sound="confirm"
                onClick={() => {
                  controllerRef.current?.restart();
                  gameHostRef.current?.focus({ preventScroll: true });
                }}
              >
                <span className="ps-symbol" aria-hidden="true">
                  ×
                </span>
                <span>{content.retryLabel}</span>
              </button>
            </div>
          )}
        </div>

        <p className="black-hole-controls">{content.instructions}</p>
      </article>
    </dialog>
  );
}
