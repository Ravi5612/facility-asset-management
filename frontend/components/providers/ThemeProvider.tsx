"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// The theme can be a predefined key, a festival key, or a custom HEX code.
export type ThemeColor = string;

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 8 Base Presets
const baseThemes: Record<string, { primary: string; sidebar: string }> = {
  blue: { primary: "#1553cc", sidebar: "#1240a8" },
  red: { primary: "#dc2626", sidebar: "#991b1b" },
  yellow: { primary: "#d97706", sidebar: "#b45309" },
  green: { primary: "#059669", sidebar: "#065f46" },
  purple: { primary: "#7c3aed", sidebar: "#5b21b6" },
  orange: { primary: "#ea580c", sidebar: "#c2410c" },
  teal: { primary: "#0d9488", sidebar: "#0f766e" },
  pink: { primary: "#db2777", sidebar: "#be185d" },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>("blue");

  useEffect(() => {
    const saved = localStorage.getItem("app-theme-color") || "blue";
    setThemeColorState(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (color: ThemeColor) => {
    const root = document.documentElement;
    let primaryHex = "";
    let sidebarBg = "";
    let isFestival = false;

    if (baseThemes[color]) {
      primaryHex = baseThemes[color].primary;
      sidebarBg = baseThemes[color].sidebar;
    } else if (color.startsWith("gradient:")) {
      const parts = color.replace("gradient:", "").split(",");
      primaryHex = parts[0] || "#1553cc";
      const gradientColors = parts.length > 1 ? parts : [parts[0], parts[0]];
      sidebarBg = `linear-gradient(135deg, ${gradientColors.join(', ')})`;
      isFestival = true;
    } else if (color.startsWith("#")) {
      // Custom Hex Color
      primaryHex = color;
      sidebarBg = color; // We can use the exact same color, or add logic to darken it later.
    } else {
      // Fallback
      primaryHex = baseThemes["blue"].primary;
      sidebarBg = baseThemes["blue"].sidebar;
    }

    // Apply to Shadcn
    root.style.setProperty("--primary", primaryHex);
    root.style.setProperty("--ring", primaryHex);
    // If it's a very light festival, we might want dark text, but let's stick to white for simplicity
    if (color === "tricolor") {
      root.style.setProperty("--primary-foreground", "#000080"); // Navy blue text on Saffron
    } else {
      root.style.setProperty("--primary-foreground", "#ffffff");
    }

    // Apply to Custom Brand Variables
    root.style.setProperty("--brand-primary", primaryHex);
    root.style.setProperty("--brand-sidebar", sidebarBg);
    
    // Active sidebar link background - for festival gradients, we use a semi-transparent white/black
    if (isFestival || sidebarBg.includes("gradient")) {
      root.style.setProperty("--brand-sidebar-active", "rgba(0,0,0,0.2)");
    } else {
      root.style.setProperty("--brand-sidebar-active", primaryHex);
    }
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem("app-theme-color", color);
    applyTheme(color);
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
