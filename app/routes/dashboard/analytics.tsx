import type { Route } from "./+types/analytics";
import { AnalyticsPage } from "~/components/dashboard/AnalyticsPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Analytics - Support IQ" },
    { name: "description", content: "View analytics and reports" },
  ];
}

export default function Analytics() {
  return <AnalyticsPage />;
}
