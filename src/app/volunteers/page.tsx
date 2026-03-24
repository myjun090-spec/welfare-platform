"use client";

import { useState } from "react";

const sampleVolunteers = [
  {
    id: 1,
    name: "김봉사",
    phone: "010-1234-5678",
    area: "노인돌봄",
    hours: 120,
    status: "활동중",
  },
  {
    id: 2,
    name: "이나눔",
    phone: "010-2345-6789",
    area: "아동교육",
    hours: 85,
    status: "활동중",
  },
  {
    id: 3,
    name: "박도움",
    phone: "010-3456-7890",
    area: "환경정리",
    hours: 200,
    status: "휴식중",
  },
  {
    id: 4,
    name: "최사랑",
    phone: "010-4567-8901",
    area: "의료지원",
    hours: 45,
    status: "활동중",
  },
];

export default function VolunteersPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">자원봉사자 관리</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + 봉사자 등록
        </button>
      </div>

      {/* 자동화 흐름 안내 (캡쳐1 기반) */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">관리 자동화 흐름</h3>
        <div className="flex items-center gap-4">
          {[
            {
              step: "1단계",
              title: "폴더 세팅",
              desc: "컨텍스트 파일, 데이터 파일, 양식 템플릿",
              color: "bg-blue-50 border-blue-200",
            },
            {
              step: "2단계",
              title: "코워크 실행",
              desc: "실시간 문서·보고서 자동 생성",
              color: "bg-green-50 border-green-200",
            },
            {
              step: "3단계",
              title: "스케줄 자동화",
              desc: "매월 1일 자동 실행, 메일 알림",
              color: "bg-purple-50 border-purple-200",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex-1 p-4 rounded-lg border ${item.color}`}>
                <p className="text-xs font-bold text-gray-500">{item.step}</p>
                <p className="font-medium text-gray-900 mt-1">{item.title}</p>
                <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
              </div>
              {i < 2 && (
                <span className="text-gray-300 mx-2 text-xl">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 봉사자 등록 폼 */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">신규 봉사자 등록</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연락처
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                활동 분야
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>노인돌봄</option>
                <option>아동교육</option>
                <option>환경정리</option>
                <option>의료지원</option>
                <option>행정지원</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작일
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              등록
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 봉사자 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                이름
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                연락처
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                활동 분야
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                누적 시간
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                상태
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sampleVolunteers.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {v.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{v.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{v.area}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {v.hours}시간
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      v.status === "활동중"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    보고서 생성
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
