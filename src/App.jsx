import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import LihatSurat from "./pages/LihatSurat";
import Home from "./pages/Home";
import CreateSuratRT from "./pages/CreateSuratRT";
import ChatPage from "./pages/ChatPage";
import LaporanPage from "./pages/LaporanPage";
import Preview from "./pages/Preview";
import ProfilePage from "./pages/ProfilePage";
import "./styles/index.css";
import AdminApp from "./admin/AdminApp";

import AccountsAdmin from "./admin/AccountsAdmin";
import HomeAdmin from "./admin/HomeAdmin";
import LaporanAdmin from "./admin/LaporanAdmin";

import { RequireRole } from "./auth/validateRole";
import { HomeRedirect } from "./auth/homeRedirect";
import NotFound from "./pages/NotFound";

// src/App.js
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route default */}

        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/koordinator/*"
          element={
            <RequireRole allowedRoles={["koordinator"]}>
              <AdminApp role="koordinator" />
            </RequireRole>
          }
        >
          <Route index element={<Home role="koordinator" />} />
          <Route path="laporan" element={<LaporanAdmin role="koordinator" />} />
          <Route path="buat-laporan" element={<LaporanPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <AdminApp role="admin" />
            </RequireRole>
          }
        >
          <Route index element={<Home role="admin" />} />
          <Route path="laporan" element={<LaporanAdmin role="admin" />} />
          <Route path="akun" element={<AccountsAdmin />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>

        <Route
          path="/koordinator/buat-surat/:id"
          element={
            <RequireRole allowedRoles={["koordinator"]}>
              <CreateSuratRT role="koordinator" />
            </RequireRole>
          }
        ></Route>

        <Route
          path="/admin/lihat-surat/:tgl"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <LihatSurat />
            </RequireRole>
          }
        ></Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
