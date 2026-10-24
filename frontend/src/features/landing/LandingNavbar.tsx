import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import type { RefObject } from "react";
export function LandingNavbar({
  navRef,
  isCompact,
  showGetStarted,
  destination,
}: {
  navRef: RefObject<HTMLDivElement | null>;
  isCompact: boolean;
  showGetStarted: boolean;
  destination: string;
}) {
  return (
    <div
      ref={navRef}
      className={`nav-area ${isCompact ? "compact" : ""} ${showGetStarted ? "cta-visible" : ""}`}
    >
      <div className="nav-frame">
        <header className="nav">
          <a className="brand" href="#landing-top" aria-label="Dataspace home">
            dataspace
          </a>
          <nav className="nav-links" aria-label="Primary">
            <a href="#workflow">How it works</a>
            <a href="#faq">Questions</a>
          </nav>
        </header>
        <Link
          className="btn primary nav-cta"
          to={destination}
          tabIndex={showGetStarted ? 0 : -1}
          aria-hidden={!showGetStarted}
        >
          Get Started
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
