import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDocument } from "@/lib/ai-knowledge";

// POST: Generate a document from template using AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, inputs, title } = body;

    if (!templateId || !inputs || !title) {
      return NextResponse.json(
        { error: "템플릿 ID, 입력값, 제목은 필수입니다." },
        { status: 400 }
      );
    }

    // Fetch template
    const template = await prisma.documentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "템플릿을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Fetch knowledge context (recent documents for context)
    const knowledgeDocs = await prisma.knowledgeDocument.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { title: true, content: true },
    });

    const knowledgeContext = knowledgeDocs.length > 0
      ? knowledgeDocs
          .map((d) => `[${d.title}]: ${d.content.slice(0, 300)}`)
          .join("\n")
      : undefined;

    // Generate document content via AI
    const content = await generateDocument({
      templateName: template.name,
      templateStructure: template.structure,
      inputs,
      knowledgeContext,
    });

    // Save generated document
    const document = await prisma.generatedDocument.create({
      data: {
        templateId,
        title,
        content,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Failed to generate document:", error);
    return NextResponse.json(
      { error: "문서 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

// GET: List generated documents
export async function GET() {
  try {
    const documents = await prisma.generatedDocument.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch generated documents:", error);
    return NextResponse.json(
      { error: "문서 목록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
