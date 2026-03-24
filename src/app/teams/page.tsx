"use client";

import { useState, useEffect } from "react";

interface Team {
  id: number;
  name: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  roleLabel: string;
  task: string;
  color: string;
}

interface Output {
  type: string;
  title: string;
  author: string;
  date: string;
  status: string;
}

interface ActivityLog {
  time: string;
  actor: string;
  action: string;
  type: string;
}

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState<"structure" | "outputs" | "logs">(
    "structure"
  );

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [outputs, setOutputs] = useState<Output[]>([]);
  const [outputsLoading, setOutputsLoading] = useState(false);

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Fetch teams on mount
  useEffect(() => {
    async function fetchTeams() {
      setTeamsLoading(true);
      try {
        const res = await fetch("/api/teams");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTeams(data);
        if (data.length > 0) {
          setSelectedTeamId(data[0].id);
        }
      } catch {
        setTeams([]);
      } finally {
        setTeamsLoading(false);
      }
    }
    fetchTeams();
  }, []);

  // Fetch team members when team or structure tab selected
  useEffect(() => {
    if (!selectedTeamId || activeTab !== "structure") return;
    async function fetchMembers() {
      setMembersLoading(true);
      try {
        const res = await fetch(`/api/teams/${selectedTeamId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMembers(data.members || data);
      } catch {
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    }
    fetchMembers();
  }, [selectedTeamId, activeTab]);

  // Fetch outputs when outputs tab selected
  useEffect(() => {
    if (!selectedTeamId || activeTab !== "outputs") return;
    async function fetchOutputs() {
      setOutputsLoading(true);
      try {
        const res = await fetch(`/api/teams/${selectedTeamId}/outputs`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setOutputs(data);
      } catch {
        setOutputs([]);
      } finally {
        setOutputsLoading(false);
      }
    }
    fetchOutputs();
  }, [selectedTeamId, activeTab]);

  // Fetch activity logs when logs tab selected
  useEffect(() => {
    if (activeTab !== "logs") return;
    async function fetchLogs() {
      setLogsLoading(true);
      try {
        const res = await fetch("/api/activity-logs?module=teams");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setLogs(data);
      } catch {
        setLogs([]);
      } finally {
        setLogsLoading(false);
      }
    }
    fetchLogs();
  }, [activeTab]);

  const leader = members.find(
    (m) => m.role === "leader" || m.role === "메인 에이전트"
  );
  const workers = members.filter(
    (m) => m.role !== "leader" && m.role !== "메인 에이전트"
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">팀 협업 관리</h2>

      {/* 팀 선택 */}
      {teamsLoading ? (
        <div className="mb-6 text-gray-500">팀 목록 로딩중...</div>
      ) : teams.length > 0 ? (
        <div className="flex gap-2 mb-6">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTeamId === team.id
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>
      ) : null}

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

      {/* 팀 구조 */}
      {activeTab === "structure" && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-6">팀 협업 구조</h3>

          {membersLoading ? (
            <div className="text-center text-gray-500 py-8">로딩중...</div>
          ) : members.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {teams.length === 0
                ? "등록된 팀이 없습니다."
                : "팀 멤버 정보가 없습니다."}
            </div>
          ) : (
            <>
              {/* 나 (사람) */}
              <div className="flex justify-center mb-4">
                <div className="bg-orange-50 border-2 border-orange-300 rounded-xl px-6 py-3 text-center">
                  <p className="font-bold text-orange-800">나 (사람)</p>
                  <p className="text-xs text-orange-600">방향 설정, 피드백</p>
                  <p className="text-xs text-gray-500 mt-1">항상 대화 가능</p>
                </div>
              </div>
              <div className="flex justify-center mb-4">
                <span className="text-gray-300 text-2xl">&darr;</span>
              </div>

              {/* 팀 리더 */}
              {leader && (
                <>
                  <div className="flex justify-center mb-4">
                    <div
                      className={`border-2 rounded-xl px-6 py-3 text-center ${leader.color || "bg-yellow-100 border-yellow-300 text-yellow-800"}`}
                    >
                      <p className="font-bold">{leader.name}</p>
                      <p className="text-xs opacity-75">
                        ({leader.roleLabel})
                      </p>
                      <p className="text-xs mt-1">{leader.task}</p>
                    </div>
                  </div>
                  {workers.length > 0 && (
                    <div className="flex justify-center mb-4">
                      <div className="flex items-center gap-16">
                        {workers.map((_, i) => (
                          <span key={i} className="text-gray-300 text-xl">
                            {i === 0
                              ? "\u2199"
                              : i === workers.length - 1
                                ? "\u2198"
                                : "\u2193"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 작업자들 */}
              {workers.length > 0 && (
                <div
                  className={`grid gap-6 mb-6`}
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(workers.length, 4)}, minmax(0, 1fr))`,
                  }}
                >
                  {workers.map((member) => (
                    <div
                      key={member.id}
                      className={`border-2 rounded-xl p-4 text-center ${member.color || "bg-blue-100 border-blue-300 text-blue-800"}`}
                    >
                      <p className="font-bold">{member.name}</p>
                      <p className="text-xs opacity-75">
                        ({member.roleLabel})
                      </p>
                      <p className="text-xs mt-2">{member.task}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-center text-xs text-gray-500 mb-6">
                &harr; 팀원끼리도 직접 소통 가능
              </p>

              {/* 결과물 */}
              <div className="flex justify-center">
                <span className="text-gray-300 text-xl mb-4">&darr;</span>
              </div>
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <p className="text-center font-bold text-gray-700 mb-3">
                  결과물
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-blue-700">
                      완성된 코드
                    </p>
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
            </>
          )}
        </div>
      )}

      {/* 결과물 탭 */}
      {activeTab === "outputs" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {outputsLoading ? (
            <div className="px-6 py-12 text-center text-gray-500">
              로딩중...
            </div>
          ) : outputs.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              등록된 결과물이 없습니다.
            </div>
          ) : (
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
                {outputs.map((output, i) => (
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
          )}
        </div>
      )}

      {/* 활동 로그 탭 */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">활동 로그</h3>
          {logsLoading ? (
            <div className="text-center text-gray-500 py-8">로딩중...</div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              활동 로그가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, i) => (
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
          )}
        </div>
      )}
    </div>
  );
}
