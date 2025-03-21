import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { query } from "@/utils/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password, licensePlate, phoneNumber } = await request.json();

    // Validate input
    if (!email || !password || !licensePlate || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (existingUser && existingUser.rowCount && existingUser.rowCount > 0) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate UUID
    const userId = uuidv4();

    // Insert user
    await query(
      `INSERT INTO users (id, email, password, license_plate, phone_number) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, email, hashedPassword, licensePlate.toUpperCase(), phoneNumber]
    );

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
