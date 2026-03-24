import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: List activities for a volunteer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const activities = await prisma.volunteerActivity.findMany({
      where: { volunteerId: id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to list activities:", error);
    return NextResponse.json(
      { error: "활동 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Add activity (auto-update totalHours on volunteer)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date, hours, location, description } = body;

    if (!date || hours === undefined) {
      return NextResponse.json(
        { error: "date와 hours는 필수 항목입니다." },
        { status: 400 }
      );
    }

    const [activity] = await prisma.$transaction([
      prisma.volunteerActivity.create({
        data: {
          volunteerId: id,
          date: new Date(date),
          hours: Number(hours),
          location,
          description,
        },
      }),
      prisma.volunteer.update({
        where: { id },
        data: {
          totalHours: { increment: Number(hours) },
        },
      }),
    ]);

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to add activity:", error);
    return NextResponse.json(
      { error: "활동 추가에 실패했습니다." },
      { status: 500 }
    );
  }
}
