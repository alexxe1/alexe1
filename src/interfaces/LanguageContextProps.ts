import { Language } from "../types/Language";

export interface LanguageContextProps {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
  showLanguageSelector: boolean;
  setShowLanguageSelector: (showLanguageSelector: boolean) => void;
}
