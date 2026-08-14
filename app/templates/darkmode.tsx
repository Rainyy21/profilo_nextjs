"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import StarryBackground from "./StarryBackground";
import CloudBackground from "./CloudBackground";

const darkModeIcon = "/srcAndImg/dark_mode_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40(1).svg";
const lightModeIcon = "/srcAndImg/light_mode_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg";

interface DarkmodeProps {
  children?: React.ReactNode;
}

export default function Darkmode({ children }: DarkmodeProps) {
  const [theme, setTheme] = useState<string>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [mounted, theme]);

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen">
      {isDark ? <StarryBackground /> : <CloudBackground />}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 transition-opacity hover:opacity-80 cursor-pointer"
          aria-label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          <Image
            src={theme === "light" ? lightModeIcon : darkModeIcon}
            alt={theme === "light" ? "Light Mode Icon" : "Dark Mode Icon"}
            width={60}
            height={60}
            className={theme === "light" ? "drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-transform hover:scale-105" : "transition-transform hover:scale-105"}
          />
        </button>
      </div>
      {children}
    </div>
  );
}

