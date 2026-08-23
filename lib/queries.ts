import { getSupabase } from "./supabase";
import { fallbackProjects, Project, Post } from "./data";

export async function getProjects(): Promise<Project[]> {
  const supabase = getSupabase();
  if (!supabase) return fallbackProjects;
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  // 資料表為空或還沒跑 slug 欄位的 migration 時,改用內建預設內容
  if (error || !data || data.length === 0 || !data[0].slug) {
    return fallbackProjects;
  }
  return data as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const fallback = fallbackProjects.find((p) => p.slug === slug) ?? null;
  const supabase = getSupabase();
  if (!supabase) return fallback;
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return fallback;
  return data as Project;
}

export async function getPosts(): Promise<Post[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, content, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, content, published_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error) return null;
  return data as Post;
}
