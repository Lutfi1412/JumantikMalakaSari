import { useYear } from "../../hooks/useYear";
import { scrollToSection } from "../../utils/scrollUtils";

const Footer = () => {
  const yearRef = useYear();

  const handleFooterClick = (e, sectionId) => {
    e.preventDefault();
    scrollToSection(sectionId);
  };

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-note">
          <p>
            © <span ref={yearRef}></span> Edukasi Jumantik. Semua hak
            dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
