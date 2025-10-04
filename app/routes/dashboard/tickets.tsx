import type { Route } from "./+types/tickets";
import { TicketsListPage } from "~/components/dashboard/TicketsListPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tickets - Support IQ" },
    { name: "description", content: "Manage support tickets" },
  ];
}

export default function Tickets() {
  return <TicketsListPage />;
}
