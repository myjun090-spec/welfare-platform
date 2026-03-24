import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: List volunteers with user info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const volunteers = await prisma.volunteer.findMany({
      where: status ? { status } : undefined,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(volunteers);
  } catch (error) {
    console.error("Failed to list volunteers:", error);
    return NextResponse.json(
      { error: "자원봉사자 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Create volunteer (create user + volunteer profile)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, phone, area, startDate } = body;

    if (!email || !name || !password || !area) {
      return NextResponse.json(
        { error: "email, name, password, area는 필수 항목입니다." },
        { status: 400 }
      );
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        area,
        startDate: startDate ? new Date(startDate) : new Date(),
        user: {
          create: {
            email,
            name,
            password,
            phone,
            role: "volunteer",
          },
        },
      },
      include: { user: true },
    });

    return NextResponse.json(volunteer, { status: 201 });
  } catch (error) {
    console.error("Failed to create volunteer:", error);
    return NextResponse.json(
      { error: "자원봉사자 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
