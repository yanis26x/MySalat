// src/themeContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES } from "./themePresets";

const KEY = "themeKey26x";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState("greenLight");
  const [THEME, setTHEME] = useState(THEMES[themeKey]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        if (saved && THEMES[saved]) {
          setThemeKey(saved);
          setTHEME(THEMES[saved]);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    setTHEME(THEMES[themeKey] || THEMES.greenLight);
    AsyncStorage.setItem(KEY, themeKey).catch(() => {});
  }, [themeKey]);

  const value = useMemo(() => ({ THEME, themeKey, setThemeKey, THEMES }), [THEME, themeKey]);

  if (!ready) return null; // laisse le splash

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme26x() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme26x must be used within ThemeProvider");
  return ctx;
}
