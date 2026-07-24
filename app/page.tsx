import type { Metadata } from "next";
import { AugustPrototype } from "./AugustPrototype";

export const metadata: Metadata = {
  title: "August — Care that continues",
  description:
    "An interactive prototype showing a safe, legible handoff from August AI to a licensed clinician.",
};

export default function Home() {
  return <AugustPrototype />;
}
