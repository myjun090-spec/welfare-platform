import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { linkages: true },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Failed to fetch resource:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
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

    const resource = await prisma.resource.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Failed to update resource:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resource = await prisma.resource.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
