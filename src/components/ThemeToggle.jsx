import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: theme === 'light' 
          ? 'linear-gradient(135deg, #E9D5FF 0%, #DDD6FE 100%)'
          : 'linear-gradient(135deg, #4C1D95 0%, #6B21A8 100%)',
      }}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-6 h-6 text-purple-900" />
      ) : (
        <Sun className="w-6 h-6 text-purple-100" />
      )}
    </button>
  );
}
