"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2 } from "lucide-react";

export function BillUploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/utility/upload-bill`,
        { method: "POST", body: form }
      );
      if (res.ok) setDone(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-background border rounded-lg p-6">
      <h2 className="font-semibold text-lg mb-1">Upload Utility Bill</h2>
      <p className="text-sm text-muted-foreground mb-5">
        No live connection? Upload a PDF bill. We'll extract your usage history,
        rate structure, and tier data.
      </p>

      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
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
        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Drop your utility bill PDF here or{" "}
          <span className="text-primary">browse</span>
        </p>
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="truncate max-w-[200px]">{file.name}</span>
          </div>

          {done ? (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Parsed
            </div>
          ) : (
            <button
              onClick={upload}
              disabled={uploading}
              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
