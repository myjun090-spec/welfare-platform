# 사회복지 통합 플랫폼

사회복지 현장의 자원 검색, 봉사자 관리, 연구 협업, 팀 운영을 하나로 통합한 웹 플랫폼입니다.

## 주요 기능

### 1. 복지자원 통합 검색
- 정부·공공자원, 지역자원, 기관 프로그램을 통합 DB에서 검색
- 연령, 소득수준, 생애주기, 지원유형 기반 필터링
- **5단계 상담 프로세스**: 초기상담 → 조건입력 → 통합검색 → 자원연계 → 모니터링

### 2. 자원봉사자 관리 자동화
- 봉사자 등록/관리 및 활동 기록
- 활동 보고서 자동 생성
- 3단계 자동화 흐름: 폴더 세팅 → 코워크 실행 → 스케줄 자동화

### 3. 논문/연구 관리
- 역할 기반 연구팀 구성 (Coordinator, Scout, Analyst, Writer, Critic, Scribe)
- 4라운드 회의 구조로 체계적 연구 진행
- Scribe를 통한 실시간 회의 기록

### 4. 팀 협업 관리
- 역할 기반 팀 구조 (리더, 작업자, 기록자)
- 작업 배정 및 결과물 관리 (코드, 보고서, 회의록)
- 활동 로그 자동 기록

### 5. 대시보드
- 복지자원, 봉사자, 연구 프로젝트, 자원 연계 현황 한눈에 확인
- 최근 연계 이력 및 연구 진행률 표시

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| DB | Prisma ORM + SQLite |
| 인증 | NextAuth.js v5 |
| 패키지 관리 | npm |

## 시작하기

### 사전 요구사항
- Node.js 18 이상
- npm

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/myjun090-spec/welfare-platform.git
cd welfare-platform

# 2. 의존성 설치
npm install

# 3. 환경변수 설정 (.env 파일이 이미 포함되어 있음)
# AUTH_SECRET과 DATABASE_URL 확인

# 4. DB 마이그레이션 및 클라이언트 생성
npx prisma migrate dev
npx prisma generate

# 5. 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 샘플 데이터 로드
- 복지자원 검색 페이지에서 **"시드 데이터 로드"** 버튼 클릭
- 또는 브라우저에서 `http://localhost:3000/api/seed` 접속

## 프로젝트 구조

```
welfare-platform/
├── prisma/
│   ├── schema.prisma          # DB 스키마 (15개 테이블)
│   └── migrations/            # 마이그레이션 파일
├── src/
│   ├── app/
│   │   ├── dashboard/         # 대시보드
│   │   ├── resources/         # 복지자원 통합 검색
│   │   ├── volunteers/        # 자원봉사자 관리
│   │   ├── research/          # 논문/연구 관리
│   │   ├── teams/             # 팀 협업 관리
│   │   ├── login/             # 로그인
│   │   ├── register/          # 회원가입
│   │   └── api/               # API 라우트 (28개 엔드포인트)
│   │       ├── resources/     # 복지자원 CRUD
│   │       ├── clients/       # 이용자 관리
│   │       ├── consultations/ # 상담 관리
│   │       ├── linkages/      # 자원 연계
│   │       ├── volunteers/    # 봉사자 관리
│   │       ├── research/      # 연구 프로젝트
│   │       ├── teams/         # 팀 협업
│   │       ├── activity-logs/ # 활동 로그
│   │       ├── auth/          # 인증 (로그인/회원가입)
│   │       └── seed/          # 샘플 데이터
│   ├── components/            # 공통 컴포넌트
│   ├── lib/                   # DB, 인증 설정
│   └── generated/             # Prisma 생성 클라이언트
└── 작업일지.md                 # 개발 작업 일지
```

## API 엔드포인트

| 모듈 | 메서드 | 경로 | 설명 |
|------|--------|------|------|
| 복지자원 | GET/POST | `/api/resources` | 자원 목록 조회 / 생성 |
| 복지자원 | GET/PUT/DELETE | `/api/resources/[id]` | 자원 상세 / 수정 / 삭제 |
| 이용자 | GET/POST | `/api/clients` | 이용자 목록 / 등록 |
| 상담 | GET/POST | `/api/consultations` | 상담 기록 조회 / 생성 |
| 연계 | GET/POST | `/api/linkages` | 자원 연계 조회 / 생성 |
| 봉사자 | GET/POST | `/api/volunteers` | 봉사자 목록 / 등록 |
| 봉사활동 | GET/POST | `/api/volunteers/[id]/activities` | 활동 기록 |
| 보고서 | GET/POST | `/api/volunteers/[id]/reports` | 보고서 관리 |
| 연구 | GET/POST | `/api/research` | 프로젝트 목록 / 생성 |
| 연구멤버 | GET/POST | `/api/research/[id]/members` | 멤버 관리 |
| 연구라운드 | PUT | `/api/research/[id]/rounds/[roundId]` | 라운드 업데이트 |
| 팀 | GET/POST | `/api/teams` | 팀 목록 / 생성 |
| 팀작업 | GET/POST | `/api/teams/[id]/tasks` | 작업 관리 |
| 결과물 | GET/POST | `/api/teams/[id]/outputs` | 결과물 관리 |
| 활동로그 | GET/POST | `/api/activity-logs` | 활동 로그 |
| 시드 | GET | `/api/seed` | 샘플 데이터 생성 |

## DB 스키마

총 15개 테이블로 구성:

- **User** - 사용자 (관리자 / 복지사 / 봉사자)
- **Resource** - 복지자원 (정부·지역·기관)
- **Client** - 이용자 (상담 대상)
- **Consultation** - 상담 기록
- **Linkage** - 자원 연계 이력
- **Volunteer** - 봉사자 프로필
- **VolunteerActivity** - 봉사 활동
- **VolunteerReport** - 봉사 보고서
- **ResearchProject** - 연구 프로젝트
- **ResearchMember** - 연구 참여자
- **ResearchRound** - 연구 라운드
- **ResearchFile** - 연구 파일
- **Team, TeamMember, TeamTask, TeamOutput** - 팀 협업
- **ActivityLog** - 활동 로그

## 라이선스

MIT
