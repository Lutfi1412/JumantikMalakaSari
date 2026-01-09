import { scrollToSection } from "../../utils/scrollUtils";

const Header = ({ navOpen, onToggleNav }) => {
  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    scrollToSection(sectionId);
    if (onToggleNav) {
      setTimeout(() => onToggleNav(false), 100);
    }
  };

  const navItems = [
    { id: "apa-itu", label: "Apa itu" },
    { id: "penyebab", label: "Penyebab" },
    { id: "pencegahan", label: "Pencegahan" },
    { id: "peran", label: "Peran Jumantik" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <div className="logo">
          <span className="logo-mark">🦟</span>
          <span className="logo-text">Jumantik</span>
        </div>

        <nav className={`nav-links ${navOpen ? "active" : ""}`}>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
            >
              {item.label}
            </a>
          ))}

          {/* Tombol Login */}
          <a href="/login" className="nav-login">
            Login
          </a>
        </nav>

        <button
          className="nav-toggle"
          aria-label="Buka navigasi"
          onClick={onToggleNav}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
