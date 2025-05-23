
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Dispatch a custom event that other components can listen to
    window.dispatchEvent(new CustomEvent('theme-change', { 
      detail: { theme: newTheme ? 'dark' : 'light' } 
    }));
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDarkMode ? 360 : 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative w-5 h-5"
      >
        <motion.div
          initial={false}
          animate={{ 
            opacity: isDarkMode ? 0 : 1,
            scale: isDarkMode ? 0.5 : 1,
            position: 'absolute',
            top: 0,
            left: 0
          }}
          transition={{ duration: 0.2 }}
        >
          <Sun className="h-5 w-5" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ 
            opacity: isDarkMode ? 1 : 0,
            scale: isDarkMode ? 1 : 0.5,
            position: 'absolute',
            top: 0,
            left: 0
          }}
          transition={{ duration: 0.2 }}
        >
          <Moon className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </Button>
  );
}

export default ThemeToggle;
