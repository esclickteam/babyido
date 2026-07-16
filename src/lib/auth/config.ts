import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isGoogleAuthEnabled } from "@/lib/auth/google";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/models/User";

/** One year — stay signed in until explicit logout. */
const SESSION_MAX_AGE = 365 * 24 * 60 * 60;

const isProduction = process.env.NODE_ENV === "production";

/** Persistent HttpOnly cookie — cleared only via signOut (like invistimo authToken). */
const authTokenCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: isProduction,
  maxAge: SESSION_MAX_AGE,
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      await connectDB();
      const user = await User.findOne({ email: parsed.data.email });
      if (!user?.password) return null;

      const isValid = await bcrypt.compare(parsed.data.password, user.password);
      if (!isValid) return null;

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
];

if (isGoogleAuthEnabled()) {
  providers.unshift(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  useSecureCookies: isProduction,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: SESSION_MAX_AGE,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE,
  },
  cookies: {
    sessionToken: {
      name: "authToken",
      options: authTokenCookieOptions,
    },
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      await connectDB();
      const existing = await User.findOne({ email: user.email });

      if (!existing) {
        await User.create({
          name: user.name ?? user.email.split("@")[0],
          email: user.email,
          image: user.image ?? undefined,
          emailVerified: new Date(),
        });
      } else if (user.image && !existing.image) {
        existing.image = user.image ?? undefined;
        await existing.save();
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.id = user.id;
        token.sub = user.id;
      }

      if (account?.provider === "google" && token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.sub = dbUser._id.toString();
        }
      }

      if (!token.id && token.sub) {
        token.id = String(token.sub);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const userId = token.id ?? token.sub;
        if (userId) {
          session.user.id = String(userId);
        }
      }
      return session;
    },
  },
});
