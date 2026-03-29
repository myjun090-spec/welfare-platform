"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  summary: string | null;
  createdAt: string;
  entities: { id: string; name: string; type: string }[];
}

interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  _count: { documents: number };
}

const typeLabels: Record<string, string> = {
  "보고서": "보고서",
  "회의록": "회의록",
  "사례기록": "사례기록",
  "법령": "법령",
  "매뉴얼": "매뉴얼",
};

const typeColors: Record<string, string> = {
  "보고서": "bg-blue-100 text-blue-700",
  "회의록": "bg-green-100 text-green-700",
  "사례기록": "bg-yellow-100 text-yellow-700",
  "법령": "bg-purple-100 text-purple-700",
  "매뉴얼": "bg-red-100 text-red-700",
};

const entityTypeColors: Record<string, string> = {
  "기관": "bg-blue-50 text-blue-600 border-blue-200",
  "서비스": "bg-green-50 text-green-600 border-green-200",
  "대상자유형": "bg-yellow-50 text-yellow-600 border-yellow-200",
  "지역": "bg-purple-50 text-purple-600 border-purple-200",
  "법제도": "bg-red-50 text-red-600 border-red-200",
  "인물": "bg-orange-50 text-orange-600 border-orange-200",
};

export default function KnowledgeDashboardPage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [entities, setEntities] = useState<KnowledgeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [docsRes, entitiesRes] = await Promise.all([
          fetch("/api/knowledge/documents").then((r) => r.json()),
          fetch("/api/knowledge/entities").then((r) => r.json()),
        ]);
        setDocuments(Array.isArray(docsRes) ? docsRes : []);
        setEntities(Array.isArray(entitiesRes) ? entitiesRes : []);
      } catch (err) {
        console.error("Failed to fetch knowledge data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const docsByType = documents.reduce(
    (acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const entitiesByType = entities.reduce(
    (acc, entity) => {
      acc[entity.type] = (acc[entity.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topEntities = [...entities]
    .sort((a, b) => (b._count?.documents || 0) - (a._count?.documents || 0))
    .slice(0, 10);

  const stats = [
    {
      label: "총 문서 수",
      value: loading ? "..." : String(documents.length),
      color: "blue",
    },
    {
      label: "추출된 개체",
      value: loading ? "..." : String(entities.length),
      color: "green",
    },
    {
      label: "문서 유형",
      value: loading ? "..." : String(Object.keys(docsByType).length),
      color: "purple",
    },
    {
      label: "개체 유형",
      value: loading ? "..." : String(Object.keys(entitiesByType).length),
      color: "orange",
    },
  ];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/knowledge/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">지식 베이스</h2>
        <div className="flex gap-3">
          <Link
            href="/knowledge/upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + 문서 업로드
          </Link>
          <Link
            href="/knowledge/search"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            RAG 검색
          </Link>
          <Link
            href="/knowledge/graph"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            지식 그래프
          </Link>
        </div>
      </div>

      {/* Quick Search Bar */}
      <form onSubmit={handleQuickSearch} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white"
            placeholder="지식 베이스에서 빠르게 검색하세요... (Enter로 검색)"
          />
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            검색
          </button>
        </div>
      </form>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Documents */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            최근 등록 문서
          </h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                로딩중...
              </p>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 mb-3">
                  등록된 문서가 없습니다.
                </p>
                <Link
                  href="/knowledge/upload"
                  className="text-blue-600 text-sm underline hover:text-blue-800"
                >
                  첫 문서를 업로드해 보세요
                </Link>
              </div>
            ) : (
              documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {doc.entities.length}개 개체 /{" "}
                      {new Date(doc.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ml-3 ${
                      typeColors[doc.type] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {typeLabels[doc.type] || doc.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Entities */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            주요 개체 (가장 많이 참조)
          </h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                로딩중...
              </p>
            ) : topEntities.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                추출된 개체가 없습니다.
              </p>
            ) : (
              topEntities.map((entity) => (
                <div
                  key={entity.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${
                        entityTypeColors[entity.type] ||
                        "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {entity.type}
                    </span>
                    <span className="text-sm text-gray-900">{entity.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {entity._count?.documents || 0}개 문서
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Document type distribution */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          문서 유형별 분포
        </h3>
        {loading ? (
          <p className="text-sm text-gray-400 py-4 text-center">로딩중...</p>
        ) : Object.keys(docsByType).length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            문서가 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(docsByType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full w-20 text-center ${
                    typeColors[type] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {typeLabels[type] || type}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width: `${Math.max(
                        5,
                        (count / documents.length) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}건
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entity type distribution */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          개체 유형별 분포
        </h3>
        {loading ? (
          <p className="text-sm text-gray-400 py-4 text-center">로딩중...</p>
        ) : Object.keys(entitiesByType).length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            개체가 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {Object.entries(entitiesByType).map(([type, count]) => (
              <div
                key={type}
                className={`p-4 rounded-lg border text-center ${
                  entityTypeColors[type] ||
                  "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs mt-1">{type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
