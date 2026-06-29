"use client";

import { useState, useRef, useCallback } from "react";
import { Bold, Italic, Heading, List, ListOrdered, Image, Eye, EyeOff } from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

const TOOLBAR_BTN = "w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment hover:text-ink transition-colors text-sm";

export default function RichEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) editorRef.current.focus();
    if (onChange) onChange(editorRef.current?.innerHTML ?? "");
  }, [onChange]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/blog-image", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload gagal");
      const { url } = await res.json();
      exec("insertImage", url);
    } catch {
      alert("Gagal upload gambar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [exec]);

  const handleEditorInput = useCallback(() => {
    if (onChange) onChange(editorRef.current?.innerHTML ?? "");
  }, [onChange]);

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap bg-surface border border-border rounded-xl px-2 py-1.5">
        <button type="button" onClick={() => exec("bold")} className={TOOLBAR_BTN} title="Tebal">
          <Bold size={16} strokeWidth={1.75} />
        </button>
        <button type="button" onClick={() => exec("italic")} className={TOOLBAR_BTN} title="Miring">
          <Italic size={16} strokeWidth={1.75} />
        </button>
        <span className="w-px h-6 bg-border mx-1" />
        <button type="button" onClick={() => exec("formatBlock", "h2")} className={TOOLBAR_BTN} title="Heading 2">
          <Heading size={16} strokeWidth={1.75} />
        </button>
        <button type="button" onClick={() => exec("formatBlock", "h3")} className={TOOLBAR_BTN} title="Heading 3">
          <span className="text-xs font-bold">H3</span>
        </button>
        <span className="w-px h-6 bg-border mx-1" />
        <button type="button" onClick={() => exec("insertUnorderedList")} className={TOOLBAR_BTN} title="List">
          <List size={16} strokeWidth={1.75} />
        </button>
        <button type="button" onClick={() => exec("insertOrderedList")} className={TOOLBAR_BTN} title="List nomor">
          <ListOrdered size={16} strokeWidth={1.75} />
        </button>
        <span className="w-px h-6 bg-border mx-1" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={TOOLBAR_BTN}
          title="Upload gambar"
        >
          <Image size={16} strokeWidth={1.75} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={TOOLBAR_BTN}
          title={showPreview ? "Edit" : "Preview"}
        >
          {showPreview ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="prose-blog w-full min-h-[16rem] bg-surface border border-border rounded-xl p-4 overflow-auto"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          className="input w-full min-h-[16rem] overflow-auto focus:outline-none cursor-text"
          style={{ whiteSpace: "pre-wrap" }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )}
    </div>
  );
}
