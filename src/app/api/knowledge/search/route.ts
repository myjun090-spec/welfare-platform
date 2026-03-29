import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchKnowledge } from "@/lib/ai-knowledge";

// POST: RAG search across knowledge base
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: "검색 질문을 입력해주세요." },
        { status: 400 }
      );
    }

    // Fetch all documents with entities for context
    const documents = await prisma.knowledgeDocument.findMany({
      include: {
        entities: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (documents.length === 0) {
      return NextResponse.json({
        answer: "지식 베이스에 등록된 문서가 없습니다. 먼저 문서를 업로드해주세요.",
        sources: [],
        relatedEntities: [],
      });
    }

    // Prepare documents for RAG
    const docsForRAG = documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      entities: doc.entities.map((e) => e.name),
    }));

    const result = await searchKnowledge(query, docsForRAG);

    return NextResponse.json(result);
  } catch (error) {
    console.error("RAG search failed:", error);
    return NextResponse.json(
      { error: "검색에 실패했습니다." },
      { status: 500 }
    );
  }
}
