import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isGoogleAuthEnabled } from "@/lib/auth/google";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/models/User";

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
  session: { strategy: "jwt" },
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
      }

      if (account?.provider === "google" && token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) token.id = dbUser._id.toString();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
