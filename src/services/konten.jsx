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

export async function getkonten() {
  const token = localStorage.getItem("token");
  try {
    const res = await api.get("/auth/get-konten", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.error || "Konten Gagal Dimuat";
    throw new Error(msg);
  }
}

export async function deleteKonten(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.delete(`/auth/delete-konten/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.error || "Gagal menghapus Konten";
    throw new Error(msg);
  }
}
