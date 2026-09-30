import { fireEvent, render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { heroContent } from '../../src/content/hero';
import HeroCard from '../../src/components/react/islands/HeroCard';

vi.mock('../../src/components/react/bits/PixelCard', () => ({
  default: ({ children }: { children: ReactNode }) => createElement('div', null, children),
}));

vi.mock('../../src/components/react/islands/BlackHoleGameModal', () => ({
  default: ({ isOpen, onRequestClose }: { isOpen: boolean; onRequestClose: () => void }) =>
    isOpen
      ? createElement(
          'div',
          { role: 'dialog', 'aria-label': 'Fuga do Buraco Negro' },
          createElement('button', { type: 'button', onClick: onRequestClose }, 'fechar'),
        )
      : null,
}));

describe('HeroCard', () => {
  it('abre o minijogo pelo card e devolve o foco ao fechar', () => {
    const requestAnimationFrame = vi.fn<(callback: FrameRequestCallback) => number>(() => 1);
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );

    render(
      createElement(HeroCard, {
        figureAriaLabel: heroContent.image.figureAriaLabel,
        gameContent: heroContent.game,
        children: createElement('img', { alt: heroContent.image.alt }),
      }),
    );

    const trigger = screen.getByRole('button', { name: heroContent.game.triggerLabel });
    expect(screen.queryByText('Jogar')).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Fuga do Buraco Negro' })).toBeInTheDocument();

    requestAnimationFrame.mockImplementationOnce((callback) => {
      callback(0);
      return 2;
    });
    fireEvent.click(screen.getByRole('button', { name: 'fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
