import { useEffect, useMemo, useState } from "react";
import ThemeContext from "./themeContext";

const themes = ["light", "dark", "system"];

function getInitialTheme() {
  const storedTheme = localStorage.getItem("app-theme");
  return themes.includes(storedTheme) ? storedTheme : "system";
}

function applyTheme(theme, systemPrefersDark) {
  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => applyTheme(theme, mediaQuery.matches);

    updateTheme();
    mediaQuery.addEventListener("change", updateTheme);
    localStorage.setItem("app-theme", theme);

    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, [theme]);

  const value = useMemo(() => {
    const cycleTheme = () => {
      setTheme((currentTheme) => themes[(themes.indexOf(currentTheme) + 1) % themes.length]);
    };

    return { theme, cycleTheme };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
