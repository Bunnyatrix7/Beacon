import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const getSystemTheme = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("beacon-theme") || "system");
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!query) return;

    const handleChange = () => setSystemTheme(getSystemTheme());
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const theme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    localStorage.setItem("beacon-theme", mode);
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [mode, theme]);

  const value = useMemo(() => ({ mode, setMode, theme }), [mode, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
