import { UnifiedCarePrototype } from "./UnifiedCarePrototype";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string | string[] }>;
}) {
  const params = await searchParams;
  const scenario = Array.isArray(params.scenario)
    ? params.scenario[0]
    : params.scenario;

  return <UnifiedCarePrototype initialScenario={scenario} />;
}
