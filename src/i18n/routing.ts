import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["he"],
  defaultLocale: "he",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
