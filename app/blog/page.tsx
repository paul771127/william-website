import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/queries";

export const metadata: Metadata = { title: "部落格 | William" };
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="py-16 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">部落格</h1>
        <p className="text-gray-400 mt-2">AI 整合與機電開發的實戰筆記。</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500 border border-dashed border-white/15 rounded-xl p-10 text-center">
          文章即將上線,敬請期待。
        </p>
      ) : (
        <ul className="space-y-5">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-6 hover:border-sky-400/50 transition-colors"
              >
                <time className="text-xs text-gray-500">
                  {new Date(post.published_at).toLocaleDateString("zh-TW")}
                </time>
                <h2 className="text-xl font-semibold mt-1">{post.title}</h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-400 mt-2">{post.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
