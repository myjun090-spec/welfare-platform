import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        consultations: {
          orderBy: { createdAt: "desc" },
          include: {
            worker: { select: { id: true, name: true, email: true } },
          },
        },
        linkages: {
          orderBy: { createdAt: "desc" },
          include: {
            resource: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Failed to fetch client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const client = await prisma.client.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Failed to update client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}
