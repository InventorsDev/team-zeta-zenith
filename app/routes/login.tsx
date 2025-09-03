import type { Route } from "./+types/login";
import { LogInPage } from "../components/auth/LogInPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In - SupportIQ" },
    { name: "description", content: "Sign in to your SupportIQ account to access your support analytics dashboard." },
  ];
}

export default function Login() {
  return <LogInPage />;
}



