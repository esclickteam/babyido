import { dehydrate, QueryClient } from "@tanstack/react-query";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth/config";
import { getAuthUserId } from "@/lib/auth/session-user";
import { getUserBabies } from "@/lib/data/babies";
import { AppShell } from "@/components/layout/app-shell";
import { BabyStoreInit } from "@/components/layout/baby-store-init";
import { Providers } from "@/providers/providers";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const userId = getAuthUserId(session);

  if (!userId) {
    redirect({ href: "/login", locale: "he" });
  }

  const babies = await getUserBabies(userId!);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
    },
  });
  queryClient.setQueryData(["babies"], babies);

  return (
    <Providers dehydratedState={dehydrate(queryClient)}>
      <BabyStoreInit babies={babies} />
      <AppShell user={session!.user!}>{children}</AppShell>
    </Providers>
  );
}
