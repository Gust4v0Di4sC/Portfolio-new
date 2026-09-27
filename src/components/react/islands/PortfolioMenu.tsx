import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Locale, MenuContent, NavigationContent } from '../../../content';
import SystemConfigurationScene from './SystemConfigurationScene';
import './PortfolioMenu.css';

type MenuView = 'main' | 'system' | 'language' | 'viewer' | 'content';

type MenuOption = {
  label: string;
  target?: string;
  action?: 'system' | 'language';
};

const orbitalPoints = [
  { size: '76%', duration: '9.2s', delay: '-1.4s', direction: 'normal' },
  { size: '64%', duration: '7.6s', delay: '-5.1s', direction: 'reverse' },
  { size: '52%', duration: '6.1s', delay: '-2.8s', direction: 'normal' },
  { size: '38%', duration: '4.9s', delay: '-1.9s', direction: 'reverse' },
] as const;

const getPortfolioStage = () => document.querySelector<HTMLElement>('[data-portfolio-stage]');
const getPortfolioScreens = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-portfolio-screen]'));

const formatDate = (date: Date | null) => {
  if (!date) return '----/--/--';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const formatTime = (date: Date | null) => {
  if (!date) return '--:--:--';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

function SystemClock({ ariaLabel }: { ariaLabel: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const intervalId = window.setInterval(update, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="system-clock" aria-label={ariaLabel}>
      <time className="system-date" dateTime={now?.toISOString()}>
        {formatDate(now)}
      </time>
      <time className="system-time" dateTime={now?.toISOString()}>
        {formatTime(now)}
      </time>
    </div>
  );
}

type PortfolioMenuProps = {
  locale: Locale;
  content: MenuContent;
  navigation: NavigationContent;
};

export default function PortfolioMenu({ locale, content, navigation }: PortfolioMenuProps) {
  const [view, setView] = useState<MenuView>('main');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [contentTarget, setContentTarget] = useState<string | null>(null);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);
  const viewerButtonRef = useRef<HTMLButtonElement>(null);
  const mainOptions = useMemo<MenuOption[]>(
    () => [
      { label: content.main.browser, target: '#projetos' },
      { label: content.main.systemConfiguration, action: 'system' },
    ],
    [content.main],
  );
  const systemOptions = useMemo<MenuOption[]>(
    () => [
      ...navigation.items
        .filter(({ href }) => href !== '#projetos')
        .map(({ href, label }) => ({ label, target: href })),
      { label: content.language, action: 'language' },
    ],
    [content.language, navigation.items],
  );
  const languageOptions = useMemo(
    () => [
      { locale: 'pt-BR' as const, label: content.portuguese },
      { locale: 'en' as const, label: content.english },
    ],
    [content.english, content.portuguese],
  );
  const isSystemView = view === 'system' || view === 'language' || view === 'viewer';
  const options = useMemo(
    () => (view === 'main' ? mainOptions : view === 'language' ? languageOptions : systemOptions),
    [languageOptions, mainOptions, systemOptions, view],
  );

  const showMenu = useCallback((nextView: 'main' | 'system' = 'main', nextSelectedIndex = 0) => {
    getPortfolioStage()?.setAttribute('hidden', '');
    getPortfolioScreens().forEach((screen) => {
      screen.hidden = true;
      screen.setAttribute('aria-hidden', 'true');
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.history.replaceState(null, '', window.location.pathname);
    setContentTarget(null);
    setSelectedIndex(nextSelectedIndex);
    setView(nextView);
  }, []);

  const openSection = useCallback(
    (target: string) => {
      const section = document.querySelector<HTMLElement>(target);
      const selectedScreen = section?.closest<HTMLElement>('[data-portfolio-screen]');
      if (!section || !selectedScreen) return;

      if (target === '#projetos') {
        window.dispatchEvent(new CustomEvent('portfolio:projects-open'));
      }

      const systemIndex = systemOptions.findIndex((option) => option.target === target);
      if (systemIndex >= 0) setSelectedIndex(systemIndex);

      getPortfolioScreens().forEach((screen) => {
        const isSelected = screen === selectedScreen;
        screen.hidden = !isSelected;
        if (isSelected) screen.removeAttribute('aria-hidden');
        else screen.setAttribute('aria-hidden', 'true');
      });
      getPortfolioStage()?.removeAttribute('hidden');
      setContentTarget(target);
      setView('content');

      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        selectedScreen.focus({ preventScroll: true });
        window.history.replaceState(null, '', target);
      });
    },
    [systemOptions],
  );

  const activateOption = useCallback(
    (option: MenuOption) => {
      if (option.action === 'system') {
        setSelectedIndex(0);
        setView('system');
        return;
      }

      if (option.action === 'language') {
        setSelectedIndex(locale === 'pt-BR' ? 0 : 1);
        setView('language');
        return;
      }

      if (option.target) openSection(option.target);
    },
    [locale, openSection],
  );

  const selectLanguage = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) return;

      try {
        window.localStorage.setItem('portfolio-locale', nextLocale);
      } catch {
        // Navigation still works when storage is unavailable.
      }

      const nextPath = nextLocale === 'pt-BR' ? '/' : '/en/';
      window.location.assign(`${nextPath}${window.location.search}${window.location.hash}`);
    },
    [locale],
  );

  const toggleViewer = useCallback(() => {
    setView((current) => (current === 'viewer' ? 'system' : 'viewer'));
  }, []);

  const returnToMenu = useCallback(() => {
    const systemIndex = systemOptions.findIndex((option) => option.target === contentTarget);
    if (systemIndex >= 0) {
      showMenu('system', systemIndex);
      return;
    }
    showMenu('main');
  }, [contentTarget, showMenu, systemOptions]);

  useEffect(() => {
    getPortfolioStage()?.setAttribute('hidden', '');
    getPortfolioScreens().forEach((screen) => {
      screen.hidden = true;
      screen.setAttribute('aria-hidden', 'true');
    });

    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (view === 'viewer') {
      viewerButtonRef.current?.focus({ preventScroll: true });
    } else if (view !== 'content') {
      selectedButtonRef.current?.focus({ preventScroll: true });
    }
  }, [selectedIndex, view]);

  useEffect(() => {
    if (view !== 'main') return undefined;

    let touchStartY = 0;
    const requestIntroRewind = (deltaY: number) => {
      window.dispatchEvent(
        new CustomEvent('portfolio:intro-rewind', {
          detail: { deltaY },
        }),
      );
    };
    const handleWheel = (event: WheelEvent) => {
      if (document.documentElement.classList.contains('splash-active') || event.deltaY >= 0) return;
      event.preventDefault();
      requestIntroRewind(event.deltaY);
    };
    const handleTouchStart = (event: TouchEvent) => {
      if (document.documentElement.classList.contains('splash-active')) return;
      touchStartY = event.touches[0]?.clientY ?? 0;
    };
    const handleTouchEnd = (event: TouchEvent) => {
      if (document.documentElement.classList.contains('splash-active')) return;
      const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - touchEndY;
      if (deltaY > -36) return;
      requestIntroRewind(deltaY);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [view]);

  useEffect(() => {
    const handleSectionLink = (event: MouseEvent) => {
      const target =
        event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a') : null;
      const href = target?.getAttribute('href');
      if (!href?.startsWith('#') || !target?.closest('[data-portfolio-stage]')) return;

      const destination = document.querySelector(href);
      if (!destination?.closest('[data-portfolio-screen]')) return;

      event.preventDefault();
      openSection(href);
    };

    document.addEventListener('click', handleSectionLink);
    return () => document.removeEventListener('click', handleSectionLink);
  }, [openSection]);

  useEffect(() => {
    if (view === 'content') return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      const normalizedKey = event.key.toLowerCase();

      if (view === 'viewer') {
        if (normalizedKey === 'z' || event.key === 'Square') {
          event.preventDefault();
          event.stopPropagation();
          toggleViewer();
        } else if (event.key === 'Escape' || normalizedKey === 'o') {
          event.preventDefault();
          event.stopPropagation();
          setView('system');
        }
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        setSelectedIndex((current) => (current + direction + options.length) % options.length);
        return;
      }

      if (event.key === 'Enter' || normalizedKey === 'x') {
        event.preventDefault();
        event.stopPropagation();
        if (view === 'language') {
          const selectedLanguage = languageOptions[selectedIndex];
          if (selectedLanguage) selectLanguage(selectedLanguage.locale);
        } else {
          const selectedOption = options[selectedIndex] as MenuOption | undefined;
          if (selectedOption) activateOption(selectedOption);
        }
        return;
      }

      if ((event.key === 'Escape' || normalizedKey === 'o') && view === 'language') {
        event.preventDefault();
        event.stopPropagation();
        setSelectedIndex(systemOptions.length - 1);
        setView('system');
        return;
      }

      if ((event.key === 'Escape' || normalizedKey === 'o') && view === 'system') {
        event.preventDefault();
        event.stopPropagation();
        showMenu('main');
        return;
      }

      if ((normalizedKey === 'z' || event.key === 'Square') && view === 'system') {
        event.preventDefault();
        event.stopPropagation();
        toggleViewer();
        return;
      }

      if (normalizedKey === 'a' || event.key === 'Triangle') {
        event.preventDefault();
        event.stopPropagation();
        openSection('#hero');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    activateOption,
    languageOptions,
    openSection,
    options,
    selectedIndex,
    selectLanguage,
    showMenu,
    systemOptions.length,
    toggleViewer,
    view,
  ]);

  if (view === 'content') {
    const returnsToSystem = systemOptions.some((option) => option.target === contentTarget);
    return (
      <button
        className="portfolio-menu-return ps-control ps-control-circle"
        type="button"
        onClick={returnToMenu}
        aria-label={
          returnsToSystem ? content.returnToSystem : content.returnToMain
        }
        aria-keyshortcuts="O Escape"
        data-shortcut="o"
        data-sound="back"
        data-return-destination={returnsToSystem ? 'system' : 'main'}
      >
        <span className="ps-symbol" aria-hidden="true">
          ○
        </span>
        <span>{returnsToSystem ? content.systemTitle : content.menu}</span>
      </button>
    );
  }

  return (
    <section
      className="portfolio-menu"
      data-portfolio-menu
      data-menu-view={view}
      data-orb-tone="blue"
      aria-label={isSystemView ? content.systemAriaLabel : content.mainMenuAriaLabel}
    >
      <div className="portfolio-menu-glow" aria-hidden="true" />

      {isSystemView && (
        <>
          <SystemConfigurationScene
            selectedIndex={view === 'language' ? systemOptions.length - 1 : selectedIndex}
            viewerMode={view === 'viewer'}
          />
          <SystemClock ariaLabel={content.localDateTimeAriaLabel} />
        </>
      )}

      {view === 'main' && (
        <div className="portfolio-menu-layout">
          <div className="orbital-system" aria-hidden="true">
            {orbitalPoints.map((point, index) => (
              <span
                className="orbital-path"
                key={`${point.size}-${point.delay}`}
                style={
                  {
                    '--orbit-size': point.size,
                    '--orbit-duration': point.duration,
                    '--orbit-delay': point.delay,
                    '--orbit-direction': point.direction,
                    '--light-scale': 1 - index * 0.035,
                  } as React.CSSProperties
                }
              >
                <span className="orbital-light" />
              </span>
            ))}
          </div>

          <nav className="portfolio-options" aria-label={content.portfolioOptions}>
            <ul>
              {mainOptions.map((option, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <li key={option.label}>
                    <button
                      ref={isSelected ? selectedButtonRef : undefined}
                      className={isSelected ? 'is-selected' : undefined}
                      type="button"
                      onClick={() => activateOption(option)}
                      onPointerMove={(event) => {
                        event.currentTarget.focus({ preventScroll: true });
                        setSelectedIndex(index);
                      }}
                      aria-current={isSelected ? 'true' : undefined}
                      data-sound={isSelected ? 'confirm' : 'hover'}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {view === 'system' && (
        <div className="system-menu-layout">
          <nav className="portfolio-options system-options" aria-label={content.portfolioOptions}>
            <h2 className="portfolio-options-title">{content.systemTitle}</h2>
            <ul>
              {systemOptions.map((option, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <li key={option.label}>
                    <button
                      ref={isSelected ? selectedButtonRef : undefined}
                      className={isSelected ? 'is-selected' : undefined}
                      type="button"
                      onClick={() => activateOption(option)}
                      onPointerMove={(event) => {
                        event.currentTarget.focus({ preventScroll: true });
                        setSelectedIndex(index);
                      }}
                      aria-current={isSelected ? 'true' : undefined}
                      data-sound={isSelected ? 'confirm' : 'hover'}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {view === 'language' && (
        <div className="system-menu-layout">
          <nav className="portfolio-options system-options" aria-label={content.languageAriaLabel}>
            <h2 className="portfolio-options-title">{content.languageTitle}</h2>
            <ul>
              {languageOptions.map((option, index) => {
                const isSelected = selectedIndex === index;
                const isCurrent = locale === option.locale;
                return (
                  <li key={option.locale}>
                    <button
                      ref={isSelected ? selectedButtonRef : undefined}
                      className={isSelected ? 'is-selected' : undefined}
                      type="button"
                      lang={option.locale}
                      onClick={() => selectLanguage(option.locale)}
                      onPointerMove={(event) => {
                        event.currentTarget.focus({ preventScroll: true });
                        setSelectedIndex(index);
                      }}
                      aria-current={isCurrent ? 'true' : undefined}
                      data-current-locale={isCurrent ? 'true' : undefined}
                      data-sound={isCurrent ? 'option' : 'confirm'}
                    >
                      {option.label}
                      {isCurrent && <span className="language-current" aria-hidden="true"> •</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {view !== 'viewer' && (
        <div className="portfolio-menu-controls" aria-label={content.controlsAriaLabel}>
          {view === 'system' && (
            <button
              className="viewer-control"
              type="button"
              onClick={toggleViewer}
              aria-label={content.enableViewer}
              aria-keyshortcuts="Z"
              data-shortcut="z"
              data-sound="option"
            >
              <i className="control-square" aria-hidden="true">
                □
              </i>{' '}
              {content.viewer}
            </button>
          )}
          <span>
            <i className="control-cross" aria-hidden="true">
              ×
            </i>{' '}
            {content.enter}
          </span>
          {(view === 'system' || view === 'language') && (
            <button
              type="button"
              onClick={() => {
                if (view === 'language') {
                  setSelectedIndex(systemOptions.length - 1);
                  setView('system');
                } else {
                  showMenu('main');
                }
              }}
              data-sound="back"
            >
              <i className="control-circle" aria-hidden="true">
                ○
              </i>{' '}
              {content.back}
            </button>
          )}
          <button
            className="hero-control"
            type="button"
            onClick={() => openSection('#hero')}
            aria-label={content.openPresentation}
            aria-keyshortcuts="A"
            data-sound="option"
          >
            <i aria-hidden="true">△</i> {content.presentation}
          </button>
        </div>
      )}

      {view === 'viewer' && (
        <button
          className="viewer-exit"
          type="button"
          onClick={toggleViewer}
          ref={viewerButtonRef}
          aria-label={content.exitViewer}
          aria-keyshortcuts="Z"
          data-shortcut="z"
          data-sound="back"
        >
          <i className="control-square" aria-hidden="true">
            □
          </i>{' '}
          {content.viewer}
        </button>
      )}
    </section>
  );
}
