"use client";

import { SessionProvider } from "next-auth/react";

/** Keeps the session alive until explicit sign-out — no background refetch that can clear state. */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}
