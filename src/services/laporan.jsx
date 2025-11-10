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
export async function getLaporan() {
  const token = localStorage.getItem("token");
  try {
    const res = await api.get("/auth/laporan?start=0&end=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.error || "Gagal membuat user, periksa akun Anda";
    throw new Error(msg);
  }
}

export async function updateLoparan(detail_alamat, id) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.put(
      `/auth/update-laporan/${id}`,
      { detail_alamat },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.error || "Gagal update user, periksa akun Anda";
    throw new Error(msg);
  }
}
export async function deleteLaporan(ids) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.delete("/auth/delete-laporan", {
      data: { ids }, // kirim array ID di body
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.error ||
      "Gagal menghapus laporan, periksa akun Anda";
    throw new Error(msg);
  }
}

export async function createLaporan(
  rt,
  detail_alamat,
  gambar,
  latitude,
  longitude
) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(
      "/auth/create-laporan",
      { rt, detail_alamat, gambar, latitude, longitude },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message || "Gagal membuat user, periksa akun Anda";
    throw new Error(msg);
  }
}

export async function getRT() {
  const token = localStorage.getItem("token");
  try {
    const res = await api.get("/auth/get-rt", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.error || "Gagal membuat user, periksa akun Anda";
    throw new Error(msg);
  }
}

export async function getGambar(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.get(`/auth/get-gambar/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message || "Gagal membuat user, periksa akun Anda";
    throw new Error(msg);
  }
}
