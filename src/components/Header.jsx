import { Link, useNavigate } from "react-router-dom";
import { BsChatDots } from "react-icons/bs";
import { IoLogInOutline } from "react-icons/io5";
import Swal from "sweetalert2";

export default function Header({
  title = "Jumantik Digital",
  showChat = false,
}) {
  const navigate = useNavigate(); // ✅ dipanggil di dalam komponen, bukan di luar

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
        navigate("/home", { replace: true });
      }
    });
  };

  return (
    <header className="px-5 pt-4 pb-3 flex items-center justify-between lg:hidden">
      <div className="flex items-center gap-2 text-xl font-semibold">
        <span className="text-2xl">🦟</span>
        <span>{title}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {showChat && (
          <Link
            to="/chat"
            aria-label="Chat"
            className="p-2 sm:p-3 rounded-full hover:bg-black/5"
          >
            <BsChatDots className="text-2xl sm:text-3xl" />
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center py-2 text-xs text-gray-500 hover:text-red-600 transition-colors"
        >
          <IoLogInOutline className="text-2xl sm:text-3xl" />
        </button>
      </div>
    </header>
  );
}
