import Link from "next/link";

const links = [
  { href: "/", label: "首頁" },
  { href: "/portfolio", label: "作品集" },
  { href: "/blog", label: "部落格" },
  { href: "/#contact", label: "聯絡我" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[#0a0e14]/80 border-b border-white/10">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-wide">
          William<span className="text-sky-400">.</span>
        </Link>
        <div className="flex gap-5 text-sm text-gray-300">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-sky-400 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
