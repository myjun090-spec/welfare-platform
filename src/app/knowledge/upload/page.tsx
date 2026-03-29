"use client";

import { useState } from "react";
import Link from "next/link";

interface ExtractedEntity {
  name: string;
  type: string;
}

interface ExtractionResult {
  entities: ExtractedEntity[];
  relationships: { from: string; to: string; relation: string }[];
  summary: string;
}

interface UploadResult {
  document: {
    id: string;
    title: string;
    type: string;
    summary: string | null;
    entities: { id: string; name: string; type: string }[];
  };
  extraction: ExtractionResult;
}

const documentTypes = [
  { value: "보고서", label: "보고서" },
  { value: "회의록", label: "회의록" },
  { value: "사례기록", label: "사례기록" },
  { value: "법령", label: "법령" },
  { value: "매뉴얼", label: "매뉴얼" },
];

const entityTypeColors: Record<string, string> = {
  "기관": "bg-blue-100 text-blue-700",
  "서비스": "bg-green-100 text-green-700",
  "대상자유형": "bg-yellow-100 text-yellow-700",
  "지역": "bg-purple-100 text-purple-700",
  "법제도": "bg-red-100 text-red-700",
  "인물": "bg-orange-100 text-orange-700",
};

export default function KnowledgeUploadPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("보고서");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/knowledge/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "업로드 실패");
      }

      const data: UploadResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "문서 업로드에 실패했습니다."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setType("보고서");
    setResult(null);
    setError("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">문서 업로드</h2>
          <p className="text-sm text-gray-500 mt-1">
            문서를 업로드하면 AI가 자동으로 개체와 관계를 추출합니다.
          </p>
        </div>
        <Link
          href="/knowledge"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          목록으로
        </Link>
      </div>

      {!result ? (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  문서 제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="문서 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  문서 유형
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {documentTypes.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                문서 내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                rows={15}
                placeholder="문서 내용을 입력하거나 텍스트를 붙여넣으세요.&#10;&#10;예시:&#10;서울특별시 복지정책과에서는 2024년도 긴급복지지원 사업을 추진하고 있습니다.&#10;주요 대상은 중위소득 75% 이하의 위기가구이며, 긴급복지지원법에 근거하여&#10;의료, 주거, 교육 등의 서비스를 제공합니다..."
              />
              <p className="text-xs text-gray-400 mt-1">
                PDF 문서의 경우 텍스트를 복사하여 붙여넣어 주세요.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? "AI 분석중..." : "AI 분석"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success message */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              문서가 성공적으로 인덱싱되었습니다
            </h3>
            <p className="text-sm text-green-700">
              제목: {result.document.title} ({result.document.type})
            </p>
          </div>

          {/* AI Summary */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              AI 요약
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {result.extraction.summary}
            </p>
          </div>

          {/* Extracted Entities */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              추출된 개체 ({result.extraction.entities.length}개)
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.extraction.entities.map((entity, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                    entityTypeColors[entity.type] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="font-medium">{entity.name}</span>
                  <span className="opacity-60 text-xs">({entity.type})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Extracted Relationships */}
          {result.extraction.relationships.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                추출된 관계 ({result.extraction.relationships.length}개)
              </h3>
              <div className="space-y-2">
                {result.extraction.relationships.map((rel, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="font-medium text-gray-900">
                      {rel.from}
                    </span>
                    <span className="text-gray-400">&rarr;</span>
                    <span className="text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded">
                      {rel.relation}
                    </span>
                    <span className="text-gray-400">&rarr;</span>
                    <span className="font-medium text-gray-900">{rel.to}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              새 문서 업로드
            </button>
            <Link
              href="/knowledge"
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              대시보드로
            </Link>
            <Link
              href="/knowledge/graph"
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              지식 그래프 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
