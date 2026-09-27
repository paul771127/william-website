import Link from "next/link";
import { profile } from "@/lib/data";
import { getProjects } from "@/lib/queries";
import ProjectCard from "@/components/ProjectCard";
import HeroInteractive from "@/components/HeroInteractive";
import TiltCard from "@/components/TiltCard";
import Reveal from "@/components/Reveal";
import ScrambleText from "@/components/ScrambleText";
import MagneticButton from "@/components/MagneticButton";
import BlueprintArm from "@/components/BlueprintArm";

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

      {/* 機構藍圖:自己畫出來,然後動起來 */}
      <section className="space-y-8">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="font-mono-ui text-[11px] tracking-[0.35em] text-sky-400/90 uppercase">
                02 — Motion
              </p>
              <ScrambleText as="h2" text="機構設計" className="font-display text-2xl font-bold mt-2" />
            </div>
            <p className="text-sm text-gray-400 sm:text-right max-w-sm">
              從尺寸標註到運動模擬。這張圖會自己畫出來,畫完之後三軸開始連續動作。
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <BlueprintArm />
        </Reveal>
      </section>

      {/* 精選作品 */}
      <section className="space-y-8">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono-ui text-[11px] tracking-[0.35em] text-sky-400/90 uppercase">
                03 — Work
              </p>
              <ScrambleText as="h2" text="精選作品" className="font-display text-2xl font-bold mt-2" />
            </div>
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
          <ScrambleText as="h2" text="聯絡我" className="text-2xl font-bold" />
          <p className="text-gray-400">
            有合作機會或技術交流,歡迎透過以下方式聯繫,或直接使用右下角的 AI 客服提問。
          </p>
          <div className="flex justify-center gap-4">
            <MagneticButton>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="skill-pill inline-block px-5 py-2 rounded-lg border border-white/20 hover:border-sky-400 hover:text-sky-400 transition-colors"
              >
                GitHub
              </a>
            </MagneticButton>
            {profile.email && (
              <MagneticButton>
                <a
                  href={`mailto:${profile.email}`}
                  className="skill-pill inline-block px-5 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors"
                >
                  寄信給我
                </a>
              </MagneticButton>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
