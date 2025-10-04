import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
  route("signup", "routes/signup.tsx"),
  route("login", "routes/login.tsx"),
  route("dashboard", "routes/dashboard-layout.tsx", [
    index("routes/dashboard/overview.tsx"),
    route("tickets", "routes/dashboard/tickets.tsx"),
    route("analytics", "routes/dashboard/analytics.tsx"),
    route("custom-dashboard", "routes/dashboard/custom-dashboard.tsx"),
    route("alerts", "routes/dashboard/alerts.tsx"),
    route("alert-rules", "routes/dashboard/alert-rules.tsx"),
    route("notification-settings", "routes/dashboard/notification-settings.tsx"),
    route("advanced-search", "routes/dashboard/advanced-search.tsx"),
    route("saved-searches", "routes/dashboard/saved-searches.tsx"),
    route("integrations", "routes/dashboard/integrations.tsx"),
    route("sync", "routes/dashboard/sync.tsx"),
    route("settings", "routes/dashboard/settings.tsx"),
  ]),
] satisfies RouteConfig;
