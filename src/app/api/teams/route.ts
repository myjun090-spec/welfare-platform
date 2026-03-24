import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: List teams with member count
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Failed to list teams:", error);
    return NextResponse.json(
      { error: "팀 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Create team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name은 필수 항목입니다." },
        { status: 400 }
      );
    }

    const team = await prisma.team.create({
      data: { name, description },
      include: {
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("Failed to create team:", error);
    return NextResponse.json(
      { error: "팀 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
