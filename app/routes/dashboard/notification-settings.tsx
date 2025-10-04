import type { Route } from "./+types/notification-settings";
import { NotificationSettingsPage } from "~/components/dashboard/NotificationSettingsPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Notification Settings - Support IQ" },
    { name: "description", content: "Configure notification preferences" },
  ];
}

export default function NotificationSettings() {
  return <NotificationSettingsPage />;
}
