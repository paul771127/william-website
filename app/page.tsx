import Link from "next/link";
import { profile } from "@/lib/data";
import { getProjects } from "@/lib/queries";
import ProjectCard from "@/components/ProjectCard";
import HeroInteractive from "@/components/HeroInteractive";
import TiltCard from "@/components/TiltCard";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export default async function Home() {
  const projects = (await getProjects()).slice(0, 2);

  return (
    <div className="py-16 space-y-24">
      {/* Hero:電路粒子場 + 游標聚光燈 + 磁吸標題 */}
      <HeroInteractive
        name={profile.name}
        title={profile.title}
        skills={profile.skills}
        intro={profile.intro}
      />

      {/* 精選作品 */}
      <section className="space-y-8">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold">精選作品</h2>
            <Link href="/portfolio" className="text-sm text-sky-400 hover:underline">
              查看全部 →
            </Link>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 120} className="h-full">
              <TiltCard>
                <ProjectCard project={p} />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 聯絡我 */}
      <Reveal>
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
              className="skill-pill px-5 py-2 rounded-lg border border-white/20 hover:border-sky-400 hover:text-sky-400 transition-colors"
            >
              GitHub
            </a>
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="skill-pill px-5 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors"
              >
                寄信給我
              </a>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
