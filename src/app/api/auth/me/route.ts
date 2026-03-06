import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const username = await getSession();
  if (!username) {
    return NextResponse.json({ admin: null }, { status: 200 });
  }
  return NextResponse.json({ admin: { username } });
}
