/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/queries";

export const revalidate = 60;

/** 可直接用 <video> 播的檔案;其餘(YouTube/Vimeo 等)走 iframe 嵌入 */
function isVideoFile(url: string) {
  const u = url.toLowerCase();
  return [".mp4", ".webm", ".mov", ".m4v"].some((ext) => u.includes(ext));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="py-16 max-w-3xl mx-auto space-y-8">
      <Link href="/portfolio" className="text-sm text-sky-400 hover:underline">
        ← 回作品集
      </Link>

      {/* 主視覺 */}
      <div className="aspect-video rounded-2xl border border-white/10 bg-gradient-to-br from-sky-900/40 to-slate-950 overflow-hidden flex items-center justify-center">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">專案圖片準備中</span>
        )}
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <div className="flex flex-wrap gap-2">
          {project.tags?.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-full bg-sky-400/10 text-sky-300"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="text-lg text-gray-300 leading-relaxed">{project.summary}</p>
      </div>

      {/* 展示影片 */}
      <div className="border-t border-white/10 pt-8">
        <p className="text-xs uppercase tracking-widest text-sky-300/80 mb-2">Demo</p>
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center">
          {project.video_url ? (
            isVideoFile(project.video_url) ? (
              <video
                src={project.video_url}
                controls
                playsInline
                preload="metadata"
                poster={project.image_url ?? undefined}
                className="w-full h-full object-cover"
              />
            ) : (
              <iframe
                src={project.video_url}
                title={` 展示影片`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )
          ) : (
            <div className="text-center text-gray-500 text-sm px-4">
              <div className="text-3xl mb-1">🎬</div>
              展示影片位置(準備中)
            </div>
          )}
        </div>
      </div>

      {project.description ? (
        <div className="space-y-4 text-gray-400 leading-relaxed border-t border-white/10 pt-8">
          {project.description.split(/\n{2,}/).map((para, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {para}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 border-t border-white/10 pt-8">
          詳細介紹與圖片即將更新。
        </p>
      )}
    </article>
  );
}
