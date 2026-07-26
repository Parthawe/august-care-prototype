import type { Metadata } from "next";
import { AugustPrototype } from "./AugustPrototype";
import { getPrototypeCase, getPrototypeVariation } from "./prototypeCases";

export const metadata: Metadata = {
  title: "August — Care that continues",
  description:
    "An interactive prototype showing a clear handoff from August AI to human clinical care.",
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    case?: string | string[];
    variation?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const prototypeCase = getPrototypeCase(params?.case);
  const prototypeVariation = getPrototypeVariation(params?.variation);

  return (
    <AugustPrototype
      initialCaseId={prototypeCase?.id ?? "home"}
      initialView={prototypeCase?.view}
      initialConcern={prototypeCase?.concern}
      initialFixture={prototypeCase?.fixture}
      variation={prototypeVariation.id}
    />
  );
}
