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
        <header className="directory-intro">
          <div className="directory-brand-row">
            <span className="directory-mark" aria-hidden="true">
              A
            </span>
            <p className="eyebrow">August AI · Interactive portfolio</p>
            <span className="directory-flow-count">
              {portfolioScenarios.length} independent flows
            </span>
          </div>
          <h1>Choose one small flow.</h1>
          <p>
            Every route stands on its own. It opens at the right context,
            stays focused on one care moment, and ends without sending you into
            another case.
          </p>
        </header>

        <div className="portfolio-scenario-groups">
          {portfolioScenarioGroups.map((group, groupIndex) => (
            <section
              className="interactive-group"
              data-group-index={groupIndex + 1}
              key={group.id}
            >
              <div className="section-heading">
                <div>
                  <span>{group.eyebrow}</span>
                  <h2>{group.title}</h2>
                  <p>{group.note}</p>
                </div>
                <small>
                  {
                    portfolioScenarios.filter(
                      (scenario) => scenario.group === group.id,
                    ).length
                  }{" "}
                  flows
                </small>
              </div>
              <div className="case-link-grid">
                {portfolioScenarios
                  .filter((scenario) => scenario.group === group.id)
                  .map((scenario, scenarioIndex) => (
                    <a
                      className="case-link-card"
                      href={`/prototype/${scenario.id}`}
                      key={scenario.id}
                    >
                      <i aria-hidden="true">
                        {String(scenarioIndex + 1).padStart(2, "0")}
                      </i>
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
