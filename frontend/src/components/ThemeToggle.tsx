import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2
                 bg-surface border hairline text-ink-dim
                 hover:text-accent hover:border-accent/45 transition-colors"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="text-[10px] uppercase tracking-[0.22em]">
        {theme === "light" ? "dark" : "light"}
      </span>
    </button>
  );
};

export default ThemeToggle;
