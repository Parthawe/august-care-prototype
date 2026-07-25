import type { Metadata } from "next";
import Link from "next/link";
import { prototypeCases } from "../prototypeCases";

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
          Each link opens the same mobile prototype at a different moment in the
          care journey, so feedback can stay specific.
        </p>
        <div className="case-link-grid">
          {prototypeCases.map((prototypeCase, index) => (
            <Link
              href={`/cases/${prototypeCase.id}`}
              key={prototypeCase.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{prototypeCase.label}</strong>
              <small>{prototypeCase.note}</small>
            </Link>
          ))}
        </div>
        <Link className="case-home-link" href="/">
          Open default prototype
        </Link>
      </section>
    </main>
  );
}
