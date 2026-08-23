import type { Metadata } from "next";
import { getProjects } from "@/lib/queries";
import CardFan from "@/components/CardFan";

export const metadata: Metadata = { title: "作品集 | William" };
export const revalidate = 60;

export default async function PortfolioPage() {
  const projects = await getProjects();

  return (
    <div className="py-16 space-y-6 overflow-hidden">
      <div className="text-center">
        <h1 className="text-3xl font-bold">作品集</h1>
        <p className="text-gray-400 mt-2">
          機電整合、AI 應用與軟韌體開發的實作專案。
        </p>
        <p className="text-sm text-sky-300/80 mt-4">
          將滑鼠移到手牌上,點擊卡牌進入專案介紹
        </p>
      </div>
      <CardFan projects={projects} />
    </div>
  );
}
