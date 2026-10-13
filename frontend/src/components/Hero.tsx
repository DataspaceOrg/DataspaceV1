import { Link } from "react-router-dom";
import dataspaceLogo from "../images/Dataspace.png";
import "../styles/Hero.css";

function Hero() {
  return (
    <div className="hero-page">
      <header className="hero-nav">
        <Link to="/" className="hero-brand">
          dataspace
        </Link>
        <nav>
          <a href="#about-dataspace">About</a>
          <Link to="/login">Log in</Link>
        </nav>
      </header>
      <section className="hero-main">
        <img src={dataspaceLogo} alt="Dataspace" className="hero-logo" />
        <div className="hero-text">
          <h1 className="hero-title">
            Welcome to dataspace, your personal AI Integrated Storage and
            workplace system.
          </h1>
          <Link to="/signup" className="hero-button">
            Create an account
          </Link>
        </div>
      </section>
      <section id="about-dataspace" className="hero-about-section">
        <div className="hero-about">
          <p className="hero-eyebrow">(FILLER CONTENT) dataspace Context</p>

          <h2 id="about-heading">
            (FILLER CONTENT) From uploaded files to useful insights.
          </h2>

          <p>
            (FILLER CONTENT) dataspace brings dataset storage and exploration
            into a single workspace. Upload CSV or SQLite files, inspect your
            tables, and use an AI assistant to help understand your data.
          </p>

          <p>
            (FILLER CONTENT) Keep your datasets organized while you investigate
            patterns, ask follow-up questions, and build a better understanding
            of the information you work with.
          </p>
        </div>
      </section>
    </div>
  );
}
export default Hero;
