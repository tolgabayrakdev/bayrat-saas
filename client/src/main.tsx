import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AuthProvider } from "./auth/AuthProvider";
import { AppShell } from "./components/AppShell";
import { GuestRoute } from "./components/GuestRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ForgotPassword from "./views/ForgotPassword";
import Login from "./views/Login";
import NotFound from "./views/NotFound";
import Overview from "./views/Overview";
import Register from "./views/Register";
import ResetPassword from "./views/ResetPassword";
import SettingsPage from "./views/Settings";
import VerifyEmail from "./views/VerifyEmail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/overview" replace />,
  },
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ],
  },
  { path: "/verify-email", element: <VerifyEmail /> },
  {
    element: <ProtectedRoute />,
    children: [{ element: <AppShell />, children: [
      { path: "/overview", element: <Overview /> },
      { path: "/plans", element: <Navigate to="/settings#subscription" replace /> },
      { path: "/settings", element: <SettingsPage /> },
    ] }],
  },
  { path: "*", element: <NotFound /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
