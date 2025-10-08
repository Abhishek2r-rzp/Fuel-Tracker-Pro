import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 50,
        background:
          theme === "light"
            ? "linear-gradient(135deg, #E9D5FF 0%, #DDD6FE 100%)"
            : "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
      }}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-6 h-6 text-purple-900" />
      ) : (
        <Sun className="w-6 h-6 text-white" />
      )}
    </button>
  );
}
