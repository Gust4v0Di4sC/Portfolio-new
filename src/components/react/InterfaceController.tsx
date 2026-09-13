import { useEffect } from 'react';

type UiSound = 'hover' | 'confirm' | 'back' | 'option';
type UiShortcut = 'x' | 'o' | 't';
type AudioEnabledWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const interactiveSelector =
  'a[href], button:not([disabled]), [role="button"]:not([aria-disabled="true"])';
const shortcutSelector = '[data-shortcut]';

export default function InterfaceController() {
  useEffect(() => {
    let audioContext: AudioContext | undefined;

    const getAudioContext = () => {
      if (audioContext) {
        return audioContext;
      }

      const audioWindow = window as AudioEnabledWindow;
      const AudioContextClass = audioWindow.AudioContext || audioWindow.webkitAudioContext;

      if (!AudioContextClass) {
        return undefined;
      }

      audioContext = new AudioContextClass();

      return audioContext;
    };

    const playTone = (type: string = 'hover') => {
      const context = getAudioContext();

      if (!context) {
        return;
      }

      if (context.state === 'suspended') {
        void context.resume().catch(() => undefined);
      }

      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const soundMap: Record<
        UiSound,
        { frequency: number; endFrequency: number; duration: number; volume: number }
      > = {
        hover: { frequency: 620, endFrequency: 760, duration: 0.055, volume: 0.018 },
        confirm: { frequency: 520, endFrequency: 980, duration: 0.12, volume: 0.04 },
        back: { frequency: 360, endFrequency: 220, duration: 0.12, volume: 0.035 },
        option: { frequency: 780, endFrequency: 1180, duration: 0.1, volume: 0.032 },
      };
      const sound = soundMap[type as UiSound] || soundMap.hover;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(sound.frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(sound.endFrequency, now + sound.duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + sound.duration);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(sound.volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + sound.duration);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + sound.duration + 0.025);
    };

    const isTyping = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const tagName = target.tagName.toLowerCase();

      return target.isContentEditable || ['input', 'select', 'textarea'].includes(tagName);
    };

    const isVisible = (element: Element) => {
      const rect = element.getBoundingClientRect();

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= window.innerHeight &&
        rect.left <= window.innerWidth
      );
    };

    const getVisibleShortcutTarget = (shortcut: UiShortcut) => {
      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLElement &&
        activeElement.matches(`${shortcutSelector}[data-shortcut="${shortcut}"]`)
      ) {
        return activeElement;
      }

      const targets = Array.from(
        document.querySelectorAll(`${shortcutSelector}[data-shortcut="${shortcut}"]`),
      ).filter(
        (target): target is HTMLElement => target instanceof HTMLElement && isVisible(target),
      );
      const viewportCenter = window.innerHeight / 2;

      return targets.sort((first, second) => {
        const firstRect = first.getBoundingClientRect();
        const secondRect = second.getBoundingClientRect();
        const firstDistance = Math.abs(firstRect.top + firstRect.height / 2 - viewportCenter);
        const secondDistance = Math.abs(secondRect.top + secondRect.height / 2 - viewportCenter);

        return firstDistance - secondDistance;
      })[0];
    };

    const activateShortcut = (shortcut: UiShortcut) => {
      const target = getVisibleShortcutTarget(shortcut);

      if (!target) {
        return;
      }

      target.focus({ preventScroll: true });
      target.click();
    };

    const handlePointerEnter = (event: PointerEvent) => {
      if (document.documentElement.classList.contains('splash-running')) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const interactive = target.closest(interactiveSelector);

      if (interactive instanceof HTMLElement) {
        playTone(interactive.dataset.sound || 'hover');
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (document.documentElement.classList.contains('splash-running')) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const interactive = target.closest(interactiveSelector);

      if (interactive instanceof HTMLElement) {
        playTone(interactive.dataset.sound || 'confirm');
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (document.documentElement.classList.contains('splash-running')) {
        return;
      }

      if (isTyping(event.target)) {
        return;
      }

      const keyMap: Record<string, UiShortcut> = {
        x: 'x',
        X: 'x',
        o: 'o',
        O: 'o',
        Escape: 'o',
        t: 't',
        T: 't',
        ArrowUp: 't',
        Triangle: 't',
      };
      const shortcut = keyMap[event.key];

      if (!shortcut) {
        return;
      }

      event.preventDefault();
      activateShortcut(shortcut);
    };

    document.addEventListener('pointerenter', handlePointerEnter, true);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('pointerenter', handlePointerEnter, true);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
      void audioContext?.close().catch(() => undefined);
    };
  }, []);

  return null;
}
