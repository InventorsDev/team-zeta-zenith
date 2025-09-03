import type { Route } from "./+types/signup";
import { SignUpPage } from "../components/auth/SignUpPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - SupportIQ" },
    { name: "description", content: "Create your SupportIQ account to get started with AI-powered support analytics." },
  ];
}

export default function SignUp() {
  return <SignUpPage />;
}



