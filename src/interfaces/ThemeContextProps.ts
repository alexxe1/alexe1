import { Theme } from "../types/Theme";

export interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
