import type { Route } from "./+types/custom-dashboard";
import { CustomDashboardPage } from "~/components/dashboard/CustomDashboardPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Custom Dashboards - Support IQ" },
    { name: "description", content: "Build and customize your analytics dashboards" },
  ];
}

export default function CustomDashboard() {
  return <CustomDashboardPage />;
}
