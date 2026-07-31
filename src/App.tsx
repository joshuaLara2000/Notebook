import { Navigate, Route, Routes } from "react-router-dom";

import { useAuthStore } from "@/platform/auth/store/useAuthStore";
import { ProtectedRoute } from "@/platform/auth/guards/ProtectedRoute";
import { Login } from "@/modules/login/views/Login";
import { Desk } from "@/modules/desk/views/Desk";

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Routes>
      {/* Public: if already signed in, skip the login screen. */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected app. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Desk />} />
      </Route>

      {/* Unknown paths fall back to the desk (which itself guards). */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
