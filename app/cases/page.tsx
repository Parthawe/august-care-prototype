/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a vinext/next-link client-runtime conflict in this static review hub. */
import type { Metadata } from "next";
import {
  primaryPrototypeCases,
  prototypeVariations,
  recommendedWalkthroughCases,
} from "../prototypeCases";

export const metadata: Metadata = {
  title: "August — Prototype cases",
  description: "Review links for the August AI care prototype.",
};

export default function PrototypeCasesPage() {
  return (
    <main className="case-directory-shell">
      <section className="case-directory">
        <p className="eyebrow">August AI prototype</p>
        <h1>Review by case.</h1>
        <p>
          Start with the recommended walkthrough, then use the scenario matrix
          to compare four product hypotheses.
        </p>
        <section className="recommended-walkthrough">
          <div className="walkthrough-heading">
            <div>
              <span>Recommended interview path</span>
              <h2>One continuous care story.</h2>
            </div>
            <small>Classic · recommended baseline</small>
          </div>
          <div className="walkthrough-steps">
            {recommendedWalkthroughCases.map((prototypeCase, index) => (
              <a
                href={`/cases/${prototypeCase.id}/classic`}
                key={prototypeCase.id}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {prototypeCase.label}
              </a>
            ))}
          </div>
        </section>
        <section className="variation-hypotheses" aria-labelledby="variation-heading">
          <div className="section-heading">
            <span>Four directions</span>
            <h2 id="variation-heading">Each tests a different idea.</h2>
          </div>
          <div>
            {prototypeVariations.map((variation) => (
              <article
                className={variation.recommended ? "recommended" : ""}
                key={variation.id}
              >
                <span>
                  {variation.label}
                  {variation.recommended ? " · Recommended" : ""}
                </span>
                <strong>{variation.hypothesis}</strong>
                <p>{variation.question}</p>
              </article>
            ))}
          </div>
        </section>
        <div className="scenario-heading">
          <span>Scenario matrix</span>
          <h2>Review an exact moment.</h2>
        </div>
        <div className="case-link-grid variation-case-grid">
          {primaryPrototypeCases.map((prototypeCase, index) => (
            <article
              className="case-link-card"
              key={prototypeCase.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{prototypeCase.label}</strong>
              <small>{prototypeCase.note}</small>
              <div className="variation-link-row">
                {prototypeVariations.map((variation) => (
                  <a
                    href={`/cases/${prototypeCase.id}/${variation.id}`}
                    key={variation.id}
                    title={variation.note}
                  >
                    {variation.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
        <a className="case-home-link" href="/">
          Open default prototype
        </a>
      </section>
    </main>
  );
}
