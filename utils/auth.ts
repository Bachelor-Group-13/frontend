import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { query } from "./db";

export async function getSession() {
  return await getServerSession();
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user?.email) {
    return null;
  }

  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }
  return user;
}

export async function getUserReservations(userId: string) {
  const result = await query(
    `SELECT * FROM reservations WHERE user_id = $1 ORDER BY reservation_date DESC`,
    [userId]
  );
  return result?.rows;
}
