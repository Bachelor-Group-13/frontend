import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "@/utils/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Look up the user by email
          const result = await query("SELECT * FROM users WHERE email = $1", [
            credentials.email,
          ]);
          if (!result || result.rowCount === 0) return null;

          const user = result.rows[0];
          if (!user?.password) return null;

          // Compare passwords
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!passwordMatch) return null;

          // Return the user object with DB fields you want in the session
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
        // Copy DB fields into the JWT token
        token.id = user.id;
        token.licensePlate = user.licensePlate;
        token.phoneNumber = user.phoneNumber;
        token.secondLicensePlate = user.secondLicensePlate;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      if (!token?.id) return session;

      const result = await query(
        `SELECT license_plate, second_license_plate, phone_number 
        FROM users WHERE id = $1`,
        [token.id]
      );

      if (result?.rowCount) {
        const dbUser = result.rows[0];
        session.user.id = token.id;
        session.user.licensePlate = dbUser.license_plate;
        session.user.secondLicensePlate = dbUser.second_license_plate;
        session.user.phoneNumber = dbUser.phone_number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
