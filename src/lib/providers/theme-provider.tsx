"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUIStore } from "@/lib/store/ui-store";

type Theme = "default" | "alireza" | "neda";
type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  setDarkMode: (dark: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "default",
  setTheme: () => null,
  isDarkMode: false,
  setDarkMode: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentTheme, darkMode, setTheme, setDarkMode } = useUIStore();
  const [mounted, setMounted] = useState(false);

  // Update the UI store when the theme changes
  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  // Update the UI store when dark mode changes
  const handleDarkModeChange = (dark: boolean) => {
    setDarkMode(dark);
  };

  // Apply theme and dark mode classes to the document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("theme-default", "theme-alireza", "theme-neda");
    
    // Add the current theme class if not default
    if (currentTheme !== "default") {
      root.classList.add(`theme-${currentTheme}`);
    }
    
    // Toggle dark mode
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [currentTheme, darkMode]);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProviderContext.Provider
      value={{
        theme: currentTheme,
        setTheme: handleThemeChange,
        isDarkMode: darkMode,
        setDarkMode: handleDarkModeChange,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};