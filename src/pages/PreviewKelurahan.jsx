import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getSuratAdmin } from "../services/surat";
import { checkToken } from "../services/user";
import { Navigate } from "react-router-dom"; // sesuaikan path-nya

export default function PreviewKelurahan() {
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const query = new URLSearchParams(window.location.search);
        const idParam = query.get("id");

        const token = localStorage.getItem("token");
        if (!token) {
          setRole(null);
          setError("Tidak ada token");
          return;
        }

        // ✅ Cek token & role dulu
        const res = await checkToken(token);
        setRole(res.message);

        // ✅ Setelah role valid, baru ambil data laporan
        const laporanRes = await getSuratAdmin(idParam);
        setLaporan(laporanRes);
      } catch (err) {
        console.error("Gagal memuat data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ✅ Kondisi loading & error lebih teratur
  if (loading) return <div>Loading data...</div>;

  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (!role) return <Navigate to="/login" replace />;

  if (role !== "admin") return <Navigate to="/404" replace />;

  if (!laporan) return <div>Gagal memuat data</div>;

  const handleDownload = async () => {
    const element = document.getElementById("formPSN");
    const canvas = await html2canvas(element, {
      scale: 2,
      windowWidth: 297 * 2,
      windowHeight: 210 * 2,
      backgroundColor: "#fff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      297,
      (297 * canvas.height) / canvas.width
    );
    pdf.save("Surat_Pengajuan.pdf");
  };

  const tdBase = {
    border: "1px solid black",
    padding: "1px",
    textAlign: "center",
    height: "15px",
    fontSize: "7pt",
  };

  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "12px",
          }}
        >
          Preview Form PSN (A4 Landscape)
        </h3>

        <button
          onClick={handleDownload}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#16a34a",
            color: "white",
            padding: "10px 18px",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            border: "none",
            zIndex: 9999,
          }}
        >
          Download PDF (Print)
        </button>

        {/* Isi utama laporan */}
        <div
          id="formPSN"
          style={{
            width: "297mm",
            minHeight: "210mm",
            background: "#fff",
            paddingTop: "3mm",
            paddingBottom: "15mm",
            paddingLeft: "15mm",
            paddingRight: "15mm",
            boxShadow: "0 0 5px rgba(0,0,0,0.3)",
            color: "#000",
            fontSize: "10pt",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Header */}
          <h2
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "12pt",
            }}
          >
            FORMULIR LAPORAN KORWIL DALAM GERAKAN PEMBERANTASAN SARANG NYAMUK
            (PSN)
          </h2>

          {/* Info section */}
          <div style={{ fontSize: "10pt" }}>
            <table style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ paddingRight: "20px", whiteSpace: "nowrap" }}>
                    Hari/ Tanggal
                  </td>
                  <td style={{ paddingRight: "6px" }}>:</td>
                  <td>
                    {new Date(laporan.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingRight: "6px", whiteSpace: "nowrap" }}>
                    Kelurahan
                  </td>
                  <td style={{ paddingRight: "6px" }}>:</td>
                  <td>Malaka Sari</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: "6px", whiteSpace: "nowrap" }}>
                    Kecamatan
                  </td>
                  <td style={{ paddingRight: "6px" }}>:</td>
                  <td>Duren Sawit</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Main Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "7pt",
              border: "1px solid black",
              marginTop: "5mm",
            }}
          >
            <thead>
              <tr>
                <th rowSpan="3" style={tdBase}>
                  RW
                </th>
                <th colSpan="2" style={tdBase}>
                  Jumlah
                </th>
                <th colSpan="14" style={tdBase}>
                  Jenis Tatanan
                </th>
                <th rowSpan="3" style={tdBase}>
                  Total Bangunan
                </th>
                <th rowSpan="3" style={tdBase}>
                  Total Jentik
                </th>
                <th rowSpan="3" style={tdBase}>
                  ABJ
                </th>
              </tr>
              <tr>
                <th rowSpan="2" style={tdBase}>
                  Jumantik
                </th>
                <th rowSpan="2" style={tdBase}>
                  Jumantik Melapor
                </th>
                {[
                  "Rumah Tangga",
                  "Perkantoran",
                  "Inst. Pendidikan",
                  "TTU",
                  "Fas Olah Raga",
                  "TPM",
                  "Fas Kesehatan",
                ].map((title, i) => (
                  <th key={i} colSpan="2" style={tdBase}>
                    {title}
                  </th>
                ))}
              </tr>
              <tr>
                {[...Array(14)].map((_, i) => (
                  <th key={i} style={tdBase}>
                    {i % 2 === 0 ? "Dikunjungi" : "(+)"}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {laporan.data.map((row, i) => (
                <tr key={i}>
                  <td style={tdBase}>{row.rw}</td>
                  <td style={tdBase}>{row.jumantik}</td>
                  <td style={tdBase}>{row.melapor}</td>

                  {Object.values(row.jenis_tatanan).map((jenis, j) => (
                    <React.Fragment key={`jenis-${i}-${j}`}>
                      <td style={tdBase}>{jenis.dikunjungi}</td>
                      <td style={tdBase}>{jenis.positif}</td>
                    </React.Fragment>
                  ))}

                  <td style={tdBase}>{row.total_bangunan}</td>
                  <td style={tdBase}>{row.total_jentik}</td>
                  <td style={tdBase}>{row.abj}</td>
                </tr>
              ))}

              {Array.from({
                length: Math.max(0, 18 - laporan.data.length),
              }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  {Array.from({ length: 20 }).map((_, j) => (
                    <td key={`empty-${i}-${j}`} style={tdBase}></td>
                  ))}
                </tr>
              ))}

              {/* Total Row */}
              <tr>
                <td style={{ ...tdBase, fontWeight: "bold" }}>Total</td>
                <td style={tdBase}>{laporan.total.jumantik}</td>
                <td style={tdBase}>{laporan.total.melapor}</td>

                {Object.values(laporan.total.jenis_tatanan).map((jenis, j) => (
                  <React.Fragment key={`total-jenis-${j}`}>
                    <td style={tdBase}>{jenis.dikunjungi}</td>
                    <td style={tdBase}>{jenis.positif}</td>
                  </React.Fragment>
                ))}

                <td style={tdBase}>{laporan.total.total_bangunan}</td>
                <td style={tdBase}>{laporan.total.total_jentik}</td>
                <td style={tdBase}>{laporan.total.abj}</td>
              </tr>
            </tbody>
          </table>

          {/* Catatan dan tanda tangan tetap sama */}
          <div style={{ fontSize: "9pt", marginTop: "5mm" }}>
            <p>
              <span style={{ fontWeight: "bold" }}>Catatan :</span>
            </p>
            <p>
              Angka Bebas Jentik (ABJ) ={" "}
              <span>
                <div style={{ display: "inline-block", textAlign: "center" }}>
                  <div
                    style={{
                      borderBottom: "1px solid black",
                      paddingBottom: "2px",
                      minWidth: "250px",
                    }}
                  >
                    Jumlah bangunan yang diperiksa tidak ada jentik
                  </div>
                  <div>Jumlah seluruh bangunan yang diperiksa</div>
                </div>{" "}
                x100%
              </span>
            </p>
            <p>ABJ yang diharapkan adalah &gt; 95 %</p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10pt",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <p>Mengetahui</p>
              <p>Plh. LURAH KELURAHAN MALAKA SARI,</p>
              <img
                src="/image/ttd.png"
                alt="Tanda Tangan"
                style={{ height: "20mm", objectFit: "contain" }}
              />
              <div style={{ lineHeight: "1", marginTop: "-2px" }}>
                <p style={{ margin: 0 }}>RASIKIN, S.IP, M.SI</p>
                <p style={{ margin: 2 }}>196904101996031004</p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <p>
                Jakarta,{" "}
                {new Date(laporan.tanggal).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p>KASI KESRA KEL. MALAKA SARI</p>
              <img
                src="/image/ttd.png"
                alt="Tanda Tangan"
                style={{ height: "20mm", objectFit: "contain" }}
              />
              <div style={{ lineHeight: "1", marginTop: "-2px" }}>
                <p style={{ margin: 0 }}>NINING SETIANINGSIH, SH</p>
                <p style={{ margin: 2 }}>NIP 196809171997032005</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
