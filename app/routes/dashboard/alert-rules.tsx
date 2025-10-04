import type { Route } from "./+types/alert-rules";
import { AlertRuleBuilderPage } from "~/components/dashboard/AlertRuleBuilderPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Alert Rules - Support IQ" },
    { name: "description", content: "Create and manage alert rules" },
  ];
}

export default function AlertRules() {
  return <AlertRuleBuilderPage />;
}
