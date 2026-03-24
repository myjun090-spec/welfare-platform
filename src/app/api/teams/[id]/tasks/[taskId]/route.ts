import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT: Update task (status, assignedTo, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params;
    const body = await request.json();
    const { title, description, assignedTo, status, priority, dueDate } = body;

    // Verify task belongs to team
    const existing = await prisma.teamTask.findFirst({
      where: { id: taskId, teamId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "해당 업무를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const task = await prisma.teamTask.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "업무 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}
