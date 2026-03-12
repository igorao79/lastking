import { NextResponse } from "next/server";
import { getChapters, getBookMeta } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [chapters, meta] = await Promise.all([getChapters(), getBookMeta()]);
    return NextResponse.json({ chapters, meta });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}
