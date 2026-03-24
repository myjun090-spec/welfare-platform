import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            consultations: true,
            linkages: true,
          },
        },
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, age, gender, familySize, incomeLevel, lifecycle, address, phone, needs, riskLevel } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        age,
        gender,
        familySize,
        incomeLevel,
        lifecycle,
        address,
        phone,
        needs,
        riskLevel,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Failed to create client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
