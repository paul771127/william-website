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
import ScopeTrace from "@/components/ScopeTrace";
import NavConsole from "@/components/NavConsole";
import AndroidPanel from "@/components/AndroidPanel";
import InferenceFlow from "@/components/InferenceFlow";
import Capability from "@/components/Capability";

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

      {/* 能力:每一項專長各有一組動畫 */}
      <section className="space-y-10">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="font-mono-ui text-[11px] tracking-[0.35em] text-sky-400/90 uppercase">
                02 — Capabilities
              </p>
              <ScrambleText as="h2" text="我做的事" className="font-display text-2xl font-bold mt-2" />
            </div>
            <p className="text-sm text-gray-400 sm:text-right max-w-sm">
              從機構、韌體、地面軟體到 App 與地端 AI,一條龍把一台機器做到會動、會通訊、會判斷。
            </p>
          </div>
        </Reveal>

        <Capability
          index="01"
          title="機構設計"
          desc="從尺寸標註、連桿配置到運動模擬。這張圖會自己畫出來,畫完之後三軸開始連續取放動作。"
          tags={["3D 機構", "公差配合", "運動學"]}
        >
          <BlueprintArm />
        </Capability>

        <Capability
          index="02"
          title="韌體撰寫"
          desc="馬達驅動、感測器讀值與即時控制迴路。PWM、正交編碼器與電流回授在示波器上連續掃過。"
          tags={["STM32", "PWM / 編碼器", "即時控制"]}
          flip
        >
          <ScopeTrace />
        </Capability>

        <Capability
          index="03"
          title="軟體撰寫"
          desc="地面站導航軟體:航點規劃、任務下載與即時遙測。船沿著航線自動航行,船首隨航向轉動。"
          tags={["地面站", "航點任務", "遙測鏈路"]}
        >
          <NavConsole />
        </Capability>

        <Capability
          index="04"
          title="Android 開發"
          desc="現場人員不必開工程軟體就能教導與調機。Jog 操作、點位管理與 DO/DI 狀態即時回饋。"
          tags={["Android", "TCP API", "PLC 整合"]}
          flip
        >
          <AndroidPanel />
        </Capability>

        <Capability
          index="05"
          title="AI 整合"
          desc="模型跑在自己的機器上,資料不出機房。輸入經過網路層層傳遞,即時吐出判讀與建議。"
          tags={["地端部署", "推論最佳化", "應用整合"]}
        >
          <InferenceFlow />
        </Capability>
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
