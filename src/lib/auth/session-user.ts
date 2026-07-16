import type { Session } from "next-auth";

/** Resolve Mongo user id from Auth.js session (id or JWT sub). */
export function getAuthUserId(session: Session | null | undefined): string | undefined {
  if (!session?.user) return undefined;

  const user = session.user as Session["user"] & { sub?: string };
  const id = user.id ?? user.sub;
  return id ? String(id) : undefined;
}
