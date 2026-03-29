"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  description: string;
  structure: string;
  category: string;
  createdAt: string;
}

interface GeneratedDoc {
  id: string;
  templateId: string | null;
  title: string;
  content: string;
  createdAt: string;
}

const templateIcons: Record<string, string> = {
  "사업계획서": "📋",
  "결과보고서": "📊",
  "사례회의록": "📝",
  "자원연계보고서": "🔗",
  "자원봉사자관리보고서": "🤝",
};

const categoryColors: Record<string, string> = {
  "사업계획": "bg-blue-100 text-blue-700",
  "결과보고": "bg-green-100 text-green-700",
  "회의록": "bg-yellow-100 text-yellow-700",
  "자원연계": "bg-purple-100 text-purple-700",
  "봉사관리": "bg-orange-100 text-orange-700",
};

export default function DocumentsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [templatesRes, docsRes] = await Promise.all([
          fetch("/api/documents/templates").then((r) => r.json()),
          fetch("/api/documents/generate").then((r) => r.json()),
        ]);
        setTemplates(Array.isArray(templatesRes) ? templatesRes : []);
        setGeneratedDocs(Array.isArray(docsRes) ? docsRes : []);
      } catch (err) {
        console.error("Failed to fetch documents data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">문서 자동 생성</h2>
        <Link
          href="/documents/generate"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + 새 문서 생성
        </Link>
      </div>

      {/* Templates */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          문서 템플릿
        </h3>
        {loading ? (
          <p className="text-sm text-gray-400 py-4 text-center">로딩중...</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            사용 가능한 템플릿이 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const structure = (() => {
                try {
                  return JSON.parse(template.structure);
                } catch {
                  return null;
                }
              })();
              const sectionCount = structure?.sections?.length || 0;

              return (
                <Link
                  key={template.id}
                  href={`/documents/generate?templateId=${template.id}`}
                  className="p-5 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">
                      {templateIcons[template.name] || "📄"}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                        {template.name}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          categoryColors[template.category] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{sectionCount}개 섹션</span>
                    <span className="text-blue-600 group-hover:text-blue-700">
                      생성하기 &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Generated Documents */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          생성된 문서 ({generatedDocs.length}건)
        </h3>
        {loading ? (
          <p className="text-sm text-gray-400 py-4 text-center">로딩중...</p>
        ) : generatedDocs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-3">
              생성된 문서가 없습니다.
            </p>
            <Link
              href="/documents/generate"
              className="text-blue-600 text-sm underline hover:text-blue-800"
            >
              첫 문서를 생성해 보세요
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(doc.createdAt).toLocaleDateString("ko-KR")} /{" "}
                    {doc.content.length.toLocaleString()}자
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <Link
                    href={`/documents/generate?docId=${doc.id}`}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
