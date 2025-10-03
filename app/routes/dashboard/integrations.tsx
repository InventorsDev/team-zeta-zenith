import type { Route } from "./+types/integrations";
import { IntegrationsPage } from "~/components/dashboard/IntegrationsPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Integrations - Support IQ" },
    { name: "description", content: "Manage integrations" },
  ];
}

export default function Integrations() {
  return <IntegrationsPage />;
}
