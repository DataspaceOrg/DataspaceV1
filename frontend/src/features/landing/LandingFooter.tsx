import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
export function LandingFooter({ destination }: { destination: string }) {
  return (
    <div className="wrap">
      <section className="endcap reveal">
        <h2>
          Bring a dataset.
          <br />
          Find a starting point.
        </h2>
        <Link className="btn primary" to={destination}>
          Get Started
          <FiArrowRight aria-hidden="true" />
        </Link>
      </section>
      <footer className="footer">
        <a className="brand" href="#landing-top" aria-label="Dataspace home">
          dataspace
        </a>
        <nav className="footer-links" aria-label="Footer">
          <a href="#workflow">Workflow</a>
          <a href="#faq">Questions</a>
          <Link to={destination}>Workspace</Link>
          <Link to="/login">Log in</Link>
        </nav>
      </footer>

      <div className="footer-meta">
        <span>Walkthrough uses sample data and illustrative analysis</span>
        <span>Dataspace</span>
      </div>
    </div>
  );
}
