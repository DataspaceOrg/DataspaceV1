import { useEffect, useRef } from "react";
import { LandingNavbar } from "./LandingNavbar";
import { HeroSection } from "./HeroSection";
import { FormatStrip } from "./FormatStrip";
import { StatementSection } from "./StatementSection";
import { WorkflowSection } from "./WorkflowSection";
import { FAQSection } from "./FAQSection";
import { LandingFooter } from "./LandingFooter";
import { useReducedMotion } from "./useReducedMotion";
import { useLandingScroll } from "./useLandingScroll";
import "./landing.css";
export default function LandingPage() {
  const root = useRef<HTMLDivElement>(null),
    nav = useRef<HTMLDivElement>(null),
    strip = useRef<HTMLDivElement>(null),
    steps = useRef<(HTMLElement | null)[]>([]);
  const reduced = useReducedMotion(),
    scroll = useLandingScroll(nav, strip, steps, reduced);
  const destination = localStorage.getItem("dataspace_user_id")
    ? "/dashboard"
    : "/signup";
  useEffect(() => {
    const previous = document.title;
    document.title = "dataspace";
    return () => {
      document.title = previous;
    };
  }, []);
  useEffect(() => {
    if (reduced || !root.current?.animate) return;
    const animations: Animation[] = [];
    const animate = (el: Element, delay = 0) =>
      animations.push(
        el.animate(
          [
            { opacity: 0, transform: "translateY(20px)" },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: 400,
            delay,
            fill: "backwards",
            easing: "cubic-bezier(.22,1,.36,1)",
          },
        ),
      );
    root.current
      .querySelectorAll(
        ".headline-line, .hero-copy>p, .hero-actions, .hero-hints",
      )
      .forEach((el, index) => animate(el, index * 65));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    root.current
      .querySelectorAll(".reveal")
      .forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      animations.forEach((a) => a.cancel());
    };
  }, [reduced]);
  return (
    <div className="landing-v2" id="landing-top" ref={root}>
      <a href="#landing-main" className="skip-link">
        Skip to content
      </a>
      <LandingNavbar
        navRef={nav}
        isCompact={scroll.isCompact}
        showGetStarted={scroll.showGetStarted}
        destination={destination}
      />
      <main id="landing-main">
        <HeroSection destination={destination} reduced={reduced} />
        <FormatStrip stripRef={strip} />
        <StatementSection />
        <WorkflowSection
          stage={scroll.stage}
          selectStage={scroll.selectStage}
          stepsRef={steps}
          reduced={reduced}
        />
        <FAQSection />
        <LandingFooter destination={destination} />
      </main>
    </div>
  );
}
