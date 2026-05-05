'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type FontSize = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  theme: Theme;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const theme: Theme = 'light';
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedFontSize = localStorage.getItem('fontSize') as FontSize | null;
    const savedHighContrast = localStorage.getItem('highContrast');

    if (savedFontSize) setFontSize(savedFontSize);
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.classList.remove('light', 'dark', 'high-contrast', 'large-font', 'xlarge-font');

    document.documentElement.classList.add(theme);

    // Применяем классы шрифтов в зависимости от режима
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
      // В режиме слабовидящих тоже применяем выбранный размер шрифта
      if (fontSize === 'large') document.documentElement.classList.add('large-font');
      if (fontSize === 'xlarge') document.documentElement.classList.add('xlarge-font');
    } else {
      if (fontSize === 'large') document.documentElement.classList.add('large-font');
      if (fontSize === 'xlarge') document.documentElement.classList.add('xlarge-font');
    }

    localStorage.setItem('theme', theme);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('highContrast', String(highContrast));
  }, [theme, fontSize, highContrast, mounted]);

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        fontSize,
        setFontSize,
        highContrast,
        toggleHighContrast: () => setHighContrast(prev => !prev),
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
