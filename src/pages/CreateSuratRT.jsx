import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Header from "../components/Header";
import { useParams, useLocation } from "react-router-dom";
import {
  getSuratRW,
  createSurat,
  deleteSurat,
  updateSurat,
} from "../services/surat";
import { getRT } from "../services/laporan";
import Swal from "sweetalert2";
import SummaryCards from "../components/Card";

export default function CreateSuratRT() {
  const [rows, setRows] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [allChecked, setAllChecked] = useState(false);
  const [search, setSearch] = useState("");
  const [rtOptions, setRtOptions] = useState([]);

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [total, setTotal] = useState(null);
  const { id } = useParams(); // ambil dari /:id
  const location = useLocation();
  const tanggal = location.state;
  const [detailRow, setDetailRow] = useState({
    rt: "",
    jumlah: {
      jumantik: "",
      melapor: "",
    },
    jenis_tatanan: {
      rumah_tangga: { dikunjungi: "", positif: "" },
      perkantoran: { dikunjungi: "", positif: "" },
      inst_pendidikan: { dikunjungi: "", positif: "" },
      ttu: { dikunjungi: "", positif: "" },
      fas_olahraga: { dikunjungi: "", positif: "" },
      tpm: { dikunjungi: "", positif: "" },
      fas_kesehatan: { dikunjungi: "", positif: "" },
    },
  });

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
    fetchRTOptions();
  }, [id]);

  // Fetch data surat (demo)
  const fetchData = async (tanggal_id) => {
    try {
      const res = await getSuratRW(Number(tanggal_id)); // pastikan integer
      console.log("DATA API:", res);

      // Backend balikin data: { data: [...], rw: 4, tanggal: "...", total: {...} }
      setRows(res.data || []);
      setTotal(res.total || null); // <-- simpan total buat SummaryCards
    } catch (err) {
      console.error("Gagal ambil data surat:", err.message);
    }
  };

  async function fetchRTOptions() {
    try {
      const res = await getRT(); // hasilnya misal { rt: 3 }
      const jumlahRT = res.rt ?? 0;
      const options = Array.from({ length: jumlahRT }, (_, i) => ({
        rt: i + 1,
      }));
      setRtOptions(options);
    } catch (err) {
      console.error("Gagal memuat RT:", err.message);
    }
  }

  // Toggle checkbox
  const toggleAll = (checkedAll) => {
    setAllChecked(checkedAll);
    if (checkedAll) {
      setChecked(new Set(rows.map((r) => r.id)));
    } else {
      setChecked(new Set());
    }
  };

  const toggleCheck = (id) => {
    const newSet = new Set(checked);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setChecked(newSet);
  };

  // Open modal
  const openAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setDetailRow({
      rt: "",
      jumlah: { jumantik: 0, melapor: 0 },
      jenis_tatanan: {
        rumah_tangga: { dikunjungi: 0, positif: 0 },
        perkantoran: { dikunjungi: 0, positif: 0 },
        inst_pendidikan: { dikunjungi: 0, positif: 0 },
        ttu: { dikunjungi: 0, positif: 0 },
        fas_olahraga: { dikunjungi: 0, positif: 0 },
        tpm: { dikunjungi: 0, positif: 0 },
        fas_kesehatan: { dikunjungi: 0, positif: 0 },
      },
    });
    setOpen(true);
  };

  const openEdit = (r) => {
    setIsEdit(true);
    setEditId(r.id);
    setDetailRow({
      rt: r.rt,
      jumlah: {
        jumantik: r.jumantik,
        melapor: r.melapor,
      },
      jenis_tatanan: { ...r.jenis_tatanan },
    });
    setOpen(true);
  };

  // Handle tambah
  const handleAdd = async () => {
    const result = await Swal.fire({
      title: "Yakin tambah data?",
      text: "Pastikan semua data sudah diisi dengan benar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, tambah",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      // Konversi semua field kosong jadi 0
      const cleanData = {
        tanggal_id: Number(id), // ambil dari useParams
        rt: Number(detailRow.rt) || 0,
        jumlah: {
          jumantik: Number(detailRow.jumlah?.jumantik) || 0,
          melapor: Number(detailRow.jumlah?.melapor) || 0,
        },
        jenis_tatanan: Object.fromEntries(
          Object.entries(detailRow.jenis_tatanan || {}).map(([key, val]) => [
            key,
            {
              dikunjungi: Number(val.dikunjungi) || 0,
              positif: Number(val.positif) || 0,
            },
          ])
        ),
      };

      await createSurat(cleanData);

      Swal.fire({
        title: "Berhasil!",
        text: "Data surat berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchData(id);
      setOpen(false); // tutup modal
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Handle update
  const handleUpdate = async () => {
    const result = await Swal.fire({
      title: "Yakin update data?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, update",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      await updateSurat(editId, detailRow);
      Swal.fire("Berhasil", "Data berhasil diperbarui", "success");
      fetchData(id);
      setOpen(false);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!checked.size)
      return Swal.fire("Info", "Pilih data yang ingin dihapus", "info");

    const result = await Swal.fire({
      title: `Hapus ${checked.size} data terpilih?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      const ids = Array.from(checked); // ambil ID dari Set()
      await deleteSurat(ids);
      Swal.fire("Berhasil", "Data berhasil dihapus", "success");
      fetchData(id);
      setChecked(new Set());
      setAllChecked(false);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Filter search
  const filteredRows = rows.filter((r) =>
    r.rt.toString().includes(search.trim())
  );

  // Update nested state
  const updateJenisTatanan = (key, field, value) => {
    setDetailRow((prev) => ({
      ...prev,
      jenis_tatanan: {
        ...prev.jenis_tatanan,
        [key]: {
          ...prev.jenis_tatanan[key],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div>
      <Header />

      <div className="p-6 max-w-[1600px] mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">
          Data Jumantik Setiap RT
        </h1>

        <div className="space-y-6">
          {total && <SummaryCards total={total} />}

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Cari berdasarkan RT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex gap-2">
              <button
                onClick={openAdd}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 flex items-center gap-2 transition"
              >
                <FaPlus /> Tambah
              </button>
              <button
                onClick={handleDelete}
                disabled={!checked.size}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
              >
                <FaTrash /> Hapus
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              <table
                className="w-full text-xs border-collapse"
                style={{ minWidth: "1400px" }}
              >
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th
                      rowSpan={3}
                      className="p-2 border border-slate-300 w-[40px]"
                    >
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="w-4 h-4 accent-sky-600 cursor-pointer"
                      />
                    </th>
                    <th
                      rowSpan={3}
                      className="p-2 border border-slate-300 w-[60px]"
                    >
                      RT
                    </th>
                    <th colSpan={2} className="p-2 border border-slate-300">
                      Jumlah
                    </th>
                    <th colSpan={14} className="p-2 border border-slate-300">
                      Jenis Tatanan
                    </th>
                    <th rowSpan={3} className="p-2 border border-slate-300">
                      Total Bangunan
                    </th>
                    <th rowSpan={3} className="p-2 border border-slate-300">
                      Total Jentik
                    </th>
                    <th rowSpan={3} className="p-2 border border-slate-300">
                      ABJ
                    </th>
                    <th
                      rowSpan={3}
                      className="p-2 border border-slate-300 w-[80px]"
                    >
                      Aksi
                    </th>
                  </tr>
                  <tr>
                    <th rowSpan={2} className="p-2 border border-slate-300">
                      Jumantik
                    </th>
                    <th rowSpan={2} className="p-2 border border-slate-300">
                      Melapor
                    </th>

                    <th
                      colSpan={2}
                      className="p-2 border border-slate-300 bg-blue-50"
                    >
                      Rumah Tangga
                    </th>
                    <th
                      colSpan={2}
                      className="p-2 border border-slate-300 bg-green-50"
                    >
                      Perkantoran
                    </th>
                    <th
                      colSpan={2}
                      className="p-2 border border-slate-300 bg-yellow-50"
                    >
                      Inst. Pendidikan
                    </th>
                    <th
                      colSpan={2}
                      className="p-2 border border-slate-300 bg-red-50"
                    >
                      TTU
                    </th>
                    <th
                      colSpan={2}
                      className="p-2 border border-slate-300 bg-purple-50"
                    >
                      Fas Olah Raga
                    </th>
                    <th
                      colSpan={2}
                      className="p-2 border border-slate-300 bg-pink-50"
                    >
                      TPM
                    </th>
                    <th
                      colSpan={2}
                      className="p-2 border border-slate-300 bg-indigo-50"
                    >
                      Fas Kesehatan
                    </th>
                  </tr>
                  <tr className="text-[10px]">
                    {/* <th className="p-1 border border-slate-300"></th>
                <th className="p-1 border border-slate-300"></th>
                <th className="p-1 border border-slate-300"></th>
                <th className="p-1 border border-slate-300"></th> */}

                    <th className="p-1 border border-slate-300 bg-blue-50">
                      Dikunjungi
                    </th>
                    <th className="p-1 border border-slate-300 bg-blue-50">
                      (+)
                    </th>
                    <th className="p-1 border border-slate-300 bg-green-50">
                      Dikunjungi
                    </th>
                    <th className="p-1 border border-slate-300 bg-green-50">
                      (+)
                    </th>
                    <th className="p-1 border border-slate-300 bg-yellow-50">
                      Dikunjungi
                    </th>
                    <th className="p-1 border border-slate-300 bg-yellow-50">
                      (+)
                    </th>
                    <th className="p-1 border border-slate-300 bg-red-50">
                      Dikunjungi
                    </th>
                    <th className="p-1 border border-slate-300 bg-red-50">
                      (+)
                    </th>
                    <th className="p-1 border border-slate-300 bg-purple-50">
                      Dikunjungi
                    </th>
                    <th className="p-1 border border-slate-300 bg-purple-50">
                      (+)
                    </th>
                    <th className="p-1 border border-slate-300 bg-pink-50">
                      Dikunjungi
                    </th>
                    <th className="p-1 border border-slate-300 bg-pink-50">
                      (+)
                    </th>
                    <th className="p-1 border border-slate-300 bg-indigo-50">
                      Dikunjungi
                    </th>
                    <th className="p-1 border border-slate-300 bg-indigo-50">
                      (+)
                    </th>

                    {/* <th className="p-1 border border-slate-300"></th>
                <th className="p-1 border border-slate-300"></th>
                <th className="p-1 border border-slate-300"></th>
                <th className="p-1 border border-slate-300"></th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="p-2 border border-slate-300 text-center">
                        <input
                          type="checkbox"
                          checked={checked.has(r.id)}
                          onChange={() => toggleCheck(r.id)}
                          className="w-4 h-4 accent-sky-600 cursor-pointer"
                        />
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-medium">
                        {r.rt}
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        {r.jumantik}
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        {r.melapor}
                      </td>

                      <td className="p-2 border border-slate-300 text-center bg-blue-50">
                        {r.jenis_tatanan.rumah_tangga.dikunjungi}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-blue-50">
                        {r.jenis_tatanan.rumah_tangga.positif}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-green-50">
                        {r.jenis_tatanan.perkantoran.dikunjungi}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-green-50">
                        {r.jenis_tatanan.perkantoran.positif}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-yellow-50">
                        {r.jenis_tatanan.inst_pendidikan.dikunjungi}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-yellow-50">
                        {r.jenis_tatanan.inst_pendidikan.positif}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-red-50">
                        {r.jenis_tatanan.ttu.dikunjungi}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-red-50">
                        {r.jenis_tatanan.ttu.positif}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-purple-50">
                        {r.jenis_tatanan.fas_olahraga.dikunjungi}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-purple-50">
                        {r.jenis_tatanan.fas_olahraga.positif}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-pink-50">
                        {r.jenis_tatanan.tpm.dikunjungi}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-pink-50">
                        {r.jenis_tatanan.tpm.positif}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-indigo-50">
                        {r.jenis_tatanan.fas_kesehatan.dikunjungi}
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-indigo-50">
                        {r.jenis_tatanan.fas_kesehatan.positif}
                      </td>

                      <td className="p-2 border border-slate-300 text-center font-medium">
                        {r.total_bangunan}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-medium">
                        {r.total_jentik}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-medium text-green-600">
                        {r.abj}
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        <button
                          title="Edit"
                          onClick={() => openEdit(r)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <FaEdit size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredRows.length && (
                    <tr>
                      <td
                        colSpan={22}
                        className="p-8 text-center text-slate-500"
                      >
                        Tidak ada data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-center text-xs text-slate-500 sm:hidden">
              ← Geser ke kanan untuk melihat lebih banyak →
            </div>
          </div>
        </div>

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {isEdit ? "Update Surat RT" : "Tambah Surat RT"}
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* RT Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    RT <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={detailRow.rt || ""}
                    onChange={(e) =>
                      setDetailRow({ ...detailRow, rt: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Pilih RT</option>
                    {rtOptions.map((r, i) => (
                      <option key={i} value={r.rt}>
                        RT {r.rt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jumlah Section */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 pb-2 border-b">
                    Jumlah
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Jumantik
                      </label>
                      <input
                        type="number"
                        value={detailRow.jumlah.jumantik || ""}
                        onChange={(e) =>
                          setDetailRow({
                            ...detailRow,
                            jumlah: {
                              ...detailRow.jumlah,
                              jumantik: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Jumantik Melapor
                      </label>
                      <input
                        type="number"
                        value={detailRow.jumlah.melapor || ""}
                        onChange={(e) =>
                          setDetailRow({
                            ...detailRow,
                            jumlah: {
                              ...detailRow.jumlah,
                              melapor: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Jenis Tatanan Section */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 pb-2 border-b">
                    Jenis Tatanan
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: "rumah_tangga", label: "Rumah Tangga" },
                      { key: "perkantoran", label: "Perkantoran" },
                      { key: "inst_pendidikan", label: "Institusi Pendidikan" },
                      { key: "ttu", label: "TTU" },
                      { key: "fas_olahraga", label: "Fasilitas Olahraga" },
                      { key: "tpm", label: "TPM" },
                      { key: "fas_kesehatan", label: "Fasilitas Kesehatan" },
                    ].map(({ key, label }) => (
                      <div key={key} className="bg-slate-50 p-4 rounded-xl">
                        <div className="font-medium text-slate-700 mb-3">
                          {label}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">
                              Dikunjungi
                            </label>
                            <input
                              type="number"
                              value={
                                detailRow.jenis_tatanan[key].dikunjungi || ""
                              }
                              onChange={(e) =>
                                updateJenisTatanan(
                                  key,
                                  "dikunjungi",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">
                              Positif (+)
                            </label>
                            <input
                              type="number"
                              value={detailRow.jenis_tatanan[key].positif || ""}
                              onChange={(e) =>
                                updateJenisTatanan(
                                  key,
                                  "positif",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  onClick={isEdit ? handleUpdate : handleAdd}
                  className={`px-5 py-2.5 rounded-xl text-white transition ${
                    isEdit
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  {isEdit ? "Update" : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
