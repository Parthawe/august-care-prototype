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

const interactiveScenarios = [
  {
    group: "Starting states",
    items: [
      {
        id: "empty",
        label: "No messages yet",
        note: "Start naturally or use one of the three prompts.",
      },
      {
        id: "symptom",
        label: "Symptom intake",
        note: "Continue the adaptive one-question-at-a-time interview.",
      },
      {
        id: "prescription",
        label: "Prescription request",
        note: "Assess the request before any medication decision.",
      },
      {
        id: "unsupported",
        label: "Unsupported request",
        note: "Give a neutral boundary and a useful next step.",
      },
    ],
  },
  {
    group: "Clinician and testing",
    items: [
      {
        id: "clinician-wait",
        label: "Maya is reviewing",
        note: "Test delayed response and private Ask August.",
      },
      {
        id: "testing",
        label: "Testing choices",
        note: "Arrange a lab, order a kit, or upload a result.",
      },
      {
        id: "result-review",
        label: "Result awaiting review",
        note: "Keep the plan pending until Maya finishes.",
      },
      {
        id: "care",
        label: "Care inbox",
        note: "Switch between August and clinician conversations.",
      },
    ],
  },
  {
    group: "Outcomes and safety",
    items: [
      {
        id: "prescription-appropriate",
        label: "Medication appropriate",
        note: "Review plan, choose pharmacy, send, and follow up.",
      },
      {
        id: "prescription-declined",
        label: "Medication declined",
        note: "Show reasoning, alternative care, and follow-up.",
      },
      {
        id: "follow-up",
        label: "August follow-up",
        note: "Test better and worse responses after treatment.",
      },
      {
        id: "emergency",
        label: "Emergency interruption",
        note: "Normal chat pauses; location and urgent actions take over.",
      },
    ],
  },
] as const;

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

        <section className="interactive-review">
          <div className="section-heading">
            <span>One-click scenario testing</span>
            <h2>Open the unified prototype at the exact state you need.</h2>
            <p>
              Each shortcut keeps reviewer controls outside the patient
              interface. Use the buttons and composer inside the phone to
              continue that branch.
            </p>
          </div>
          {interactiveScenarios.map((scenarioGroup) => (
            <div className="interactive-group" key={scenarioGroup.group}>
              <h3>{scenarioGroup.group}</h3>
              <div className="case-link-grid">
                {scenarioGroup.items.map((scenario) => (
                  <a
                    className="case-link-card"
                    href={`/?scenario=${scenario.id}`}
                    key={scenario.id}
                  >
                    <strong>{scenario.label}</strong>
                    <small>{scenario.note}</small>
                    <span>Start test →</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>

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
