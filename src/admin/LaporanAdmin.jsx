// src/admin/LaporanAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { FaMapMarkerAlt, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import Modal from "../shared/Modal";
import {
  getLaporan,
  updateLoparan,
  deleteLaporan,
  getGambar,
} from "../services/laporan";
import DatePicker from "react-datepicker";
import LoadingOverlay from "../components/LoadingOverlay";
import "react-datepicker/dist/react-datepicker.css";
import { set } from "date-fns";

export default function LaporanAdmin({ role }) {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState([]); // ✅ untuk checkbox
  const [range, setRange] = useState([null, null]);
  const [startDate, endDate] = range;
  const [loading, setLoading] = useState(false);

  // === Fetch data dari API ===
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await getLaporan();
        setRows(res.data || []);
      } catch (err) {
        console.error("Gagal get laporan:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleGambar(row) {
    setLoading(true);
    try {
      const res = await getGambar(row.id);
      const imageSrc = res.gambar.startsWith("data:image")
        ? res.gambar
        : `data:image/jpeg;base64,${res.gambar}`;

      Swal.fire({
        imageUrl: imageSrc,
        imageAlt: "Gambar laporan",
        showConfirmButton: false,
        showCloseButton: true,
        imageWidth: 400,
        imageHeight: 600,
        background: "#f8fafc",
      });
    } catch (err) {
      console.error("Gagal ambil gambar:", err);
      Swal.fire("Gagal ambil gambar", err.message, "error");
    } finally {
      setLoading(false);
    }
  }
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return rows.filter((r) => {
      let matchQuery = true;

      if (role === "admin") {
        matchQuery = !q || r.rw.toString().includes(q);
      } else if (role === "koordinator") {
        matchQuery = !q || r.rt.toString().includes(q);
      }

      // Filter tanggal jika range dipilih
      const matchDate =
        !startDate || !endDate
          ? true
          : new Date(r.tanggal) >= startDate && new Date(r.tanggal) <= endDate;

      return matchQuery && matchDate;
    });
  }, [rows, query, startDate, endDate, role]);

  // === Select All ===
  const allSelected =
    selected.length === filtered.length && filtered.length > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(filtered.map((r) => r.id));
    }
  }

  function handleDateChange(update) {
    const [start, end] = update || [];

    // kalau endDate ada, tambahkan 1 hari agar tanggal akhir ikut terhitung
    if (end) {
      const adjustedEnd = new Date(end);
      adjustedEnd.setDate(adjustedEnd.getDate() + 1);
      setRange([start, adjustedEnd]);
    } else {
      setRange([start, end]);
    }
  }

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // === Tombol Delete ===
  async function handleDelete() {
    if (selected.length === 0) return;

    const confirm = await Swal.fire({
      title: "Hapus Data?",
      text: `Yakin ingin menghapus ${selected.length} laporan?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;
    setLoading(true);
    try {
      await deleteLaporan(selected); // kirim array ke backend
      setRows((prev) => prev.filter((r) => !selected.includes(r.id)));
      setSelected([]);
      Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
    } catch (err) {
      Swal.fire("Gagal!", err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // === Edit ===
  function openForEdit(row) {
    setEditing({ ...row });
    setOpenEdit(true);
  }

  async function saveEdit() {
    setLoading(true);
    try {
      await updateLoparan(editing.detail_alamat, editing.id);
      setRows((rs) => rs.map((r) => (r.id === editing.id ? editing : r)));
      setOpenEdit(false);
      Swal.fire({
        icon: "success",
        title: "Data berhasil diperbarui!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Gagal update!", err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // === Potong alamat ===
  function truncateAlamat(text, id) {
    const limit = 20;
    const isExpanded = expanded[id];
    if (!text) return "";
    const displayText = isExpanded
      ? text
      : text.slice(0, limit) + (text.length > limit ? "…" : "");
    return (
      <>
        {displayText}{" "}
        {text.length > limit && (
          <button
            onClick={() =>
              setExpanded((prev) => ({ ...prev, [id]: !isExpanded }))
            }
            className="text-blue-600 underline text-xs hover:text-blue-800"
          >
            {isExpanded ? "Lihat Sedikit" : "Lihat Selengkapnya"}
          </button>
        )}
      </>
    );
  }

  if (loading) return <LoadingOverlay show={loading} />;

  return (
    <section className="max-w-7xl mx-auto">
      {/* Header + Filter */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur">
        <div className="px-4 sm:px-6 py-4 space-y-3">
          <h2 className="text-xl sm:text-2xl font-semibold">Laporan</h2>

          {/* 🔍 Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Label dan DatePicker */}
            <div className="flex items-center gap-2">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
                isClearable={true}
                placeholderText="Pilih rentang tanggal"
                dateFormat="yyyy-MM-dd"
                className="rounded-xl border border-slate-300 px-3 py-2 w-[160px] sm:w-[200px]"
              />
            </div>

            {/* Input Cari */}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={role === "admin" ? "Cari RW" : "Cari RT"}
              className="flex-1 min-w-[100px] sm:min-w-[160px] rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />

            {/* Tombol Hapus */}
            <button
              onClick={handleDelete}
              disabled={selected.length === 0}
              className={`flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-white transition-all ${
                selected.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              <FaTrash /> Hapus
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 sm:px-6 pb-8 pt-2">
        <div className="rounded-2xl bg-white shadow-sm p-2 sm:p-4 overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="text-left">
                <Th className="w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </Th>
                <Th>No</Th>
                <Th>Tanggal</Th>
                <Th>RT</Th>
                <Th>RW</Th>
                <Th>Detail Alamat</Th>
                <Th>Pelapor</Th>
                <Th>Gambar</Th>
                <Th className="text-center">Aksi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Td className="text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </Td>
                  <Td>{i + 1}</Td>
                  <Td>{r.tanggal}</Td>
                  <Td>{r.rt}</Td>
                  <Td>{r.rw}</Td>
                  <Td className="min-w-[220px]">
                    {truncateAlamat(r.detail_alamat, r.id)}
                  </Td>
                  <Td>{r.pelapor}</Td>
                  <Td className="text-center">
                    <button
                      onClick={() => handleGambar(r)}
                      className="text-blue-600 hover:underline"
                    >
                      Lihat
                    </button>
                  </Td>

                  <Td className="text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        title="Lihat lokasi"
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps?q=${r.latitude},${r.longitude}`,
                            "_blank"
                          )
                        }
                        className="rounded-lg px-2 py-1 text-rose-600 hover:bg-rose-50"
                      >
                        <FaMapMarkerAlt />
                      </button>
                      {role === "koordinator" && (
                        <button
                          onClick={() => openForEdit(r)}
                          title="Edit"
                          className="rounded-lg px-2 py-1 text-sky-600 hover:bg-sky-50"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      <Modal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title="Edit Laporan"
      >
        {editing && (
          <div className="space-y-3">
            <label className="block text-sm">Detail Alamat</label>
            <textarea
              rows={3}
              value={editing.detail_alamat}
              onChange={(e) =>
                setEditing({ ...editing, detail_alamat: e.target.value })
              }
              className="w-full rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-200"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOpenEdit(false)}
                className="px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

/* Helpers */
function Th({ children, className = "" }) {
  return (
    <th
      className={`px-3 sm:px-4 py-2 sm:py-3 text-sm font-semibold ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-3 sm:px-4 py-3 align-top ${className}`}>{children}</td>
  );
}
