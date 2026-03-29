import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: List all knowledge documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const documents = await prisma.knowledgeDocument.findMany({
      where,
      include: {
        entities: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch knowledge documents:", error);
    return NextResponse.json(
      { error: "문서 목록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Create a new knowledge document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type, summary, entities } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: "제목, 내용, 유형은 필수입니다." },
        { status: 400 }
      );
    }

    const document = await prisma.knowledgeDocument.create({
      data: {
        title,
        content,
        type,
        summary: summary || null,
        ...(entities && entities.length > 0
          ? {
              entities: {
                create: entities.map((e: { name: string; type: string }) => ({
                  name: e.name,
                  type: e.type,
                })),
              },
            }
          : {}),
      },
      include: {
        entities: true,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Failed to create knowledge document:", error);
    return NextResponse.json(
      { error: "문서 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
