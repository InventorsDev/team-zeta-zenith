import type { Route } from "./+types/home";
import { LandingPage } from "../components/LandingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Zeta Zenith - AI-Powered Support Analytics" },
    { name: "description", content: "Transform your customer support with AI-powered ticket analysis, sentiment detection, and actionable insights." },
  ];
}

export default function Home() {
  return <LandingPage />;
}
