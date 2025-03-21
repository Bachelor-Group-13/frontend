import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { requireAuth } from "@/utils/auth";
import bcrypt from "bcrypt";

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { license_plate, second_license_plate, phone_number, password } =
      await request.json();

    // Validate input
    if (!license_plate || !phone_number) {
      return NextResponse.json(
        { error: "License plate and phone number are required" },
        { status: 400 }
      );
    }

    // Start building the update query
    let updateFields = ["license_plate = $1", "phone_number = $2"];

    let params = [license_plate.toUpperCase(), phone_number];

    // Add second_license_plate if provided
    if (second_license_plate) {
      updateFields.push("second_license_plate = $3");
      params.push(second_license_plate.toUpperCase());
    } else {
      // Set to null if not provided
      updateFields.push("second_license_plate = $3");
      params.push(null);
    }

    // Add password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push("password = $" + (params.length + 1));
      params.push(hashedPassword);
    }

    // Add user ID as the last parameter
    params.push(user.id);

    // Build and execute the update query
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(", ")} 
      WHERE id = $${params.length}
    `;

    await query(updateQuery, params);

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        licensePlate: license_plate,
        secondLicensePlate: second_license_plate || null,
        phoneNumber: phone_number,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
