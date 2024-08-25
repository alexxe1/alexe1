import { createContext, useState, ReactNode, useEffect } from "react";
import { Theme } from "../types/Theme";
import { ThemeContextProps } from "../interfaces/ThemeContextProps";

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const lastTheme = window.localStorage.getItem("theme");
    if (lastTheme) {
      setTheme(lastTheme as "light" | "dark");
      document.body.classList.add(lastTheme);
    } else {
      setTheme("dark");
      document.body.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme", theme);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
