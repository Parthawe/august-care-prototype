/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors keep the static review hub resilient in vinext. */
import type { Metadata } from "next";
import {
  prototypeVariations,
  recommendedWalkthroughCases,
  signatureEdgeCases,
  supportingCases,
  variationComparisonCases,
} from "../prototypeCases";

export const metadata: Metadata = {
  title: "August — Prototype review",
  description: "Focused review links for the August care encounter.",
};

export default function PrototypeCasesPage() {
  return (
    <main className="case-directory-shell">
      <section className="case-directory">
        <p className="eyebrow">August AI prototype</p>
        <h1>Review one care encounter.</h1>
        <p>
          Start with the recommended story. Compare four hypotheses only where
          the product model materially changes, then review the resolved edge
          paths.
        </p>

        <section className="recommended-walkthrough">
          <div className="walkthrough-heading">
            <div>
              <span>Primary interview artifact</span>
              <h2>One continuous care story</h2>
            </div>
            <a href="/cases/home/classic">Begin walkthrough</a>
          </div>
          <div className="walkthrough-steps">
            {recommendedWalkthroughCases.map((prototypeCase, index) => (
              <a
                href={`/cases/${prototypeCase.id}/classic`}
                key={prototypeCase.id}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{prototypeCase.label}</strong>
                <small>{prototypeCase.note}</small>
              </a>
            ))}
          </div>
        </section>

        <section
          className="focused-comparison"
          aria-labelledby="comparison-heading"
        >
          <div className="section-heading">
            <span>Focused comparison</span>
            <h2 id="comparison-heading">Four hypotheses, three moments</h2>
            <p>
              Home, intake, and clinician handoff are the only places where the
              directions intentionally diverge.
            </p>
          </div>
          <div className="comparison-table">
            <div className="comparison-row comparison-head">
              <span>Moment</span>
              {prototypeVariations.map((variation) => (
                <span key={variation.id}>{variation.label}</span>
              ))}
            </div>
            {variationComparisonCases.map((prototypeCase) => (
              <div className="comparison-row" key={prototypeCase.id}>
                <span>
                  <strong>{prototypeCase.label}</strong>
                  <small>{prototypeCase.note}</small>
                </span>
                {prototypeVariations.map((variation) => (
                  <a
                    href={`/cases/${prototypeCase.id}/${variation.id}`}
                    key={variation.id}
                    title={variation.hypothesis}
                  >
                    Open
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className="variation-hypotheses">
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

        <section className="edge-paths" aria-labelledby="edge-heading">
          <div className="section-heading">
            <span>Resolved edge paths</span>
            <h2 id="edge-heading">One recommended design per case</h2>
          </div>
          <div className="case-link-grid">
            {signatureEdgeCases.map((prototypeCase) => (
              <a
                className="case-link-card"
                href={`/cases/${prototypeCase.id}/classic`}
                key={prototypeCase.id}
              >
                <strong>{prototypeCase.label}</strong>
                <small>{prototypeCase.note}</small>
                <span>Review flow →</span>
              </a>
            ))}
          </div>
        </section>

        <section className="supporting-states" aria-labelledby="proof-heading">
          <div className="section-heading">
            <span>Decision proof</span>
            <h2 id="proof-heading">Resolved outcome states</h2>
          </div>
          <div className="supporting-link-row">
            {supportingCases.map((prototypeCase) => (
              <a
                href={`/cases/${prototypeCase.id}/classic`}
                key={prototypeCase.id}
              >
                {prototypeCase.label}
              </a>
            ))}
          </div>
        </section>

        <a className="case-home-link" href="/">
          Open default prototype
        </a>
      </section>
    </main>
  );
}
