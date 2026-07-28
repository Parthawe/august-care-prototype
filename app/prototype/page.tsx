/* eslint-disable @next/next/no-html-link-for-pages -- These are resilient portfolio review links. */
import type { Metadata } from "next";
import { portfolioScenarios } from "../portfolioScenarios";

export const metadata: Metadata = {
  title: "August AI — Portfolio prototype scenarios",
  description:
    "Open focused August AI prototype journeys for symptoms, clinician care, medication, testing, follow-up, and safety.",
};

const groups = [
  {
    id: "begin",
    eyebrow: "Begin care",
    title: "How the conversation starts",
  },
  {
    id: "handoff",
    eyebrow: "Human care",
    title: "How August and Maya work together",
  },
  {
    id: "outcome",
    eyebrow: "Clinical outcomes",
    title: "How decisions, testing, and follow-up continue",
  },
  {
    id: "safety",
    eyebrow: "Boundaries and safety",
    title: "How the experience responds when routine care should stop",
  },
] as const;

export default function PortfolioPrototypePage() {
  return (
    <main className="case-directory-shell">
      <section className="case-directory">
        <p className="eyebrow">August AI · Interactive portfolio</p>
        <h1>Choose the moment you want to review.</h1>
        <p>
          Each link opens a focused, usable care scenario. Start fresh for the
          natural experience, or jump directly to a decision point.
        </p>

        <a className="portfolio-primary-link" href="/prototype/start">
          <span>
            <small>Recommended first</small>
            <strong>Start with an empty August conversation</strong>
          </span>
          <b>Open prototype →</b>
        </a>

        <div className="portfolio-scenario-groups">
          {groups.map((group) => (
            <section className="interactive-group" key={group.id}>
              <div className="section-heading">
                <span>{group.eyebrow}</span>
                <h2>{group.title}</h2>
              </div>
              <div className="case-link-grid">
                {portfolioScenarios
                  .filter((scenario) => scenario.group === group.id)
                  .map((scenario) => (
                    <a
                      className="case-link-card"
                      href={`/prototype/${scenario.id}`}
                      key={scenario.id}
                    >
                      <strong>{scenario.label}</strong>
                      <small>{scenario.note}</small>
                      <span>Open scenario →</span>
                    </a>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
