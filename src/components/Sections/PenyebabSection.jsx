const PenyebabSection = () => {
  const causes = [
    {
      title: '1. Genangan Air Bersih',
      description:
        'Nyamuk Aedes aegypti (penyebab DBD) senang berkembang biak di air bersih yang tergenang, seperti bak mandi, vas bunga, ember, talang air, dan tempat minum hewan yang jarang dibersihkan.',
    },
    {
      title: '2. Sampah & Wadah Terbuka',
      description:
        'Kaleng, botol, ban bekas, dan benda-benda yang dapat menampung air hujan menjadi tempat ideal bagi nyamuk untuk bertelur jika dibiarkan terbuka.',
    },
    {
      title: '3. Kurangnya Pemeriksaan Rutin',
      description:
        'Tanpa pemeriksaan jentik secara berkala, jentik dapat berkembang menjadi nyamuk dewasa dalam waktu 7–10 hari dan meningkatkan risiko penularan DBD.',
    },
  ]

  const cycleSteps = [
    {
      number: 1,
      title: 'Telur',
      description:
        'Nyamuk betina meletakkan telur di dinding tempat penampungan air.',
    },
    {
      number: 2,
      title: 'Jentik',
      description:
        'Telur menetas menjadi jentik dan hidup di dalam air, mudah terlihat jika diperiksa.',
    },
    {
      number: 3,
      title: 'Pupa',
      description:
        'Jentik berubah menjadi pupa sebelum akhirnya menjadi nyamuk dewasa.',
    },
    {
      number: 4,
      title: 'Nyamuk Dewasa',
      description:
        'Nyamuk betina yang terinfeksi virus dengue dapat menularkan DBD kepada manusia.',
    },
  ]

  return (
    <section className="section alt" id="penyebab">
      <div className="container">
        <div className="section-header">
          <h2>Penyebab Munculnya Jentik Nyamuk</h2>
          <p>
            Jentik nyamuk muncul karena kombinasi lingkungan yang mendukung dan
            kurangnya kebersihan di sekitar tempat tinggal.
          </p>
        </div>
        <div className="grid-3">
          {causes.map((cause, index) => (
            <div key={index} className="card">
              <h3>{cause.title}</h3>
              <p>{cause.description}</p>
            </div>
          ))}
        </div>

        <div className="cycle">
          <h3>Siklus Hidup Nyamuk Aedes aegypti</h3>
          <div className="cycle-steps">
            {cycleSteps.map((step) => (
              <div key={step.number} className="cycle-step">
                <span className="cycle-number">{step.number}</span>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
          <p className="cycle-note">
            <strong>Catatan:</strong> Tahap paling mudah diputus adalah saat masih
            berupa <strong>jentik</strong>. Di sinilah peran Jumantik menjadi sangat
            penting.
          </p>
        </div>
      </div>
    </section>
  )
}

export default PenyebabSection

