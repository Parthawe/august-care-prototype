import { notFound } from "next/navigation";
import { AugustPrototype } from "../../../AugustPrototype";
import {
  getPrototypeCase,
  getPrototypeVariation,
  prototypeCases,
  prototypeVariations,
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
    title: `August prototype — ${prototypeCase.label} / ${prototypeVariation.label}`,
    description: `Review the ${prototypeVariation.label.toLowerCase()} variation for ${prototypeCase.label.toLowerCase()} in the August AI prototype.`,
  };
}

export default async function PrototypeVariationPage({ params }: Props) {
  const { scenario, variation } = await params;
  const prototypeCase = getPrototypeCase(scenario);
  const prototypeVariation = getPrototypeVariation(variation);

  if (!prototypeCase) {
    notFound();
  }

  return (
    <AugustPrototype
      initialView={prototypeCase.view}
      initialConcern={prototypeCase.concern}
      variation={prototypeVariation.id}
    />
  );
}
