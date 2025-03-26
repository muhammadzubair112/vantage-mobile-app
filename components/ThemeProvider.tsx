import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/hooks/useThemeStore';
import Colors from '@/constants/colors';
import DarkColors from '@/constants/darkColors';

interface ThemeContextType {
  isDarkMode: boolean;
  colors: typeof Colors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  colors: Colors,
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { isDarkMode, toggleTheme, setDarkMode } = useThemeStore();
  
  // Apply the theme colors based on the dark mode setting
  const colors = isDarkMode ? DarkColors : Colors;
  
  // Sync with system theme on initial load - but only once
  useEffect(() => {
    if (systemColorScheme) {
      setDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, setDarkMode]);
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export useTheme hook after ThemeContext and ThemeProvider are defined
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};