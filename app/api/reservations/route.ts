import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { getCurrentUser, requireAuth } from "@/utils/auth";

// GET /api/reservations
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        r.spot_number, 
        r.user_id, 
        r.license_plate,
        u.email,
        u.phone_number
      FROM 
        reservations r
      JOIN 
        users u ON r.user_id = u.id
      WHERE 
        r.reservation_date = $1`,
      [date]
    );

    // Transform the data to match the expected format
    const reservations = result?.rows.map((row) => ({
      spot_number: row.spot_number,
      user_id: row.user_id,
      license_plate: row.license_plate,
      reserved_by: {
        email: row.email,
        phone_number: row.phone_number,
      },
    }));

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

// POST /api/reservations
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { spot_number, license_plate, reservation_date } =
      await request.json();

    if (!spot_number || !license_plate || !reservation_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if spot is already reserved
    const existingReservation = await query(
      "SELECT * FROM reservations WHERE spot_number = $1 AND reservation_date = $2",
      [spot_number, reservation_date]
    );

    if (existingReservation?.rowCount && existingReservation.rowCount > 0) {
      return NextResponse.json(
        { error: "This spot is already reserved" },
        { status: 409 }
      );
    }

    // Create reservation
    await query(
      `INSERT INTO reservations (spot_number, user_id, reservation_date, license_plate) 
       VALUES ($1, $2, $3, $4)`,
      [spot_number, user.id, reservation_date, license_plate]
    );

    return NextResponse.json(
      { message: "Reservation created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

// DELETE /api/reservations
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { spot_number, reservation_date } = await request.json();

    if (!spot_number || !reservation_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if reservation exists and belongs to the user
    const existingReservation = await query(
      "SELECT * FROM reservations WHERE spot_number = $1 AND reservation_date = $2 AND user_id = $3",
      [spot_number, reservation_date, user.id]
    );

    if (!existingReservation?.rowCount || existingReservation.rowCount === 0) {
      return NextResponse.json(
        { error: "Reservation not found or not authorized to delete" },
        { status: 404 }
      );
    }

    // Delete reservation
    await query(
      "DELETE FROM reservations WHERE spot_number = $1 AND reservation_date = $2 AND user_id = $3",
      [spot_number, reservation_date, user.id]
    );

    return NextResponse.json(
      { message: "Reservation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json(
      { error: "Failed to delete reservation" },
      { status: 500 }
    );
  }
}
