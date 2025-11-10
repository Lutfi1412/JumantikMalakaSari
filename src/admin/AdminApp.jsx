// src/admin/AdminApp.jsx
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import Swal from "sweetalert2";

export default function AdminApp({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Yakin mau logout?",
      text: "Kamu akan keluar dari akun ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        Swal.fire({
          title: "Berhasil logout!",
          icon: "success",
          showConfirmButton: false,
          timer: 1200,
        });
        navigate("/login", { replace: true });
      }
    });
  };

  return (
    <div className="min-h-dvh bg-white text-slate-900 flex flex-col">
      <Header
        title={`Jumantik | ${role.charAt(0).toUpperCase() + role.slice(1)}`}
      />

      {/* ===== MOBILE ===== */}
      <main className="flex-1 pt-4 pb-20 px-4 sm:px-6 lg:hidden">
        <Outlet />
      </main>
      <BottomNav role={role} />

      {/* ===== DESKTOP (sidebar + content) ===== */}
      <div className="hidden lg:flex">
        <aside className="sticky top-0 h-screen w-60 flex-shrink-0 bg-slate-900 text-slate-100 px-4 py-6">
          <div className="text-lg font-semibold mb-6">Menu</div>

          <nav className="space-y-2">
            <Item to={`/${role}`} end>
              Home
            </Item>
            <Item to={`/${role}/laporan`}>Laporan</Item>
            {role === "admin" && <Item to={`/${role}/akun`}>Akun</Item>}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-6 w-full rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 min-h-screen bg-white px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Item({ to, children, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "block rounded-md px-3 py-2 transition",
          isActive ? "bg-white text-slate-800 shadow" : "hover:bg-white/10",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
