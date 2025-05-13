
import { ThemeProvider as ThemeContextProvider } from "@/contexts/ThemeContext";
import type { ThemeProviderProps } from "@/contexts/ThemeContext";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <ThemeContextProvider {...props}>{children}</ThemeContextProvider>;
}
