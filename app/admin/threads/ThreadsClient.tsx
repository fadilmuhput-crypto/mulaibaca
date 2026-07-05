"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle, Users, TrendingUp, CheckCircle2, Sparkles,
  ArrowLeft, Plus, Copy, RefreshCw, Send, FileText,
  Hash, Eye, BarChart3, Zap, BookOpen, Trash2, Search, X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

type Stage = "new" | "chatting" | "warm" | "ready" | "pitched" | "converted" | "cold";

type View =
  | { type: "overview" }
  | { type: "questions" }
  | { type: "explore" }
  | { type: "insight" }
  | { type: "discussion"; discussionId: string }
  | { type: "conversation"; discussionId: string; conversationId: string };

interface Message {
  id: string;
  sender: "audience" | "brand";
  text: string;
  timestamp: string;
  aiGenerated?: boolean;
}

interface Conversation {
  id: string;
  audienceName: string;
  audienceHandle: string;
  stage: Stage;
  messages: Message[];
  notes: string;
  lastActivity: string;
}

interface Discussion {
  id: string;
  question: string;
  theme: string;
  audience?: Audience;
  status: "draft" | "active" | "closed";
  createdAt: string;
  conversations: Conversation[];
}

interface GeneratedQuestion {
  question: string;
  angle: string;
}

interface CarouselSlide {
  label: string;
  heading: string;
  body: string;
}

interface ContentIdea {
  type: "carousel" | "single" | "quote" | "blog";
  title?: string;
  hook?: string;
  slides?: Array<CarouselSlide | string>;
  caption?: string;
  body?: string;
  text?: string;
  context?: string;
  cta: string;
}

interface InsightResult {
  themes: string[];
  insights: string[];
  content_ideas: ContentIdea[];
}

// ── Constants ──────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  new:       { label: "Baru Masuk",    color: "#92400E", bg: "#FEF3C7", border: "#F59E0B", emoji: "🆕" },
  chatting:  { label: "Ngobrol",       color: "#1E40AF", bg: "#DBEAFE", border: "#3B82F6", emoji: "💬" },
  warm:      { label: "Hangat",        color: "#065F46", bg: "#D1FAE5", border: "#10B981", emoji: "🔥" },
  ready:     { label: "Siap Diajak",   color: "#4C1D95", bg: "#EDE9FE", border: "#8B5CF6", emoji: "🎯" },
  pitched:   { label: "Sudah Diajak",  color: "#831843", bg: "#FCE7F3", border: "#EC4899", emoji: "📤" },
  converted: { label: "Bergabung!",    color: "#064E3B", bg: "#D1FAE5", border: "#059669", emoji: "✅" },
  cold:      { label: "Tidak Aktif",   color: "#374151", bg: "#F3F4F6", border: "#9CA3AF", emoji: "❄️" },
};

const ALL_STAGES: Stage[] = ["new", "chatting", "warm", "ready", "pitched", "converted", "cold"];

type Audience = "individu" | "keluarga";

const AUDIENCE_CONFIG: Record<Audience, { label: string; emoji: string }> = {
  individu: { label: "Individu", emoji: "🙋" },
  keluarga: { label: "Keluarga", emoji: "👨‍👩‍👧" },
};

const THEMES_BY_AUDIENCE: Record<Audience, string[]> = {
  individu: [
    "Membangun kebiasaan baca",
    "Reading slump & cara keluar",
    "Konsistensi baca di tengah kesibukan",
    "TBR numpuk vs realita",
    "Buku yang mengubah hidup",
    "Baca buku vs scroll HP",
    "Ritual & waktu favorit membaca",
    "Buku pertama yang bikin jatuh cinta baca",
  ],
  keluarga: [
    "Membaca bersama anak",
    "Buku favorit keluarga",
    "Membangun kebiasaan baca anak",
    "Rekomendasi buku anak",
    "Pengalaman pertama membaca",
    "Tantangan membaca buku",
    "Reading habits keluarga",
    "Perpustakaan rumah",
  ],
};

const SAMPLE_DATA: Discussion[] = [
  {
    id: "demo-1",
    question: "Gimana cara kalian bikin anak mau baca buku sendiri tanpa disuruh? 📚",
    theme: "Membaca bersama anak",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    conversations: [
      {
        id: "conv-1",
        audienceName: "Bunda Rara",
        audienceHandle: "@bundarara_id",
        stage: "warm",
        lastActivity: new Date(Date.now() - 3600000).toISOString(),
        notes: "Anak 6 tahun, suka komik Doraemon. Belum mau baca teks biasa.",
        messages: [
          {
            id: "m1", sender: "audience",
            text: "Anak aku 6 tahun baru mau baca kalau ada gambarnya. Komik Doraemon aja yang masuk 😅",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: "m2", sender: "brand",
            text: "Haha valid banget! Komik itu actually salah satu gateway terbaik lho. Anak kamu suka Doraemon cerita yang gimana yang paling disuka?",
            timestamp: new Date(Date.now() - 6900000).toISOString(),
            aiGenerated: true,
          },
          {
            id: "m3", sender: "audience",
            text: "Yang petualangan-petualangan gitu. Tapi tetep gamau baca buku biasa, udah coba beliin beberapa buku masih nolak 😔",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      },
      {
        id: "conv-2",
        audienceName: "Papah Dito",
        audienceHandle: "@ditopratama88",
        stage: "pitched",
        lastActivity: new Date(Date.now() - 10800000).toISOString(),
        notes: "Rutin baca 15 menit sebelum tidur sejak anak usia 4 tahun. Anak sekarang 8 tahun.",
        messages: [
          {
            id: "m4", sender: "audience",
            text: "Kuncinya konsisten sih. Kita biasain tiap malem 15 menit sebelum tidur baca bareng dari dia umur 4 tahun",
            timestamp: new Date(Date.now() - 14400000).toISOString(),
          },
          {
            id: "m5", sender: "brand",
            text: "Wah konsisten dari usia 4 tahun, salut banget! Sekarang udah umur berapa? Dan buku genrenya udah berkembang atau masih di zona nyaman yang sama?",
            timestamp: new Date(Date.now() - 14100000).toISOString(),
            aiGenerated: true,
          },
          {
            id: "m6", sender: "audience",
            text: "Sekarang 8 tahun. Udah mau baca sendiri cerita yang lebih panjang, sekarang lagi suka buku petualangan",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
          },
          {
            id: "m7", sender: "brand",
            text: "Keren banget progressnya! 4 tahun konsisten itu luar biasa. Kalau kamu pengen track perjalanan baca dia sekaligus log bacaan harian, coba mulaibaca — gratis dan bisa invite seluruh keluarga.",
            timestamp: new Date(Date.now() - 10500000).toISOString(),
            aiGenerated: true,
          },
        ],
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "baru saja";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m lalu`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}j lalu`;
  return `${Math.floor(diff / 86400000)}h lalu`;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    try {
      const s = localStorage.getItem(key);
      if (s) setState(JSON.parse(s));
    } catch { /* ignore */ }
  }, [key]);

  const set = useCallback(
    (v: T | ((p: T) => T)) => {
      setState((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key]
  );

  return [state, set];
}

// ── UI atoms ───────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: Stage }) {
  const cfg = STAGE_CONFIG[stage];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────

function Sidebar({
  view, setView, activeCount, onAdd,
}: {
  view: View;
  setView: (v: View) => void;
  activeCount: number;
  onAdd: () => void;
}) {
  const items: Array<{
    type: "overview" | "questions" | "explore" | "insight";
    icon: typeof BarChart3;
    label: string;
    badge?: number;
  }> = [
    { type: "overview", icon: BarChart3, label: "Overview" },
    { type: "questions", icon: MessageCircle, label: "Pertanyaan", badge: activeCount },
    { type: "explore", icon: Sparkles, label: "Eksplorasi" },
    { type: "insight", icon: Eye, label: "Insight" },
  ];

  return (
    <div className="w-48 shrink-0 border-r border-border pr-4 space-y-1">
      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider px-3 mb-3 pt-1">
        Threads CRM
      </p>
      {items.map((item) => {
        const { type, icon: Icon, label } = item;
        const badge = "badge" in item ? item.badge : undefined;
        const active =
          view.type === type ||
          (type === "questions" && (view.type === "discussion" || view.type === "conversation"));
        return (
          <button
            key={type}
            onClick={() => setView({ type } as View)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-amber text-white"
                : "text-ink-secondary hover:bg-parchment hover:text-ink"
            }`}
          >
            <Icon size={14} />
            <span className="flex-1 text-left">{label}</span>
            {badge !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? "bg-white/20 text-white" : "bg-parchment text-ink-muted"
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
      <div className="pt-3">
        <button
          onClick={onAdd}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-amber border border-amber/30 hover:bg-amber/5 transition-colors"
        >
          <Plus size={13} /> Tambah Pertanyaan
        </button>
      </div>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────

function OverviewView({
  discussions, setView, onClearDemo,
}: {
  discussions: Discussion[];
  setView: (v: View) => void;
  onClearDemo: () => void;
}) {
  const allConvs = discussions.flatMap((d) => d.conversations);
  const warm = allConvs.filter((c) => c.stage === "warm" || c.stage === "ready").length;
  const converted = allConvs.filter((c) => c.stage === "converted").length;

  const needResponse = discussions.flatMap((d) =>
    d.conversations
      .filter((c) => {
        const last = c.messages[c.messages.length - 1];
        return last?.sender === "audience" && !["converted", "cold"].includes(c.stage);
      })
      .map((c) => ({ discussion: d, conversation: c }))
  );

  return (
    <div className="space-y-6">
      <h2 className="text-h2">Overview</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Pertanyaan Aktif", value: discussions.filter((d) => d.status === "active").length, icon: MessageCircle, color: "text-forest" },
          { label: "Total Percakapan", value: allConvs.length, icon: Users, color: "text-blue-600" },
          { label: "Prospek Hangat", value: warm, icon: TrendingUp, color: "text-amber" },
          { label: "Bergabung", value: converted, icon: CheckCircle2, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-xl border border-border p-4">
            <s.icon size={17} className={s.color} />
            <p className="text-2xl font-bold text-ink mt-2">{s.value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {discussions.some((d) => d.id.startsWith("demo-")) && (
        <div className="flex items-center justify-between bg-amber/8 border border-amber/20 rounded-xl px-4 py-3">
          <p className="text-xs text-amber font-medium">Data demo aktif — hapus setelah kamu tambah pertanyaan pertamamu.</p>
          <button onClick={onClearDemo} className="text-xs font-bold text-amber underline ml-3 shrink-0">
            Hapus demo
          </button>
        </div>
      )}

      {needResponse.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
            <Zap size={14} className="text-amber" /> Perlu Respons ({needResponse.length})
          </h3>
          <div className="space-y-2">
            {needResponse.slice(0, 6).map(({ discussion, conversation }) => {
              const last = conversation.messages[conversation.messages.length - 1];
              return (
                <button
                  key={conversation.id}
                  onClick={() =>
                    setView({
                      type: "conversation",
                      discussionId: discussion.id,
                      conversationId: conversation.id,
                    })
                  }
                  className="w-full bg-surface border border-border rounded-xl p-3 text-left hover:border-amber/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <StageBadge stage={conversation.stage} />
                    <span className="text-xs font-semibold text-ink">{conversation.audienceName}</span>
                    <span className="text-xs text-ink-muted">{conversation.audienceHandle}</span>
                    <span className="text-xs text-ink-muted ml-auto">{formatTime(conversation.lastActivity)}</span>
                  </div>
                  {last && (
                    <p className="text-xs text-ink-secondary line-clamp-1 pl-0.5">
                      &ldquo;{last.text}&rdquo;
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {allConvs.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <MessageCircle size={28} className="mx-auto text-ink-muted mb-3" />
          <p className="text-sm text-ink-secondary">Belum ada percakapan.</p>
          <p className="text-xs text-ink-muted mt-1">Mulai dengan tambah pertanyaan atau eksplorasi ide pertanyaan.</p>
        </div>
      )}
    </div>
  );
}

// ── Questions List ─────────────────────────────────────────────────────

function QuestionsView({
  discussions, setView, onAdd, onDelete,
}: {
  discussions: Discussion[];
  setView: (v: View) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h2">Pertanyaan</h2>
        <button onClick={onAdd} className="btn-primary-sm flex items-center gap-1.5">
          <Plus size={13} /> Tambah
        </button>
      </div>

      {discussions.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Hash size={28} className="mx-auto text-ink-muted mb-3" />
          <p className="text-sm text-ink-secondary">Belum ada pertanyaan.</p>
          <button onClick={onAdd} className="btn-secondary mt-3 inline-flex">
            + Tambah Pertanyaan
          </button>
        </div>
      )}

      <div className="space-y-3">
        {discussions.map((d) => {
          const stageCounts = ALL_STAGES.reduce(
            (acc, s) => ({ ...acc, [s]: d.conversations.filter((c) => c.stage === s).length }),
            {} as Record<Stage, number>
          );
          const activeStages = ALL_STAGES.filter((s) => stageCounts[s] > 0);
          const needsResponse = d.conversations.filter((c) => {
            const last = c.messages[c.messages.length - 1];
            return last?.sender === "audience" && !["converted", "cold"].includes(c.stage);
          }).length;

          return (
            <div key={d.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <p className="font-semibold text-ink flex-1">{d.question}</p>
                    {needsResponse > 0 && (
                      <span className="text-[10px] font-bold text-amber border border-amber/40 px-1.5 py-0.5 rounded-full shrink-0">
                        {needsResponse} perlu respons
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.status === "active" ? "bg-green-50 text-green-700" :
                      d.status === "draft" ? "bg-gray-100 text-gray-500" : "bg-gray-100 text-gray-400"
                    }`}>
                      {d.status === "active" ? "● Aktif" : d.status === "draft" ? "Draft" : "Selesai"}
                    </span>
                    {d.audience && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                        {AUDIENCE_CONFIG[d.audience].emoji} {AUDIENCE_CONFIG[d.audience].label}
                      </span>
                    )}
                    <span className="text-xs text-ink-muted">{d.theme}</span>
                    <span className="text-xs text-ink-muted">·</span>
                    <span className="text-xs text-ink-muted">{d.conversations.length} percakapan</span>
                    <span className="text-xs text-ink-muted">·</span>
                    <span className="text-xs text-ink-muted">{formatTime(d.createdAt)}</span>
                  </div>
                  {activeStages.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {activeStages.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: STAGE_CONFIG[s].color, background: STAGE_CONFIG[s].bg }}
                        >
                          {STAGE_CONFIG[s].emoji} {stageCounts[s]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(d.id); }}
                    className="p-1.5 text-ink-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => setView({ type: "discussion", discussionId: d.id })}
                    className="btn-secondary text-sm"
                  >
                    Lihat →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Discussion Detail ──────────────────────────────────────────────────

function DiscussionView({
  discussion, setView, onAddConversation, onDeleteDiscussion, onDeleteConversation,
}: {
  discussion: Discussion;
  setView: (v: View) => void;
  onAddConversation: () => void;
  onDeleteDiscussion: () => void;
  onDeleteConversation: (convId: string) => void;
}) {
  return (
    <div className="space-y-5">
      <button
        onClick={() => setView({ type: "questions" })}
        className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={14} /> Semua Pertanyaan
      </button>

      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-start gap-2">
          <p className="font-bold text-ink flex-1">{discussion.question}</p>
          <button
            onClick={onDeleteDiscussion}
            className="p-1.5 text-ink-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            title="Hapus pertanyaan"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            discussion.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            {discussion.status === "active" ? "● Aktif" : "Draft"}
          </span>
          <span className="text-xs text-ink-muted">{discussion.theme}</span>
          <span className="text-xs text-ink-muted">·</span>
          <span className="text-xs text-ink-muted">{discussion.conversations.length} percakapan</span>
        </div>
      </div>

      {/* Stage pipeline */}
      <div className="grid grid-cols-7 gap-1.5">
        {ALL_STAGES.map((s) => {
          const count = discussion.conversations.filter((c) => c.stage === s).length;
          return (
            <div
              key={s}
              className="text-center p-2 rounded-lg border border-border"
              style={count > 0 ? { background: STAGE_CONFIG[s].bg, borderColor: STAGE_CONFIG[s].border } : {}}
            >
              <p className="text-base">{STAGE_CONFIG[s].emoji}</p>
              <p className="text-base font-bold text-ink">{count}</p>
              <p className="text-[9px] text-ink-muted leading-tight">{STAGE_CONFIG[s].label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-ink">Percakapan ({discussion.conversations.length})</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setView({ type: "insight" })}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <BarChart3 size={12} /> Generate Insight
          </button>
          <button
            onClick={onAddConversation}
            className="btn-primary-sm flex items-center gap-1.5"
          >
            <Plus size={13} /> Tambah Respons
          </button>
        </div>
      </div>

      {discussion.conversations.length === 0 && (
        <div className="text-center py-8 border border-dashed border-border rounded-xl">
          <p className="text-sm text-ink-secondary">Belum ada yang merespons.</p>
          <button onClick={onAddConversation} className="btn-secondary mt-2 inline-flex text-sm">
            + Tambah Respons dari Threads
          </button>
        </div>
      )}

      <div className="space-y-2">
        {discussion.conversations.map((c) => {
          const last = c.messages[c.messages.length - 1];
          const needsResponse = last?.sender === "audience" && !["converted", "cold"].includes(c.stage);
          return (
            <div
              key={c.id}
              className={`relative group bg-surface rounded-xl p-3.5 transition-colors border ${
                needsResponse ? "border-amber/40" : "border-border"
              }`}
            >
              <button
                onClick={() =>
                  setView({ type: "conversation", discussionId: discussion.id, conversationId: c.id })
                }
                className="w-full text-left"
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap pr-7">
                  <StageBadge stage={c.stage} />
                  <span className="font-semibold text-sm text-ink">{c.audienceName}</span>
                  <span className="text-xs text-ink-muted">{c.audienceHandle}</span>
                  <span className="text-xs text-ink-muted ml-auto">{formatTime(c.lastActivity)}</span>
                  {needsResponse && (
                    <span className="text-[10px] font-bold text-amber border border-amber/40 px-1.5 py-0.5 rounded-full">
                      Perlu Respons
                    </span>
                  )}
                </div>
                {last && (
                  <p className="text-xs text-ink-secondary line-clamp-1">
                    {last.sender === "brand" ? "→ " : ""}
                    {last.text}
                  </p>
                )}
                {c.notes && (
                  <p className="text-xs text-ink-muted mt-1 italic line-clamp-1">📝 {c.notes}</p>
                )}
              </button>
              <button
                onClick={() => onDeleteConversation(c.id)}
                className="absolute top-3 right-3 p-1 text-ink-muted hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Hapus percakapan"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Conversation View ──────────────────────────────────────────────────

function ConversationView({
  discussion, conversation, setView,
  onAddMessage, onUpdateStage, onUpdateNotes, onDelete,
}: {
  discussion: Discussion;
  conversation: Conversation;
  setView: (v: View) => void;
  onAddMessage: (text: string, sender: "audience" | "brand", aiGenerated?: boolean) => void;
  onUpdateStage: (stage: Stage) => void;
  onUpdateNotes: (notes: string) => void;
  onDelete: () => void;
}) {
  const [msgText, setMsgText] = useState("");
  const [msgSender, setMsgSender] = useState<"audience" | "brand">("audience");
  const [aiResponse, setAiResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [notes, setNotes] = useState(conversation.notes);
  const [copied, setCopied] = useState(false);

  const generateResponse = async () => {
    setIsGenerating(true);
    setAiResponse("");
    setAiError("");
    try {
      const res = await fetch("/api/admin/threads-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "response",
          data: {
            question: discussion.question,
            messages: conversation.messages,
            stage: conversation.stage,
            audience: discussion.audience,
          },
        }),
      });
      const data = await res.json();
      if (data.error) setAiError(data.error);
      else setAiResponse(data.text || "");
    } catch {
      setAiError("Gagal terhubung ke server.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    copyText(aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseResponse = () => {
    if (!aiResponse.trim()) return;
    onAddMessage(aiResponse, "brand", true);
    setAiResponse("");
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setView({ type: "discussion", discussionId: discussion.id })}
        className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={14} />
        <span className="line-clamp-1">{discussion.question.slice(0, 50)}…</span>
      </button>

      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-parchment border border-border flex items-center justify-center text-sm font-bold text-forest shrink-0">
          {conversation.audienceName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink">{conversation.audienceName}</p>
          <p className="text-xs text-ink-muted">{conversation.audienceHandle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StageBadge stage={conversation.stage} />
          <select
            value={conversation.stage}
            onChange={(e) => onUpdateStage(e.target.value as Stage)}
            className="text-xs border border-border rounded-lg px-2 py-1 bg-surface text-ink focus:outline-none focus:border-amber"
          >
            {ALL_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_CONFIG[s].emoji} {STAGE_CONFIG[s].label}
              </option>
            ))}
          </select>
          <button
            onClick={onDelete}
            className="p-1.5 text-ink-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus percakapan"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Chat thread */}
      <div className="bg-parchment rounded-xl border border-border p-4 space-y-3 min-h-48">
        <p className="text-[11px] text-center text-ink-muted font-medium pb-2 border-b border-border/60 italic">
          &ldquo;{discussion.question}&rdquo;
        </p>
        {conversation.messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "brand" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.sender === "brand"
                  ? "bg-amber text-white rounded-tr-sm"
                  : "bg-surface border border-border text-ink rounded-tl-sm"
              }`}
            >
              <p>{m.text}</p>
              {m.aiGenerated && (
                <p className={`text-[10px] mt-1 ${m.sender === "brand" ? "text-white/60" : "text-ink-muted"}`}>
                  ✨ AI draft
                </p>
              )}
            </div>
          </div>
        ))}
        {conversation.messages.length === 0 && (
          <p className="text-center text-sm text-ink-muted py-4">Belum ada pesan.</p>
        )}
      </div>

      {/* AI Response composer */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-ink flex items-center gap-2">
            <Sparkles size={14} className="text-amber" /> Respons AI
          </p>
          <button
            onClick={generateResponse}
            disabled={isGenerating}
            className="btn-primary-sm flex items-center gap-1.5 disabled:opacity-60"
          >
            {isGenerating ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            {isGenerating ? "Generating…" : "Generate"}
          </button>
        </div>

        {aiError && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{aiError}</p>
        )}

        {aiResponse && (
          <>
            <div className="bg-parchment rounded-xl p-3 border border-amber/20">
              <textarea
                value={aiResponse}
                onChange={(e) => setAiResponse(e.target.value)}
                className="w-full bg-transparent text-sm text-ink resize-none outline-none min-h-16"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary flex items-center gap-1.5 text-xs flex-1"
              >
                <Copy size={12} /> {copied ? "Disalin!" : "Copy ke Threads"}
              </button>
              <button
                onClick={handleUseResponse}
                className="btn-primary flex items-center gap-1.5 text-xs flex-1"
              >
                <CheckCircle2 size={12} /> Simpan ke Chat
              </button>
            </div>
          </>
        )}

        {!aiResponse && !isGenerating && (
          <p className="text-xs text-ink-muted">
            Klik Generate untuk draft respons sesuai stage percakapan saat ini.
          </p>
        )}
      </div>

      {/* Manual message */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-bold text-ink flex items-center gap-2">
          <Send size={14} /> Tambah Pesan
        </p>
        <div className="flex gap-4">
          {(["audience", "brand"] as const).map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={msgSender === s}
                onChange={() => setMsgSender(s)}
                className="accent-amber"
              />
              <span className="text-sm text-ink">
                {s === "audience" ? conversation.audienceName : "mulaibaca (kamu)"}
              </span>
            </label>
          ))}
        </div>
        <textarea
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          placeholder={
            msgSender === "audience"
              ? "Paste respons dari Threads…"
              : "Tulis atau paste respons kamu…"
          }
          className="w-full border border-border rounded-lg p-2.5 text-sm text-ink resize-none outline-none focus:border-amber min-h-16 transition-colors"
        />
        <button
          onClick={() => {
            if (msgText.trim()) {
              onAddMessage(msgText.trim(), msgSender);
              setMsgText("");
            }
          }}
          disabled={!msgText.trim()}
          className="btn-primary-sm flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send size={12} /> Tambah Pesan
        </button>
      </div>

      {/* Notes */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
        <p className="text-sm font-bold text-ink flex items-center gap-2">
          <FileText size={14} /> Catatan Internal
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onUpdateNotes(notes)}
          placeholder="Catatan tentang audiens ini (tidak tampil di Threads)…"
          className="w-full border border-border rounded-lg p-2.5 text-sm text-ink resize-none outline-none focus:border-amber min-h-16 transition-colors"
        />
      </div>
    </div>
  );
}

// ── Explore ────────────────────────────────────────────────────────────

function ExploreView({ onSave }: { onSave: (q: string, theme: string, audience: Audience) => void }) {
  const [audience, setAudience] = useState<Audience>("keluarga");
  const [theme, setTheme] = useState(THEMES_BY_AUDIENCE.keluarga[0]);
  const [custom, setCustom] = useState("");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());

  const ANGLE_LABEL: Record<string, string> = {
    emotional: "💛 Emosional",
    nostalgic: "🕰 Nostalgia",
    practical: "⚡ Praktis",
    funny: "😄 Humor",
    relatable: "🤝 Relatable",
  };

  const generate = async () => {
    setIsGenerating(true);
    setQuestions([]);
    setError("");
    const effectiveTheme = custom.trim() || theme;
    try {
      const res = await fetch("/api/admin/threads-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "questions", data: { theme: effectiveTheme, audience } }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      try {
        const jsonStr = data.text.match(/\[[\s\S]*\]/)?.[0];
        if (jsonStr) setQuestions(JSON.parse(jsonStr));
        else setError("Format respons tidak valid.");
      } catch {
        setError("Gagal parse respons AI.");
      }
    } catch {
      setError("Gagal terhubung.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-h2">Eksplorasi Pertanyaan</h2>
        <p className="text-sm text-ink-secondary mt-1">
          Generate ide pertanyaan untuk dibuka sebagai diskusi di Threads.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
            Target Audience
          </label>
          <div className="flex gap-2">
            {(Object.keys(AUDIENCE_CONFIG) as Audience[]).map((a) => (
              <button
                key={a}
                onClick={() => {
                  setAudience(a);
                  setTheme(THEMES_BY_AUDIENCE[a][0]);
                  setCustom("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  audience === a
                    ? "border-amber bg-amber/10 text-amber"
                    : "border-border text-ink-secondary hover:border-ink/30"
                }`}
              >
                {AUDIENCE_CONFIG[a].emoji} {AUDIENCE_CONFIG[a].label}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-muted mt-1.5">
            {audience === "individu"
              ? "Individu yang sedang membangun kebiasaan baca untuk dirinya sendiri."
              : "Orang tua / keluarga yang ingin menumbuhkan kebiasaan baca bersama anak."}
          </p>
        </div>
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
            Tema
          </label>
          <select
            value={custom ? "__custom" : theme}
            onChange={(e) => {
              if (e.target.value === "__custom") setCustom(" ");
              else { setTheme(e.target.value); setCustom(""); }
            }}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:border-amber"
          >
            {THEMES_BY_AUDIENCE[audience].map((t) => <option key={t} value={t}>{t}</option>)}
            <option value="__custom">+ Tema kustom…</option>
          </select>
        </div>
        {custom.trim() !== "" && (
          <div>
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
              Tema Kustom
            </label>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Tulis tema sendiri…"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber"
            />
          </div>
        )}
        <button
          onClick={generate}
          disabled={isGenerating}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {isGenerating ? "Generating 5 pertanyaan…" : "Generate 5 Pertanyaan"}
        </button>
        {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      </div>

      {questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex gap-3">
                <span className="text-xs font-bold text-ink-muted w-5 mt-0.5 text-center shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{q.question}</p>
                  <span className="text-xs text-ink-muted mt-1 block">
                    {ANGLE_LABEL[q.angle] || q.angle}
                  </span>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        copyText(q.question);
                        setCopiedIdx(i);
                        setTimeout(() => setCopiedIdx(null), 2000);
                      }}
                      className="btn-secondary text-xs flex items-center gap-1.5"
                    >
                      <Copy size={11} /> {copiedIdx === i ? "Disalin!" : "Copy"}
                    </button>
                    <button
                      onClick={() => {
                        onSave(q.question, custom.trim() || theme, audience);
                        setSavedIdx((prev) => new Set(prev).add(i));
                      }}
                      disabled={savedIdx.has(i)}
                      className="btn-primary-sm text-xs flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {savedIdx.has(i) ? (
                        <><CheckCircle2 size={11} /> Tersimpan</>
                      ) : (
                        <><Plus size={11} /> Simpan sebagai Draft</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Insight ────────────────────────────────────────────────────────────

function InsightView({ discussions }: { discussions: Discussion[] }) {
  const withConvs = discussions.filter((d) => d.conversations.length > 0);
  const [selectedId, setSelectedId] = useState(withConvs[0]?.id || "");
  const [audience, setAudience] = useState<Audience>(
    withConvs[0]?.audience ?? "keluarga"
  );
  const [insight, setInsight] = useState<InsightResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const selected = withConvs.find((d) => d.id === selectedId);

  const selectDiscussion = (id: string) => {
    setSelectedId(id);
    const d = withConvs.find((x) => x.id === id);
    if (d?.audience) setAudience(d.audience);
  };

  const generate = async () => {
    if (!selected) return;
    setIsGenerating(true);
    setInsight(null);
    setError("");
    try {
      const res = await fetch("/api/admin/threads-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "insight",
          data: {
            question: selected.question,
            conversations: selected.conversations,
            audience,
          },
        }),
      });
      let data;
      try { data = await res.json(); } catch {
        setError(`Server error (${res.status}) — coba lagi.`);
        return;
      }
      if (data.error) { setError(data.error); return; }
      try {
        const jsonStr = data.text.match(/\{[\s\S]*\}/)?.[0];
        if (jsonStr) setInsight(JSON.parse(jsonStr));
        else setError("Format respons tidak valid.");
      } catch {
        setError("Gagal parse respons AI.");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsGenerating(false);
    }
  };

  const buildCopyText = (idea: ContentIdea) => {
    if (idea.type === "carousel") {
      const slides = (idea.slides ?? [])
        .map((s, i) => {
          if (typeof s === "string") return `Slide ${i + 1}:\n${s}`;
          return `Slide ${i + 1} (${s.label}):\n${s.heading}\n${s.body}`;
        })
        .join("\n\n");
      const caption = idea.caption ? `\n\n--- Caption ---\n${idea.caption}` : "";
      return `${idea.title}\n\n${slides}${caption}\n\nCTA: ${idea.cta}`;
    }
    if (idea.type === "single")
      return `${idea.hook}\n\n${idea.body}\n\n${idea.cta}`;
    if (idea.type === "blog")
      return `${idea.title}\n\n${idea.body}\n\n${idea.cta}`;
    return `"${idea.text}"\n\n${idea.context}\n\n${idea.cta}`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-h2">Insight & Konten</h2>
        <p className="text-sm text-ink-secondary mt-1">
          Analisis percakapan dan generate draft konten Instagram.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
        {withConvs.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            Belum ada percakapan. Tambahkan dulu dari menu Pertanyaan.
          </p>
        ) : (
          <>
            <div>
              <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
                Pilih Pertanyaan
              </label>
              <select
                value={selectedId}
                onChange={(e) => selectDiscussion(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:border-amber"
              >
                {withConvs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.question.slice(0, 65)}{d.question.length > 65 ? "…" : ""} ({d.conversations.length} conv.)
                  </option>
                ))}
              </select>
              {selected && (
                <p className="text-xs text-ink-muted mt-1.5">
                  {selected.conversations.length} percakapan ·{" "}
                  {selected.conversations.reduce((acc, c) => acc + c.messages.length, 0)} pesan total
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
                Konten untuk Audience
              </label>
              <div className="flex gap-2">
                {(Object.keys(AUDIENCE_CONFIG) as Audience[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAudience(a)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      audience === a
                        ? "border-amber bg-amber/10 text-amber"
                        : "border-border text-ink-secondary hover:border-ink/30"
                    }`}
                  >
                    {AUDIENCE_CONFIG[a].emoji} {AUDIENCE_CONFIG[a].label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-muted mt-1.5">
                {audience === "individu"
                  ? "Insight & konten ditulis untuk pembaca individu yang membangun kebiasaan baca sendiri."
                  : "Insight & konten ditulis untuk konteks keluarga / parenting."}
              </p>
            </div>
            <button
              onClick={generate}
              disabled={isGenerating || !selectedId}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Eye size={14} />}
              {isGenerating ? "Menganalisis percakapan…" : "Generate Insight"}
            </button>
            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          </>
        )}
      </div>

      {insight && (
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
              <Hash size={14} className="text-amber" /> Key Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {insight.themes.map((t, i) => (
                <span key={i} className="bg-parchment border border-border text-sm text-ink px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
              <Eye size={14} className="text-amber" /> Audience Insights
            </h3>
            <ul className="space-y-2">
              {insight.insights.map((ins, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="text-amber mt-0.5 shrink-0">→</span>
                  {ins}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
              <BookOpen size={14} className="text-amber" /> Draft Konten Instagram
            </h3>
            <div className="space-y-3">
              {insight.content_ideas.map((idea, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        idea.type === "carousel"
                          ? "bg-blue-50 text-blue-700"
                          : idea.type === "single"
                          ? "bg-green-50 text-green-700"
                          : idea.type === "blog"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {idea.type === "carousel" ? "📎 Carousel" : idea.type === "single" ? "🖼 Single Post" : idea.type === "blog" ? "📝 Blog" : "💬 Quote Card"}
                    </span>
                    {idea.title && (
                      <span className="text-sm font-semibold text-ink">{idea.title}</span>
                    )}
                  </div>

                  {idea.type === "carousel" && idea.slides && (
                    <div className="space-y-2">
                      {idea.hook && (
                        <p className="text-xs font-semibold text-amber mb-2">Hook: {idea.hook}</p>
                      )}
                      {idea.slides.map((slide, si) =>
                        typeof slide === "string" ? (
                          <div key={si} className="flex gap-2 text-sm">
                            <span className="text-xs font-bold text-ink-muted w-5 shrink-0 mt-0.5 text-right">
                              {si + 1}.
                            </span>
                            <span className="text-ink">{slide}</span>
                          </div>
                        ) : (
                          <div key={si} className="bg-parchment border border-border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold text-white bg-forest px-1.5 py-0.5 rounded">
                                {si + 1}
                              </span>
                              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                                {slide.label}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-ink">{slide.heading}</p>
                            {slide.body && (
                              <p className="text-xs text-ink-secondary mt-1 whitespace-pre-line">{slide.body}</p>
                            )}
                          </div>
                        )
                      )}
                      {idea.caption && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                            Caption
                          </p>
                          <p className="text-xs text-ink-secondary whitespace-pre-line">{idea.caption}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {idea.type === "single" && (
                    <div className="space-y-2">
                      {idea.hook && (
                        <p className="text-sm font-semibold text-ink">{idea.hook}</p>
                      )}
                      {idea.body && (
                        <p className="text-sm text-ink-secondary whitespace-pre-line">{idea.body}</p>
                      )}
                    </div>
                  )}

                  {idea.type === "quote" && (
                    <div className="space-y-2">
                      {idea.text && (
                        <p className="text-base font-medium text-ink italic border-l-2 border-amber pl-3">
                          &ldquo;{idea.text}&rdquo;
                        </p>
                      )}
                      {idea.context && (
                        <p className="text-xs text-ink-muted">{idea.context}</p>
                      )}
                    </div>
                  )}

                  {idea.type === "blog" && (
                    <div className="space-y-3">
                      {idea.title && (
                        <p className="text-base font-bold text-ink">{idea.title}</p>
                      )}
                      {idea.body && (
                        <div className="text-sm text-ink-secondary whitespace-pre-line leading-relaxed">
                          {idea.body}
                        </div>
                      )}
                    </div>
                  )}

                  {idea.cta && (
                    <p className="text-xs text-amber font-medium mt-3 pt-3 border-t border-border">
                      CTA → {idea.cta}
                    </p>
                  )}

                  <button
                    onClick={() => copyText(buildCopyText(idea))}
                    className="mt-3 btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <Copy size={11} /> Copy Draft
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modals ─────────────────────────────────────────────────────────────

function AddDiscussionModal({
  onAdd, onClose,
}: {
  onAdd: (q: string, theme: string, status: "draft" | "active", audience: Audience) => void;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [audience, setAudience] = useState<Audience>("keluarga");
  const [theme, setTheme] = useState(THEMES_BY_AUDIENCE.keluarga[0]);
  const [custom, setCustom] = useState("");
  const [status, setStatus] = useState<"draft" | "active">("active");

  return (
    <Modal onClose={onClose}>
      <h3 className="font-bold text-ink text-lg mb-4">Tambah Pertanyaan</h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
            Pertanyaan untuk Threads
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Tulis atau paste pertanyaan yang akan dipost di Threads…"
            className="w-full border border-border rounded-lg p-2.5 text-sm text-ink resize-none outline-none focus:border-amber min-h-20 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
            Target Audience
          </label>
          <div className="flex gap-2">
            {(Object.keys(AUDIENCE_CONFIG) as Audience[]).map((a) => (
              <button
                key={a}
                onClick={() => {
                  setAudience(a);
                  setTheme(THEMES_BY_AUDIENCE[a][0]);
                  setCustom("");
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                  audience === a
                    ? "border-amber bg-amber/10 text-amber"
                    : "border-border text-ink-secondary hover:border-ink/30"
                }`}
              >
                {AUDIENCE_CONFIG[a].emoji} {AUDIENCE_CONFIG[a].label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
            Tema
          </label>
          <select
            value={custom ? "__c" : theme}
            onChange={(e) => {
              if (e.target.value === "__c") setCustom(" ");
              else { setTheme(e.target.value); setCustom(""); }
            }}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-ink focus:outline-none focus:border-amber"
          >
            {THEMES_BY_AUDIENCE[audience].map((t) => <option key={t} value={t}>{t}</option>)}
            <option value="__c">+ Tema kustom…</option>
          </select>
          {custom.trim() && (
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Tema kustom…"
              className="mt-2 w-full border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber"
            />
          )}
        </div>
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
            Status
          </label>
          <div className="flex gap-4">
            {(["active", "draft"] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="accent-amber"
                />
                <span className="text-sm text-ink">
                  {s === "active" ? "Aktif (sudah dipost)" : "Draft (belum dipost)"}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Batal</button>
          <button
            onClick={() => {
              if (question.trim()) {
                onAdd(question.trim(), custom.trim() || theme, status, audience);
                onClose();
              }
            }}
            disabled={!question.trim()}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AddConversationModal({
  discussionQuestion, onAdd, onClose,
}: {
  discussionQuestion: string;
  onAdd: (name: string, handle: string, stage: Stage, firstMsg: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("@");
  const [stage, setStage] = useState<Stage>("new");
  const [firstMsg, setFirstMsg] = useState("");

  return (
    <Modal onClose={onClose}>
      <h3 className="font-bold text-ink text-lg mb-1">Tambah Respons Baru</h3>
      <p className="text-xs text-ink-muted mb-4 line-clamp-1 italic">&ldquo;{discussionQuestion}&rdquo;</p>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
              Nama
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama audiens"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
              Handle
            </label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@username"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
            Stage Awal
          </label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-ink focus:outline-none focus:border-amber"
          >
            {ALL_STAGES.map((s) => (
              <option key={s} value={s}>{STAGE_CONFIG[s].emoji} {STAGE_CONFIG[s].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
            Respons Pertama (dari Threads)
          </label>
          <textarea
            value={firstMsg}
            onChange={(e) => setFirstMsg(e.target.value)}
            placeholder="Paste respons audiens dari Threads…"
            className="w-full border border-border rounded-lg p-2.5 text-sm text-ink resize-none outline-none focus:border-amber min-h-20 transition-colors"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Batal</button>
          <button
            onClick={() => {
              if (name.trim() && firstMsg.trim()) {
                onAdd(name.trim(), handle.trim(), stage, firstMsg.trim());
                onClose();
              }
            }}
            disabled={!name.trim() || !firstMsg.trim()}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Tambah
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Search ─────────────────────────────────────────────────────────────

function SearchResults({
  query, discussions, onOpen,
}: {
  query: string;
  discussions: Discussion[];
  onOpen: (v: View) => void;
}) {
  const q = query.toLowerCase();

  const matchedQuestions = discussions.filter(
    (d) => d.question.toLowerCase().includes(q) || d.theme.toLowerCase().includes(q)
  );

  const matchedConvs = discussions.flatMap((d) =>
    d.conversations
      .map((c) => {
        const matchedMsg = c.messages.find((m) => m.text.toLowerCase().includes(q));
        const profileMatch =
          c.audienceName.toLowerCase().includes(q) ||
          c.audienceHandle.toLowerCase().includes(q) ||
          c.notes.toLowerCase().includes(q);
        if (!profileMatch && !matchedMsg) return null;
        return { discussion: d, conversation: c, matchedMsg };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-secondary">
        Hasil pencarian &ldquo;<span className="font-semibold text-ink">{query}</span>&rdquo; —{" "}
        {matchedConvs.length} percakapan, {matchedQuestions.length} pertanyaan
      </p>

      {matchedConvs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
            <Users size={14} className="text-amber" /> Percakapan
          </h3>
          <div className="space-y-2">
            {matchedConvs.map(({ discussion, conversation, matchedMsg }) => (
              <button
                key={conversation.id}
                onClick={() =>
                  onOpen({
                    type: "conversation",
                    discussionId: discussion.id,
                    conversationId: conversation.id,
                  })
                }
                className="w-full bg-surface border border-border rounded-xl p-3.5 text-left hover:border-amber/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <StageBadge stage={conversation.stage} />
                  <span className="font-semibold text-sm text-ink">{conversation.audienceName}</span>
                  <span className="text-xs text-ink-muted">{conversation.audienceHandle}</span>
                  <span className="text-xs text-ink-muted ml-auto">{formatTime(conversation.lastActivity)}</span>
                </div>
                {matchedMsg ? (
                  <p className="text-xs text-ink-secondary line-clamp-2">
                    {matchedMsg.sender === "brand" ? "→ " : ""}&ldquo;{matchedMsg.text}&rdquo;
                  </p>
                ) : conversation.notes ? (
                  <p className="text-xs text-ink-muted italic line-clamp-1">📝 {conversation.notes}</p>
                ) : null}
                <p className="text-[10px] text-ink-muted mt-1.5 line-clamp-1 italic">
                  dari: {discussion.question}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {matchedQuestions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
            <Hash size={14} className="text-amber" /> Pertanyaan
          </h3>
          <div className="space-y-2">
            {matchedQuestions.map((d) => (
              <button
                key={d.id}
                onClick={() => onOpen({ type: "discussion", discussionId: d.id })}
                className="w-full bg-surface border border-border rounded-xl p-3.5 text-left hover:border-amber/50 transition-colors"
              >
                <p className="text-sm font-medium text-ink line-clamp-2">{d.question}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {d.audience && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber/10 text-amber">
                      {AUDIENCE_CONFIG[d.audience].emoji} {AUDIENCE_CONFIG[d.audience].label}
                    </span>
                  )}
                  <span className="text-xs text-ink-muted">{d.theme}</span>
                  <span className="text-xs text-ink-muted">· {d.conversations.length} percakapan</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {matchedConvs.length === 0 && matchedQuestions.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Search size={24} className="mx-auto text-ink-muted mb-2" />
          <p className="text-sm text-ink-secondary">Tidak ada hasil untuk &ldquo;{query}&rdquo;.</p>
          <p className="text-xs text-ink-muted mt-1">Coba cari nama, handle, isi pesan, catatan, atau pertanyaan.</p>
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────

export default function ThreadsClient() {
  const [discussions, setDiscussions] = useLocalStorage<Discussion[]>(
    "mulaibaca-threads-crm",
    SAMPLE_DATA
  );
  const [view, setView] = useState<View>({ type: "overview" });
  const [showAddDiscussion, setShowAddDiscussion] = useState(false);
  const [addConvFor, setAddConvFor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Derived
  const currentDiscussion =
    (view.type === "discussion" || view.type === "conversation")
      ? discussions.find((d) => d.id === view.discussionId) ?? null
      : null;
  const currentConversation =
    view.type === "conversation" && currentDiscussion
      ? currentDiscussion.conversations.find((c) => c.id === view.conversationId) ?? null
      : null;
  const addConvDiscussion = addConvFor
    ? discussions.find((d) => d.id === addConvFor) ?? null
    : null;

  // Mutators
  const addDiscussion = (q: string, theme: string, status: "draft" | "active", audience: Audience) =>
    setDiscussions((prev) => [
      ...prev,
      { id: uid(), question: q, theme, audience, status, createdAt: new Date().toISOString(), conversations: [] },
    ]);

  const addConversation = (discussionId: string, name: string, handle: string, stage: Stage, firstMsg: string) =>
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id !== discussionId
          ? d
          : {
              ...d,
              conversations: [
                ...d.conversations,
                {
                  id: uid(), audienceName: name, audienceHandle: handle, stage, notes: "",
                  lastActivity: new Date().toISOString(),
                  messages: [{ id: uid(), sender: "audience", text: firstMsg, timestamp: new Date().toISOString() }],
                },
              ],
            }
      )
    );

  const addMessage = (
    discussionId: string,
    conversationId: string,
    text: string,
    sender: "audience" | "brand",
    aiGenerated?: boolean
  ) =>
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id !== discussionId
          ? d
          : {
              ...d,
              conversations: d.conversations.map((c) =>
                c.id !== conversationId
                  ? c
                  : {
                      ...c,
                      lastActivity: new Date().toISOString(),
                      messages: [
                        ...c.messages,
                        { id: uid(), sender, text, timestamp: new Date().toISOString(), aiGenerated },
                      ],
                    }
              ),
            }
      )
    );

  const updateStage = (discussionId: string, conversationId: string, stage: Stage) =>
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id !== discussionId
          ? d
          : {
              ...d,
              conversations: d.conversations.map((c) =>
                c.id === conversationId ? { ...c, stage } : c
              ),
            }
      )
    );

  const updateNotes = (discussionId: string, conversationId: string, notes: string) =>
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id !== discussionId
          ? d
          : {
              ...d,
              conversations: d.conversations.map((c) =>
                c.id === conversationId ? { ...c, notes } : c
              ),
            }
      )
    );

  const deleteDiscussion = (discussionId: string) => {
    if (!confirm("Hapus pertanyaan ini dan semua percakapannya?")) return;
    setDiscussions((prev) => prev.filter((d) => d.id !== discussionId));
    setView({ type: "questions" });
  };

  const deleteConversation = (discussionId: string, conversationId: string) => {
    if (!confirm("Hapus percakapan ini?")) return;
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id !== discussionId
          ? d
          : { ...d, conversations: d.conversations.filter((c) => c.id !== conversationId) }
      )
    );
    setView({ type: "discussion", discussionId });
  };

  const clearDemoData = () => {
    setDiscussions((prev) => prev.filter((d) => !d.id.startsWith("demo-")));
  };

  const saveQuestion = (q: string, theme: string, audience: Audience) => {
    addDiscussion(q, theme, "draft", audience);
    setView({ type: "questions" });
  };

  const activeCount = discussions.filter((d) => d.status === "active").length;

  return (
    <div className="flex gap-6 min-h-[70vh]">
      <Sidebar
        view={view}
        setView={setView}
        activeCount={activeCount}
        onAdd={() => setShowAddDiscussion(true)}
      />

      <div className="flex-1 min-w-0 pb-8">
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari user, isi percakapan, catatan, atau pertanyaan…"
            className="w-full border border-border rounded-lg pl-9 pr-9 py-2 text-sm text-ink bg-surface focus:outline-none focus:border-amber transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {searchQuery.trim() ? (
          <SearchResults
            query={searchQuery.trim()}
            discussions={discussions}
            onOpen={(v) => {
              setView(v);
              setSearchQuery("");
            }}
          />
        ) : (
          <>
        {view.type === "overview" && (
          <OverviewView discussions={discussions} setView={setView} onClearDemo={clearDemoData} />
        )}
        {view.type === "questions" && (
          <QuestionsView
            discussions={discussions}
            setView={setView}
            onAdd={() => setShowAddDiscussion(true)}
            onDelete={deleteDiscussion}
          />
        )}
        {view.type === "explore" && <ExploreView onSave={saveQuestion} />}
        {view.type === "insight" && <InsightView discussions={discussions} />}
        {view.type === "discussion" && currentDiscussion && (
          <DiscussionView
            discussion={currentDiscussion}
            setView={setView}
            onAddConversation={() => setAddConvFor(currentDiscussion.id)}
            onDeleteDiscussion={() => deleteDiscussion(currentDiscussion.id)}
            onDeleteConversation={(convId) => deleteConversation(currentDiscussion.id, convId)}
          />
        )}
        {view.type === "conversation" && currentDiscussion && currentConversation && (
          <ConversationView
            discussion={currentDiscussion}
            conversation={currentConversation}
            setView={setView}
            onAddMessage={(text, sender, ai) =>
              addMessage(currentDiscussion.id, currentConversation.id, text, sender, ai)
            }
            onUpdateStage={(stage) =>
              updateStage(currentDiscussion.id, currentConversation.id, stage)
            }
            onUpdateNotes={(notes) =>
              updateNotes(currentDiscussion.id, currentConversation.id, notes)
            }
            onDelete={() => deleteConversation(currentDiscussion.id, currentConversation.id)}
          />
        )}
          </>
        )}
      </div>

      {showAddDiscussion && (
        <AddDiscussionModal
          onAdd={addDiscussion}
          onClose={() => setShowAddDiscussion(false)}
        />
      )}
      {addConvFor && addConvDiscussion && (
        <AddConversationModal
          discussionQuestion={addConvDiscussion.question}
          onAdd={(name, handle, stage, msg) =>
            addConversation(addConvFor, name, handle, stage, msg)
          }
          onClose={() => setAddConvFor(null)}
        />
      )}
    </div>
  );
}
