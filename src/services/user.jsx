// src/services/authService.js
import axios from "axios";

// Buat instance axios biar bisa reuse di service lain juga
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_HOST,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

const envHost = import.meta.env.VITE_API_HOST; // kalau sudah di-set di .env
// const autoHost = `http://${location.hostname}:8080`; // otomatis pakai IP PC yang diakses oleh HP
// const baseURL =
//   envHost && envHost !== "http://localhost:8080" ? envHost : autoHost;

const api = axios.create({
  baseURL: envHost,
  headers: { "Content-Type": "application/json" },
});
export async function login(username, password) {
  try {
    const res = await api.post("/login", { username, password });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.error || "Login gagal, periksa kembali akun Anda";
    throw new Error(msg);
  }
}

export async function checkToken(token) {
  try {
    const res = await api.post("/check-token", { token });
    return res.data; // Ambil string "admin" saja
  } catch (error) {
    const msg =
      error.response?.data?.error || "Login gagal, periksa kembali akun Anda";
    throw new Error(msg);
  }
}

export async function createUser(
  nama,
  username,
  password,
  role,
  rt,
  rw,
  nama_rw
) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(
      "/auth/create-user",
      { nama, username, password, role, rt, rw, nama_rw },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.error || "Gagal membuat user, periksa akun Anda";
    throw new Error(msg);
  }
}

export async function getUser() {
  const token = localStorage.getItem("token");
  try {
    const res = await api.get("/auth/get-user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.error || "Gagal membuat user, periksa akun Anda";
    throw new Error(msg);
  }
}

export async function updateUser(username, password_new, id) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.put(
      `/auth/update-user/${id}`,
      { username, password_new },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.error || "Gagal update user, periksa akun Anda";
    throw new Error(msg);
  }
}

export async function deleteUser(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.delete(`/auth/delete-user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.error || "Gagal menghapus user, periksa akun Anda";
    throw new Error(msg);
  }
}
