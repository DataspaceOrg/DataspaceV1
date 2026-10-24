import { faqItems } from "./demoData";
export function FAQSection() {
  return (
    <section className="wrap faq" id="faq">
      <div className="reveal">
        <div className="section-label">Before you start</div>
        <h2>
          A few useful
          <br />
          answers.
        </h2>
      </div>
      <div className="faq-list reveal">
        {faqItems.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
