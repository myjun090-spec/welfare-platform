import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Default templates to seed
const defaultTemplates = [
  {
    name: "사업계획서",
    description: "복지 사업의 목적, 대상, 내용, 예산 등을 포함한 사업계획 문서",
    category: "사업계획",
    structure: JSON.stringify({
      sections: [
        { title: "사업 개요", fields: ["사업명", "사업기간", "사업목적"] },
        { title: "사업 배경 및 필요성", fields: ["현황분석", "필요성"] },
        { title: "사업 대상", fields: ["대상자유형", "선정기준", "인원"] },
        { title: "사업 내용", fields: ["주요프로그램", "세부활동", "일정"] },
        { title: "예산 계획", fields: ["총예산", "항목별예산"] },
        { title: "기대 효과", fields: ["정량적목표", "정성적목표"] },
      ],
    }),
  },
  {
    name: "결과보고서",
    description: "사업 수행 결과를 정리하고 성과를 분석한 보고서",
    category: "결과보고",
    structure: JSON.stringify({
      sections: [
        { title: "사업 개요", fields: ["사업명", "사업기간", "담당자"] },
        { title: "추진 경과", fields: ["주요일정", "추진내용"] },
        { title: "사업 실적", fields: ["참여인원", "활동횟수", "주요성과"] },
        { title: "예산 집행", fields: ["집행총액", "항목별집행"] },
        { title: "평가 및 분석", fields: ["목표달성도", "만족도", "개선점"] },
        { title: "향후 계획", fields: ["개선방향", "차기계획"] },
      ],
    }),
  },
  {
    name: "사례회의록",
    description: "클라이언트 사례에 대한 회의 내용과 결정사항을 기록한 문서",
    category: "회의록",
    structure: JSON.stringify({
      sections: [
        { title: "회의 정보", fields: ["회의일시", "참석자", "회의장소"] },
        { title: "사례 개요", fields: ["대상자정보", "의뢰경위", "주요문제"] },
        { title: "사정 내용", fields: ["욕구분석", "강점", "위험요인"] },
        { title: "서비스 계획", fields: ["목표", "개입방법", "담당자"] },
        { title: "논의 내용", fields: ["주요의견", "쟁점사항"] },
        { title: "결정사항", fields: ["합의내용", "역할분담", "일정"] },
      ],
    }),
  },
  {
    name: "자원연계보고서",
    description: "복지 자원 연계 과정과 결과를 기록한 보고서",
    category: "자원연계",
    structure: JSON.stringify({
      sections: [
        { title: "연계 개요", fields: ["연계일자", "담당자", "연계유형"] },
        {
          title: "대상자 정보",
          fields: ["이름", "연령", "주요욕구", "위기수준"],
        },
        { title: "연계 자원", fields: ["자원명", "자원유형", "제공기관"] },
        { title: "연계 과정", fields: ["접수경위", "사정내용", "연계절차"] },
        { title: "연계 결과", fields: ["서비스내용", "이용자반응"] },
        { title: "모니터링", fields: ["모니터링일정", "추후계획"] },
      ],
    }),
  },
  {
    name: "자원봉사자관리보고서",
    description: "자원봉사자 활동 현황과 관리 내용을 정리한 보고서",
    category: "봉사관리",
    structure: JSON.stringify({
      sections: [
        { title: "보고 개요", fields: ["보고기간", "작성자", "작성일"] },
        { title: "봉사자 현황", fields: ["총인원", "신규", "퇴직", "활동중"] },
        { title: "활동 실적", fields: ["총활동시간", "활동분야", "주요활동"] },
        { title: "교육 및 훈련", fields: ["교육프로그램", "참여인원"] },
        {
          title: "우수사례",
          fields: ["우수봉사자", "활동내용", "성과"],
        },
        { title: "과제 및 계획", fields: ["문제점", "개선방안", "향후계획"] },
      ],
    }),
  },
];

// GET: List all document templates
export async function GET() {
  try {
    let templates = await prisma.documentTemplate.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Auto-seed if no templates exist
    if (templates.length === 0) {
      for (const t of defaultTemplates) {
        await prisma.documentTemplate.create({ data: t });
      }
      templates = await prisma.documentTemplate.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      { error: "템플릿 목록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: Create a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, structure, category } = body;

    if (!name || !description || !structure || !category) {
      return NextResponse.json(
        { error: "이름, 설명, 구조, 카테고리는 필수입니다." },
        { status: 400 }
      );
    }

    const template = await prisma.documentTemplate.create({
      data: { name, description, structure, category },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Failed to create template:", error);
    return NextResponse.json(
      { error: "템플릿 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
