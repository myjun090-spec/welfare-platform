import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const consultation = await prisma.consultation.update({
      where: { id },
      data: body,
      include: {
        client: { select: { id: true, name: true } },
        worker: { select: { id: true, name: true, email: true } },
        linkages: {
          include: { resource: true },
        },
      },
    });

    return NextResponse.json(consultation);
  } catch (error) {
    console.error("Failed to update consultation:", error);
    return NextResponse.json(
      { error: "Failed to update consultation" },
      { status: 500 }
    );
  }
}
