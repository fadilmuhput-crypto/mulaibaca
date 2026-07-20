import Link from "next/link";
import { BookCopy, Users, Star, Layout, FileText, HelpCircle, MessageSquare, BarChart3, MessageCircle, GitCompare } from "lucide-react";

const MENUS = [
  { href: "/admin/buku",     icon: BookCopy,     label: "Buku",          desc: "Kelola katalog buku curated",       color: "text-forest" },
  { href: "/admin/members",  icon: Users,        label: "Anggota",       desc: "Anggota keluarga & pengguna",        color: "text-blue-600" },
  { href: "/admin/review",   icon: Star,         label: "Review",        desc: "Moderasi review buku",               color: "text-amber" },
  { href: "/admin/jelajah",  icon: Layout,       label: "Halaman Jelajah", desc: "Atur section & banner jelajah",    color: "text-purple-600" },
  { href: "/admin/blog",     icon: FileText,     label: "Blog",          desc: "Tulis & kelola artikel blog",        color: "text-ink" },
  { href: "/admin/bantuan",  icon: HelpCircle,   label: "Bantuan",       desc: "Atur FAQ & panduan",                 color: "text-info" },
  { href: "/admin/feedback", icon: MessageSquare, label: "Feedback",     desc: "Balas masukan pengguna",             color: "text-amber" },
  { href: "/admin/metrics",  icon: BarChart3,    label: "Metrics",       desc: "Dashboard statistik & analitik",     color: "text-forest" },
  { href: "/admin/threads",  icon: MessageCircle, label: "Threads",      desc: "CRM & AI threads",                   color: "text-ink-secondary" },
  { href: "/admin/dedup",    icon: GitCompare,    label: "Dedup",        desc: "Gabung & bersihkan duplikat buku",   color: "text-red-500" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-ink mb-1">Admin Panel</h1>
      <p className="text-sm text-ink-muted mb-8">Pilih menu untuk mengelola konten dan data mulaibaca.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MENUS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group bg-surface border border-border rounded-2xl p-5 hover:border-amber/40 hover:shadow-sm transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-parchment flex items-center justify-center mb-3 group-hover:scale-105 transition-transform ${m.color}`}>
              <m.icon size={20} strokeWidth={1.75} />
            </div>
            <h2 className="font-semibold text-ink text-sm">{m.label}</h2>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
