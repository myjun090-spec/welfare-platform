"use client";

import { useState } from "react";

type Role = "coordinator" | "scout" | "analyst" | "writer" | "critic" | "scribe";
type Round = 1 | 2 | 3 | 4;

const roles: { id: Role; label: string; desc: string; color: string }[] = [
  {
    id: "coordinator",
    label: "Coordinator",
    desc: "회의 진행, 작업 배분, 진행 관리",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: "scout",
    label: "Scout",
    desc: "논문 검색 (arXiv, Scholar, AlphaXiv)",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    id: "analyst",
    label: "Analyst",
    desc: "논문 분석, 핵심 추출, 비교 정리",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    id: "writer",
    label: "Writer",
    desc: "논문 작성, 초안 생성, 구조화",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    id: "critic",
    label: "Critic",
    desc: "논문 피드백, 약점 지적, 개선안",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    id: "scribe",
    label: "Scribe",
    desc: "모든 회의/작업 내용 실시간 기록",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
];

const roundLabels: Record<Round, string> = {
  1: "주제/범위 확정",
  2: "문헌 검토 토론",
  3: "초안 작성",
  4: "수정 후 재검토",
};

const sampleProjects = [
  {
    id: 1,
    title: "지역사회 돌봄 체계 분석",
    currentRound: 3 as Round,
    members: 5,
    status: "진행중",
  },
  {
    id: 2,
    title: "복지 사각지대 실태조사",
    currentRound: 2 as Round,
    members: 4,
    status: "진행중",
  },
  {
    id: 3,
    title: "자원봉사 효과성 연구",
    currentRound: 1 as Round,
    members: 6,
    status: "진행중",
  },
];

export default function ResearchPage() {
  const [selectedProject, setSelectedProject] = useState(sampleProjects[0]);
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">논문/연구 관리</h2>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
        >
          + 새 연구 프로젝트
        </button>
      </div>

      {/* 팀 역할 구조 (캡쳐3 기반) */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">연구팀 역할 구조</h3>
        <div className="flex justify-center mb-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-sm font-medium text-orange-700">
            나 (연구자) — 방향 설정, 최종 검토/제출
          </div>
        </div>
        <div className="flex justify-center mb-2">
          <span className="text-gray-300">↓</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`p-3 rounded-lg border text-center ${role.color}`}
            >
              <p className="font-bold text-sm">{role.label}</p>
              <p className="text-xs mt-1 opacity-75">{role.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 회의실 라운드 구조 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Conference Rounds — {selectedProject.title}
        </h3>
        <div className="flex gap-4">
          {([1, 2, 3, 4] as Round[]).map((round) => (
            <div
              key={round}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                selectedProject.currentRound === round
                  ? "border-purple-500 bg-purple-50"
                  : selectedProject.currentRound > round
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedProject.currentRound === round
                      ? "bg-purple-600 text-white"
                      : selectedProject.currentRound > round
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-white"
                  }`}
                >
                  {selectedProject.currentRound > round ? "✓" : round}
                </span>
                <span className="text-sm font-bold text-gray-700">
                  Round {round}
                </span>
              </div>
              <p className="text-xs text-gray-600">{roundLabels[round]}</p>
              {selectedProject.currentRound === round && (
                <span className="inline-block mt-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  진행중
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Round 3-4는 품질 기준 충족까지 반복 · 모든 회의 내용은 Scribe가
          실시간 기록
        </p>
      </div>

      {/* 연구 프로젝트 목록 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">연구 프로젝트 목록</h3>
        <div className="space-y-3">
          {sampleProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedProject.id === project.id
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {project.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    참여 인원: {project.members}명 · Round{" "}
                    {project.currentRound} 진행중
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${(project.currentRound / 4) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round((project.currentRound / 4) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
