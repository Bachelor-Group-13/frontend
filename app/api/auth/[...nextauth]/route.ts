import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { query } from "@/utils/db";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const result = await query("SELECT * FROM users WHERE email = $1", [
            credentials.email,
          ]);

          if (!result) {
            return null;
          }
          const user = result.rows[0];

          if (!user || !user.password) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split("@")[0],
            licensePlate: user.license_plate,
            phoneNumber: user.phone_number,
            secondLicensePlate: user.second_license_plate,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.licensePlate = user.licensePlate;
        token.phoneNumber = user.phoneNumber;
        token.secondLicensePlate = user.secondLicensePlate;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.licensePlate = token.licensePlate as string;
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.secondLicensePlate = token.secondLicensePlate as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
