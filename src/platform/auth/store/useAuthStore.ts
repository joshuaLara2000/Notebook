import { create } from "zustand";

import type { AuthUser } from "../types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** 'loading' mientras se resuelve la sesión inicial de Supabase */
  status: "loading" | "ready";
  setUser: (user: AuthUser | null) => void;
  setReady: () => void;
}

// La sesión la gestiona Supabase; este store solo refleja el usuario actual.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  status: "loading",
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  setReady: () => set({ status: "ready" }),
}));
