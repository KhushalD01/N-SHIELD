import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/emergency-circle/authHelper";
import { deleteContact, updateContact } from "@/lib/emergency-circle/circleStore";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const result = await updateContact(user.id, id, body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, contact: result.contact });
  } catch (err: any) {
    console.error("PATCH /api/emergency-circle/contacts/[id] error:", err);
    return NextResponse.json({ error: "Failed to update contact." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteContact(user.id, id);

    if (!deleted) {
      return NextResponse.json({ error: "Contact not found or already removed." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Contact removed from Emergency Circle." });
  } catch (err: any) {
    console.error("DELETE /api/emergency-circle/contacts/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete contact." }, { status: 500 });
  }
}

