import { create } from "zustand";

export type Theme = "light" | "dark";

// clave de localStorage; debe coincidir con el script anti-parpadeo de index.html
const STORAGE_KEY = "nb-theme";

// aplica el tema al <html> y lo persiste
function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage no disponible: solo aplica en memoria
  }
}

// lee el tema ya aplicado por el script inicial (evita parpadeo al montar)
function initialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme(),
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
