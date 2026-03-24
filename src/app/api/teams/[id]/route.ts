import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Get team with members, tasks, outputs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
        tasks: { orderBy: { createdAt: "desc" } },
        outputs: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "팀을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("Failed to get team:", error);
    return NextResponse.json(
      { error: "팀 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: Update team
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        members: { include: { user: true } },
        tasks: true,
        outputs: true,
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("Failed to update team:", error);
    return NextResponse.json(
      { error: "팀 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}
