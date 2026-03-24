"use client";

import { useState } from "react";

type MemberRole = "leader" | "worker-a" | "worker-b" | "recorder";

const teamMembers: {
  id: number;
  name: string;
  role: MemberRole;
  roleLabel: string;
  task: string;
  color: string;
}[] = [
  {
    id: 1,
    name: "팀 리더",
    role: "leader",
    roleLabel: "메인 에이전트",
    task: "관리만, 직접 작업 안 함",
    color: "bg-yellow-100 border-yellow-300 text-yellow-800",
  },
  {
    id: 2,
    name: "작업자 A",
    role: "worker-a",
    roleLabel: "코딩 / 구현",
    task: "시스템 개발 및 기능 구현",
    color: "bg-blue-100 border-blue-300 text-blue-800",
  },
  {
    id: 3,
    name: "작업자 B",
    role: "worker-b",
    roleLabel: "조사 / 분석",
    task: "데이터 조사 및 분석 업무",
    color: "bg-purple-100 border-purple-300 text-purple-800",
  },
  {
    id: 4,
    name: "기록자 C",
    role: "recorder",
    roleLabel: "회의록 / 개발일지",
    task: "모든 활동 기록 및 문서화",
    color: "bg-red-100 border-red-300 text-red-800",
  },
];

const sampleOutputs = [
  {
    type: "코드",
    title: "복지자원 검색 API 구현",
    author: "작업자 A",
    date: "2026-03-22",
    status: "완료",
  },
  {
    type: "보고서",
    title: "지역 복지자원 현황 분석",
    author: "작업자 B",
    date: "2026-03-21",
    status: "검토중",
  },
  {
    type: "회의록",
    title: "3차 스프린트 회의록",
    author: "기록자 C",
    date: "2026-03-20",
    status: "완료",
  },
  {
    type: "코드",
    title: "봉사자 관리 대시보드",
    author: "작업자 A",
    date: "2026-03-19",
    status: "진행중",
  },
];

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState<"structure" | "outputs" | "logs">(
    "structure"
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">팀 협업 관리</h2>

      {/* 탭 */}
      <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200 mb-6 w-fit">
        {[
          { id: "structure" as const, label: "팀 구조" },
          { id: "outputs" as const, label: "결과물" },
          { id: "logs" as const, label: "활동 로그" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 팀 구조 (캡쳐4 기반) */}
      {activeTab === "structure" && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-6">팀 협업 구조</h3>

          {/* 나 (사람) */}
          <div className="flex justify-center mb-4">
            <div className="bg-orange-50 border-2 border-orange-300 rounded-xl px-6 py-3 text-center">
              <p className="font-bold text-orange-800">나 (사람)</p>
              <p className="text-xs text-orange-600">방향 설정, 피드백</p>
              <p className="text-xs text-gray-500 mt-1">
                항상 대화 가능
              </p>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <span className="text-gray-300 text-2xl">↓</span>
          </div>

          {/* 팀 리더 */}
          <div className="flex justify-center mb-4">
            <div className={`border-2 rounded-xl px-6 py-3 text-center ${teamMembers[0].color}`}>
              <p className="font-bold">{teamMembers[0].name}</p>
              <p className="text-xs opacity-75">({teamMembers[0].roleLabel})</p>
              <p className="text-xs mt-1">{teamMembers[0].task}</p>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-16">
              <span className="text-gray-300 text-xl">↙</span>
              <span className="text-gray-300 text-xl">↓</span>
              <span className="text-gray-300 text-xl">↘</span>
            </div>
          </div>

          {/* 작업자들 */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {teamMembers.slice(1).map((member) => (
              <div
                key={member.id}
                className={`border-2 rounded-xl p-4 text-center ${member.color}`}
              >
                <p className="font-bold">{member.name}</p>
                <p className="text-xs opacity-75">({member.roleLabel})</p>
                <p className="text-xs mt-2">{member.task}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 mb-6">
            ↔ 팀원끼리도 직접 소통 가능
          </p>

          {/* 결과물 */}
          <div className="flex justify-center">
            <span className="text-gray-300 text-xl mb-4">↓</span>
          </div>
          <div className="border-2 border-gray-200 rounded-xl p-4">
            <p className="text-center font-bold text-gray-700 mb-3">결과물</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-blue-700">완성된 코드</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-purple-700">
                  분석 보고서
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-red-700">
                  회의록 / 일지
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 결과물 탭 */}
      {activeTab === "outputs" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  유형
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  제목
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  작성자
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  날짜
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sampleOutputs.map((output, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        output.type === "코드"
                          ? "bg-blue-100 text-blue-700"
                          : output.type === "보고서"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {output.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {output.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {output.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {output.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        output.status === "완료"
                          ? "bg-green-100 text-green-700"
                          : output.status === "검토중"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {output.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 활동 로그 탭 */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">활동 로그</h3>
          <div className="space-y-4">
            {[
              {
                time: "14:30",
                actor: "작업자 A",
                action: "복지자원 검색 API 구현 완료",
                type: "완료",
              },
              {
                time: "13:15",
                actor: "기록자 C",
                action: "3차 스프린트 회의록 작성",
                type: "기록",
              },
              {
                time: "11:00",
                actor: "팀 리더",
                action: "작업자 B에게 지역 현황 분석 배정",
                type: "배정",
              },
              {
                time: "10:30",
                actor: "작업자 B",
                action: "지역 복지자원 데이터 수집 시작",
                type: "시작",
              },
              {
                time: "09:00",
                actor: "나",
                action: "이번 주 방향성 피드백 전달",
                type: "피드백",
              },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="text-xs text-gray-400 w-12 pt-1 shrink-0">
                  {log.time}
                </span>
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{log.actor}</span>{" "}
                    {log.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
