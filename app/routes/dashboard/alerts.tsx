import type { Route } from "./+types/alerts";
import { AlertsPage } from "~/components/dashboard/AlertsPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Alerts - Support IQ" },
    { name: "description", content: "Monitor and manage alerts" },
  ];
}

export default function Alerts() {
  return <AlertsPage />;
}
