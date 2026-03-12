import { NextResponse } from "next/server";
import { getChapter } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const chapter = await getChapter(parseInt(number, 10));
    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}
