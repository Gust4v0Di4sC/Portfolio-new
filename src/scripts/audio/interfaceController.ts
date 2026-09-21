export type UiSound = 'hover' | 'confirm' | 'back' | 'option';
type UiShortcut = 'x' | 'o' | 'a' | 'z';
type AudioEnabledWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

const interactiveSelector =
  'a[href], button:not([disabled]), [role="button"]:not([aria-disabled="true"])';
const shortcutSelector = '[data-shortcut]';

export function setupInterfaceController() {
  let audioContext: AudioContext | undefined;
  const getAudioContext = () => {
    if (audioContext) return audioContext;
    const audioWindow = window as AudioEnabledWindow;
    const AudioContextClass = audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioContextClass) return undefined;
    audioContext = new AudioContextClass();
    return audioContext;
  };

  const playTone = (type: string = 'hover') => {
    const context = getAudioContext();
    if (!context) return;
    if (context.state === 'suspended') void context.resume().catch(() => undefined);
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const sounds: Record<
      UiSound,
      { frequency: number; endFrequency: number; duration: number; volume: number }
    > = {
      hover: { frequency: 620, endFrequency: 760, duration: 0.055, volume: 0.018 },
      confirm: { frequency: 520, endFrequency: 980, duration: 0.12, volume: 0.04 },
      back: { frequency: 360, endFrequency: 220, duration: 0.12, volume: 0.035 },
      option: { frequency: 780, endFrequency: 1180, duration: 0.1, volume: 0.032 },
    };
    const sound = sounds[type as UiSound] || sounds.hover;
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
  const isTyping = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ['input', 'select', 'textarea'].includes(target.tagName.toLowerCase()));
  const getShortcutScope = () =>
    Array.from(document.querySelectorAll('dialog[open]')).at(-1) ?? document;
  const getVisibleShortcutTarget = (shortcut: UiShortcut) => {
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      getShortcutScope().contains(active) &&
      active.matches(`${shortcutSelector}[data-shortcut="${shortcut}"]`)
    )
      return active;
    const viewportCenter = window.innerHeight / 2;
    return Array.from(
      getShortcutScope().querySelectorAll(`${shortcutSelector}[data-shortcut="${shortcut}"]`),
    )
      .filter((target): target is HTMLElement => target instanceof HTMLElement && isVisible(target))
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return (
          Math.abs(aRect.top + aRect.height / 2 - viewportCenter) -
          Math.abs(bRect.top + bRect.height / 2 - viewportCenter)
        );
      })[0];
  };
  const findInteractive = (target: EventTarget | null) => {
    const found = target instanceof Element ? target.closest(interactiveSelector) : null;
    return found instanceof HTMLElement ? found : undefined;
  };
  const canInteract = () => !document.documentElement.classList.contains('splash-running');
  const handlePointerEnter = (event: PointerEvent) => {
    if (!canInteract()) return;
    const target = findInteractive(event.target);
    if (target) playTone(target.dataset.sound || 'hover');
  };
  const handleClick = (event: MouseEvent) => {
    if (!canInteract()) return;
    const target = findInteractive(event.target);
    if (target) playTone(target.dataset.sound || 'confirm');
  };
  const handleKeydown = (event: KeyboardEvent) => {
    if (
      !canInteract() ||
      isTyping(event.target) ||
      event.defaultPrevented ||
      event.repeat ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const keyMap: Record<string, UiShortcut> = {
      x: 'x',
      X: 'x',
      o: 'o',
      O: 'o',
      Escape: 'o',
      a: 'a',
      A: 'a',
      ArrowUp: 'a',
      Triangle: 'a',
      z: 'z',
      Z: 'z',
      Square: 'z',
    };
    const shortcut = keyMap[event.key];
    if (!shortcut) return;
    const active = findInteractive(document.activeElement);
    const target =
      shortcut === 'x' && active && getShortcutScope().contains(active)
        ? active
        : getVisibleShortcutTarget(shortcut);
    if (!target) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
    target.click();
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
}
