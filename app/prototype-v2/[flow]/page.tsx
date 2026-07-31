import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AugustV2Prototype } from "../../AugustV2Prototype";
import {
  isPrototypeV2Flow,
  normalizePrototypeV2State,
  prototypeV2Flows,
  prototypeV2StateLabels,
} from "../../prototypeV2Machine";

type Props = {
  params: Promise<{ flow: string }>;
  searchParams: Promise<{ state?: string }>;
};

export function generateStaticParams() {
  return prototypeV2Flows.map((flow) => ({ flow }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { flow } = await params;
  if (!isPrototypeV2Flow(flow)) {
    return { title: "August Care — Prototype V2" };
  }
  const labels = {
    intake: "Start with August",
    prescription: "Prescription continuation",
    lab: "Nearby-lab continuation",
  };
  return {
    title: `August Care — ${labels[flow]}`,
    description:
      "A focused, high-fidelity August Care interaction prototype.",
  };
}

export default async function PrototypeV2FlowPage({
  params,
  searchParams,
}: Props) {
  const [{ flow }, query] = await Promise.all([params, searchParams]);
  if (!isPrototypeV2Flow(flow)) {
    notFound();
  }

  const initialState = normalizePrototypeV2State(flow, query.state);

  return (
    <AugustV2Prototype
      initialFlow={flow}
      initialState={initialState}
      initialLabel={prototypeV2StateLabels[flow][initialState]}
    />
  );
}
