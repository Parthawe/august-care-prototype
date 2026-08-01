import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AugustV2Prototype } from "../../AugustV2Prototype";
import {
  getCompleteJourneyLocation,
  isPrototypeV2Flow,
  normalizePrototypeV2State,
  prototypeV2Flows,
} from "../../prototypeV2Machine";

type Props = {
  params: Promise<{ flow: string }>;
  searchParams: Promise<{ state?: string }>;
};

export function generateStaticParams() {
  return [...prototypeV2Flows, "complete", "00"].map((flow) => ({ flow }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { flow } = await params;
  if (flow === "complete" || flow === "00") {
    return {
      title: "August Care: Complete visit",
      description:
        "One continuous mobile visit from private intake through clinician care and fulfillment.",
    };
  }
  if (!isPrototypeV2Flow(flow)) {
    return { title: "August Care" };
  }
  const labels = {
    intake: "Start with August",
    prescription: "Prescription continuation",
    lab: "Nearby-lab continuation",
  };
  return {
    title: `August Care: ${labels[flow]}`,
    description:
      "Mobile care that starts with a conversation and continues with a human clinician.",
  };
}

export default async function PrototypeV2FlowPage({
  params,
  searchParams,
}: Props) {
  const [{ flow }, query] = await Promise.all([params, searchParams]);
  if (flow === "complete" || flow === "00") {
    const location = getCompleteJourneyLocation(query.state);
    return (
      <AugustV2Prototype
        completeJourney
        initialFlow={location.flow}
        initialState={location.state}
      />
    );
  }
  if (!isPrototypeV2Flow(flow)) {
    notFound();
  }

  const initialState = normalizePrototypeV2State(flow, query.state);

  return <AugustV2Prototype initialFlow={flow} initialState={initialState} />;
}
