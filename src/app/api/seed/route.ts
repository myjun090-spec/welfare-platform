import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const sampleResources = [
  {
    name: "긴급복지지원",
    type: "government",
    category: "긴급복지",
    target: "위기상황 가구",
    ageRange: "전연령",
    incomeLevel: "기준중위소득 75% 이하",
    lifecycle: "전생애",
    description: "생계곤란 등 위기상황에 처한 저소득 가구에 생계·의료·주거 등 필요한 복지서비스를 신속하게 지원",
    howToApply: "주민센터 방문 또는 129 전화",
    contact: "보건복지콜센터 129",
    manager: "보건복지부",
  },
  {
    name: "기초생활보장 생계급여",
    type: "government",
    category: "생계지원",
    target: "기초생활수급자",
    ageRange: "전연령",
    incomeLevel: "기준중위소득 30% 이하",
    lifecycle: "전생애",
    description: "생활이 어려운 사람에게 일상생활에 기본적으로 필요한 금품을 지급하여 최저생활을 보장",
    howToApply: "주민센터 방문 신청",
    contact: "주민센터",
    manager: "보건복지부",
  },
  {
    name: "노인돌봄종합서비스",
    type: "government",
    category: "돌봄",
    target: "65세 이상 노인",
    ageRange: "65세 이상",
    incomeLevel: "기준중위소득 160% 이하",
    lifecycle: "노년기",
    description: "혼자 힘으로 일상생활을 영위하기 어려운 노인에게 가사·활동지원 등 종합적인 서비스 제공",
    howToApply: "주민센터 또는 국민건강보험공단 신청",
    contact: "국민건강보험공단 1577-1000",
    manager: "보건복지부",
  },
  {
    name: "아이돌봄서비스",
    type: "government",
    category: "돌봄",
    target: "맞벌이 가정 등 양육공백 가정",
    ageRange: "0~12세",
    incomeLevel: "소득 무관 (비용 차등)",
    lifecycle: "영유아·아동기",
    description: "부모의 맞벌이 등으로 양육공백이 발생한 가정에 아이돌보미가 방문하여 돌봄 서비스 제공",
    howToApply: "아이돌봄서비스 홈페이지 또는 전화 신청",
    contact: "아이돌봄서비스 1577-2514",
    manager: "여성가족부",
  },
  {
    name: "지역사회 무료급식소",
    type: "local",
    category: "식품",
    target: "결식우려 주민",
    ageRange: "전연령",
    incomeLevel: "저소득층",
    lifecycle: "전생애",
    description: "지역 내 결식우려가 있는 저소득 주민에게 무료 중식 제공",
    howToApply: "직접 방문",
    contact: "지역 복지관",
    manager: "지역자활센터",
  },
  {
    name: "주거취약계층 주거지원",
    type: "local",
    category: "주거",
    target: "주거취약계층",
    ageRange: "전연령",
    incomeLevel: "기준중위소득 50% 이하",
    lifecycle: "전생애",
    description: "쪽방, 고시원 등에 거주하는 주거취약계층에 임대주택 및 주거비 지원",
    howToApply: "주민센터 또는 LH 신청",
    contact: "LH 1600-1004",
    manager: "국토교통부·지자체",
  },
  {
    name: "장애인활동지원서비스",
    type: "government",
    category: "활동지원",
    target: "등록 장애인",
    ageRange: "6~65세",
    incomeLevel: "소득 무관 (비용 차등)",
    lifecycle: "전생애",
    description: "신체적·정신적 장애로 혼자서 일상생활과 사회활동이 어려운 장애인에게 활동보조, 방문목욕 등 제공",
    howToApply: "주민센터 또는 국민건강보험공단 신청",
    contact: "국민건강보험공단 1577-1000",
    manager: "보건복지부",
  },
  {
    name: "한부모가족 지원",
    type: "government",
    category: "가족지원",
    target: "한부모가족",
    ageRange: "전연령",
    incomeLevel: "기준중위소득 63% 이하",
    lifecycle: "전생애",
    description: "한부모가족에게 아동양육비, 교육비, 생활보조금 등을 지원하여 생활 안정 도모",
    howToApply: "주민센터 방문 신청",
    contact: "여성가족부 1644-6621",
    manager: "여성가족부",
  },
  {
    name: "지역아동센터",
    type: "institution",
    category: "교육",
    target: "방과후 돌봄이 필요한 아동",
    ageRange: "6~18세",
    incomeLevel: "저소득층 우선",
    lifecycle: "아동·청소년기",
    description: "방과후 돌봄이 필요한 아동에게 학습지원, 급식, 문화활동 등 종합 서비스 제공",
    howToApply: "해당 지역아동센터 직접 방문 또는 전화",
    contact: "지역아동센터중앙지원단 02-365-1264",
    manager: "보건복지부·지자체",
  },
  {
    name: "사회복지관 사례관리",
    type: "institution",
    category: "사례관리",
    target: "복합 욕구 가구",
    ageRange: "전연령",
    incomeLevel: "소득 무관",
    lifecycle: "전생애",
    description: "다양한 문제와 욕구를 가진 대상자에게 맞춤형 서비스를 계획·연계·조정하여 통합 지원",
    howToApply: "사회복지관 방문 또는 전화 상담",
    contact: "관할 사회복지관",
    manager: "한국사회복지관협회",
  },
  {
    name: "정신건강복지센터",
    type: "institution",
    category: "의료",
    target: "정신건강 위기 대상자",
    ageRange: "전연령",
    incomeLevel: "소득 무관",
    lifecycle: "전생애",
    description: "정신건강 상담, 위기개입, 자살예방, 재활 프로그램 등 정신건강 관련 통합 서비스 제공",
    howToApply: "센터 방문 또는 전화 상담",
    contact: "정신건강위기상담전화 1577-0199",
    manager: "보건복지부·지자체",
  },
  {
    name: "드림스타트",
    type: "government",
    category: "아동복지",
    target: "취약계층 아동 및 가족",
    ageRange: "0~12세",
    incomeLevel: "기준중위소득 60% 이하",
    lifecycle: "영유아·아동기",
    description: "취약계층 아동에게 건강, 복지, 교육 등 맞춤형 통합서비스를 제공하여 공정한 출발 기회 보장",
    howToApply: "주민센터 또는 드림스타트센터 신청",
    contact: "드림스타트 1644-0997",
    manager: "보건복지부",
  },
];

export async function GET() {
  try {
    // Check if resources already exist
    const existingCount = await prisma.resource.count();
    if (existingCount > 0) {
      return NextResponse.json({
        message: `Database already has ${existingCount} resources. Skipping seed.`,
        count: existingCount,
      });
    }

    const created = await prisma.resource.createMany({
      data: sampleResources,
    });

    return NextResponse.json({
      message: `Successfully seeded ${created.count} welfare resources`,
      count: created.count,
    });
  } catch (error) {
    console.error("Failed to seed database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
