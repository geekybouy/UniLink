
import { ThemeProvider as NextThemesProvider } from "@/contexts/ThemeContext"
import { type ThemeProviderProps } from "@/contexts/ThemeContext"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
