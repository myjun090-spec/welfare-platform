import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VALID_ROLES = [
  "coordinator",
  "scout",
  "analyst",
  "writer",
  "critic",
  "scribe",
];

// GET: List members with user info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const members = await prisma.researchMember.findMany({
      where: { projectId: id },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to list research members:", error);
    return NextResponse.json(
      { error: "연구 멤버 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Add member with role
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId와 role은 필수 항목입니다." },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          error: `유효하지 않은 역할입니다. 가능한 역할: ${VALID_ROLES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const member = await prisma.researchMember.create({
      data: {
        projectId: id,
        userId,
        role,
      },
      include: { user: true },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Failed to add research member:", error);
    return NextResponse.json(
      { error: "연구 멤버 추가에 실패했습니다." },
      { status: 500 }
    );
  }
}
