import { useAccordion } from "../../hooks/useAccordion";

const FAQSection = () => {
  const { activeAccordion, toggleAccordion } = useAccordion();

  const faqs = [
    {
      question: "Apakah Jumantik harus tenaga kesehatan?",
      answer:
        "Tidak. Jumantik bisa berasal dari masyarakat umum yang telah mendapatkan pelatihan dasar dari petugas kesehatan. Yang terpenting adalah komitmen dan kepedulian terhadap lingkungan.",
    },
    {
      question: "Seberapa sering pemeriksaan jentik harus dilakukan?",
      answer:
        "Idealnya pemeriksaan jentik dilakukan seminggu sekali, mengingat siklus hidup nyamuk dari telur hingga dewasa sekitar 7–10 hari.",
    },
    {
      question: "Apakah fogging saja cukup untuk mencegah DBD?",
      answer:
        "Tidak. Fogging hanya membunuh nyamuk dewasa, tidak membunuh jentik. Jika tempat berkembang biak nyamuk tidak dibersihkan, jentik akan tetap berkembang menjadi nyamuk baru. Karena itu, tindakan 3M Plus dan peran Jumantik tetap sangat penting.",
    },
    {
      question: "Apa manfaat memiliki Jumantik di setiap rumah?",
      answer:
        "Dengan adanya Jumantik di setiap rumah, pengawasan jentik dapat dilakukan lebih intensif dan mandiri. Lingkungan menjadi lebih terkontrol, angka bebas jentik meningkat, dan risiko penularan DBD dapat ditekan secara signifikan.",
    },
  ];

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-header">
          <h2>Pertanyaan yang Sering Diajukan</h2>
          <p>Beberapa pertanyaan umum seputar Jumantik dan pencegahan DBD.</p>
        </div>
        <div className="accordion">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`accordion-item ${
                activeAccordion === index ? "active" : ""
              }`}
            >
              <button
                className="accordion-header"
                onClick={() => toggleAccordion(index)}
              >
                <span>{faq.question}</span>
                <span className="icon">
                  {activeAccordion === index ? "−" : "+"}
                </span>
              </button>
              <div className="accordion-body">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
