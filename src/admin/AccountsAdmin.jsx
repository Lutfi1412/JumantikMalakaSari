// src/admin/AccountsAdmin.jsx
import { useMemo, useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Modal from "../shared/Modal";
import { createUser, getUser, updateUser, deleteUser } from "../services/user";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const ROLES = ["All role", "admin", "koordinator", "petugas"];

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-3 sm:px-4 py-2 sm:py-3 text-left text-sm font-semibold text-slate-600 ${className}`}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`px-3 sm:px-4 py-3 align-middle ${className}`}>
      {children}
    </td>
  );
}

export default function AccountsAdmin() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All role");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUser();
        setRows(res.data.table_user);
      } catch (err) {
        console.error(err);
        alert(err.message || "Gagal mengambil data user");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((r) => {
      const okRole = role === "All role" ? true : r.role === role;

      // cek kalau query kosong langsung true
      if (!q) return okRole;

      // gabungkan semua field jadi satu string searchable
      const combined = `${r.nama ?? ""} ${r.rw ?? ""} ${
        r.role ?? ""
      }`.toLowerCase();

      const okSearch = combined.includes(q);

      return okRole && okSearch;
    });
  }, [rows, query, role]);

  function openAdd() {
    setEditing({
      name: "",
      username: "",
      password: "",
      role: "admin",
      rt: "",
      rw: "",
      _isNew: true,
    });
    setOpen(true);
  }

  function openEdit(row) {
    // hanya username & password_new yang di-edit
    setEditing({
      id: row.id,
      username: row.username,
      password_new: "",
      _isNew: false,
    });
    setOpen(true);
  }

  // ================= SAVE FUNCTION =================
  async function save() {
    try {
      if (editing._isNew) {
        // === ADD USER ===
        if (!editing.name || !editing.username || !editing.password)
          return MySwal.fire("Oops...", "Semua field wajib diisi!", "warning");

        const nama = editing.name.trim();
        const username = editing.username.trim();
        const password = editing.password.trim();
        const role = editing.role;
        let rt = 0,
          rw = 0;
        let nama_rw = "";

        if (role === "koordinator" || role === "petugas") {
          if (!editing.rt || !editing.rw)
            return MySwal.fire("Oops...", "RT dan RW harus diisi!", "warning");
          rt = parseInt(editing.rt);
          rw = parseInt(editing.rw);
        }

        if (role === "koordinator") {
          if (!editing.nama_rw)
            return MySwal.fire("Oops...", "Nama RW harus diisi!", "warning");
          nama_rw = editing.nama_rw.trim();
        }

        await createUser(nama, username, password, role, rt, rw, nama_rw);
        MySwal.fire("Berhasil!", "User berhasil ditambahkan!", "success");
      } else {
        // === UPDATE USER ===
        if (!editing.username || !editing.password_new)
          return MySwal.fire(
            "Oops...",
            "Username dan password wajib diisi!",
            "warning"
          );

        await updateUser(editing.username, editing.password_new, editing.id);
        MySwal.fire("Berhasil!", "User berhasil diupdate!", "success");
      }

      setOpen(false);
      setEditing(null);

      // refresh data
      const res = await getUser();
      setRows(res.data.table_user);
    } catch (err) {
      console.error(err);
      MySwal.fire("Gagal", err.message || "Terjadi kesalahan", "error");
    }
  }

  // ================= DELETE FUNCTION =================
  async function handleDelete(row) {
    MySwal.fire({
      title: `Hapus ${row.nama}?`,
      text: "Data yang dihapus tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUser(row.id);
          MySwal.fire("Berhasil!", "User berhasil dihapus!", "success");

          // refresh data
          const res = await getUser();
          setRows(res.data.table_user);
        } catch (err) {
          console.error(err);
          MySwal.fire("Gagal", err.message || "Gagal menghapus user", "error");
        }
      }
    });
  }

  return (
    <section className="max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 min-w-[160px] rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="Cari Nama atau RW"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-[150px] rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <button
              onClick={openAdd}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-sm font-medium shadow-sm"
            >
              <FaPlus /> Add user
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 sm:px-6 pb-8 pt-2">
        <div className="rounded-2xl bg-white shadow-sm p-2 sm:p-4">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <Th className="w-16 sm:w-20">No</Th>
                    <Th>Nama</Th>
                    <Th>Nama RW</Th>
                    <Th className="w-20 sm:w-28">RT</Th>
                    <Th className="w-20 sm:w-28">RW</Th>
                    <Th className="w-32 sm:w-40">Role</Th>
                    <Th className="text-center w-24">Action</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.length > 0 ? (
                    filtered.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <Td className="text-slate-500 whitespace-nowrap">
                          {i + 1}
                        </Td>
                        <Td className="font-medium min-w-[180px]">
                          {r.nama ?? "-"}
                        </Td>
                        <Td className="font-medium min-w-[180px]">
                          {r.nama_rw && r.nama_rw.trim() !== ""
                            ? r.nama_rw
                            : "-"}
                        </Td>
                        <Td className="whitespace-nowrap">
                          {r.rt && r.rt !== 0 ? r.rt : "-"}
                        </Td>
                        <Td className="whitespace-nowrap">
                          {r.rw && r.rw !== 0 ? r.rw : "-"}
                        </Td>

                        <Td>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm ${
                              r.role.toLowerCase() === "admin"
                                ? "bg-sky-50 text-sky-700"
                                : r.role.toLowerCase() === "petugas"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {r.role}
                          </span>
                        </Td>
                        <Td className="text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              title="Edit"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 text-sky-600 hover:bg-sky-50"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(r)}
                              title="Delete"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 text-red-600 hover:bg-red-50"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <Td className="text-center text-slate-400" colSpan={6}>
                        Tidak ada data
                      </Td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing?._isNew ? "Add User" : "Update User"}
      >
        {!!editing && (
          <div className="space-y-4">
            {editing._isNew ? (
              <>
                {/* Tambah user form lama */}
                <div>
                  <label className="block text-sm mb-1">Nama</label>
                  <input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Masukan nama…"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Role</label>
                  <select
                    value={editing.role}
                    onChange={(e) =>
                      setEditing({ ...editing, role: e.target.value })
                    }
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option>admin</option>
                    <option>koordinator</option>
                    <option>petugas</option>
                  </select>
                </div>

                {/* ✅ Tambahan khusus untuk role koordinator */}
                {editing.role === "koordinator" && (
                  <div>
                    <label className="block text-sm mb-1">Nama RW</label>
                    <input
                      value={editing.nama_rw || ""}
                      onChange={(e) =>
                        setEditing({ ...editing, nama_rw: e.target.value })
                      }
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Masukan nama RW…"
                    />
                  </div>
                )}

                {(editing.role === "koordinator" ||
                  editing.role === "petugas") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">RT</label>
                      <input
                        type="number"
                        value={editing.rt}
                        onChange={(e) =>
                          setEditing({ ...editing, rt: e.target.value })
                        }
                        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Masukan RT…"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">RW</label>
                      <input
                        type="number"
                        value={editing.rw}
                        onChange={(e) =>
                          setEditing({ ...editing, rw: e.target.value })
                        }
                        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Masukan RW…"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Username</label>
                    <input
                      value={editing.username}
                      onChange={(e) =>
                        setEditing({ ...editing, username: e.target.value })
                      }
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Masukan username…"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input
                      type="password"
                      value={editing.password}
                      onChange={(e) =>
                        setEditing({ ...editing, password: e.target.value })
                      }
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Masukan password…"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Edit hanya username & password */}
                <div>
                  <label className="block text-sm mb-1">Username</label>
                  <input
                    value={editing.username}
                    onChange={(e) =>
                      setEditing({ ...editing, username: e.target.value })
                    }
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Masukan username baru…"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Password Baru</label>
                  <input
                    type="password"
                    value={editing.password_new}
                    onChange={(e) =>
                      setEditing({ ...editing, password_new: e.target.value })
                    }
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Masukan password baru…"
                  />
                </div>
              </>
            )}

            {/* Tombol */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Batal
              </button>
              <button
                onClick={save}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white"
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
