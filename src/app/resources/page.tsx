"use client";

import { useState, useEffect } from "react";

type ResourceType = "government" | "local" | "institution";
type Step = 1 | 2 | 3 | 4 | 5;

interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  category: string | null;
  target: string | null;
  ageRange: string | null;
  incomeLevel: string | null;
  lifecycle: string | null;
  description: string | null;
  howToApply: string | null;
  contact: string | null;
  manager: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Linkage {
  id: string;
  clientId: string;
  resourceId: string;
  status: string;
  assignedTo: string | null;
  memo: string | null;
  createdAt: string;
  client?: { id: string; name: string };
  resource?: Resource;
}

const stepLabels: Record<Step, string> = {
  1: "이용자 초기상담",
  2: "조건 입력",
  3: "통합 검색",
  4: "자원 선정·연계",
  5: "모니터링·기록",
};

export default function ResourcesPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [filters, setFilters] = useState({
    age: "",
    income: "",
    lifecycle: "",
    type: "" as ResourceType | "",
  });
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

  // Linkage form state
  const [linkageAssignedTo, setLinkageAssignedTo] = useState("");
  const [linkageDate, setLinkageDate] = useState("");
  const [linkageMemo, setLinkageMemo] = useState("");
  const [linkageCreating, setLinkageCreating] = useState(false);
  const [createdLinkage, setCreatedLinkage] = useState<Linkage | null>(null);

  // Load all resources on mount
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) query.set(key, value);
        });
      }
      const url = `/api/resources${query.toString() ? `?${query.toString()}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage("");
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      setSeedMessage(data.message || "시드 데이터 로드 완료");
      // Reload resources after seeding
      await fetchResources();
    } catch (err) {
      console.error("Seed failed:", err);
      setSeedMessage("시드 데이터 로드 실패");
    } finally {
      setSeeding(false);
    }
  };

  const handleSearch = async () => {
    const params: Record<string, string> = {};
    if (filters.type) params.type = filters.type;
    if (filters.age) params.ageRange = filters.age;
    if (filters.income) params.incomeLevel = filters.income;
    if (filters.lifecycle) params.lifecycle = filters.lifecycle;
    await fetchResources(params);
    setCurrentStep(3);
  };

  const handleCreateLinkage = async () => {
    if (!selectedResource) return;
    setLinkageCreating(true);
    try {
      // Use a placeholder clientId since the current UI doesn't have full client management
      const res = await fetch("/api/linkages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: "placeholder-client",
          resourceId: selectedResource.id,
          assignedTo: linkageAssignedTo || undefined,
          memo: linkageMemo || undefined,
        }),
      });
      if (res.ok) {
        const linkage = await res.json();
        setCreatedLinkage(linkage);
        setCurrentStep(5);
      } else {
        const err = await res.json();
        alert(`연계 생성 실패: ${err.error || "알 수 없는 오류"}`);
      }
    } catch (err) {
      console.error("Failed to create linkage:", err);
      alert("연계 생성 중 오류가 발생했습니다.");
    } finally {
      setLinkageCreating(false);
    }
  };

  const typeLabel: Record<ResourceType, string> = {
    government: "정부·공공",
    local: "지역자원",
    institution: "기관",
  };

  const typeColor: Record<ResourceType, string> = {
    government: "bg-blue-100 text-blue-700",
    local: "bg-green-100 text-green-700",
    institution: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          복지자원 통합 검색
        </h2>
        <div className="flex items-center gap-3">
          {seedMessage && (
            <span className="text-sm text-gray-600">{seedMessage}</span>
          )}
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {seeding ? "로딩중..." : "시드 데이터 로드"}
          </button>
        </div>
      </div>

      {/* 5단계 프로세스 표시 */}
      <div className="flex items-center mb-8 bg-white rounded-xl p-4 border border-gray-200">
        {([1, 2, 3, 4, 5] as Step[]).map((step) => (
          <div key={step} className="flex items-center flex-1">
            <button
              onClick={() => setCurrentStep(step)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                currentStep === step
                  ? "bg-blue-50 text-blue-700"
                  : currentStep > step
                    ? "text-green-600"
                    : "text-gray-400"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === step
                    ? "bg-blue-600 text-white"
                    : currentStep > step
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > step ? "✓" : step}
              </span>
              {stepLabels[step]}
            </button>
            {step < 5 && (
              <div
                className={`w-8 h-0.5 ${currentStep > step ? "bg-green-300" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: 초기상담 */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">이용자 초기상담</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="이용자 이름"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연령/가구 구성
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="예: 45세, 3인 가구"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                욕구 파악
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
                placeholder="주요 욕구 및 위기 수준"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                소득 수준
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>선택하세요</option>
                <option>중위소득 30% 이하</option>
                <option>중위소득 50% 이하</option>
                <option>중위소득 75% 이하</option>
                <option>중위소득 100% 이하</option>
                <option>중위소득 100% 초과</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setCurrentStep(2)}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            다음 단계 →
          </button>
        </div>
      )}

      {/* Step 2: 조건 입력 */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">검색 조건 입력</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연령대
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={filters.age}
                onChange={(e) =>
                  setFilters({ ...filters, age: e.target.value })
                }
              >
                <option value="">전체</option>
                <option value="child">아동 (0-12세)</option>
                <option value="youth">청소년 (13-18세)</option>
                <option value="adult">성인 (19-64세)</option>
                <option value="senior">노인 (65세 이상)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                소득수준
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={filters.income}
                onChange={(e) =>
                  setFilters({ ...filters, income: e.target.value })
                }
              >
                <option value="">전체</option>
                <option value="30">중위소득 30% 이하</option>
                <option value="50">중위소득 50% 이하</option>
                <option value="75">중위소득 75% 이하</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                생애주기
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={filters.lifecycle}
                onChange={(e) =>
                  setFilters({ ...filters, lifecycle: e.target.value })
                }
              >
                <option value="">전체</option>
                <option value="infant">영유아기</option>
                <option value="school">학령기</option>
                <option value="working">근로기</option>
                <option value="retirement">은퇴기</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                지원유형
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={filters.type}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    type: e.target.value as ResourceType | "",
                  })
                }
              >
                <option value="">전체</option>
                <option value="government">정부·공공자원</option>
                <option value="local">지역자원</option>
                <option value="institution">기관 프로그램</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setCurrentStep(1)}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              ← 이전
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "검색중..." : "통합 검색 →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 검색 결과 */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            검색 결과 ({searchResults.length}건)
          </h3>
          {loading ? (
            <p className="text-gray-500 text-sm py-8 text-center">
              검색중...
            </p>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">
                검색 결과가 없습니다.
              </p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="text-blue-600 text-sm underline hover:text-blue-800"
              >
                시드 데이터를 로드해 보세요
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((resource) => (
                <div
                  key={resource.id}
                  onClick={() => setSelectedResource(resource)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedResource?.id === resource.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {resource.name}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${typeColor[resource.type] || "bg-gray-100 text-gray-700"}`}
                    >
                      {typeLabel[resource.type] || resource.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {resource.description}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>대상: {resource.target || "-"}</span>
                    <span>연령: {resource.ageRange || "-"}</span>
                    <span>소득: {resource.incomeLevel || "-"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              ← 조건 수정
            </button>
            <button
              onClick={() => selectedResource && setCurrentStep(4)}
              disabled={!selectedResource}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              자원 연계 →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: 자원 선정·연계 */}
      {currentStep === 4 && selectedResource && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">자원 선정·연계</h3>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-900">
              {selectedResource.name}
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              {selectedResource.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연계 담당자
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="담당 복지사"
                value={linkageAssignedTo}
                onChange={(e) => setLinkageAssignedTo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                신청 예정일
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={linkageDate}
                onChange={(e) => setLinkageDate(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연계 메모
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
                placeholder="연계 관련 특이사항"
                value={linkageMemo}
                onChange={(e) => setLinkageMemo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setCurrentStep(3)}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              ← 이전
            </button>
            <button
              onClick={handleCreateLinkage}
              disabled={linkageCreating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {linkageCreating ? "연계 생성중..." : "연계 확정 →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: 모니터링·기록 */}
      {currentStep === 5 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">모니터링·기록</h3>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
            <p className="text-green-800 font-medium">
              ✓ 자원 연계가 완료되었습니다
            </p>
            <p className="text-green-600 text-sm mt-1">
              {selectedResource?.name} → 이용자 연계 확정
            </p>
            {createdLinkage && (
              <div className="mt-2 text-sm text-green-700">
                <p>연계 ID: {createdLinkage.id}</p>
                <p>
                  상태:{" "}
                  {createdLinkage.status === "pending"
                    ? "대기중"
                    : createdLinkage.status === "linked"
                      ? "연계완료"
                      : createdLinkage.status === "monitoring"
                        ? "모니터링"
                        : createdLinkage.status}
                </p>
                {createdLinkage.assignedTo && (
                  <p>담당자: {createdLinkage.assignedTo}</p>
                )}
                {createdLinkage.memo && <p>메모: {createdLinkage.memo}</p>}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연계 상태 기록
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
                placeholder="연계 결과 및 추적 기록"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                재사정 필요 여부
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>필요 없음</option>
                <option>1개월 후 재사정</option>
                <option>3개월 후 재사정</option>
                <option>6개월 후 재사정</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setCurrentStep(1);
                setSelectedResource(null);
                setCreatedLinkage(null);
                setLinkageAssignedTo("");
                setLinkageDate("");
                setLinkageMemo("");
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              새 상담 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
