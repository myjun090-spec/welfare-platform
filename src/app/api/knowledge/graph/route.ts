import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Get graph data (nodes and edges) for knowledge visualization
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");

    const where: Record<string, string> = {};
    if (entityType) where.type = entityType;

    // Fetch entities with their documents
    const entities = await prisma.knowledgeEntity.findMany({
      where,
      include: {
        document: {
          select: { id: true, title: true, type: true },
        },
      },
    });

    // Build unique entity nodes (grouped by name+type)
    const nodeMap = new Map<
      string,
      { id: string; name: string; type: string; documentCount: number }
    >();
    // Track which documents each entity-key belongs to
    const entityDocMap = new Map<string, Set<string>>();

    for (const entity of entities) {
      const key = `${entity.name}::${entity.type}`;
      if (nodeMap.has(key)) {
        const existing = nodeMap.get(key)!;
        existing.documentCount += 1;
      } else {
        nodeMap.set(key, {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          documentCount: 1,
        });
      }

      if (!entityDocMap.has(key)) {
        entityDocMap.set(key, new Set());
      }
      entityDocMap.get(key)!.add(entity.documentId);
    }

    // Build edges: entities that share the same document are connected
    const edges: { source: string; target: string }[] = [];
    const edgeSet = new Set<string>();
    const nodeKeys = Array.from(nodeMap.keys());

    for (let i = 0; i < nodeKeys.length; i++) {
      for (let j = i + 1; j < nodeKeys.length; j++) {
        const docsA = entityDocMap.get(nodeKeys[i])!;
        const docsB = entityDocMap.get(nodeKeys[j])!;

        // Check if they share any document
        let shared = false;
        for (const docId of docsA) {
          if (docsB.has(docId)) {
            shared = true;
            break;
          }
        }

        if (shared) {
          const sourceId = nodeMap.get(nodeKeys[i])!.id;
          const targetId = nodeMap.get(nodeKeys[j])!.id;
          const edgeKey = `${sourceId}-${targetId}`;
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({ source: sourceId, target: targetId });
          }
        }
      }
    }

    return NextResponse.json({
      nodes: Array.from(nodeMap.values()),
      edges,
      entityTypes: ["기관", "서비스", "대상자유형", "지역", "법제도", "인물"],
    });
  } catch (error) {
    console.error("Failed to fetch graph data:", error);
    return NextResponse.json(
      { error: "그래프 데이터 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
