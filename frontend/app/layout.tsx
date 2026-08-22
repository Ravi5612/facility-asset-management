import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asset Management System",
  description: "Enterprise asset, ticket, and department management dashboard.",
};

import { cookies } from "next/headers";

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  const cookieStore = await cookies();
  let themeColor = cookieStore.get("app-theme-color")?.value;
  
  if (!themeColor) {
    try {
      const res = await fetch(`${process.env.BACKEND_URL || "http://127.0.0.1:3001"}/settings/public-theme`, { cache: "no-store" });
      const data = await res.json();
      themeColor = data.themeColor || "blue";
    } catch (e) {
      themeColor = "blue";
    }
  }

  return (
    <html suppressHydrationWarning lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* FOUC Preventer */}<head><script dangerouslySetInnerHTML={{ __html: `
try {
  let cookies = document.cookie.split("; ");
  let themeCookie = cookies.find(row => row.startsWith("app-theme-color="));
  let color = themeCookie ? themeCookie.split("=")[1] : (localStorage.getItem("app-theme-color") || "${themeColor}");
  localStorage.setItem("app-theme-color", color);
  
  const baseThemes = {
    blue: { primary: "#1553cc", sidebar: "#1240a8" },
    red: { primary: "#dc2626", sidebar: "#991b1b" },
    yellow: { primary: "#d97706", sidebar: "#b45309" },
    green: { primary: "#059669", sidebar: "#065f46" },
    purple: { primary: "#7c3aed", sidebar: "#5b21b6" },
    orange: { primary: "#ea580c", sidebar: "#c2410c" },
    teal: { primary: "#0d9488", sidebar: "#0f766e" },
    pink: { primary: "#db2777", sidebar: "#be185d" },
  };

  let primaryHex = "";
  let sidebarBg = "";
  let isFestival = false;

  if (baseThemes[color]) {
    primaryHex = baseThemes[color].primary;
    sidebarBg = baseThemes[color].sidebar;
  } else if (color.startsWith("gradient:")) {
    let parts = color.replace("gradient:", "").split(",");
    primaryHex = parts[0] || "#1553cc";
    let gradientColors = parts.length > 1 ? parts : [parts[0], parts[0]];
    sidebarBg = "linear-gradient(135deg, " + gradientColors.join(', ') + ")";
    isFestival = true;
  } else if (color.startsWith("#")) {
    primaryHex = color;
    sidebarBg = color;
  } else {
    primaryHex = baseThemes["blue"].primary;
    sidebarBg = baseThemes["blue"].sidebar;
  }

  let root = document.documentElement;
  root.style.setProperty("--primary", primaryHex);
  root.style.setProperty("--ring", primaryHex);
  if (color === "tricolor") {
    root.style.setProperty("--primary-foreground", "#000080");
  } else {
    root.style.setProperty("--primary-foreground", "#ffffff");
  }
  root.style.setProperty("--brand-primary", primaryHex);
  root.style.setProperty("--brand-sidebar", sidebarBg);
  
  if (isFestival || sidebarBg.includes("gradient")) {
    root.style.setProperty("--brand-sidebar-active", "rgba(0,0,0,0.2)");
  } else {
    root.style.setProperty("--brand-sidebar-active", primaryHex);
  }
} catch (e) {}
` }} /></head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider><QueryProvider>{children}</QueryProvider></ThemeProvider>
      </body>
    </html>
  );
}
