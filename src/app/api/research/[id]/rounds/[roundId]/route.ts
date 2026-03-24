import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT: Update round (status, notes/scribe records)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const { id, roundId } = await params;
    const body = await request.json();
    const { status, notes, startedAt, endedAt } = body;

    // Verify round belongs to project
    const existing = await prisma.researchRound.findFirst({
      where: { id: roundId, projectId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "해당 라운드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const round = await prisma.researchRound.update({
      where: { id: roundId },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(startedAt !== undefined && { startedAt: new Date(startedAt) }),
        ...(endedAt !== undefined && { endedAt: new Date(endedAt) }),
      },
    });

    return NextResponse.json(round);
  } catch (error) {
    console.error("Failed to update research round:", error);
    return NextResponse.json(
      { error: "라운드 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}
