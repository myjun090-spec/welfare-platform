export default function DashboardPage() {
  const stats = [
    { label: "등록 복지자원", value: "1,247", change: "+12", color: "blue" },
    { label: "활동 봉사자", value: "356", change: "+8", color: "green" },
    { label: "진행중 연구", value: "14", change: "+2", color: "purple" },
    { label: "이용자 상담", value: "89", change: "+5", color: "orange" },
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
            <p className="text-sm text-green-600 mt-1">
              {stat.change} 이번 주
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
            {[
              {
                name: "김OO",
                resource: "긴급복지 지원",
                status: "연계완료",
              },
              {
                name: "이OO",
                resource: "무료진료 프로그램",
                status: "진행중",
              },
              {
                name: "박OO",
                resource: "푸드뱅크 연결",
                status: "모니터링",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">{item.resource}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.status === "연계완료"
                      ? "bg-green-100 text-green-700"
                      : item.status === "진행중"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            진행중 연구 프로젝트
          </h3>
          <div className="space-y-3">
            {[
              {
                title: "지역사회 돌봄 체계 분석",
                round: "Round 3",
                progress: 75,
              },
              {
                title: "복지 사각지대 실태조사",
                round: "Round 2",
                progress: 50,
              },
              {
                title: "자원봉사 효과성 연구",
                round: "Round 1",
                progress: 25,
              },
            ].map((item, i) => (
              <div key={i} className="py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  <span className="text-xs text-purple-600 font-medium">
                    {item.round}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
