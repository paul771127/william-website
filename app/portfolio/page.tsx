import type { Metadata } from "next";
import { getProjects } from "@/lib/queries";
import ProjectCard from "@/components/ProjectCard";

export const metadata: Metadata = { title: "作品集 | William" };
export const revalidate = 60;

export default async function PortfolioPage() {
  const projects = await getProjects();

  return (
    <div className="py-16 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">作品集</h1>
        <p className="text-gray-400 mt-2">
          機電整合、AI 應用與 Android 工業軟體的實作專案。
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
