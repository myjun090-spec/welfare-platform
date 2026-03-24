import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Get volunteer with activities and reports
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: {
        user: true,
        activities: { orderBy: { date: "desc" } },
        reports: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!volunteer) {
      return NextResponse.json(
        { error: "자원봉사자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(volunteer);
  } catch (error) {
    console.error("Failed to get volunteer:", error);
    return NextResponse.json(
      { error: "자원봉사자 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: Update volunteer status/area
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, area } = body;

    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(area !== undefined && { area }),
      },
      include: { user: true },
    });

    return NextResponse.json(volunteer);
  } catch (error) {
    console.error("Failed to update volunteer:", error);
    return NextResponse.json(
      { error: "자원봉사자 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}
