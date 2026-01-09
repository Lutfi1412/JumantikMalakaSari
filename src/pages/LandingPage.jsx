import { useState } from "react";
import Header from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import AboutSection from "../components/Sections/AboutSection";
import PenyebabSection from "../components/Sections/PenyebabSection";
import PencegahanSection from "../components/Sections/PencegahanSection";
import PeranSection from "../components/Sections/PeranSection";
import FAQSection from "../components/Sections/FAQSection";
import Footer from "../components/Footer/Footer";
// import "../styles/main.css";

function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  return (
    <>
      {/* <Helmet>
        
      </Helmet> */}
      <link rel="stylesheet" href=".//main.css" />

      <Header navOpen={navOpen} onToggleNav={toggleNav} />

      <main>
        <Hero />
        <AboutSection />
        <PenyebabSection />
        <PencegahanSection />
        <PeranSection />
        <FAQSection />
      </main>

      <Footer />
    </>
  );
}

export default LandingPage;
