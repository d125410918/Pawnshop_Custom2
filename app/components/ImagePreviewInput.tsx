"use client";

import { useEffect, useRef, useState } from "react";

type ImagePreviewInputProps = {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
};

export default function ImagePreviewInput(props: ImagePreviewInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!props.file) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(props.file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [props.file]);

  const clearFile = () => {
    props.onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-bold tracking-wider text-[#f5d47a]">{props.label}</span>
      <div
        className={
          props.file
            ? "group relative flex min-h-[230px] cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-solid border-[#ffe48a] bg-[#061936] text-center shadow-[inset_0_0_22px_rgba(0,0,0,0.48),0_0_34px_rgba(245,212,122,0.22)] transition duration-200"
            : "group relative flex min-h-[165px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#f5d47a]/85 bg-[#031226]/75 px-4 py-6 text-center shadow-[inset_0_0_22px_rgba(0,0,0,0.48),0_0_24px_rgba(245,212,122,0.10)] transition duration-200 hover:border-[#ffe48a] hover:bg-[#061936]/90 hover:shadow-[inset_0_0_22px_rgba(0,0,0,0.48),0_0_32px_rgba(245,212,122,0.18)]"
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => props.onChange(e.target.files?.[0] || null)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        {props.file && previewUrl ? (
          <>
            <div className="relative h-36 w-full overflow-hidden rounded-t-2xl bg-black/35">
              <img src={previewUrl} alt={`${props.label}預覽`} className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-full border border-[#f5d47a]/70 bg-[#071a38]/90 px-3 py-1 text-xs font-black tracking-wider text-[#f5d47a] shadow-lg shadow-black/30">
                已選擇圖片
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center px-4 py-4">
              <span className="text-sm font-black tracking-wider text-[#f5d47a]">點擊可重新選擇</span>
              <span className="mt-2 line-clamp-2 max-w-full break-all text-xs leading-5 text-slate-300">{props.file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearFile();
                }}
                className="relative z-10 mx-auto mt-3 rounded-full border border-[#f5d47a]/55 bg-[#071a38] px-4 py-1.5 text-xs font-bold text-[#f5d47a] shadow-md shadow-black/25 transition hover:bg-[#0b244d]"
              >
                取消選擇
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#f5d47a]/55 bg-[#0b244d] text-3xl font-black text-[#f5d47a] shadow-lg shadow-black/30 transition group-hover:scale-105">
              ＋
            </span>
            <span className="text-sm font-black tracking-wider text-[#f5d47a]">點擊或拖曳檔案上傳</span>
            <span className="mt-2 text-xs leading-5 text-slate-300">支援 JPG、PNG、WEBP</span>
            <span className="mt-3 line-clamp-2 max-w-full break-all text-xs leading-5 text-slate-400">尚未選擇檔案</span>
          </>
        )}
      </div>
    </label>
  );
}
