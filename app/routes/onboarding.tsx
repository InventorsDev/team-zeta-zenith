import type { Route } from "./+types/onboarding";
import { OnboardingPage } from "../components/onboarding/OnboardingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Get Started - SupportIQ" },
    { name: "description", content: "Welcome to SupportIQ, where every conversation becomes clear, actionable insight." },
  ];
}

export default function Onboarding() {
  return <OnboardingPage />;
}



