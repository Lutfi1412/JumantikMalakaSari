import { scrollToSection } from "../../utils/scrollUtils";

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-text">
          <span className="badge">Gerakan Lawan DBD</span>
          <h1>
            Kenali <span className="highlight">Jumantik</span>, Garda Terdepan
            Cegah DBD di Lingkungan Anda
          </h1>
          <p className="hero-subtitle">
            Juru Pemantau Jentik (Jumantik) adalah kader kesehatan yang bertugas
            memantau, mencegah, dan mengedukasi masyarakat agar bebas jentik
            nyamuk penular Demam Berdarah Dengue (DBD).
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => scrollToSection("pencegahan")}
            >
              Pelajari Cara Pencegahan
            </button>
            <button
              className="btn-outline"
              onClick={() => scrollToSection("apa-itu")}
            >
              Apa itu Jumantik?
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">3M+</span>
              <span className="stat-label">Gerakan 3M Plus</span>
            </div>
            <div className="stat">
              <span className="stat-number">3x</span>
              <span className="stat-label">Pemeriksaan jentik per minggu</span>
            </div>
            {/* <div className="stat">
              <span className="stat-number">RT</span>
              <span className="stat-label">Rumah = 1 Jumantik</span>
            </div> */}
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-illustration">
            <div className="bubble bubble-main">
              <h2>Bebas Jentik, Bebas DBD</h2>
              <p>Cegah sebelum sakit. Awali dari rumah Anda sendiri.</p>
            </div>
            <div className="bubble bubble-checklist">
              <h3>Checklist Mingguan</h3>
              <ul>
                <li>Periksa bak mandi</li>
                <li>Kuras & sikat dinding bak</li>
                <li>Tutup rapat tempat penampungan air</li>
                <li>Buang kaleng/botol bekas</li>
              </ul>
            </div>
            <div className="bubble bubble-alert">
              <span className="dot"></span>
              <span>Waspada genangan air & tempat gelap lembap</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
