import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Get project with members, rounds, files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.researchProject.findUnique({
      where: { id },
      include: {
        members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
        rounds: { orderBy: { roundNum: "asc" } },
        files: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "연구 프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to get research project:", error);
    return NextResponse.json(
      { error: "연구 프로젝트 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: Update project (advance round, change status)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, advanceRound } = body;

    if (advanceRound) {
      // Advance to next round: complete current round, start next
      const project = await prisma.researchProject.findUnique({
        where: { id },
        include: { rounds: { orderBy: { roundNum: "asc" } } },
      });

      if (!project) {
        return NextResponse.json(
          { error: "연구 프로젝트를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      if (project.currentRound >= 4) {
        return NextResponse.json(
          { error: "이미 마지막 라운드입니다." },
          { status: 400 }
        );
      }

      const currentRound = project.rounds.find(
        (r) => r.roundNum === project.currentRound
      );
      const nextRound = project.rounds.find(
        (r) => r.roundNum === project.currentRound + 1
      );

      await prisma.$transaction([
        ...(currentRound
          ? [
              prisma.researchRound.update({
                where: { id: currentRound.id },
                data: { status: "completed", endedAt: new Date() },
              }),
            ]
          : []),
        ...(nextRound
          ? [
              prisma.researchRound.update({
                where: { id: nextRound.id },
                data: { status: "in_progress", startedAt: new Date() },
              }),
            ]
          : []),
        prisma.researchProject.update({
          where: { id },
          data: { currentRound: { increment: 1 } },
        }),
      ]);

      const updated = await prisma.researchProject.findUnique({
        where: { id },
        include: {
          members: { include: { user: true } },
          rounds: { orderBy: { roundNum: "asc" } },
          files: true,
        },
      });

      return NextResponse.json(updated);
    }

    // Simple field update
    const updated = await prisma.researchProject.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
      include: {
        members: { include: { user: true } },
        rounds: { orderBy: { roundNum: "asc" } },
        files: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update research project:", error);
    return NextResponse.json(
      { error: "연구 프로젝트 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}
