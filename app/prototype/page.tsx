import type { Metadata } from "next";
import {
  portfolioScenarioGroups,
  portfolioScenarios,
} from "../portfolioScenarios";

export const metadata: Metadata = {
  title: "August AI — Independent prototype flows",
  description:
    "Open independent August AI prototype flows for intake, clinician care, reports, decisions, and safety.",
};

export default function PortfolioPrototypePage() {
  return (
    <main className="case-directory-shell">
      <section className="case-directory">
        <p className="eyebrow">August AI · Interactive portfolio</p>
        <h1>Choose one small flow.</h1>
        <p>
          Every route stands on its own. It opens at the right context, stays
          inside that flow, and has no case-to-case progression controls.
        </p>

        <div className="portfolio-scenario-groups">
          {portfolioScenarioGroups.map((group) => (
            <section className="interactive-group" key={group.id}>
              <div className="section-heading">
                <span>{group.eyebrow}</span>
                <h2>{group.title}</h2>
                <p>{group.note}</p>
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
                      <span>Open this flow →</span>
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
