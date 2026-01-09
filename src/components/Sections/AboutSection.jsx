const AboutSection = () => {
  return (
    <section className="section" id="apa-itu">
      <div className="container grid-2">
        <div>
          <h2>
            Apa itu <span className="highlight">Jumantik</span>?
          </h2>
          <p>
            Jumantik (Juru Pemantau Jentik) adalah petugas atau kader kesehatan, baik
            dari masyarakat maupun petugas resmi, yang diberi tugas untuk memeriksa
            keberadaan jentik nyamuk di rumah-rumah, sekolah, perkantoran, dan
            lingkungan sekitar.
          </p>
          <p>
            Program Jumantik bertujuan untuk mencegah penularan penyakit Demam Berdarah
            Dengue (DBD) dengan cara memutus siklus hidup nyamuk sejak masih dalam bentuk
            jentik, sebelum berkembang menjadi nyamuk dewasa yang bisa menggigit dan
            menularkan penyakit.
          </p>
        </div>
        <div className="card card-soft">
          <h3>Peran Utama Jumantik</h3>
          <ul className="list-icon">
            <li>
              <span>✓</span> Memantau dan memeriksa jentik nyamuk di tempat-tempat
              penampungan air.
            </li>
            <li>
              <span>✓</span> Mengedukasi warga tentang cara pencegahan DBD.
            </li>
            <li>
              <span>✓</span> Melaporkan kondisi lingkungan berisiko kepada petugas
              kesehatan.
            </li>
            <li>
              <span>✓</span> Menggerakkan masyarakat untuk menerapkan perilaku hidup
              bersih dan sehat.
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default AboutSection

