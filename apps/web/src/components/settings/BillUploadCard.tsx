"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, Loader2, FileUp } from "lucide-react";

export function BillUploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f);
    setDone(false);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/utility/upload-bill`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (res.ok) setDone(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-5 border-b border-slate-50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
            <FileUp className="h-4 w-4 text-violet-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Upload Utility Bill</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          No live connection? Upload a PDF bill and we'll extract your usage history, rate structure, and tier data.
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Upload className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">Drop your PDF here or <span className="text-blue-600">browse</span></p>
          <p className="text-xs text-slate-400">PDF utility bills only</p>
        </div>

        {file && (
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-700 truncate">{file.name}</span>
            </div>
            {done ? (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium shrink-0 ml-3">
                <CheckCircle2 className="h-4 w-4" />
                Parsed
              </div>
            ) : (
              <button
                onClick={upload}
                disabled={uploading}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 shrink-0 ml-3"
              >
                {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {uploading ? "Uploading…" : "Upload"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
