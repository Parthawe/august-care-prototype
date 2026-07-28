import { notFound, redirect } from "next/navigation";
import {
  getPortfolioFlowForPrototypeCase,
  getPrototypeCase,
  prototypeCases,
} from "../../prototypeCases";

type Props = {
  params: Promise<{
    scenario: string;
  }>;
};

export function generateStaticParams() {
  return prototypeCases.map((prototypeCase) => ({
    scenario: prototypeCase.id,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { scenario } = await params;
  const prototypeCase = getPrototypeCase(scenario);

  if (!prototypeCase) {
    return {
      title: "August prototype case",
    };
  }

  return {
    title: `August prototype — ${prototypeCase.label}`,
    description: `Review the ${prototypeCase.label.toLowerCase()} case in the August AI mobile prototype.`,
  };
}

export default async function PrototypeCasePage({ params }: Props) {
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
