import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Upload from "./components/Upload";
import Dataset from "./components/Dataset";
import Hero from "./components/Hero";
import AuthPage from "./components/AuthPage";
function Workspace() {
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    main.current?.focus();
  }, [location.pathname]);
  if (!localStorage.getItem("dataspace_user_id"))
    return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Sidebar />
      <main id="main" className="main-content" tabIndex={-1} ref={main}>
        <Outlet />
      </main>
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/login" element={<AuthPage key="login" mode="login" />} />
      <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
      <Route element={<Workspace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/dataset/:dataset_id/" element={<Dataset />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
