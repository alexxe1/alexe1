/**
 * CV integrado en la página, en español e inglés.
 * La fuente de verdad es `cv.json`: de ahí salen esta pantalla y los PDF (`npm run build:cv`).
 */
import data from './cv.json';
import type { Lang } from '../store';

export interface CvProject { name: string; meta: string; text: string }
export interface CvLocale {
  headline: string;
  about: string;
  interests: string;
  education: { title: string; school: string; period: string; text: string };
  projects: CvProject[];
  tech: { languages: string; frameworks: string; tools: string };
  languages: { name: string; level: string }[];
}

export const cvBase = { name: data.name, location: data.location, contact: data.contact };

/** PDF descargable de cada idioma (se generan con `npm run build:cv` desde cv.json). */
export const cvPdf: Record<Lang, string> = {
  es: './cv/CV-Elias-Torczuk-ES.pdf',
  en: './cv/CV-Elias-Torczuk-EN.pdf',
};

export const cvLocale = (lang: Lang): CvLocale => data[lang] as CvLocale;
