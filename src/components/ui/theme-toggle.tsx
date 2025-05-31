
import React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  // For toggle: cycle through 'light', 'dark', 'system'
  const nextTheme = theme === 'light'
    ? 'dark'
    : theme === 'dark'
    ? 'system'
    : 'light';

  const label =
    theme === 'dark'
      ? 'Switch to system'
      : theme === 'system'
      ? 'Switch to light'
      : 'Switch to dark';

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={label}
      onClick={() => setTheme(nextTheme)}
      className={className}
    >
      {theme === 'dark' ? (
        <Moon className="w-5 h-5" />
      ) : theme === 'light' ? (
        <Sun className="w-5 h-5" />
      ) : (
        // system: show both
        <span className="relative">
          <Sun className="absolute left-0 top-0 w-5 h-5 opacity-70" />
          <Moon className="w-5 h-5" />
        </span>
      )}
    </Button>
  );
}

export default ThemeToggle;
