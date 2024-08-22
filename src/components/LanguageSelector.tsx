import { useEffect, useRef } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { Language } from "../types/Language";
import "./LanguageSelector.css";

export function LanguageSelector() {
  const { setCurrentLanguage, showLanguageSelector, setShowLanguageSelector } =
    useLanguage();
  const languageSelectorRef = useRef<HTMLElement | null>(null);

  const selectLanguage = (language: Language) => {
    setCurrentLanguage(language);
    setShowLanguageSelector(false);
  };

  useEffect(() => {
    const languageSelector = languageSelectorRef.current;
    if (!languageSelector) return;

    if (showLanguageSelector) {
      languageSelector.classList.add("show");
      languageSelector.classList.remove("hide");
    } else {
      languageSelector.classList.add("hide");
      languageSelector.classList.remove("show");
    }
  }, [showLanguageSelector]);

  return (
    <aside className="language-selector" ref={languageSelectorRef}>
      <button onClick={() => selectLanguage("en")}>English</button>
      <button onClick={() => selectLanguage("es")}>Español</button>
    </aside>
  );
}
