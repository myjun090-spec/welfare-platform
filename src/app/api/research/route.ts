import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: List research projects with member count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const projects = await prisma.researchProject.findMany({
      where: status ? { status } : undefined,
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to list research projects:", error);
    return NextResponse.json(
      { error: "연구 프로젝트 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Create research project (auto-create 4 rounds)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: "title은 필수 항목입니다." },
        { status: 400 }
      );
    }

    const roundTitles = [
      "1R: 주제 선정 및 문헌 탐색",
      "2R: 자료 수집 및 분석",
      "3R: 초고 작성 및 검토",
      "4R: 최종 수정 및 완성",
    ];

    const project = await prisma.researchProject.create({
      data: {
        title,
        description,
        rounds: {
          create: roundTitles.map((roundTitle, index) => ({
            roundNum: index + 1,
            title: roundTitle,
            status: index === 0 ? "in_progress" : "pending",
          })),
        },
      },
      include: {
        rounds: { orderBy: { roundNum: "asc" } },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create research project:", error);
    return NextResponse.json(
      { error: "연구 프로젝트 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
