import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: List all entities, optionally filter by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: Record<string, string> = {};
    if (type) where.type = type;

    const entities = await prisma.knowledgeEntity.findMany({
      where,
      include: {
        document: {
          select: { id: true, title: true, type: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group entities by name+type to get counts
    const entityMap = new Map<
      string,
      {
        id: string;
        name: string;
        type: string;
        documents: { id: string; title: string; type: string }[];
        _count: { documents: number };
      }
    >();

    for (const entity of entities) {
      const key = `${entity.name}::${entity.type}`;
      if (entityMap.has(key)) {
        const existing = entityMap.get(key)!;
        existing.documents.push(entity.document);
        existing._count.documents = existing.documents.length;
      } else {
        entityMap.set(key, {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          documents: [entity.document],
          _count: { documents: 1 },
        });
      }
    }

    return NextResponse.json(Array.from(entityMap.values()));
  } catch (error) {
    console.error("Failed to fetch entities:", error);
    return NextResponse.json(
      { error: "개체 목록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Create a new entity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, documentId } = body;

    if (!name || !type || !documentId) {
      return NextResponse.json(
        { error: "이름, 유형, 문서 ID는 필수입니다." },
        { status: 400 }
      );
    }

    const entity = await prisma.knowledgeEntity.create({
      data: {
        name,
        type,
        documentId,
      },
      include: {
        document: true,
      },
    });

    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    console.error("Failed to create entity:", error);
    return NextResponse.json(
      { error: "개체 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
