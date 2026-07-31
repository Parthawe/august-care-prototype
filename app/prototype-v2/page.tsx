import type { Metadata } from "next";
import Link from "next/link";

const entries = [
  {
    id: "intake",
    number: "01",
    eyebrow: "Shared journey",
    title: "Start with August",
    description:
      "Conversational intake, information confirmation, and a direct handoff to Maya.",
    states: "6 states",
  },
  {
    id: "prescription",
    number: "02",
    eyebrow: "Clinician-authored continuation",
    title: "Prescription",
    description:
      "Review Maya’s recommendation, confirm the pharmacy, and send the prescription.",
    states: "4 states",
  },
  {
    id: "lab",
    number: "03",
    eyebrow: "Clinician-authored continuation",
    title: "Nearby lab",
    description:
      "Review Maya’s testing decision and confirm the August-arranged lab appointment.",
    states: "3 states",
  },
] as const;

export const metadata: Metadata = {
  title: "August Care — Interactive Prototype V2",
  description:
    "Three focused August care prototype entry points for intake, prescription, and testing.",
};

export default function PrototypeV2Hub() {
  return (
    <main className="v2-hub">
      <div className="v2-hub-noise" aria-hidden="true" />
      <header className="v2-hub-header">
        <Link className="v2-hub-wordmark" href="/prototype-v2">
          August
        </Link>
        <span>Interactive prototype · V2</span>
      </header>

      <section className="v2-hub-intro">
        <p>ONE CARE RELATIONSHIP</p>
        <h1>Start with a conversation.</h1>
        <div>
          <p>
            August gathers the context. Maya reviews the care. Each decision
            keeps a visible owner.
          </p>
          <span>Choose a reviewer starting point below.</span>
        </div>
      </section>

      <section className="v2-hub-grid" aria-label="Prototype starting points">
        {entries.map((entry) => (
          <Link
            className={`v2-hub-card v2-hub-card-${entry.id}`}
            href={`/prototype-v2/${entry.id}`}
            key={entry.id}
          >
            <span className="v2-hub-card-number">{entry.number}</span>
            <div>
              <small>{entry.eyebrow}</small>
              <h2>{entry.title}</h2>
              <p>{entry.description}</p>
            </div>
            <footer>
              <span>{entry.states}</span>
              <strong>Open flow →</strong>
            </footer>
          </Link>
        ))}
      </section>

      <footer className="v2-hub-footer">
        <span>Fictional product-design prototype</span>
        <span>No clinician or outcome selection appears in patient UI.</span>
      </footer>
    </main>
  );
}
