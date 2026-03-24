"use client";

import { useState, useEffect } from "react";

interface Linkage {
  id: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  client?: { id: string; name: string };
  resource?: { id: string; name: string; type: string };
}

interface ResearchProject {
  id: string;
  title: string;
  currentRound: number;
  status: string;
  _count?: { members: number };
}

export default function DashboardPage() {
  const [resourceCount, setResourceCount] = useState<number | null>(null);
  const [volunteerCount, setVolunteerCount] = useState<number | null>(null);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>(
    []
  );
  const [linkages, setLinkages] = useState<Linkage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [resRes, volRes, projRes, linkRes] = await Promise.all([
          fetch("/api/resources").then((r) => r.json()),
          fetch("/api/volunteers").then((r) => r.json()),
          fetch("/api/research").then((r) => r.json()),
          fetch("/api/linkages").then((r) => r.json()),
        ]);

        setResourceCount(Array.isArray(resRes) ? resRes.length : 0);
        setVolunteerCount(Array.isArray(volRes) ? volRes.length : 0);
        setResearchProjects(Array.isArray(projRes) ? projRes : []);
        setLinkages(Array.isArray(linkRes) ? linkRes : []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const activeResearch = researchProjects.filter(
    (p) => p.status === "active"
  );

  const statusLabel: Record<string, string> = {
    pending: "대기중",
    linked: "연계완료",
    monitoring: "모니터링",
    completed: "완료",
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    linked: "bg-green-100 text-green-700",
    monitoring: "bg-blue-100 text-blue-700",
    completed: "bg-gray-100 text-gray-700",
  };

  const stats = [
    {
      label: "등록 복지자원",
      value: loading ? "..." : String(resourceCount ?? 0),
      color: "blue",
    },
    {
      label: "활동 봉사자",
      value: loading ? "..." : String(volunteerCount ?? 0),
      color: "green",
    },
    {
      label: "진행중 연구",
      value: loading ? "..." : String(activeResearch.length),
      color: "purple",
    },
    {
      label: "자원 연계",
      value: loading ? "..." : String(linkages.length),
      color: "orange",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">대시보드</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            최근 자원 연계
          </h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                로딩중...
              </p>
            ) : linkages.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                연계 데이터가 없습니다.
              </p>
            ) : (
              linkages.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.client?.name || item.assignedTo || "이용자"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.resource?.name || "자원 정보 없음"}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      statusColor[item.status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusLabel[item.status] || item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            진행중 연구 프로젝트
          </h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                로딩중...
              </p>
            ) : activeResearch.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                진행중인 연구가 없습니다.
              </p>
            ) : (
              activeResearch.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <span className="text-xs text-purple-600 font-medium">
                      Round {item.currentRound}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${(item.currentRound / 4) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
