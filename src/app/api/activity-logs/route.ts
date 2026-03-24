import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: List activity logs (filter by module)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get("module");

    const logs = await prisma.activityLog.findMany({
      where: module ? { module } : undefined,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to list activity logs:", error);
    return NextResponse.json(
      { error: "활동 로그를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Create log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, module, action, target, details } = body;

    if (!module || !action) {
      return NextResponse.json(
        { error: "module과 action은 필수 항목입니다." },
        { status: 400 }
      );
    }

    const log = await prisma.activityLog.create({
      data: {
        userId,
        module,
        action,
        target,
        details,
      },
      include: { user: true },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity log:", error);
    return NextResponse.json(
      { error: "활동 로그 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
