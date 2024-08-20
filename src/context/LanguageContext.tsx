import { createContext, useState, ReactNode, useEffect } from "react";
import { Language } from "../types/Language";
import { LanguageContextProps } from "../interfaces/LanguageContextProps";

export const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    const lastCurrentLanguage = window.localStorage.getItem("currentLanguage");
    if (lastCurrentLanguage) {
      setCurrentLanguage(lastCurrentLanguage as Language);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("currentLanguage", currentLanguage);
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setCurrentLanguage,
        showLanguageSelector,
        setShowLanguageSelector,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
