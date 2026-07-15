import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["he"],
  defaultLocale: "he",
  localePrefix: "never",
});

export type AppLocale = (typeof routing.locales)[number];
