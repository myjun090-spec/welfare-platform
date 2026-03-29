"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface SearchSource {
  documentId: string;
  title: string;
  content: string;
  relevanceScore: number;
  matchedEntities: string[];
}

interface RAGResponse {
  answer: string;
  sources: SearchSource[];
  relatedEntities: string[];
}

export default function KnowledgeSearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<RAGResponse | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<
    { query: string; answer: string }[]
  >([]);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setSearching(true);
    setError("");

    try {
      const res = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "검색 실패");
      }

      const data: RAGResponse = await res.json();
      setResult(data);
      setHistory((prev) => [
        { query: q, answer: data.answer },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "검색에 실패했습니다.");
    } finally {
      setSearching(false);
    }
  };

  // Auto-search if query param is provided
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const suggestedQueries = [
    "긴급복지지원 대상자 기준은?",
    "노인돌봄서비스 제공 기관 목록",
    "장애인 자립생활 지원 정책",
    "아동학대 예방 프로그램 현황",
    "지역사회 자원연계 방법",
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">RAG 지식 검색</h2>
          <p className="text-sm text-gray-500 mt-1">
            자연어로 질문하면 지식 베이스에서 관련 정보를 종합하여 답변합니다.
          </p>
        </div>
        <Link
          href="/knowledge"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          대시보드
        </Link>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none"
              rows={2}
              placeholder="복지 관련 질문을 입력하세요... (Enter로 검색)"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={searching || !query.trim()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 self-start"
          >
            {searching ? "검색중..." : "검색"}
          </button>
        </div>

        {/* Suggested queries */}
        {!result && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">추천 질문:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search Result */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* AI Answer */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                  AI
                </span>
                <h3 className="text-lg font-semibold text-gray-900">AI 답변</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {result.answer}
              </p>
            </div>

            {/* Source Documents */}
            {result.sources.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  참조 문서 ({result.sources.length}건)
                </h3>
                <div className="space-y-3">
                  {result.sources.map((source, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {source.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${source.relevanceScore * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(source.relevanceScore * 100)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {source.content}
                      </p>
                      {source.matchedEntities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {source.matchedEntities.slice(0, 5).map((e, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related Entities Sidebar */}
          <div className="space-y-6">
            {result.relatedEntities.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  관련 개체
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.relatedEntities.map((entity, idx) => (
                    <span
                      key={idx}
                      className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search History */}
            {history.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  검색 기록
                </h3>
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                      onClick={() => {
                        setQuery(item.query);
                        handleSearch(item.query);
                      }}
                    >
                      <p className="text-xs font-medium text-gray-900">
                        {item.query}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* If no result yet, show history below */}
      {!result && history.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            검색 기록
          </h3>
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                onClick={() => setQuery(item.query)}
              >
                <p className="text-sm font-medium text-gray-900">
                  {item.query}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
