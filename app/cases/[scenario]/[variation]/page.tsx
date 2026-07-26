import { notFound, redirect } from "next/navigation";
import { AugustPrototype } from "../../../AugustPrototype";
import {
  getPrototypeCase,
  getPrototypeVariation,
  prototypeCases,
  prototypeVariations,
  supportsVariationComparison,
} from "../../../prototypeCases";

type Props = {
  params: Promise<{
    scenario: string;
    variation: string;
  }>;
};

export function generateStaticParams() {
  return prototypeCases.flatMap((prototypeCase) =>
    prototypeVariations.map((variation) => ({
      scenario: prototypeCase.id,
      variation: variation.id,
    }))
  );
}

export async function generateMetadata({ params }: Props) {
  const { scenario, variation } = await params;
  const prototypeCase = getPrototypeCase(scenario);
  const prototypeVariation = getPrototypeVariation(variation);

  if (!prototypeCase) {
    return {
      title: "August prototype variation",
    };
  }

  return {
    title: `August prototype — ${prototypeCase.label} · ${prototypeVariation.label}`,
    description: `${prototypeVariation.label} variation for the ${prototypeCase.label.toLowerCase()} scenario.`,
  };
}

export default async function PrototypeCaseVariationPage({ params }: Props) {
  const { scenario, variation } = await params;
  const prototypeCase = getPrototypeCase(scenario);
  const prototypeVariation = getPrototypeVariation(variation);

  if (!prototypeCase) {
    notFound();
  }

  if (
    prototypeVariation.id !== "classic" &&
    !supportsVariationComparison(prototypeCase.id)
  ) {
    redirect(`/cases/${prototypeCase.id}/classic`);
  }

  return (
    <AugustPrototype
      initialCaseId={prototypeCase.id}
      initialView={prototypeCase.view}
      initialConcern={prototypeCase.concern}
      initialFixture={prototypeCase.fixture}
      variation={prototypeVariation.id}
    />
  );
}
