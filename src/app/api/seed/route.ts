import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

// ========== 복지자원 데이터 ==========
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
    const results: Record<string, number | string> = {};

    // ========== 1. 사용자 계정 (데모용) ==========
    const existingUsers = await prisma.user.count();
    if (existingUsers === 0) {
      const pw = await hash("demo1234", 12);
      const users = await Promise.all([
        prisma.user.create({
          data: { email: "admin@welfare.kr", name: "관리자", password: pw, role: "admin", phone: "02-1234-5678" },
        }),
        prisma.user.create({
          data: { email: "kim@welfare.kr", name: "김복지", password: pw, role: "socialworker", phone: "010-1111-2222" },
        }),
        prisma.user.create({
          data: { email: "lee@welfare.kr", name: "이상담", password: pw, role: "socialworker", phone: "010-3333-4444" },
        }),
        prisma.user.create({
          data: { email: "park@welfare.kr", name: "박연구", password: pw, role: "socialworker", phone: "010-5555-6666" },
        }),
        prisma.user.create({
          data: { email: "choi@welfare.kr", name: "최봉사", password: pw, role: "volunteer", phone: "010-7777-8888" },
        }),
        prisma.user.create({
          data: { email: "jung@welfare.kr", name: "정나눔", password: pw, role: "volunteer", phone: "010-9999-0000" },
        }),
        prisma.user.create({
          data: { email: "han@welfare.kr", name: "한도움", password: pw, role: "volunteer", phone: "010-1234-5678" },
        }),
        prisma.user.create({
          data: { email: "yoon@welfare.kr", name: "윤사랑", password: pw, role: "volunteer", phone: "010-8765-4321" },
        }),
      ]);
      results.users = users.length;

      // ========== 2. 자원봉사자 프로필 ==========
      const volunteers = await Promise.all([
        prisma.volunteer.create({
          data: { userId: users[4].id, area: "노인돌봄", totalHours: 120, status: "active", startDate: new Date("2025-03-01") },
        }),
        prisma.volunteer.create({
          data: { userId: users[5].id, area: "아동교육", totalHours: 85, status: "active", startDate: new Date("2025-06-15") },
        }),
        prisma.volunteer.create({
          data: { userId: users[6].id, area: "환경정리", totalHours: 200, status: "resting", startDate: new Date("2024-09-01") },
        }),
        prisma.volunteer.create({
          data: { userId: users[7].id, area: "의료지원", totalHours: 45, status: "active", startDate: new Date("2026-01-10") },
        }),
      ]);
      results.volunteers = volunteers.length;

      // 봉사 활동 기록
      const activityData = [
        { volunteerId: volunteers[0].id, date: new Date("2026-03-20"), hours: 4, location: "행복노인복지관", description: "어르신 말벗 및 식사보조" },
        { volunteerId: volunteers[0].id, date: new Date("2026-03-18"), hours: 3, location: "사랑의집", description: "독거노인 가정방문 돌봄" },
        { volunteerId: volunteers[0].id, date: new Date("2026-03-15"), hours: 5, location: "행복노인복지관", description: "어르신 건강체조 보조" },
        { volunteerId: volunteers[1].id, date: new Date("2026-03-21"), hours: 3, location: "희망지역아동센터", description: "초등학생 수학 지도" },
        { volunteerId: volunteers[1].id, date: new Date("2026-03-19"), hours: 4, location: "꿈나무교실", description: "영어 읽기 지도" },
        { volunteerId: volunteers[2].id, date: new Date("2026-03-10"), hours: 6, location: "관악산 일대", description: "등산로 주변 환경정리" },
        { volunteerId: volunteers[3].id, date: new Date("2026-03-22"), hours: 3, location: "무료진료소", description: "진료 접수 및 안내 보조" },
      ];
      await prisma.volunteerActivity.createMany({ data: activityData });
      results.activities = activityData.length;

      // 봉사 보고서
      await prisma.volunteerReport.createMany({
        data: [
          { volunteerId: volunteers[0].id, title: "2026년 2월 봉사활동 보고서", period: "2026-02", content: "노인돌봄 활동 총 32시간 수행. 독거노인 5가구 정기방문 완료.", autoGenerated: true },
          { volunteerId: volunteers[0].id, title: "2026년 1월 봉사활동 보고서", period: "2026-01", content: "노인돌봄 활동 총 28시간 수행. 한파 대비 안부확인 집중.", autoGenerated: true },
          { volunteerId: volunteers[1].id, title: "2026년 2월 교육봉사 보고서", period: "2026-02", content: "아동교육 봉사 총 20시간. 중간고사 대비 특별수업 진행.", autoGenerated: true },
        ],
      });
      results.reports = 3;

      // ========== 3. 연구 프로젝트 ==========
      const research1 = await prisma.researchProject.create({
        data: {
          title: "지역사회 통합돌봄 체계 효과성 분석",
          description: "커뮤니티케어 시범사업 3년간 성과를 분석하고, 지속가능한 통합돌봄 모델을 제안하는 연구",
          currentRound: 3,
          status: "active",
        },
      });
      const research2 = await prisma.researchProject.create({
        data: {
          title: "복지 사각지대 발굴을 위한 AI 활용 방안",
          description: "빅데이터와 AI를 활용하여 복지 사각지대 대상자를 선제적으로 발굴하는 시스템 설계 연구",
          currentRound: 2,
          status: "active",
        },
      });
      const research3 = await prisma.researchProject.create({
        data: {
          title: "자원봉사 동기부여 요인 및 지속성 연구",
          description: "자원봉사자의 참여 동기와 지속 요인을 조사하여 효과적인 봉사자 관리 전략 수립",
          currentRound: 1,
          status: "active",
        },
      });
      results.research = 3;

      // 연구 라운드
      const roundTitles = ["주제/범위 확정", "문헌 검토 토론", "초안 작성", "수정 후 재검토"];
      for (const project of [research1, research2, research3]) {
        for (let i = 1; i <= 4; i++) {
          await prisma.researchRound.create({
            data: {
              projectId: project.id,
              roundNum: i,
              title: roundTitles[i - 1],
              status: i < project.currentRound ? "completed" : i === project.currentRound ? "in_progress" : "pending",
              notes: i < project.currentRound ? `Round ${i} 완료. 주요 논의 사항이 기록되었습니다.` : null,
              startedAt: i <= project.currentRound ? new Date(`2026-0${i}-01`) : null,
              endedAt: i < project.currentRound ? new Date(`2026-0${i}-28`) : null,
            },
          });
        }
      }

      // 연구 멤버
      await prisma.researchMember.createMany({
        data: [
          { projectId: research1.id, userId: users[3].id, role: "coordinator" },
          { projectId: research1.id, userId: users[1].id, role: "analyst" },
          { projectId: research1.id, userId: users[2].id, role: "writer" },
          { projectId: research2.id, userId: users[1].id, role: "coordinator" },
          { projectId: research2.id, userId: users[3].id, role: "scout" },
          { projectId: research2.id, userId: users[2].id, role: "critic" },
          { projectId: research3.id, userId: users[2].id, role: "coordinator" },
          { projectId: research3.id, userId: users[1].id, role: "writer" },
        ],
      });

      // ========== 4. 팀 ==========
      const team1 = await prisma.team.create({
        data: { name: "플랫폼 개발팀", description: "복지 플랫폼 시스템 개발 및 유지보수" },
      });
      const team2 = await prisma.team.create({
        data: { name: "현장 실무팀", description: "복지 현장 상담 및 자원 연계 실무" },
      });
      results.teams = 2;

      // 팀 멤버
      await prisma.teamMember.createMany({
        data: [
          { teamId: team1.id, userId: users[0].id, role: "leader" },
          { teamId: team1.id, userId: users[3].id, role: "worker-a" },
          { teamId: team1.id, userId: users[1].id, role: "worker-b" },
          { teamId: team1.id, userId: users[2].id, role: "recorder" },
          { teamId: team2.id, userId: users[1].id, role: "leader" },
          { teamId: team2.id, userId: users[2].id, role: "worker-a" },
          { teamId: team2.id, userId: users[4].id, role: "worker-b" },
        ],
      });

      // 팀 작업
      await prisma.teamTask.createMany({
        data: [
          { teamId: team1.id, title: "복지자원 검색 API 고도화", description: "전문 검색 및 추천 알고리즘 구현", assignedTo: "박연구", status: "in_progress", priority: "high" },
          { teamId: team1.id, title: "대시보드 차트 시각화", description: "Chart.js로 통계 그래프 구현", assignedTo: "박연구", status: "todo", priority: "medium" },
          { teamId: team1.id, title: "봉사자 보고서 .docx 내보내기", description: "활동보고서 자동 문서화 기능", assignedTo: "김복지", status: "done", priority: "high" },
          { teamId: team1.id, title: "모바일 반응형 UI 개선", description: "사이드바 및 테이블 모바일 대응", assignedTo: "이상담", status: "review", priority: "medium" },
          { teamId: team2.id, title: "3월 신규 이용자 초기상담", description: "신규 접수 이용자 5명 초기상담 진행", assignedTo: "이상담", status: "in_progress", priority: "high" },
          { teamId: team2.id, title: "2분기 자원봉사자 모집", description: "4~6월 봉사자 모집 공고 및 면접", assignedTo: "김복지", status: "todo", priority: "medium" },
          { teamId: team2.id, title: "독거노인 안부확인 사업", description: "관내 독거노인 30가구 정기 안부확인", assignedTo: "최봉사", status: "in_progress", priority: "high" },
        ],
      });

      // 팀 결과물
      await prisma.teamOutput.createMany({
        data: [
          { teamId: team1.id, type: "code", title: "복지자원 검색 API v2", author: "박연구", status: "completed", content: "필터링 성능 개선 및 전문검색 추가" },
          { teamId: team1.id, type: "report", title: "1분기 개발 진행 보고서", author: "이상담", status: "completed", content: "플랫폼 개발 진행률 85%, 주요 기능 구현 완료" },
          { teamId: team1.id, type: "minutes", title: "3월 4주차 스프린트 회의록", author: "이상담", status: "completed", content: "배포 일정 확정, QA 테스트 계획 수립" },
          { teamId: team2.id, type: "report", title: "3월 상담 현황 분석", author: "김복지", status: "review", content: "신규 상담 23건, 자원연계 15건, 모니터링 8건" },
          { teamId: team2.id, type: "minutes", title: "현장팀 주간 회의록", author: "이상담", status: "completed", content: "독거노인 사업 진행상황 공유, 봉사자 배치 조정" },
        ],
      });

      // ========== 5. 이용자 + 상담 + 연계 ==========
      const clients = await Promise.all([
        prisma.client.create({
          data: { name: "김OO", age: 78, gender: "여", familySize: 1, incomeLevel: "기준중위소득 30% 이하", lifecycle: "노년기", address: "서울시 관악구", phone: "010-0000-1111", needs: "독거노인 돌봄, 식사 지원 필요", riskLevel: "고위험" },
        }),
        prisma.client.create({
          data: { name: "이OO", age: 35, gender: "여", familySize: 3, incomeLevel: "기준중위소득 50% 이하", lifecycle: "근로기", address: "서울시 금천구", phone: "010-0000-2222", needs: "한부모 가정, 아동 교육 및 돌봄 지원", riskLevel: "중위험" },
        }),
        prisma.client.create({
          data: { name: "박OO", age: 45, gender: "남", familySize: 2, incomeLevel: "기준중위소득 75% 이하", lifecycle: "근로기", address: "서울시 영등포구", phone: "010-0000-3333", needs: "주거 불안정, 정신건강 상담 필요", riskLevel: "고위험" },
        }),
        prisma.client.create({
          data: { name: "최OO", age: 8, gender: "남", familySize: 4, incomeLevel: "기준중위소득 60% 이하", lifecycle: "아동기", address: "서울시 구로구", phone: "010-0000-4444", needs: "방과후 돌봄, 학습지원 필요", riskLevel: "저위험" },
        }),
        prisma.client.create({
          data: { name: "정OO", age: 62, gender: "남", familySize: 1, incomeLevel: "기준중위소득 50% 이하", lifecycle: "은퇴기", address: "서울시 동작구", phone: "010-0000-5555", needs: "퇴직 후 생계 지원, 재취업 상담", riskLevel: "중위험" },
        }),
      ]);
      results.clients = clients.length;

      // 상담 기록
      const consultations = await Promise.all([
        prisma.consultation.create({
          data: { clientId: clients[0].id, workerId: users[1].id, step: 5, notes: "독거노인 돌봄서비스 연계 완료. 무료급식소 안내.", conditions: JSON.stringify({ age: "senior", income: "30", lifecycle: "retirement" }) },
        }),
        prisma.consultation.create({
          data: { clientId: clients[1].id, workerId: users[2].id, step: 4, notes: "한부모가족 지원 + 지역아동센터 연계 진행 중.", conditions: JSON.stringify({ age: "adult", income: "50", type: "government" }) },
        }),
        prisma.consultation.create({
          data: { clientId: clients[2].id, workerId: users[1].id, step: 3, notes: "주거지원 + 정신건강 상담 자원 검색 중.", conditions: JSON.stringify({ income: "75", lifecycle: "working" }) },
        }),
        prisma.consultation.create({
          data: { clientId: clients[3].id, workerId: users[2].id, step: 5, notes: "드림스타트 + 지역아동센터 연계 완료.", conditions: JSON.stringify({ age: "child", income: "60" }) },
        }),
        prisma.consultation.create({
          data: { clientId: clients[4].id, workerId: users[1].id, step: 2, notes: "초기상담 완료. 조건 입력 단계.", conditions: JSON.stringify({ age: "senior", income: "50" }) },
        }),
      ]);
      results.consultations = consultations.length;

      // 복지자원 먼저 생성
      const resources = await prisma.resource.createMany({ data: sampleResources });
      results.resources = resources.count;

      // 생성된 자원 가져오기
      const allResources = await prisma.resource.findMany();

      // 연계 이력
      const getResource = (name: string) => allResources.find((r) => r.name.includes(name));
      await prisma.linkage.createMany({
        data: [
          { clientId: clients[0].id, resourceId: getResource("노인돌봄")!.id, consultationId: consultations[0].id, status: "linked", assignedTo: "김복지", memo: "주 2회 방문돌봄 시작", linkedAt: new Date("2026-03-15") },
          { clientId: clients[0].id, resourceId: getResource("무료급식")!.id, consultationId: consultations[0].id, status: "monitoring", assignedTo: "김복지", memo: "주 5일 중식 이용 중", linkedAt: new Date("2026-03-10") },
          { clientId: clients[1].id, resourceId: getResource("한부모")!.id, consultationId: consultations[1].id, status: "linked", assignedTo: "이상담", memo: "아동양육비 신청 완료", linkedAt: new Date("2026-03-18") },
          { clientId: clients[1].id, resourceId: getResource("지역아동")!.id, consultationId: consultations[1].id, status: "pending", assignedTo: "이상담", memo: "센터 등록 대기 중" },
          { clientId: clients[3].id, resourceId: getResource("드림스타트")!.id, consultationId: consultations[3].id, status: "linked", assignedTo: "이상담", memo: "통합서비스 시작", linkedAt: new Date("2026-03-05") },
          { clientId: clients[3].id, resourceId: getResource("지역아동")!.id, consultationId: consultations[3].id, status: "linked", assignedTo: "이상담", memo: "방과후 돌봄 시작", linkedAt: new Date("2026-03-08") },
        ],
      });
      results.linkages = 6;

      // ========== 6. 활동 로그 ==========
      await prisma.activityLog.createMany({
        data: [
          { userId: users[1].id, module: "resources", action: "search", target: "복지자원 통합 검색", details: "노인돌봄 관련 자원 3건 검색" },
          { userId: users[1].id, module: "resources", action: "link", target: "김OO → 노인돌봄종합서비스", details: "연계 완료" },
          { userId: users[2].id, module: "resources", action: "link", target: "이OO → 한부모가족 지원", details: "연계 진행" },
          { userId: users[4].id, module: "volunteers", action: "activity", target: "노인돌봄 봉사활동", details: "행복노인복지관 4시간 활동" },
          { userId: users[5].id, module: "volunteers", action: "activity", target: "아동교육 봉사활동", details: "희망지역아동센터 3시간 활동" },
          { userId: users[0].id, module: "teams", action: "create", target: "플랫폼 개발팀 작업 배정", details: "검색 API 고도화 작업 배정" },
          { userId: users[3].id, module: "teams", action: "complete", target: "복지자원 검색 API v2", details: "코드 구현 완료, PR 생성" },
          { userId: users[2].id, module: "teams", action: "create", target: "3월 4주차 회의록 작성", details: "스프린트 회의록 작성 완료" },
          { userId: users[1].id, module: "research", action: "update", target: "지역사회 통합돌봄 연구", details: "Round 3 초안 작성 시작" },
          { userId: users[3].id, module: "research", action: "review", target: "AI 활용 복지사각지대 연구", details: "문헌 검토 토론 진행" },
        ],
      });
      results.activityLogs = 10;
    } else {
      // 이미 사용자가 있으면 자원만 체크
      const existingResources = await prisma.resource.count();
      if (existingResources === 0) {
        const created = await prisma.resource.createMany({ data: sampleResources });
        results.resources = created.count;
      } else {
        results.message = "이미 목업 데이터가 존재합니다";
        results.existingUsers = existingUsers;
        results.existingResources = existingResources;
      }
    }

    return NextResponse.json({
      success: true,
      message: "목업 데이터 세팅 완료!",
      data: results,
      demo: {
        로그인: "이메일: admin@welfare.kr / 비밀번호: demo1234",
        역할: "admin(관리자), kim@welfare.kr(복지사), choi@welfare.kr(봉사자)",
      },
    });
  } catch (error) {
    console.error("Failed to seed database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
