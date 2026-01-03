import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { SignIn } from "../pages/auth/SignIn";
import { SignUp } from "../pages/auth/SignUp";
import EmployeeDashboard from "../pages/EmployeeDashboard";

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Route based on user role
  if (user.role === UserRole.EMPLOYEE) {
    return <Navigate to="/employee/dashboard" replace />;
  } else if (user.role === UserRole.ADMIN || user.role === UserRole.HR) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/signin" replace />;
};

const TempAdminDashboard = () => {
  const { logout, user } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "1rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        Welcome, {user?.fullName}!
      </h1>
      <p style={{ color: "#6b7280" }}>Admin Dashboard coming soon...</p>
      <button
        onClick={logout}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#7c3aed",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "500",
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "1.125rem",
          color: "#6b7280",
        }}
      >
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "1.125rem",
          color: "#6b7280",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <TempAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
