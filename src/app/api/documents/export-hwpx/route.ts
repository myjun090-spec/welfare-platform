import { NextRequest, NextResponse } from "next/server";
import { markdownToHwpx } from "kordoc";

export async function POST(request: NextRequest) {
  try {
    const { content, title } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const hwpxBuffer = await markdownToHwpx(content);

    return new NextResponse(hwpxBuffer, {
      headers: {
        "Content-Type": "application/hwp+zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title || "문서")}.hwpx"`,
      },
    });
  } catch (error) {
    console.error("HWPX export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
