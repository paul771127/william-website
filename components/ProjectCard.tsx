/* eslint-disable @next/next/no-img-element */
import { Project } from "@/lib/data";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-sky-400/50 transition-colors">
      <div className="aspect-video bg-gradient-to-br from-sky-900/40 to-slate-900 flex items-center justify-center">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500 text-sm">圖片準備中</span>
        )}
      </div>
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold">{project.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{project.summary}</p>
        {project.description && (
          <p className="text-sm text-gray-500 leading-relaxed">{project.description}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {project.tags?.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded bg-sky-400/10 text-sky-300">
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
