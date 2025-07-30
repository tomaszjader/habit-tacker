import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Sprawdź localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme as Theme;
    }
    
    // Sprawdź preferencje systemowe
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Domyślnie tryb ciemny dla PWA
    return 'dark';
  });

  useEffect(() => {
    // Usuń wszystkie klasy motywu
    document.documentElement.classList.remove('light', 'dark');
    // Dodaj aktualny motyw
    document.documentElement.classList.add(theme);
    // Zapisz w localStorage
    localStorage.setItem('theme', theme);
    
    // Ustawienia dla PWA na Androidzie
    const isDark = theme === 'dark';
    const backgroundColor = isDark ? '#111827' : '#ffffff';
    const textColor = isDark ? '#f9fafb' : '#111827';
    const themeColor = isDark ? '#111827' : '#ffffff';
    
    // Ustaw kolory tła i tekstu
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = textColor;
    document.documentElement.style.backgroundColor = backgroundColor;
    document.documentElement.style.color = textColor;
    
    // Ustaw color-scheme dla lepszego wsparcia trybu ciemnego
    document.documentElement.style.colorScheme = theme;
    
    // Aktualizuj meta tag theme-color dla Androida
    let themeColorMeta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', themeColor);
    
    // Aktualizuj status bar style dla iOS
    let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (statusBarMeta) {
      statusBarMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
    }
    
    // Dodatkowe ustawienia dla PWA
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.backgroundColor = backgroundColor;
      rootElement.style.color = textColor;
    }
    
    // Usuń loading spinner jeśli istnieje
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
      loadingSpinner.remove();
    }
  }, [theme]);

  // Nasłuchuj zmian preferencji systemowych
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Tylko jeśli użytkownik nie ustawił ręcznie motywu
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};