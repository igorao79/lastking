import { NextResponse } from "next/server";
import { getChapters, getBookMeta, hasQueuePending } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [chapters, meta, generating] = await Promise.all([
      getChapters(),
      getBookMeta(),
      hasQueuePending(),
    ]);
    return NextResponse.json({ chapters, meta, generating });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}
