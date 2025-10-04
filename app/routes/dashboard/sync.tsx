import type { Route } from "./+types/sync";
import { SyncStatusPage } from "~/components/dashboard/SyncStatusPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sync Status - Support IQ" },
    { name: "description", content: "Monitor integration sync status" },
  ];
}

export default function Sync() {
  return <SyncStatusPage />;
}
