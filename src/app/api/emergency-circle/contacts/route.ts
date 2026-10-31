import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/emergency-circle/authHelper";
import { createContact, getContactsForUser } from "@/lib/emergency-circle/circleStore";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to access your Emergency Circle." }, { status: 401 });
    }

    const contacts = await getContactsForUser(user.id);
    return NextResponse.json({ success: true, contacts });
  } catch (err: any) {
    console.error("GET /api/emergency-circle/contacts error:", err);
    return NextResponse.json({ error: "Failed to fetch emergency contacts." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const { name, countryCode, phoneNumber, relationship } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a valid contact name (at least 2 characters)." }, { status: 400 });
    }

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });
    }

    const digitsOnly = phoneNumber.replace(/[^0-9]/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 12) {
      return NextResponse.json({ error: "Phone number must be a valid 10-digit mobile number." }, { status: 400 });
    }

    const validRelationships = ["Family", "Friend", "Other"];
    const chosenRel = validRelationships.includes(relationship) ? relationship : "Family";

    const result = await createContact(user.id, {
      name,
      countryCode: countryCode || "+91",
      phoneNumber: digitsOnly,
      relationship: chosenRel,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, contact: result.contact }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/emergency-circle/contacts error:", err);
    return NextResponse.json({ error: "Failed to save emergency contact." }, { status: 500 });
  }
}

