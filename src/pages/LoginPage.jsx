import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../services/user";
import jwt_decode from "jwt-decode";
import LoadingOverlay from "../components/LoadingOverlay";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(username, password);

      if (data.message) {
        localStorage.setItem("token", data.message);

        const token = localStorage.getItem("token");
        const decoded = jwt_decode(token);
        if (decoded.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (decoded.role === "petugas") {
          navigate("/petugas", { replace: true });
        } else if (decoded.role === "koordinator") {
          navigate("/koordinator", { replace: true });
        } else {
          navigate("/404", { replace: true });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: error.message || "Username atau password salah",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <LoadingOverlay show={loading} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">
          Login to your account
        </h1>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-800">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-800">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {show ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
