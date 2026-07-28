import { notFound, redirect } from "next/navigation";
import {
  getPortfolioFlowForPrototypeCase,
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
    title: `August prototype — ${prototypeCase.label} · ${prototypeVariation.label}`,
    description: `${prototypeVariation.label} variation for the ${prototypeCase.label.toLowerCase()} scenario.`,
  };
}

export default async function PrototypeCaseVariationPage({ params }: Props) {
  const { scenario } = await params;
  const prototypeCase = getPrototypeCase(scenario);

  if (!prototypeCase) {
    notFound();
  }

  const flow = getPortfolioFlowForPrototypeCase(prototypeCase.id);
  if (!flow) {
    notFound();
  }

  redirect(`/prototype/${flow}`);
}
