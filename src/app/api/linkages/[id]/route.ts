import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // If status is being changed to "linked", set linkedAt timestamp
    const data = { ...body };
    if (data.status === "linked" && !data.linkedAt) {
      data.linkedAt = new Date();
    }

    const linkage = await prisma.linkage.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, name: true } },
        resource: true,
        consultation: { select: { id: true, step: true } },
      },
    });

    return NextResponse.json(linkage);
  } catch (error) {
    console.error("Failed to update linkage:", error);
    return NextResponse.json(
      { error: "Failed to update linkage" },
      { status: 500 }
    );
  }
}
