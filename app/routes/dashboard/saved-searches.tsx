import type { Route } from "./+types/saved-searches";
import SavedSearchesPage from "~/components/dashboard/SavedSearchesPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Saved Searches - Zeta Zenith" },
    { name: "description", content: "Manage your saved search queries" },
  ];
}

export default function SavedSearches() {
  return <SavedSearchesPage />;
}
