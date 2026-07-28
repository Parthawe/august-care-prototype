import { notFound } from "next/navigation";
import { UnifiedCarePrototype } from "../../UnifiedCarePrototype";
import {
  getPortfolioScenario,
  portfolioScenarios,
} from "../../portfolioScenarios";

type Props = {
  params: Promise<{
    scenario: string;
  }>;
};

export function generateStaticParams() {
  return portfolioScenarios.map((scenario) => ({
    scenario: scenario.id,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { scenario: id } = await params;
  const scenario = getPortfolioScenario(id);

  if (!scenario) {
    return {
      title: "August AI prototype",
    };
  }

  return {
    title: `August AI — ${scenario.label}`,
    description: scenario.note,
  };
}

export default async function PortfolioScenarioPage({ params }: Props) {
  const { scenario: id } = await params;
  const scenario = getPortfolioScenario(id);

  if (!scenario) {
    notFound();
  }

  return <UnifiedCarePrototype initialScenario={scenario.initialScenario} />;
}
