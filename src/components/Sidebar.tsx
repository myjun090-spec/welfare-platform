"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: "📊" },
  { href: "/resources", label: "복지자원 검색", icon: "🔍" },
  { href: "/volunteers", label: "자원봉사자 관리", icon: "🤝" },
  { href: "/research", label: "논문/연구", icon: "📝" },
  { href: "/teams", label: "팀 협업", icon: "👥" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">복지 플랫폼</h1>
        <p className="text-sm text-gray-500 mt-1">사회복지 연구·실무 통합</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold">
            관
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">관리자</p>
            <p className="text-xs text-gray-500">admin@welfare.kr</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
