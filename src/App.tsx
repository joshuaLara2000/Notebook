import { Navigate, Route, Routes } from "react-router-dom";

import { useAuthStore } from "@/platform/auth/store/useAuthStore";
import { ProtectedRoute } from "@/platform/auth/guards/ProtectedRoute";
import { Login } from "@/modules/login/views/Login";
import { Desk } from "@/modules/desk/views/Desk";

export default function App() {
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Evita el parpadeo de login mientras Supabase resuelve la sesión inicial.
  if (status === "loading") {
    return (
      <div className="text-ink-soft grid min-h-dvh place-items-center font-bold">
        Cargando…
      </div>
    );
  }

  return (
    <Routes>
      {/* Público: si ya hay sesión, salta el login. */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* App protegida. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Desk />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
