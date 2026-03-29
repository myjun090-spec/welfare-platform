"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] text-gray-400">
      그래프 로딩중...
    </div>
  ),
});

interface GraphNode {
  id: string;
  name: string;
  type: string;
  documentCount: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  entityTypes: string[];
}

interface NodeDocuments {
  id: string;
  title: string;
  type: string;
}

const entityTypeColors: Record<string, string> = {
  "기관": "#3B82F6",
  "서비스": "#10B981",
  "대상자유형": "#F59E0B",
  "지역": "#8B5CF6",
  "법제도": "#EF4444",
  "인물": "#F97316",
};

const entityTypeBgColors: Record<string, string> = {
  "기관": "bg-blue-100 text-blue-700 border-blue-300",
  "서비스": "bg-green-100 text-green-700 border-green-300",
  "대상자유형": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "지역": "bg-purple-100 text-purple-700 border-purple-300",
  "법제도": "bg-red-100 text-red-700 border-red-300",
  "인물": "bg-orange-100 text-orange-700 border-orange-300",
};

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [nodeDocuments, setNodeDocuments] = useState<NodeDocuments[]>([]);
  const graphRef = useRef<{ d3ReheatSimulation: () => void } | null>(null);

  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.set("entityType", selectedType);
      const res = await fetch(
        `/api/knowledge/graph${params.toString() ? `?${params}` : ""}`
      );
      if (res.ok) {
        const data: GraphData = await res.json();
        setGraphData(data);
      }
    } catch (err) {
      console.error("Failed to fetch graph data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const handleNodeClick = useCallback(
    async (node: { id?: string; name?: string; type?: string; documentCount?: number }) => {
      const graphNode = node as GraphNode;
      setSelectedNode(graphNode);

      // Fetch documents for this entity
      try {
        const res = await fetch("/api/knowledge/entities");
        if (res.ok) {
          const entities = await res.json();
          // Match by name+type since ids may differ for grouped entities
          const entity = entities.find(
            (e: { id: string; name: string; type: string; documents: NodeDocuments[] }) =>
              e.name === graphNode.name && e.type === graphNode.type
          );
          if (entity) {
            setNodeDocuments(entity.documents || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch node documents:", err);
      }
    },
    []
  );

  // Transform data for ForceGraph2D
  const forceGraphData = graphData
    ? {
        nodes: graphData.nodes.map((n) => ({
          id: n.id,
          name: n.name,
          type: n.type,
          documentCount: n.documentCount,
          val: Math.max(3, n.documentCount * 2 + 3),
        })),
        links: graphData.edges.map((e) => ({
          source: e.source,
          target: e.target,
        })),
      }
    : { nodes: [], links: [] };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">지식 그래프</h2>
          <p className="text-sm text-gray-500 mt-1">
            개체 간 관계를 시각적으로 탐색합니다. 노드를 클릭하면 관련 문서를 볼
            수 있습니다.
          </p>
        </div>
        <Link
          href="/knowledge"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          대시보드
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            개체 유형 필터:
          </span>
          <button
            onClick={() => setSelectedType("")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              selectedType === ""
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            전체
          </button>
          {(graphData?.entityTypes || ["기관", "서비스", "대상자유형", "지역", "법제도"]).map(
            (type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type === selectedType ? "" : type)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedType === type
                    ? entityTypeBgColors[type] || "bg-gray-200 text-gray-800 border-gray-400"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-[500px] text-gray-400">
              그래프 데이터 로딩중...
            </div>
          ) : !graphData || graphData.nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
              <p className="mb-3">표시할 개체가 없습니다.</p>
              <Link
                href="/knowledge/upload"
                className="text-blue-600 text-sm underline hover:text-blue-800"
              >
                문서를 업로드하여 개체를 추출해 보세요
              </Link>
            </div>
          ) : (
            <ForceGraph2D
              ref={graphRef as React.MutableRefObject<never>}
              graphData={forceGraphData}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              nodeLabel={(node: any) =>
                `${node.name} (${node.type}) - ${node.documentCount || 0}개 문서`
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              nodeColor={(node: any) =>
                entityTypeColors[node.type || ""] || "#9CA3AF"
              }
              nodeRelSize={6}
              linkColor={() => "#E5E7EB"}
              linkWidth={1.5}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onNodeClick={(node: any) => handleNodeClick(node)}
              width={typeof window !== "undefined" ? Math.min(window.innerWidth * 0.55, 800) : 800}
              height={500}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const label = node.name || "";
                const fontSize = Math.max(10 / globalScale, 3);
                const size = (node.val || 5) / 1.5;
                const color = entityTypeColors[node.type || ""] || "#9CA3AF";

                // Node circle
                ctx.beginPath();
                ctx.arc(node.x || 0, node.y || 0, size, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 1.5 / globalScale;
                ctx.stroke();

                // Label
                ctx.font = `${fontSize}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = "#374151";
                ctx.fillText(label, node.x || 0, (node.y || 0) + size + 2);
              }}
            />
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Legend */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">범례</h3>
            <div className="space-y-2">
              {Object.entries(entityTypeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-700">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          {graphData && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                그래프 통계
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">노드 수</span>
                  <span className="font-medium text-gray-900">
                    {graphData.nodes.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">연결 수</span>
                  <span className="font-medium text-gray-900">
                    {graphData.edges.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Node Details */}
          {selectedNode && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                선택된 개체
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedNode.name}
                  </p>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${
                      entityTypeBgColors[selectedNode.type] ||
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {selectedNode.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  관련 문서: {selectedNode.documentCount}개
                </p>

                {nodeDocuments.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      관련 문서 목록:
                    </p>
                    <div className="space-y-1">
                      {nodeDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="text-xs text-gray-600 py-1 border-b border-gray-100 last:border-0"
                        >
                          {doc.title}
                          <span className="text-gray-400 ml-1">
                            ({doc.type})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
