import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { StoreProvider } from "./lib/store";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/dashboard/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Subscribers from "./pages/Subscribers";
import Templates from "./pages/Templates";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <StoreProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/subscribers" element={<Subscribers />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </HashRouter>
        </StoreProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
