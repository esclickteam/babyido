import type { Metadata, Viewport } from "next";
import { Fredoka, Heebo } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";
import { AuthSessionProvider } from "@/providers/auth-session-provider";
import "../globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
  weight: ["400", "700"],
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BabyIdo — הכל שהתינוק שלכם צריך, במקום אחד.",
    template: "%s | BabyIdo",
  },
  description:
    "אפליקציית מעקב חכמה לתינוקות: גדילה, התפתחות, האכלה, שינה ועוד.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BabyIdo",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FEF6F0" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b2e" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "he")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isRtl = true;

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} suppressHydrationWarning className={`${fredoka.variable} ${heebo.variable}`}>
      <body className="min-h-screen antialiased" style={{ fontFamily: "var(--font-body), sans-serif" }}>
        <NextIntlClientProvider messages={messages}>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
