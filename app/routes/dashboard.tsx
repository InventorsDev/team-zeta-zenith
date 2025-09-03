import type { Route } from "./+types/dashboard";
import { DashboardPage } from "../components/dashboard/DashboardPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - SupportIQ" },
    { name: "description", content: "SupportIQ dashboard for managing customer support tickets and conversations." },
  ];
}

export default function Dashboard() {
  return <DashboardPage />;
}



