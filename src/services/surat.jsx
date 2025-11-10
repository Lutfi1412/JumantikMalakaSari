// src/services/surat.js
import axios from "axios";

const envHost = import.meta.env.VITE_API_HOST || ""; // pastikan di .env ada VITE_API_HOST

const api = axios.create({
  baseURL: envHost,
  headers: { "Content-Type": "application/json" },
});

function getTokenHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: token ? `Bearer ${token}` : "" };
}

/**
 * Get surat RW berdasarkan tanggal_id (backend menerima body { tanggal_id })
 * NOTE: Menggunakan POST karena backend mengharapkan payload di body.
 */
export async function getSuratRW(tanggal_id) {
  try {
    const res = await api.post(
      `/auth/get-surat-rw`,
      { tanggal_id },
      { headers: getTokenHeader() }
    );
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.messege ||
      "Gagal mengambil data surat";
    throw new Error(msg);
  }
}

export async function getSuratAdmin(tanggal) {
  try {
    const res = await api.post(
      `/auth/get-surat-admin`,
      { tanggal },
      { headers: getTokenHeader() }
    );
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.messege ||
      "Gagal mengambil data surat";
    throw new Error(msg);
  }
}

export async function updateSurat(id, data) {
  try {
    const safeNumber = (val) => (val === "" || val == null ? 0 : Number(val));

    const payload = {
      rt: Number(data.rt),
      jumlah: {
        jumantik: safeNumber(data.jumlah.jumantik),
        melapor: safeNumber(data.jumlah.melapor),
      },
      jenis_tatanan: {
        rumah_tangga: {
          dikunjungi: safeNumber(data.jenis_tatanan.rumah_tangga.dikunjungi),
          positif: safeNumber(data.jenis_tatanan.rumah_tangga.positif),
        },
        perkantoran: {
          dikunjungi: safeNumber(data.jenis_tatanan.perkantoran.dikunjungi),
          positif: safeNumber(data.jenis_tatanan.perkantoran.positif),
        },
        inst_pendidikan: {
          dikunjungi: safeNumber(data.jenis_tatanan.inst_pendidikan.dikunjungi),
          positif: safeNumber(data.jenis_tatanan.inst_pendidikan.positif),
        },
        ttu: {
          dikunjungi: safeNumber(data.jenis_tatanan.ttu.dikunjungi),
          positif: safeNumber(data.jenis_tatanan.ttu.positif),
        },
        fas_olahraga: {
          dikunjungi: safeNumber(data.jenis_tatanan.fas_olahraga.dikunjungi),
          positif: safeNumber(data.jenis_tatanan.fas_olahraga.positif),
        },
        tpm: {
          dikunjungi: safeNumber(data.jenis_tatanan.tpm.dikunjungi),
          positif: safeNumber(data.jenis_tatanan.tpm.positif),
        },
        fas_kesehatan: {
          dikunjungi: safeNumber(data.jenis_tatanan.fas_kesehatan.dikunjungi),
          positif: safeNumber(data.jenis_tatanan.fas_kesehatan.positif),
        },
      },
    };

    const res = await api.put(`/auth/update-surat/${id}`, payload, {
      headers: getTokenHeader(),
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Gagal update surat, periksa kembali data Anda";
    throw new Error(msg);
  }
}

export async function deleteSurat(ids) {
  try {
    const res = await api.delete("/auth/delete-surat", {
      data: { ids }, // array ID di body
      headers: getTokenHeader(),
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Gagal menghapus surat";
    throw new Error(msg);
  }
}

export async function createSurat(data) {
  try {
    const payload = {
      tanggal_id: data.tanggal_id,
      rt: data.rt,
      jumlah: data.jumlah,
      jenis_tatanan: data.jenis_tatanan,
    };

    const res = await api.post("/auth/create-surat", payload, {
      headers: getTokenHeader(),
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Gagal membuat surat, periksa kembali data Anda";
    throw new Error(msg);
  }
}
