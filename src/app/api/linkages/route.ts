import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    const linkages = await prisma.linkage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        resource: true,
        consultation: { select: { id: true, step: true } },
      },
    });

    return NextResponse.json(linkages);
  } catch (error) {
    console.error("Failed to fetch linkages:", error);
    return NextResponse.json(
      { error: "Failed to fetch linkages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, resourceId, consultationId, assignedTo, memo } = body;

    if (!clientId || !resourceId) {
      return NextResponse.json(
        { error: "clientId and resourceId are required" },
        { status: 400 }
      );
    }

    const linkage = await prisma.linkage.create({
      data: {
        clientId,
        resourceId,
        consultationId,
        assignedTo,
        memo,
        status: "pending",
      },
      include: {
        client: { select: { id: true, name: true } },
        resource: true,
      },
    });

    return NextResponse.json(linkage, { status: 201 });
  } catch (error) {
    console.error("Failed to create linkage:", error);
    return NextResponse.json(
      { error: "Failed to create linkage" },
      { status: 500 }
    );
  }
}
