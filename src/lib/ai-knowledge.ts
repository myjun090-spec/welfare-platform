import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getModel() {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// ========== Entity Extraction ==========

export interface ExtractedEntity {
  name: string;
  type: "기관" | "서비스" | "대상자유형" | "지역" | "법제도" | "인물";
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  relationships: { from: string; to: string; relation: string }[];
  summary: string;
}

export async function extractEntities(
  content: string
): Promise<{ name: string; type: string }[]> {
  const model = getModel();

  const prompt = `다음 사회복지 관련 문서에서 핵심 개체(Entity)를 추출해주세요.

문서 내용: ${content}

다음 유형의 개체를 추출하세요:
- 기관: 정부기관, 복지관, 병원, 학교 등
- 서비스: 복지 서비스, 프로그램, 지원 사업 등
- 대상자유형: 노인, 아동, 장애인, 저소득층 등
- 지역: 시/도, 구/군, 동/읍/면 등
- 법제도: 관련 법률, 제도, 정책 등
- 인물: 담당자, 관련 인물 등

JSON 형식으로 응답해주세요:
[{"name": "개체명", "type": "유형"}]

JSON 배열만 응답하세요.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as { name: string; type: string }[];
    }
    return [];
  } catch (error) {
    console.error("Entity extraction failed:", error);
    return [];
  }
}

// Full extraction with relationships and summary (used by upload/extract API)
export async function extractEntitiesFull(
  title: string,
  content: string
): Promise<ExtractionResult> {
  const model = getModel();

  const prompt = `다음 사회복지 관련 문서에서 핵심 개체(Entity)와 관계를 추출해주세요.

문서 제목: ${title}
문서 내용: ${content}

다음 유형의 개체를 추출하세요:
- 기관: 정부기관, 복지관, 병원, 학교 등
- 서비스: 복지 서비스, 프로그램, 지원 사업 등
- 대상자유형: 노인, 아동, 장애인, 저소득층 등
- 지역: 시/도, 구/군, 동/읍/면 등
- 법제도: 관련 법률, 제도, 정책 등
- 인물: 담당자, 관련 인물 등

JSON 형식으로 응답해주세요:
{
  "entities": [{"name": "개체명", "type": "유형"}],
  "relationships": [{"from": "개체1", "to": "개체2", "relation": "관계설명"}],
  "summary": "문서 요약 (2-3문장)"
}

JSON만 응답하세요.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ExtractionResult;
    }
    return { entities: [], relationships: [], summary: "추출 실패" };
  } catch (error) {
    console.error("Entity extraction failed:", error);
    return { entities: [], relationships: [], summary: "AI 호출 실패" };
  }
}

// ========== RAG Search ==========

export interface SearchResult {
  documentId: string;
  title: string;
  content: string;
  relevanceScore: number;
  matchedEntities: string[];
}

export interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  relatedEntities: string[];
}

export async function searchKnowledge(
  query: string,
  documents: { id: string; title: string; content: string; entities: string[] }[]
): Promise<RAGResponse> {
  const model = getModel();

  const docContext = documents
    .map(
      (doc, i) =>
        `[문서${i + 1}] 제목: ${doc.title}\n내용: ${doc.content.slice(0, 500)}\n관련 개체: ${doc.entities.join(", ")}`
    )
    .join("\n\n");

  const prompt = `사회복지 지식 베이스에서 다음 질문에 답변해주세요.

질문: ${query}

참고 문서들:
${docContext}

다음 JSON 형식으로 응답해주세요:
{
  "answer": "질문에 대한 종합적인 답변 (한국어, 2-4문장)",
  "sources": [
    {"documentIndex": 0, "relevanceScore": 0.95, "reason": "관련 이유"}
  ],
  "relatedEntities": ["관련 개체1", "관련 개체2"]
}

JSON만 응답하세요.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const sources: SearchResult[] = (
        parsed.sources || []
      ).map(
        (s: { documentIndex: number; relevanceScore: number; reason?: string }) => {
          const doc = documents[s.documentIndex];
          return {
            documentId: doc?.id || "",
            title: doc?.title || "",
            content: doc?.content?.slice(0, 200) || "",
            relevanceScore: s.relevanceScore || 0,
            matchedEntities: doc?.entities || [],
          };
        }
      );
      return {
        answer: parsed.answer || "답변을 생성할 수 없습니다.",
        sources,
        relatedEntities: parsed.relatedEntities || [],
      };
    }
    return {
      answer: "답변을 생성할 수 없습니다.",
      sources: [],
      relatedEntities: [],
    };
  } catch (error) {
    console.error("RAG search failed:", error);
    return {
      answer: "AI 검색 중 오류가 발생했습니다.",
      sources: [],
      relatedEntities: [],
    };
  }
}

// ========== Document Generation ==========

export interface GenerateDocumentInput {
  templateName: string;
  templateStructure: string;
  inputs: Record<string, string>;
  knowledgeContext?: string;
}

export async function generateDocument(
  template: { name: string; structure: string } | GenerateDocumentInput,
  context?: string,
  userInputs?: Record<string, string>
): Promise<string> {
  const model = getModel();

  // Support both call signatures
  const templateName = "templateName" in template ? template.templateName : template.name;
  const templateStructure = "templateStructure" in template ? template.templateStructure : template.structure;
  const inputs = userInputs || ("inputs" in template ? template.inputs : {});
  const knowledgeContext = context || ("knowledgeContext" in template ? template.knowledgeContext : undefined);

  const prompt = `사회복지 분야의 전문 문서를 생성해주세요.

문서 유형: ${templateName}
문서 구조: ${templateStructure}

사용자 입력:
${Object.entries(inputs)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

${knowledgeContext ? `참고 지식:\n${knowledgeContext}` : ""}

위 정보를 바탕으로 완성도 높은 전문 문서를 작성해주세요.
- 한국어로 작성
- 공식적인 문체 사용
- 구체적인 내용 포함
- 마크다운 형식 사용

문서 내용만 응답하세요.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Document generation failed:", error);
    return "문서 생성에 실패했습니다. API 키를 확인하거나 다시 시도해주세요.";
  }
}

// ========== Document Summarization ==========

export async function summarizeDocument(content: string): Promise<string> {
  const model = getModel();

  const prompt = `다음 사회복지 관련 문서를 요약해주세요.

${content.slice(0, 2000)}

한국어로 2-3문장으로 핵심 내용을 요약하세요.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Summarization failed:", error);
    return "요약 생성에 실패했습니다.";
  }
}

export async function summarizeDocuments(
  documents: { title: string; content: string }[]
): Promise<string> {
  const model = getModel();

  const docList = documents
    .map((doc, i) => `[${i + 1}] ${doc.title}: ${doc.content.slice(0, 300)}`)
    .join("\n");

  const prompt = `다음 사회복지 관련 문서들을 종합적으로 요약해주세요.

${docList}

한국어로 3-5문장으로 핵심 내용을 요약하세요.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Summarization failed:", error);
    return "요약 생성에 실패했습니다.";
  }
}
