import Link from "next/link";
import { profile } from "@/lib/data";
import { getProjects } from "@/lib/queries";
import ProjectCard from "@/components/ProjectCard";

export const revalidate = 60;

export default async function Home() {
  const projects = (await getProjects()).slice(0, 2);

  return (
    <div className="py-16 space-y-24">
      {/* Hero */}
      <section className="text-center space-y-6">
        <p className="text-sky-400 tracking-widest text-sm">PORTFOLIO</p>
        <h1 className="text-4xl sm:text-6xl font-bold">
          {profile.name}
        </h1>
        <p className="text-xl text-gray-300">{profile.title}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {profile.skills.map((s) => (
            <span
              key={s}
              className="px-4 py-1.5 rounded-full border border-sky-400/40 text-sky-300 text-sm"
            >
              {s}
            </span>
          ))}
        </div>
        <p className="max-w-2xl mx-auto text-gray-400 leading-relaxed">
          {profile.intro}
        </p>
      </section>

      {/* 精選作品 */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">精選作品</h2>
          <Link href="/portfolio" className="text-sm text-sky-400 hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      {/* 聯絡我 */}
      <section id="contact" className="text-center space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-bold">聯絡我</h2>
        <p className="text-gray-400">
          有合作機會或技術交流,歡迎透過以下方式聯繫,或直接使用右下角的 AI 客服提問。
        </p>
        <div className="flex justify-center gap-4">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2 rounded-lg border border-white/20 hover:border-sky-400 hover:text-sky-400 transition-colors"
          >
            GitHub
          </a>
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="px-5 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors"
            >
              寄信給我
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
