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
    
    // Dodatkowe ustawienia dla PWA
    document.body.style.backgroundColor = theme === 'dark' ? '#111827' : '#ffffff';
    document.body.style.color = theme === 'dark' ? '#f9fafb' : '#111827';
  }, [theme]);

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