"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

type FormState = {
  name: string;
  birthDate: string;
  identityNumber: string;
  phone: string;
  lineId: string;
  city: string;
  district: string;
  jobType: string;
  workYears: string;
  incomeLabel: string;
  payrollInsurance: string;
  fundingNeedWan: string;
  fundingPurpose: string;
  collateral: string;
  agreeFollowUp: boolean;
  agreePrivacy: boolean;
};

const initialForm: FormState = {
  name: "",
  birthDate: "",
  identityNumber: "",
  phone: "",
  lineId: "",
  city: "",
  district: "",
  jobType: "",
  workYears: "",
  incomeLabel: "",
  payrollInsurance: "",
  fundingNeedWan: "",
  fundingPurpose: "",
  collateral: "",
  agreeFollowUp: false,
  agreePrivacy: false,
};

const cities = [
  "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
  "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣",
  "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
  "台東縣", "澎湖縣", "金門縣", "連江縣"
];

const TAIWAN_ID_CODES: Record<string, number> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
  K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
  U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
};

function isValidTaiwanId(value: string) {
  const id = value.toUpperCase();
  if (!/^[A-Z][12]\d{8}$/.test(id)) return false;

  const code = TAIWAN_ID_CODES[id[0]];
  if (!code) return false;

  const digits = [
    Math.floor(code / 10),
    code % 10,
    ...id.slice(1).split("").map((x) => Number(x)),
  ];

  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
  const sum = digits.reduce((total, digit, index) => total + digit * weights[index], 0);

  return sum % 10 === 0;
}

function isValidBirthDate(value: string) {
  if (!/^\d{8}$/.test(value)) return false;

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));

  if (year < 1911 || year > new Date().getFullYear()) return false;

  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

function cleanDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

function cleanTaiwanId(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

function cleanNoChinese(value: string, maxLength: number) {
  return value
    .replace(/[\u4e00-\u9fff]/g, "")
    .replace(/[^A-Za-z0-9._@\-\/\s]/g, "")
    .slice(0, maxLength);
}

function cleanDistrict(value: string) {
  return value.replace(/[^\u4e00-\u9fa5A-Za-z0-9\s\-]/g, "").slice(0, 30);
}

function isValidImage(file: File | null) {
  if (!file) return false;
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

function safeFileName(file: File, prefix: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9-_]/g, "");
  return `customers/${cleanPrefix}-${Date.now()}.${ext}`;
}

function validate(
  form: FormState,
  selfieFile: File | null,
  idCardFrontFile: File | null,
  idCardBackFile: File | null
) {
  if (!form.name.trim()) return "請填寫姓名";
  if (!isValidBirthDate(form.birthDate)) return "出生年月日請輸入 8 位西元日期，例如 19990101";
  if (!isValidTaiwanId(form.identityNumber)) return "請填寫正確的身分證字號";
  if (!/^09\d{8}$/.test(form.phone)) return "手機號碼格式不正確";
  if (!/^[A-Za-z0-9._@\-\/\s]{2,50}$/.test(form.lineId)) return "LINE ID 格式不正確，請輸入英文、數字或常用符號";
  if (!form.city) return "請選擇現居縣市";
  if (!form.district.trim()) return "請填寫現居區域";
  if (!form.jobType) return "請選擇工作類型";
  if (!form.workYears.trim()) return "請填寫任職年資";
  if (!form.incomeLabel) return "請選擇月收入區間";
  if (!form.payrollInsurance) return "請選擇是否有薪轉／勞保";
  if (!/^\d{1,4}$/.test(form.fundingNeedWan)) return "資金需求請輸入數字，例如 5 代表 5 萬";
  if (!form.fundingPurpose.trim()) return "請填寫資金用途";
  if (!form.collateral) return "請選擇當品";
  if (selfieFile && !isValidImage(selfieFile)) return "自拍照格式限 JPG、PNG、WEBP";
  if (idCardFrontFile && !isValidImage(idCardFrontFile)) return "身分證正面格式限 JPG、PNG、WEBP";
  if (idCardBackFile && !isValidImage(idCardBackFile)) return "身分證反面格式限 JPG、PNG、WEBP";
  if (!form.agreeFollowUp) return "請同意後續補件審核";
  if (!form.agreePrivacy) return "請同意個資蒐集與使用";
  return "";
}

async function uploadImage(file: File, prefix: string) {
  const blob = await upload(safeFileName(file, prefix), file, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });

  if (!blob.url) {
    throw new Error("圖片上傳失敗");
  }

  return blob.url;
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idCardFrontFile, setIdCardFrontFile] = useState<File | null>(null);
  const [idCardBackFile, setIdCardBackFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateBirthDate = (value: string) => {
    const cleaned = cleanDigits(value, 8);
    update("birthDate", cleaned);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate(form, selfieFile, idCardFrontFile, idCardBackFile);
    if (error) {
      setMessage(error);
      return;
    }

    setSending(true);
    setMessage("圖片上傳中，請勿關閉頁面...");

    try {
      const [selfieUrl, idCardFrontUrl, idCardBackUrl] = await Promise.all([
        selfieFile ? uploadImage(selfieFile, "selfie") : Promise.resolve(null),
        idCardFrontFile ? uploadImage(idCardFrontFile, "id-front") : Promise.resolve(null),
        idCardBackFile ? uploadImage(idCardBackFile, "id-back") : Promise.resolve(null),
      ]);

      setMessage("資料寫入中...");

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          incomeType: "monthly",
          incomeAmount: null,
          fundingNeed: `${form.fundingNeedWan}萬`,
          selfieUrl,
          idCardFrontUrl,
          idCardBackUrl
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "送出失敗");
        return;
      }

      setMessage("申請已送出，將由專人聯繫。");
      setForm(initialForm);
      setSelfieFile(null);
      setIdCardFrontFile(null);
      setIdCardBackFile(null);

      const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
      fileInputs.forEach((input) => {
        input.value = "";
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "系統異常，請稍後再試");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#06142c] bg-[radial-gradient(circle_at_top_left,_rgba(245,212,122,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(45,102,180,0.24),_transparent_42%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl rounded-[28px] border border-[#d6a84f]/35 bg-[#081b3a]/95 p-5 shadow-2xl shadow-black/60 backdrop-blur sm:p-8">
        <h1 className="brand-title text-3xl leading-tight text-[#f5d47a] sm:text-4xl">
          徠鑫當鋪初審申請表
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-200">
          請照實填寫資料。自拍與身分證照片可上傳，送出後將由專人聯繫。
        </p>

        <form onSubmit={submit} className="mt-7 grid gap-5">
          <FormSection number="01" title="基本資料">
            <div className="grid gap-5 md:grid-cols-2">
              <Input label="姓名" value={form.name} onChange={(v) => update("name", v.slice(0, 40))} />

              <Input
                label="出生年月日"
                value={form.birthDate}
                maxLength={8}
                placeholder="例如 19990101"
                note="請輸入西元 8 位數字，例如 19990101。民國年請加 1911，例如民國 88 年 = 1999。"
                onChange={updateBirthDate}
              />

              <Input
                id="identityNumberInput"
                label="身分證字號"
                value={form.identityNumber}
                maxLength={10}
                placeholder="例如 A123456789"
                inputMode="url"
                lang="en"
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                pattern="[A-Za-z][12][0-9]{8}"
                enterKeyHint="next"
                onFocus={(e) => {
                  e.currentTarget.setAttribute("inputmode", "url");
                  e.currentTarget.setAttribute("lang", "en");
                }}
                onChange={(v) => update("identityNumber", cleanTaiwanId(v))}
              />

              <Input
                label="手機號碼"
                value={form.phone}
                maxLength={10}
                placeholder="例如 0912345678"
                onChange={(v) => update("phone", cleanDigits(v, 10))}
              />

              <div className="md:col-span-2">
                <Input
                  label="LINE ID"
                  value={form.lineId}
                  placeholder="請輸入英文、數字或常用符號"
                  inputMode="url"
                  lang="en"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={(v) => update("lineId", cleanNoChinese(v, 50))}
                />
              </div>
            </div>
          </FormSection>

          <FormSection number="02" title="居住與工作資料">
            <div className="grid gap-5 md:grid-cols-2">
              <Select label="現居縣市" value={form.city} onChange={(v) => update("city", v)} options={cities} />
              <Input
                label="現居區域"
                value={form.district}
                placeholder="例如 中山區"
                onChange={(v) => update("district", v)}
                onBlur={(e) => update("district", cleanDistrict(e.target.value))}
              />

              <Select
                label="工作類型"
                value={form.jobType}
                onChange={(v) => update("jobType", v)}
                options={["正職", "兼職", "自營", "臨時工", "其他"]}
              />

              <Input
                label="任職年資"
                value={form.workYears}
                placeholder="例如 2年3個月"
                onChange={(v) => update("workYears", v)}
              />

              <Select
                label="月收入區間"
                value={form.incomeLabel}
                onChange={(v) => update("incomeLabel", v)}
                options={["2萬以下", "2萬至4萬", "4萬至6萬", "6萬以上"]}
              />

              <Select
                label="是否有薪轉／勞保"
                value={form.payrollInsurance}
                onChange={(v) => update("payrollInsurance", v)}
                options={["都有", "只有薪轉", "只有勞保", "都沒有"]}
              />
            </div>
          </FormSection>

          <FormSection number="03" title="資金需求">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <label className="block rounded-2xl border border-[#f5d47a]/65 bg-[#071a38]/90 p-4 shadow-[0_0_30px_rgba(245,212,122,0.15)]">
                <span className="mb-3 block text-sm font-bold tracking-wider text-[#f5d47a]">資金需求</span>
                <div className="flex items-stretch overflow-hidden rounded-2xl border border-[#f5d47a]/65 bg-[#031226] shadow-[inset_0_0_18px_rgba(0,0,0,0.45)] focus-within:border-[#ffe48a] focus-within:ring-2 focus-within:ring-[#f5d47a]/25">
                  <span className="flex items-center border-r border-[#d6a84f]/35 bg-[#0b244d] px-4 text-3xl font-black tracking-tight text-[#f5d47a] sm:px-5 sm:text-4xl">
                    NT$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.fundingNeedWan}
                    maxLength={4}
                    placeholder="例如 5"
                    onChange={(e) => update("fundingNeedWan", cleanDigits(e.target.value, 4))}
                    className="min-w-0 flex-1 bg-transparent px-4 py-4 text-2xl font-black text-white outline-none placeholder:text-slate-500 sm:text-3xl"
                  />
                  <span className="flex items-center border-l border-[#d6a84f]/35 px-5 py-4 text-lg font-black text-[#f5d47a]">萬</span>
                </div>
              </label>

              <div className="grid gap-5">
                <Select
                  label="選擇當品"
                  value={form.collateral}
                  onChange={(v) => update("collateral", v)}
                  options={["汽車", "機車", "無當", "其他"]}
                />

                <TextArea
                  label="資金用途"
                  value={form.fundingPurpose}
                  placeholder="請輸入資金用途"
                  lang="zh-Hant-TW"
                  onChange={(v) => update("fundingPurpose", v)}
                />
              </div>
            </div>
          </FormSection>

          <FormSection number="04" title="照片上傳">
            <div className="grid gap-5 md:grid-cols-3">
              <FileInput label="自拍照" file={selfieFile} onChange={setSelfieFile} />
              <FileInput label="身分證正面（清晰可辨識）" file={idCardFrontFile} onChange={setIdCardFrontFile} />
              <FileInput label="身分證反面（清晰可辨識）" file={idCardBackFile} onChange={setIdCardBackFile} />
            </div>
          </FormSection>

          <FormSection number="05" title="同意事項">
            <div className="grid gap-4">
              <label className="flex gap-3 rounded-2xl border border-[#d6a84f]/25 bg-[#071a38]/80 p-4 text-sm text-slate-200 shadow-lg shadow-black/20 transition hover:border-[#f5d47a]/45">
                <input type="checkbox" checked={form.agreeFollowUp} onChange={(e) => update("agreeFollowUp", e.target.checked)} />
                <span>我同意後續審核時，依需求補充相關資料。</span>
              </label>

              <label className="flex gap-3 rounded-2xl border border-[#d6a84f]/25 bg-[#071a38]/80 p-4 text-sm text-slate-200 shadow-lg shadow-black/20 transition hover:border-[#f5d47a]/45">
                <input type="checkbox" checked={form.agreePrivacy} onChange={(e) => update("agreePrivacy", e.target.checked)} />
                <span>本人同意基於申請審核、聯繫、資料確認之目的，蒐集並使用本人所提供之資料。</span>
              </label>
            </div>
          </FormSection>

          {message && (
            <div className="rounded-2xl border border-[#d6a84f]/45 bg-black/35 px-5 py-4 text-sm font-semibold text-[#f5d47a] shadow-lg shadow-black/25">
              {message}
            </div>
          )}

          <div className="flex justify-center pt-1">
            <button
              type="submit"
              disabled={sending}
              className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-[#8b6914] via-[#ffe48a] to-[#8b6914] px-8 py-4 text-lg font-black tracking-[0.22em] text-[#071a38] shadow-[0_0_24px_rgba(245,212,122,0.32)] ring-1 ring-[#f5d47a]/50 transition duration-200 hover:scale-[1.01] hover:shadow-[0_0_34px_rgba(245,212,122,0.42)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "送出中..." : "送出申請"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function FormSection(props: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#d6a84f]/45 bg-[#082047]/70 p-5 shadow-xl shadow-black/25 ring-1 ring-white/5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-lg bg-gradient-to-b from-[#fff2a8] to-[#d6a84f] px-2.5 py-1 text-base font-black text-[#071a38] shadow-md shadow-black/30">
          {props.number}
        </span>
        <h2 className="text-xl font-black tracking-[0.12em] text-[#f5d47a]">
          {props.title}
        </h2>
      </div>
      {props.children}
    </section>
  );
}

function Input(props: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  maxLength?: number;
  placeholder?: string;
  note?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  lang?: string;
  autoCapitalize?: string;
  autoComplete?: string;
  autoCorrect?: string;
  spellCheck?: boolean;
  pattern?: string;
  enterKeyHint?: React.HTMLAttributes<HTMLInputElement>["enterKeyHint"];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold tracking-wider text-[#f5d47a]">{props.label}</span>
      <input
        id={props.id}
        type={props.type || "text"}
        value={props.value}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        inputMode={props.inputMode}
        lang={props.lang}
        autoCapitalize={props.autoCapitalize}
        autoComplete={props.autoComplete}
        autoCorrect={props.autoCorrect}
        spellCheck={props.spellCheck}
        pattern={props.pattern}
        enterKeyHint={props.enterKeyHint}
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        className="w-full rounded-xl border border-[#d6a84f]/35 bg-[#031226]/85 px-4 py-3 text-white shadow-inner shadow-black/30 outline-none transition duration-200 placeholder:text-slate-500 hover:border-[#d6a84f]/60 focus:border-[#f5d47a] focus:bg-[#061936] focus:ring-2 focus:ring-[#f5d47a]/20"
      />
      {props.note && <span className="mt-2 block text-xs leading-5 text-slate-400">{props.note}</span>}
    </label>
  );
}

function Select(props: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold tracking-wider text-[#f5d47a]">{props.label}</span>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-xl border border-[#d6a84f]/35 bg-[#031226]/85 px-4 py-3 text-white shadow-inner shadow-black/30 outline-none transition duration-200 hover:border-[#d6a84f]/60 focus:border-[#f5d47a] focus:bg-[#061936] focus:ring-2 focus:ring-[#f5d47a]/20"
      >
        <option value="">請選擇</option>
        {props.options.map((x) => (
          <option key={x} value={x}>{x}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  lang?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold tracking-wider text-[#f5d47a]">{props.label}</span>
      <textarea
        rows={4}
        value={props.value}
        placeholder={props.placeholder}
        lang={props.lang}
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={props.onBlur}
        className="w-full resize-none rounded-xl border border-[#d6a84f]/35 bg-[#031226]/85 px-4 py-3 text-white shadow-inner shadow-black/30 outline-none transition duration-200 placeholder:text-slate-500 hover:border-[#d6a84f]/60 focus:border-[#f5d47a] focus:bg-[#061936] focus:ring-2 focus:ring-[#f5d47a]/20"
      />
    </label>
  );
}

function FileInput(props: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold tracking-wider text-[#f5d47a]">{props.label}</span>
      <div className="group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#f5d47a]/85 bg-[#031226]/75 px-4 py-6 text-center shadow-[inset_0_0_22px_rgba(0,0,0,0.48),0_0_24px_rgba(245,212,122,0.10)] transition duration-200 hover:border-[#ffe48a] hover:bg-[#061936]/90 hover:shadow-[inset_0_0_22px_rgba(0,0,0,0.48),0_0_32px_rgba(245,212,122,0.18)]">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => props.onChange(e.target.files?.[0] || null)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#f5d47a]/55 bg-[#0b244d] text-3xl font-black text-[#f5d47a] shadow-lg shadow-black/30 transition group-hover:scale-105">
          ＋
        </span>
        <span className="text-sm font-black tracking-wider text-[#f5d47a]">
          點擊或拖曳檔案上傳
        </span>
        <span className="mt-2 text-xs leading-5 text-slate-300">
          支援 JPG、PNG、WEBP
        </span>
        <span className="mt-3 line-clamp-2 max-w-full break-all text-xs leading-5 text-slate-400">
          {props.file ? props.file.name : "尚未選擇檔案"}
        </span>
      </div>
    </label>
  );
}
