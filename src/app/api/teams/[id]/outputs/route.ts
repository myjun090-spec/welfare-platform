import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VALID_TYPES = ["code", "report", "minutes"];

// GET: List outputs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const outputs = await prisma.teamOutput.findMany({
      where: { teamId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(outputs);
  } catch (error) {
    console.error("Failed to list outputs:", error);
    return NextResponse.json(
      { error: "산출물 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Create output (code, report, minutes)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, title, content, filePath, author } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: "type과 title은 필수 항목입니다." },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        {
          error: `유효하지 않은 타입입니다. 가능한 타입: ${VALID_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const output = await prisma.teamOutput.create({
      data: {
        teamId: id,
        type,
        title,
        content,
        filePath,
        author,
      },
    });

    return NextResponse.json(output, { status: 201 });
  } catch (error) {
    console.error("Failed to create output:", error);
    return NextResponse.json(
      { error: "산출물 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
