import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: List tasks (filter by status, assignedTo)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");

    const tasks = await prisma.teamTask.findMany({
      where: {
        teamId: id,
        ...(status && { status }),
        ...(assignedTo && { assignedTo }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to list tasks:", error);
    return NextResponse.json(
      { error: "업무 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Create task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, assignedTo, priority, dueDate } = body;

    if (!title) {
      return NextResponse.json(
        { error: "title은 필수 항목입니다." },
        { status: 400 }
      );
    }

    const task = await prisma.teamTask.create({
      data: {
        teamId: id,
        title,
        description,
        assignedTo,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "업무 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
