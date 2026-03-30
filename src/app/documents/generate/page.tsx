"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";


interface Template {
  id: string;
  name: string;
  description: string;
  structure: string;
  category: string;
}

interface TemplateStructure {
  sections: {
    title: string;
    fields: string[];
  }[];
}

interface GeneratedDoc {
  id: string;
  title: string;
  content: string;
  templateId: string | null;
  createdAt: string;
}

function DocumentGenerateContent() {
  const searchParams = useSearchParams();
  const preselectedTemplateId = searchParams.get("templateId");
  const docId = searchParams.get("docId");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDoc | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const templatesRes = await fetch("/api/documents/templates").then((r) =>
          r.json()
        );
        const templateList = Array.isArray(templatesRes) ? templatesRes : [];
        setTemplates(templateList);

        // Pre-select template if provided
        if (preselectedTemplateId) {
          const found = templateList.find(
            (t: Template) => t.id === preselectedTemplateId
          );
          if (found) {
            setSelectedTemplate(found);
          }
        }

        // Load existing document if docId provided
        if (docId) {
          const docsRes = await fetch("/api/documents/generate").then((r) =>
            r.json()
          );
          const docs = Array.isArray(docsRes) ? docsRes : [];
          const doc = docs.find((d: GeneratedDoc) => d.id === docId);
          if (doc) {
            setGeneratedDoc(doc);
            setEditContent(doc.content);
            setTitle(doc.title);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [preselectedTemplateId, docId]);

  const getStructure = (template: Template): TemplateStructure | null => {
    try {
      return JSON.parse(template.structure);
    } catch {
      return null;
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setInputs({});
    setTitle("");
    setGeneratedDoc(null);
    setEditContent("");
  };

  const handleInputChange = (field: string, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !title.trim()) {
      setError("템플릿과 문서 제목은 필수입니다.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          title,
          inputs,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "생성 실패");
      }

      const doc: GeneratedDoc = await res.json();
      setGeneratedDoc(doc);
      setEditContent(doc.content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "문서 생성에 실패했습니다."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    const content = editContent || generatedDoc?.content || "";
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = async () => {
    const content = editContent || generatedDoc?.content || "";
    const res = await fetch("/api/documents/export-hwpx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, title: title || "문서" }),
    });
    if (!res.ok) {
      setError("HWPX 내보내기에 실패했습니다.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "문서"}.hwpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">로딩중...</p>
      </div>
    );
  }

  // Show generated document view
  if (generatedDoc) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              AI가 생성한 문서를 검토하고 수정할 수 있습니다.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              {copied ? "복사됨!" : "복사"}
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              다운로드 (.hwpx)
            </button>
            <Link
              href="/documents"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              목록으로
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono leading-relaxed"
            rows={30}
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              setGeneratedDoc(null);
              setEditContent("");
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            새 문서 생성
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI 문서 생성</h2>
          <p className="text-sm text-gray-500 mt-1">
            템플릿을 선택하고 기본 정보를 입력하면 AI가 전문 문서를 생성합니다.
          </p>
        </div>
        <Link
          href="/documents"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          목록으로
        </Link>
      </div>

      {/* Step 1: Select Template */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          1. 템플릿 선택
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedTemplate?.id === template.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h4 className="font-medium text-gray-900 text-sm">
                {template.name}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {template.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Input Fields */}
      {selectedTemplate && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            2. 기본 정보 입력 - {selectedTemplate.name}
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              문서 제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="예: 2024년 1분기 긴급복지지원 사업계획서"
            />
          </div>

          {(() => {
            const structure = getStructure(selectedTemplate);
            if (!structure) return null;

            return (
              <div className="space-y-6">
                {structure.sections.map((section, sIdx) => (
                  <div key={sIdx}>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                      {section.title}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.fields.map((field) => (
                        <div key={field}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {field}
                          </label>
                          <input
                            type="text"
                            value={inputs[field] || ""}
                            onChange={(e) =>
                              handleInputChange(field, e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder={`${field}을(를) 입력하세요`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? "AI 문서 생성중..." : "AI 생성"}
            </button>
            <p className="text-xs text-gray-400 self-center">
              * 모든 필드를 채우지 않아도 AI가 내용을 보완합니다. 핵심 정보만
              입력해도 됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import { Suspense } from "react";

export default function DocumentGeneratePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><p className="text-gray-400">로딩중...</p></div>}>
      <DocumentGenerateContent />
    </Suspense>
  );
}
