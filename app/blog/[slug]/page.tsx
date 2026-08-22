import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/queries";

export const revalidate = 60;

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="py-16 max-w-3xl mx-auto space-y-6">
      <Link href="/blog" className="text-sm text-sky-400 hover:underline">
        ← 回部落格
      </Link>
      <div>
        <time className="text-xs text-gray-500">
          {new Date(post.published_at).toLocaleDateString("zh-TW")}
        </time>
        <h1 className="text-3xl font-bold mt-1">{post.title}</h1>
      </div>
      {/* 內容以純文字段落呈現;之後可換成 markdown 渲染 */}
      <div className="space-y-4 text-gray-300 leading-relaxed">
        {post.content.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {para.replace(/^#+\s*/, "")}
          </p>
        ))}
      </div>
    </article>
  );
}
