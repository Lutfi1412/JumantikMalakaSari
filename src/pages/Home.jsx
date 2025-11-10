import { useEffect, useMemo, useState } from "react";
import {
  createTanggal,
  getTanggal,
  updateTanggal,
  deleteTanggal,
} from "../services/tanggal";
import Modal from "../shared/Modal";
import DatePicker from "react-datepicker";
import { TbListDetails } from "react-icons/tb";
import { VscOpenPreview } from "react-icons/vsc";
import { FaRegEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const pad = (n) => String(n).padStart(2, "0");
const fmt = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function Home({ role }) {
  const [rows, setRows] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [isAdd, setIsAdd] = useState(false);
  const [range, setRange] = useState([null, null]);
  const [startDate, endDate] = range;

  // === Fetch Data Tanggal dari API ===
  useEffect(() => {
    async function fetchTanggal() {
      try {
        const res = await getTanggal();
        const data = res.data.map((t) => ({
          id: t.id,
          tgl: t.tanggal,
        }));
        setRows(data);
      } catch (err) {
        console.error("Gagal ambil data tanggal:", err.message);
      }
    }
    fetchTanggal();
  }, []);

  // === Filter Data berdasarkan range ===
  const filtered = useMemo(() => {
    if (!startDate || !endDate) return rows;
    const start = fmt(startDate);
    const end = fmt(endDate);
    return rows.filter((r) => r.tgl >= start && r.tgl <= end);
  }, [rows, startDate, endDate]);

  const allChecked = checked.size && checked.size === rows.length;
  const toggleAll = (flag) =>
    flag ? setChecked(new Set(rows.map((r) => r.id))) : setChecked(new Set());
  const toggleOne = (id) => {
    const s = new Set(checked);
    s.has(id) ? s.delete(id) : s.add(id);
    setChecked(s);
  };

  // === Tambah ===
  const handleAdd = () => {
    setIsAdd(true);
    setDetailRow({ tgl: fmt(new Date()) });
    setOpen(true);
  };

  const submitAdd = async () => {
    try {
      await createTanggal(detailRow.tgl);

      const res = await getTanggal();
      const data = res.data.map((t) => ({
        id: t.id,
        tgl: t.tanggal,
      }));
      setRows(data);
      setOpen(false);

      Swal.fire("Berhasil", "Tanggal berhasil ditambahkan", "success");
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    }
  };
  const submitUpdate = async () => {
    try {
      await updateTanggal(detailRow.tgl, detailRow.id);

      const res = await getTanggal();
      const data = res.data.map((t) => ({
        id: t.id,
        tgl: t.tanggal,
      }));
      setRows(data);
      setOpen(false);

      Swal.fire("Berhasil", "Tanggal berhasil diperbarui", "success");
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!checked.size) {
      Swal.fire("Peringatan", "Pilih data yang ingin dihapus", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data yang dihapus tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e11d48",
    });

    if (result.isConfirmed) {
      try {
        const ids = Array.from(checked);
        await deleteTanggal(ids);

        const res = await getTanggal();
        const data = res.data.map((t) => ({
          id: t.id,
          tgl: t.tanggal,
        }));
        setRows(data);
        setChecked(new Set());

        Swal.fire("Berhasil", "Data berhasil dihapus", "success");
      } catch (err) {
        Swal.fire("Gagal", err.message, "error");
      }
    }
  };

  // === Detail ===
  const openDetail = (row) => {
    setIsAdd(false);
    setDetailRow(row);
    setOpen(true);
  };

  // === Date Range ===
  function handleDateChange(update) {
    const [start, end] = update || [];
    setRange([start, end]);
  }

  const navigate = useNavigate();

  const PageDetail = (row) => {
    navigate(`/${role}/buat-surat/${row.id}`, { state: row });
  };

  const PageDetailAdmin = (row) => {
    navigate(`/${role}/lihat-surat/${row.tgl}`, { state: row });
  };

  const PreviewKelurahan = (row) => {
    window.location.href = `/previewkelurahan.html?id=${row.tgl}`;
    // navigate(`/${role}/lihat-surat/${row.tgl}`, { state: row });
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-4">
        {role === "koordinator"
          ? "Data Jumantik Berdasarkan Tanggal | Koordinator"
          : "Data Jumantik Berdasarkan Tanggal | Admin"}
      </h1>

      {/* === Filter & Tombol (kanan semua) === */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end mb-4">
        <div className="w-full sm:w-auto">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            isClearable={true}
            placeholderText="Pilih rentang tanggal"
            dateFormat="yyyy-MM-dd"
            className="rounded-xl border border-slate-300 px-3 py-2 w-full sm:w-[200px]"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleAdd}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
          >
            Tambah
          </button>
          <button
            onClick={handleDelete}
            disabled={!checked.size}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
          >
            Hapus
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
        <table className="min-w-full text-sm table-fixed">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left w-[40px]">
                <input
                  type="checkbox"
                  checked={!!allChecked}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="w-4 h-4 accent-sky-600"
                />
              </th>
              <th className="p-3 text-left w-[60px]">No</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-center w-[120px]">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} className="border-t hover:bg-slate-50">
                <td className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={checked.has(r.id)}
                    onChange={() => toggleOne(r.id)}
                    className="w-4 h-4 accent-sky-600"
                  />
                </td>
                <td className="p-3 text-left">{i + 1}</td>
                <td className="p-3 text-left">{r.tgl}</td>
                <td className="p-3 w-[120px]">
                  <div className="flex justify-end gap-2 w-full">
                    <button
                      title="Update"
                      onClick={() => openDetail(r)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-indigo-600 hover:bg-slate-50"
                    >
                      <FaRegEdit size={18} />
                    </button>

                    {role === "admin" && (
                      <button
                        title="Preview"
                        onClick={() => PreviewKelurahan(r)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sky-600 hover:bg-slate-50"
                      >
                        <VscOpenPreview size={18} />
                      </button>
                    )}

                    <button
                      title="Detail"
                      onClick={() =>
                        role === "admin" ? PageDetailAdmin(r) : PageDetail(r)
                      }
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-indigo-600 hover:bg-slate-50`}
                    >
                      <TbListDetails size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === Modal Tambah / Update === */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isAdd ? "Tambah Tanggal" : "Update Tanggal"}
      >
        {!!detailRow && (
          <div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={detailRow.tgl}
                onChange={(e) =>
                  setDetailRow({ ...detailRow, tgl: e.target.value })
                }
                className="mb-4 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={isAdd ? submitAdd : submitUpdate}
                className={`px-4 py-2 rounded-xl text-white transition ${
                  isAdd
                    ? "bg-sky-600 hover:bg-sky-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isAdd ? "Simpan" : "Update"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
