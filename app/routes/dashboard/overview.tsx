import type { Route } from "./+types/overview";
import { OverviewPage } from "~/components/dashboard/OverviewPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Support IQ" },
    { name: "description", content: "Dashboard overview for Support IQ" },
  ];
}

export default function Overview() {
  return <OverviewPage />;
}
