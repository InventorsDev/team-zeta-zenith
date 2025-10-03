import type { Route } from "./+types/tickets";
import { DashboardPage } from "~/components/dashboard/DashboardPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tickets - Support IQ" },
    { name: "description", content: "Manage support tickets" },
  ];
}

export default function Tickets() {
  return <DashboardPage />;
}
