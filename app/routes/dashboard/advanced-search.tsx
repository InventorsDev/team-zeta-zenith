import type { Route } from "./+types/advanced-search";
import AdvancedSearchPage from "~/components/dashboard/AdvancedSearchPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Advanced Search - Zeta Zenith" },
    { name: "description", content: "Search and filter tickets with advanced criteria" },
  ];
}

export default function AdvancedSearch() {
  return <AdvancedSearchPage />;
}
