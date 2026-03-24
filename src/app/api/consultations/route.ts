import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");

    const where: Record<string, unknown> = {};
    if (clientId) where.clientId = clientId;

    const consultations = await prisma.consultation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        worker: { select: { id: true, name: true, email: true } },
        linkages: {
          include: { resource: true },
        },
      },
    });

    return NextResponse.json(consultations);
  } catch (error) {
    console.error("Failed to fetch consultations:", error);
    return NextResponse.json(
      { error: "Failed to fetch consultations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, workerId, step, notes, conditions } = body;

    if (!clientId || !workerId) {
      return NextResponse.json(
        { error: "clientId and workerId are required" },
        { status: 400 }
      );
    }

    const consultation = await prisma.consultation.create({
      data: {
        clientId,
        workerId,
        step: step ?? 1,
        notes,
        conditions,
      },
      include: {
        client: { select: { id: true, name: true } },
        worker: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    console.error("Failed to create consultation:", error);
    return NextResponse.json(
      { error: "Failed to create consultation" },
      { status: 500 }
    );
  }
}
