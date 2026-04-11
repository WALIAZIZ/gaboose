import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, roomType, checkIn, checkOut, notes } = body;

    // Validate required fields
    if (!name || !phone || !roomType || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    if (checkInDate < new Date(new Date().toDateString())) {
      return NextResponse.json(
        { error: "Check-in date cannot be in the past" },
        { status: 400 }
      );
    }

    const booking = await db.booking.create({
      data: {
        name,
        phone,
        roomType,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: 1,
        notes: notes || null,
        status: "pending",
      },
    });

    return NextResponse.json(
      { message: "Booking submitted successfully!", bookingId: booking.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to submit booking. Please try again." },
      { status: 500 }
    );
  }
}