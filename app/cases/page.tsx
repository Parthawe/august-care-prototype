import type { Metadata } from "next";
import Link from "next/link";
import { primaryPrototypeCases, prototypeVariations } from "../prototypeCases";

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
          Each scenario has four visual directions. Open the exact moment you
          want to critique, then compare Classic, Ambient, Clinical, and
          Concierge.
        </p>
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
                  <Link
                    href={`/cases/${prototypeCase.id}/${variation.id}`}
                    key={variation.id}
                    title={variation.note}
                  >
                    {variation.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
        <Link className="case-home-link" href="/">
          Open default prototype
        </Link>
      </section>
    </main>
  );
}
