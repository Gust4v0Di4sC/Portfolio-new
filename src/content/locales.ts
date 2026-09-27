import { enContent } from './en';
import { ptBRContent } from './pt-BR';
import type { Locale, PortfolioContent } from './types';

export const defaultLocale: Locale = 'pt-BR';
export const locales = ['pt-BR', 'en'] as const satisfies readonly Locale[];

const contentByLocale: Record<Locale, PortfolioContent> = {
  'pt-BR': ptBRContent,
  en: enContent,
};

export const getContent = (locale: Locale): PortfolioContent => contentByLocale[locale];

export const getLocalePath = (locale: Locale): '/' | '/en/' =>
  locale === defaultLocale ? '/' : '/en/';

export const isLocale = (value: string): value is Locale => locales.some((locale) => locale === value);
