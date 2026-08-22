import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} {profile.name} — {profile.title}</p>
        <div className="flex gap-4">
          <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-sky-400">
            GitHub
          </a>
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="hover:text-sky-400">
              Email
            </a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-sky-400">
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
