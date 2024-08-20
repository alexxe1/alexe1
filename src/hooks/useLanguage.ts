import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { languages } from "../constants/languages";

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  const {
    currentLanguage,
    setCurrentLanguage,
    showLanguageSelector,
    setShowLanguageSelector,
  } = context;
  const traductions = languages[currentLanguage];

  return {
    currentLanguage,
    setCurrentLanguage,
    showLanguageSelector,
    setShowLanguageSelector,
    traductions,
  };
}
