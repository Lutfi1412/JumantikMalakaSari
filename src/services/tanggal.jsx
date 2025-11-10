import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
  headers: { "Content-Type": "application/json" },
});

export async function createTanggal(tanggal) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(
      "/auth/create-tanggal",
      { tanggal },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.messege || "Login gagal, periksa kembali akun Anda";
    throw new Error(msg);
  }
}

export async function getTanggal() {
  const token = localStorage.getItem("token");
  try {
    const res = await api.get("/auth/get-tanggal", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.messege || "Gagal membuat user, periksa akun Anda";
    throw new Error(msg);
  }
}

export async function updateTanggal(tanggal, id) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.put(
      `/auth/update-tanggal/${id}`,
      { tanggal },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.messege || "Gagal update user, periksa akun Anda";
    throw new Error(msg);
  }
}

export async function deleteTanggal(ids) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.delete("/auth/delete-tanggal", {
      data: { ids }, // kirim array ID di body
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.messege ||
      "Gagal menghapus laporan, periksa akun Anda";
    throw new Error(msg);
  }
}

export async function getRW(tanggal) {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(
      `/auth/get-rw`,
      { tanggal },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.messege ||
      "Gagal mengambil data rw";
    throw new Error(msg);
  }
}
