import { useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "../lib/device";
import { api } from "../lib/api";
import { getRT, createLaporan } from "../services/laporan";
import Header from "../components/Header";
import { compressImageToBase64 } from "../utils/image";

export default function LaporanPage() {
  const [alamat, setAlamat] = useState("");
  const [photo, setPhoto] = useState(null);
  const [rtCount, setRtCount] = useState(0);
  const [selectedRT, setSelectedRT] = useState("");
  const fileRef = useRef(null);
  const isProcessing = useRef(false);
  const [loading, setLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null); // ✅ Track akurasi GPS

  const mobile = useMemo(() => isMobile(), []);

  useEffect(() => {
    const fetchRT = async () => {
      try {
        const res = await getRT();
        setRtCount(res.rt || 0);
      } catch (err) {
        console.error("Gagal ambil data RT:", err);
      }
    };
    fetchRT();
  }, []);

  const onFile = (e) => {
    if (isProcessing.current) return;
    const f = e.target.files?.[0];
    if (!f) return;

    isProcessing.current = true;
    setPhoto(Object.assign(f, { preview: URL.createObjectURL(f) }));
    if (fileRef.current) fileRef.current.value = "";

    setTimeout(() => {
      isProcessing.current = false;
    }, 500);
  };

  const submit = async () => {
    if (!photo) return alert("Harap ambil foto terlebih dahulu.");
    if (!selectedRT) return alert("Harap pilih RT terlebih dahulu.");
    if (!alamat.trim()) return alert("Harap isi detail alamat.");

    try {
      setLoading(true);

      // ✅ Ambil lokasi langsung
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: false, timeout: 5000 }
        );
      });

      const base64Image = await compressImageToBase64(photo, 600, 0.5);

      // ✅ Kirim ke backend
      await createLaporan(
        Number(selectedRT),
        alamat,
        base64Image,
        String(position.latitude),
        String(position.longitude)
      );

      alert("✅ Laporan terkirim!");

      // ✅ Reset form
      if (photo?.preview) URL.revokeObjectURL(photo.preview);
      setAlamat("");
      setPhoto(null);
      setSelectedRT("");
      setGpsAccuracy(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error("Error submit:", err);
      alert("❌ Gagal mengirim laporan: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const openCamera = () => fileRef.current?.click();

  const retakePhoto = () => {
    if (photo?.preview) URL.revokeObjectURL(photo.preview);
    setPhoto(null);
    if (fileRef.current) {
      fileRef.current.value = "";
      setTimeout(() => fileRef.current?.click(), 100);
    }
  };

  if (!mobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Halaman Tidak Tersedia
        </h1>
        <p className="text-slate-600 max-w-sm">
          Fitur pelaporan ini hanya tersedia di perangkat <b>mobile</b>.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24 sm:pb-10">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFile}
      />

      {!photo && (
        <div
          className="fixed inset-0 bg-white flex flex-col"
          style={{ overscrollBehavior: "none" }}
        >
          <Header title={`Jumantik | Koordinator`} />
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={openCamera}
              className="bg-blue-600 text-white rounded-2xl px-8 py-4 text-lg font-semibold shadow-lg active:scale-95 transition-transform"
            >
              📸 Ambil Foto
            </button>
          </div>
        </div>
      )}

      {photo && (
        <div>
          <Header title={`Jumantik | Koordinator`} />
          <div className="px-5 space-y-5">
            <div className="relative">
              <img
                src={photo.preview}
                alt="preview"
                className="rounded-2xl w-full object-cover"
              />
              <button
                onClick={retakePhoto}
                className="absolute top-2 right-2 bg-white/90 text-slate-700 rounded-full px-3 py-1.5 text-sm shadow-lg font-medium active:scale-95 transition-transform"
              >
                🔄 Ulangi Foto
              </button>
            </div>

            <select
              value={selectedRT}
              onChange={(e) => setSelectedRT(e.target.value)}
              className="w-full rounded-2xl border-2 border-neutral-300 px-4 py-3 outline-none focus:border-blue-600 bg-white"
            >
              <option value="">Pilih RT</option>
              {Array.from({ length: rtCount }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  RT {num}
                </option>
              ))}
            </select>

            <textarea
              rows="4"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Detail Alamat"
              className="w-full rounded-2xl shadow-inner px-4 py-3 outline-none border-2 border-neutral-300 focus:border-blue-600"
            />

            {gpsAccuracy && (
              <div className="text-sm text-slate-600 text-center">
                📍 Akurasi GPS: {gpsAccuracy.toFixed(1)} meter
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className={`w-full bg-blue-600 text-white rounded-2xl py-3 font-semibold text-lg shadow-lg transition-transform active:scale-95 ${
                loading ? "opacity-60" : ""
              }`}
            >
              {loading ? "Mengirim..." : "✉️ Kirim Laporan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
