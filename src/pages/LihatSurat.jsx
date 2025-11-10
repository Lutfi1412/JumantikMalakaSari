import { useEffect, useState } from "react";
import { getRW } from "../services/tanggal";
import { TbListDetails } from "react-icons/tb";
import { VscOpenPreview } from "react-icons/vsc";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../components/Header";

export default function LihatSurat({ role }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const { tgl } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // === Ambil Data RW Berdasarkan Tanggal ===
  useEffect(() => {
    async function fetchRW() {
      try {
        const res = await getRW(tgl);
        const data = res.data.map((t) => ({
          id: t.id,
          rw: t.rw,
        }));
        setRows(data);
      } catch (err) {
        console.error("Gagal ambil data RW:", err.message);
      }
    }

    if (tgl) fetchRW();
  }, [tgl]);

  // === Filter RW berdasarkan pencarian ===
  const filtered = rows.filter((r) => r.rw.toString().includes(search.trim()));

  // === Navigasi ke detail surat ===
  const Preview = (row) => {
    window.location.href = `/preview.html?id=${row.id}`;
  };

  return (
    <div>
      <Header />
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-semibold mb-4">
          Data Jumantik Setiap RW Tanggal | {location.state?.tgl || tgl}
        </h1>

        {/* === Filter Pencarian === */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end mb-4">
          <input
            type="text"
            placeholder="Cari berdasarkan RW..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* === Tabel Data === */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-left w-[60px]">No</th>
                <th className="p-3 text-left">RW</th>
                <th className="p-3 text-center w-[100px]">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{r.rw}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center">
                      <button
                        title="Preview"
                        onClick={() => Preview(r)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sky-600 hover:bg-slate-50 transition"
                      >
                        <VscOpenPreview size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-500">
                    Tidak ada data RW
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
