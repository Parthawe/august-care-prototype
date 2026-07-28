import type { Metadata } from "next";
import {
  portfolioScenarioGroups,
  portfolioScenarios,
} from "../portfolioScenarios";

export const metadata: Metadata = {
  title: "August — Independent flow review",
  description: "Independent review links for the August care prototype.",
};

export default function PrototypeCasesPage() {
  return (
    <main className="case-directory-shell">
      <section className="case-directory">
        <p className="eyebrow">August AI prototype</p>
        <h1>Choose one small flow.</h1>
        <p>
          This is a menu of independent review routes, not one long
          walkthrough. Each link opens with the context it needs and does not
          lead into a neighboring case.
        </p>

        <section className="interactive-review">
          <div className="section-heading">
            <span>Six small flow groups</span>
            <h2>Open only the part you want to test.</h2>
            <p>
              Use the in-flow actions to test that moment. Return here when you
              want to open a different flow.
            </p>
          </div>
          {portfolioScenarioGroups.map((scenarioGroup) => (
            <div className="interactive-group" key={scenarioGroup.id}>
              <div className="section-heading">
                <span>{scenarioGroup.eyebrow}</span>
                <h3>{scenarioGroup.title}</h3>
                <p>{scenarioGroup.note}</p>
              </div>
              <div className="case-link-grid">
                {portfolioScenarios
                  .filter((scenario) => scenario.group === scenarioGroup.id)
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
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
