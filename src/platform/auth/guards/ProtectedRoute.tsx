import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/platform/auth/store/useAuthStore";

/** Gate for authenticated routes: redirects to /login without a session. */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
