import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractEntitiesFull } from "@/lib/ai-knowledge";

// POST: Upload document, extract entities via AI, and save
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: "제목, 내용, 유형은 필수입니다." },
        { status: 400 }
      );
    }

    // Extract entities using AI
    const extraction = await extractEntitiesFull(title, content);

    // Create document with entities in a single transaction
    const document = await prisma.knowledgeDocument.create({
      data: {
        title,
        content,
        type,
        summary: extraction.summary || null,
        entities: {
          create: extraction.entities.map((entity) => ({
            name: entity.name,
            type: entity.type,
          })),
        },
      },
      include: {
        entities: true,
      },
    });

    return NextResponse.json(
      {
        document,
        extraction: {
          entities: extraction.entities,
          relationships: extraction.relationships,
          summary: extraction.summary,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to extract and index document:", error);
    return NextResponse.json(
      { error: "문서 분석 및 인덱싱에 실패했습니다." },
      { status: 500 }
    );
  }
}
