import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { plate: string } }
) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plate = params.plate;
    if (!plate) {
      return NextResponse.json(
        { error: "License plate is required" },
        { status: 400 }
      );
    }

    // Query the database for users with the given license plate
    const result = await query(
      `SELECT email, phone_number 
       FROM users 
       WHERE license_plate = $1 OR second_license_plate = $1`,
      [plate]
    );

    if (!result?.rows || result.rows.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        email: result.rows[0].email,
        phone_number: result.rows[0].phone_number,
      },
    });
  } catch (error) {
    console.error("Error fetching user by license plate:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
}
