import Reveal from "@/components/Reveal";

/** 一項專長:左右交錯的圖文排版,捲進畫面才浮現 */
export default function Capability({
  index,
  title,
  desc,
  tags,
  flip = false,
  children,
}: {
  index: string;
  title: string;
  desc: string;
  tags: string[];
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.35fr)] lg:gap-10 lg:items-center">
        <div className={flip ? "lg:order-2" : undefined}>
          <div className="flex items-baseline gap-3">
            <span className="font-mono-ui text-sky-400/70 text-sm">{index}</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold mt-3">{title}</h3>
          <p className="text-gray-400 leading-relaxed mt-3 text-sm sm:text-base">{desc}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((t) => (
              <span
                key={t}
                className="font-mono-ui text-[11px] px-2.5 py-1 rounded-full border border-sky-400/25 text-sky-300/80"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className={flip ? "lg:order-1" : undefined}>{children}</div>
      </div>
    </Reveal>
  );
}
