import { useState } from "react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Modal from "../components/Modal";
import { api } from "../lib/api";

export default function ProfilePage() {
  const nama = "Nazrul Islam"; // nanti ganti dengan data dari api.me()
  const [pwOpen, setPwOpen] = useState(false);
  const [rwOpen, setRwOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="pb-24 sm:pb-10">
      {/* Tombol kembali ke Beranda */}
      <Header backTo="/" title="Profile" />

      <div className="px-5 space-y-4">
        <div className="rounded-2xl bg-neutral-100 p-5">
          <div className="text-2xl font-semibold">{nama}</div>
        </div>

        <button
          onClick={() => setPwOpen(true)}
          className="w-full text-left rounded-2xl shadow px-4 py-3"
        >
          Ganti Password
        </button>

        <button
          onClick={() => setRwOpen(true)}
          className="w-full text-left rounded-2xl shadow px-4 py-3"
        >
          RT/RW
        </button>

        <button
          onClick={() => setAboutOpen(true)}
          className="w-full text-left rounded-2xl shadow px-4 py-3"
        >
          Tentang
        </button>

        <button
          onClick={() => {
            api.logout();
            window.location.replace("/home");
          }}
          className="w-full rounded-2xl bg-red-500 text-white py-3"
        >
          Logout
        </button>
      </div>

      <BottomNav />

      {/* Modal: Ganti Password */}
      <Modal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title="Ganti password"
      >
        <PwForm />
      </Modal>

      {/* Modal: RT/RW */}
      <Modal open={rwOpen} onClose={() => setRwOpen(false)} title="RT/RW">
        <div className="space-y-3">
          <input
            placeholder="RT"
            className="w-full rounded-2xl shadow-inner px-4 py-3 outline-none"
          />
          <input
            placeholder="RW"
            className="w-full rounded-2xl shadow-inner px-4 py-3 outline-none"
          />
          <button className="w-full bg-blue-600 text-white rounded-2xl py-3">
            Simpan
          </button>
        </div>
      </Modal>

      {/* Modal: Tentang */}
      <Modal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        title="Tentang"
      >
        <p className="text-neutral-700">
          Aplikasi Jumantik Digital untuk pelaporan potensi sarang nyamuk oleh
          warga. Versi 1.0.
        </p>
      </Modal>
    </div>
  );
}

function PwForm() {
  const [show, setShow] = useState({ old: false, neu: false, conf: false });
  return (
    <div className="space-y-3">
      <PwInput
        label="Password Lama"
        show={show.old}
        onToggle={() => setShow((s) => ({ ...s, old: !s.old }))}
      />
      <PwInput
        label="Password Baru"
        show={show.neu}
        onToggle={() => setShow((s) => ({ ...s, neu: !s.neu }))}
      />
      <PwInput
        label="Konfirmasi Password"
        show={show.conf}
        onToggle={() => setShow((s) => ({ ...s, conf: !s.conf }))}
      />
      <button className="w-full bg-blue-600 text-white rounded-2xl py-3">
        Konfirmasi
      </button>
    </div>
  );
}

function PwInput({ label, show, onToggle }) {
  return (
    <div>
      <div className="mb-1 text-neutral-800">{label}</div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder="Enter your password"
          className="w-full rounded-2xl shadow-inner px-4 py-3 pr-10 outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}
