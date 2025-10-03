import type { Route } from "./+types/settings";
import { SettingsPage } from "~/components/dashboard/SettingsPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings - Support IQ" },
    { name: "description", content: "Manage settings" },
  ];
}

export default function Settings() {
  return <SettingsPage />;
}
