
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon, Laptop } from "lucide-react";

const labels: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  system: "System Default",
};

const icons: Record<string, React.ReactNode> = {
  light: <Sun className="w-4 h-4 mr-1 inline" />,
  dark: <Moon className="w-4 h-4 mr-1 inline" />,
  system: <Laptop className="w-4 h-4 mr-1 inline" />,
};

export function ThemeSelect({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
      <SelectTrigger className={className + " w-44"}>
        <SelectValue placeholder="Select theme">
          <span className="flex items-center">
            {icons[theme]} {labels[theme]}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <span className="flex items-center">{icons.light}Light</span>
        </SelectItem>
        <SelectItem value="dark">
          <span className="flex items-center">{icons.dark}Dark</span>
        </SelectItem>
        <SelectItem value="system">
          <span className="flex items-center">{icons.system}System Default</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export default ThemeSelect;
