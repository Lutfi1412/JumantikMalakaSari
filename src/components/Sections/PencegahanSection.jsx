const PencegahanSection = () => {
  const threeMPoints = [
    {
      number: 1,
      title: 'Menguras',
      description:
        'Membersihkan dan menyikat tempat penampungan air (bak mandi, toren, drum, dll.) minimal seminggu sekali.',
    },
    {
      number: 2,
      title: 'Menutup',
      description:
        'Menutup rapat semua tempat penampungan air agar nyamuk tidak dapat bertelur.',
    },
    {
      number: 3,
      title: 'Memanfaatkan / Mengubur',
      description:
        'Mendaur ulang atau mengubur barang bekas yang berpotensi menampung air.',
    },
  ]

  const familyRoles = [
    'Menjadwalkan pemeriksaan jentik di rumah setiap minggu.',
    'Membentuk Jumantik Rumah (satu orang bertanggung jawab memantau).',
    'Mengikuti penyuluhan kesehatan dari Puskesmas atau sekolah.',
    'Melaporkan jika ada kasus DBD di lingkungan sekitar.',
  ]

  return (
    <section className="section" id="pencegahan">
      <div className="container">
        <div className="section-header">
          <h2>Cara Pencegahan & Penanggulangan</h2>
          <p>
            Pencegahan DBD dapat dilakukan dengan kebiasaan sederhana yang konsisten.
            Mulai dari diri sendiri dan keluarga.
          </p>
        </div>
        <div className="grid-2">
          <div className="card">
            <h3>Gerakan 3M Plus</h3>
            <ul className="list-number">
              {threeMPoints.map((point) => (
                <li key={point.number}>
                  <span>{point.number}</span>
                  <div>
                    <strong>{point.title}</strong>
                    <p>{point.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="plus-text">
              <strong>Plus:</strong> Menggunakan lotion anti nyamuk, memasang kelambu,
              menabur larvasida pada tempat yang sulit dikuras, dan menjaga kebersihan
              lingkungan.
            </p>
          </div>
          <div className="card card-soft">
            <h3>Peran Keluarga & Masyarakat</h3>
            <ul className="list-icon">
              {familyRoles.map((role, index) => (
                <li key={index}>
                  <span>✓</span> {role}
                </li>
              ))}
            </ul>
            <div className="alert">
              <strong>Segera ke fasilitas kesehatan</strong> jika mengalami demam tinggi
              mendadak, nyeri kepala, nyeri otot, mual, atau muncul bintik merah pada
              kulit.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PencegahanSection

