import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const ageRange = searchParams.get("ageRange");
    const incomeLevel = searchParams.get("incomeLevel");
    const lifecycle = searchParams.get("lifecycle");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { isActive: true };

    if (type) where.type = type;
    if (ageRange) where.ageRange = ageRange;
    if (incomeLevel) where.incomeLevel = incomeLevel;
    if (lifecycle) where.lifecycle = lifecycle;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { target: { contains: search } },
      ];
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, category, target, ageRange, incomeLevel, lifecycle, description, howToApply, contact, manager } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "name and type are required" },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        type,
        category,
        target,
        ageRange,
        incomeLevel,
        lifecycle,
        description,
        howToApply,
        contact,
        manager,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Failed to create resource:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}
