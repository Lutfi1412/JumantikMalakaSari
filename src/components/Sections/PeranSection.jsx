const PeranSection = () => {
  const activities = [
    {
      title: 'Kunjungan Rumah',
      description:
        'Memeriksa bak mandi, talang air, vas bunga, dispenser, dan tempat penampungan air lainnya untuk memastikan bebas jentik.',
    },
    {
      title: 'Edukasi Warga',
      description:
        'Menjelaskan cara 3M Plus, mengingatkan jadwal pembersihan, dan memberikan contoh nyata praktik hidup bersih dan sehat.',
    },
    {
      title: 'Pencatatan & Pelaporan',
      description:
        'Mencatat hasil pemeriksaan jentik dan melaporkannya kepada petugas Puskesmas untuk pemantauan wilayah.',
    },
    {
      title: 'Koordinasi Kegiatan',
      description:
        'Bekerja sama dengan RT/RW, sekolah, dan tokoh masyarakat untuk mengadakan kerja bakti dan kampanye anti DBD.',
    },
  ]

  return (
    <section className="section alt" id="peran">
      <div className="container">
        <div className="section-header">
          <h2>Aktivitas Sehari-hari Seorang Jumantik</h2>
          <p>
            Tidak hanya memeriksa jentik, Jumantik juga menjadi ujung tombak edukasi dan
            penggerak perubahan perilaku di masyarakat.
          </p>
        </div>
        <div className="timeline">
          {activities.map((activity, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PeranSection

