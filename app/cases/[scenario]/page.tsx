import { notFound } from "next/navigation";
import { AugustPrototype } from "../../AugustPrototype";
import { getPrototypeCase, prototypeCases } from "../../prototypeCases";

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

  return (
    <AugustPrototype
      initialView={prototypeCase.view}
      initialConcern={prototypeCase.concern}
      variation="classic"
    />
  );
}
