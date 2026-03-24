import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "사회복지 통합 플랫폼",
  description: "사회복지 연구·실무 통합 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-gray-50">
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 ml-64 p-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
