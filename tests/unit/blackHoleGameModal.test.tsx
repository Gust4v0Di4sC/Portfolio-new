import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BlackHoleGameModal from '../../src/components/react/islands/BlackHoleGameModal';
import { heroContent } from '../../src/content/hero';
import type {
  BlackHoleGameController,
  BlackHoleGameOptions,
} from '../../src/game/black-hole/types';

const mocks = vi.hoisted(() => ({
  action: vi.fn(),
  restart: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  destroy: vi.fn(),
  mount: vi.fn(),
}));

vi.mock('../../src/game/black-hole/runtime', () => ({
  mountBlackHoleGame: mocks.mount,
}));

describe('BlackHoleGameModal', () => {
  let mountedOptions: BlackHoleGameOptions | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };

    const controller: BlackHoleGameController = {
      action: mocks.action,
      restart: mocks.restart,
      pause: mocks.pause,
      resume: mocks.resume,
      destroy: mocks.destroy,
    };
    mocks.mount.mockImplementation((options: BlackHoleGameOptions) => {
      mountedOptions = options;
      options.parent.dataset.gameState = 'ready';
      options.onStateChange('ready');
      return controller;
    });
  });

  afterEach(() => cleanup());

  it('encaminha cada tecla e toque como uma única ação', async () => {
    render(<BlackHoleGameModal content={heroContent.game} isOpen onRequestClose={vi.fn()} />);

    const host = await screen.findByRole('button', { name: heroContent.game.canvasLabel });
    await waitFor(() => expect(mocks.mount).toHaveBeenCalledOnce());

    fireEvent.keyDown(host, { key: ' ' });
    expect(mocks.action).toHaveBeenCalledOnce();

    fireEvent.pointerDown(host);
    expect(mocks.action).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(host, { key: 'Enter' });
    expect(mocks.action).toHaveBeenCalledTimes(2);
  });

  it('reinicia andando e devolve o foco para o jogo', async () => {
    render(<BlackHoleGameModal content={heroContent.game} isOpen onRequestClose={vi.fn()} />);

    const host = await screen.findByRole('button', { name: heroContent.game.canvasLabel });
    await waitFor(() => expect(mountedOptions).toBeDefined());
    act(() => mountedOptions?.onStateChange('gameover'));

    fireEvent.click(screen.getByRole('button', { name: heroContent.game.retryLabel }));
    expect(mocks.restart).toHaveBeenCalledOnce();
    expect(host).toHaveFocus();
  });
});
