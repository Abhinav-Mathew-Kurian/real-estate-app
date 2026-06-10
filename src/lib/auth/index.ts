import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/db/models/User";
import { authConfig } from "@/lib/auth/config";

declare module "next-auth" {
  interface User {
    role?: "admin" | "staff";
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: "admin" | "staff";
    };
  }
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({
          email: String(credentials.email).toLowerCase(),
        }).lean();

        if (!user) return null;

        const valid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
