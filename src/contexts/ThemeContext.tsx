
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeContextProps>({
  theme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const { user } = useAuth();

  // Helper for applying/removing .dark class from <html>
  const applyThemeClass = (themeToApply: Theme) => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove('dark');
    // If explicitly dark, or system & system prefers dark
    const shouldDark =
      themeToApply === 'dark' ||
      (themeToApply === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (shouldDark) {
      root.classList.add('dark');
    }
  };

  // Load theme at startup (from Supabase, localStorage, or system)
  useEffect(() => {
    const loadTheme = async () => {
      let storedTheme: Theme | null = null;
      if (user) {
        // Try Supabase profile for saved theme
        const { data, error } = await supabase
          .from('profiles')
          .select('theme')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!error && data && data.theme) {
          storedTheme = data.theme as Theme;
        }
      }
      if (!storedTheme) {
        // Try localStorage fallback
        try {
          storedTheme = (localStorage.getItem('theme') as Theme) || 'system';
        } catch {
          storedTheme = 'system';
        }
      }
      setThemeState(storedTheme);
      applyThemeClass(storedTheme);
    };
    loadTheme();
    // System theme change event
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemThemeChange = () => {
      if (theme === 'system') applyThemeClass('system');
    };
    mq.addEventListener('change', onSystemThemeChange);
    return () => mq.removeEventListener('change', onSystemThemeChange);
    // eslint-disable-next-line
  }, [user]); // Loads whenever user changes/logs in

  // Helper for setting state, localStorage, html class, and DB
  const setTheme = (value: Theme) => {
    setThemeState(value);
    try {
      localStorage.setItem('theme', value);
    } catch {
      // ignore
    }
    applyThemeClass(value);
    // Persist to Supabase if logged in
    if (user) {
      supabase.from('profiles').update({ theme: value }).eq('user_id', user.id);
    }
  };

  // On manual/sync theme change, ensure HTML class gets updated
  useEffect(() => {
    if (typeof window !== "undefined") {
      applyThemeClass(theme);
    }
  }, [theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeProviderContext);
}
