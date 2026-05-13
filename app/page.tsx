"use client";

import { useState } from "react";

type FormData = {
  name: string;
  birthDate: string;
  identityNumber: string;
  phone: string;
  lineId: string;
  city: string;
  area: string;
  jobType: string;
  workYears: string;
  incomeRange: string;
  hasPayrollOrLaborInsurance: string;
  fundingAmountWan: string;
  fundingPurpose: string;
  pawnItem: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  agreeFollowUp: boolean;
  agreePrivacy: boolean;
};

const initialForm: FormData = {
  name: "",
  birthDate: "",
  identityNumber: "",
  phone: "",
  lineId: "",
  city: "",
  area: "",
  jobType: "",
  workYears: "",
  incomeRange: "",
  hasPayrollOrLaborInsurance: "",
  fundingAmountWan: "",
  fundingPurpose: "",
  pawnItem: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
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
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

function cleanDigits(value: string, maxLength: number) {
  const next = value.replace(/\D/g, "");
  return next.slice(0, maxLength);
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

function cleanArea(value: string) {
  return value.replace(/[^\u4e00-\u9fa5A-Za-z0-9\s\-]/g, "").slice(0, 30);
}

function cleanPurpose(value: string) {
  return value
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9\s，。,.、；;：:（）()\-／/]/g, "")
    .slice(0, 200);
}

function validate(form: FormData) {
  if (!form.name.trim()) return "請填寫姓名";
  if (!isValidBirthDate(form.birthDate)) return "出生年月日請輸入 8 位西元日期，例如 19990101";
  if (!isValidTaiwanId(form.identityNumber)) return "請填寫正確的身分證字號";
  if (!/^09\d{8}$/.test(form.phone)) return "手機號碼格式不正確";
  if (!/^[A-Za-z0-9._@-]{2,50}$/.test(form.lineId)) return "LINE ID 格式不正確，不能輸入中文";
  if (!form.city) return "請選擇現居縣市";
  if (!form.area.trim()) return "請填寫現居區域";
  if (!form.jobType) return "請選擇工作類型";
  if (!form.workYears.trim()) return "請填寫任職年資，不能輸入中文";
  if (!form.incomeRange) return "請選擇月收入區間";
  if (!form.hasPayrollOrLaborInsurance) return "請選擇是否有薪轉／勞保";
  if (!/^\d{1,4}$/.test(form.fundingAmountWan)) return "資金需求請輸入數字，例如 5 代表 5 萬";
  if (!/^[\u4e00-\u9fa5A-Za-z0-9\s，。,.、；;：:（）()\-／/]{2,200}$/.test(form.fundingPurpose)) return "資金用途格式不正確";
  if (!form.pawnItem) return "請選擇當品";
  if (!form.emergencyName.trim()) return "請填寫緊急聯絡人姓名";
  if (!/^09\d{8}$/.test(form.emergencyPhone)) return "緊急聯絡人電話格式不正確";
  if (!form.emergencyRelation.trim()) return "請填寫緊急聯絡人關係";
  if (!form.agreeFollowUp) return "請同意後續補件審核";
  if (!form.agreePrivacy) return "請同意個資蒐集與使用";
  return "";
}

export default function Home() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const update = (key: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const cleanNoChineseOnBlur = (key: keyof FormData, value: string, maxLength: number) => {
    update(key, cleanNoChinese(value, maxLength));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate(form);
    if (error) {
      setMessage(error);
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          fundingAmount: `${form.fundingAmountWan}萬`,
          fullAddressArea: `${form.city}${form.area}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "送出失敗");
        return;
      }

      setMessage("申請已送出，將由專人聯繫。");
      setForm(initialForm);
    } catch {
      setMessage("系統異常，請稍後再試");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold text-slate-900">初審申請表</h1>
        <p className="mt-2 text-sm text-slate-600">
          請照實填寫資料，送出後將由專人聯繫。
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <Input label="姓名" value={form.name} onChange={(v: string) => update("name", v.slice(0, 40))} />

          <Input
            label="出生年月日"
            value={form.birthDate}
            maxLength={8}
            placeholder="例如 19990101"
            note="請輸入西元 8 位數字，例如 19990101。民國年請加 1911，例如民國 88 年 = 1999。年輸入四位後直接接著輸入月份與日期。"
            onChange={(v: string) => update("birthDate", cleanDigits(v, 8))}
          />

          <Input
            label="身分證字號"
            value={form.identityNumber}
            maxLength={10}
            placeholder="例如 A123456789"
            onChange={(v: string) => update("identityNumber", cleanTaiwanId(v))}
          />

          <Input
            label="手機號碼"
            value={form.phone}
            maxLength={10}
            placeholder="例如 0912345678"
            onChange={(v: string) => update("phone", cleanDigits(v, 10))}
          />

          <Input
            label="LINE ID"
            value={form.lineId}
            placeholder="不能輸入中文"
            onChange={(v: string) => update("lineId", v)}
            onBlur={(e) => cleanNoChineseOnBlur("lineId", e.target.value, 50)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="現居縣市"
              value={form.city}
              onChange={(v: string) => update("city", v)}
              options={cities}
            />

            <Input
              label="現居區域"
              value={form.area}
              placeholder="例如 中山區"
              onChange={(v: string) => update("area", cleanArea(v))}
            />
          </div>

          <Select
            label="工作類型"
            value={form.jobType}
            onChange={(v: string) => update("jobType", v)}
            options={["正職", "兼職", "自營", "臨時工", "其他"]}
          />

          <Input
            label="任職年資"
            value={form.workYears}
            placeholder="不能輸入中文，例如 2Y3M 或 2-3"
            onChange={(v: string) => update("workYears", v)}
            onBlur={(e) => cleanNoChineseOnBlur("workYears", e.target.value, 20)}
          />

          <Select
            label="月收入區間"
            value={form.incomeRange}
            onChange={(v: string) => update("incomeRange", v)}
            options={["2萬以下", "2萬至4萬", "4萬至6萬", "6萬以上"]}
          />

          <Select
            label="是否有薪轉／勞保"
            value={form.hasPayrollOrLaborInsurance}
            onChange={(v: string) => update("hasPayrollOrLaborInsurance", v)}
            options={["都有", "只有薪轉", "只有勞保", "都沒有"]}
          />

          <div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">資金需求</span>
              <div className="flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-slate-900">
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.fundingAmountWan}
                  maxLength={4}
                  placeholder="例如 5"
                  onChange={(e) => update("fundingAmountWan", cleanDigits(e.target.value, 4))}
                  className="w-full px-3 py-2 outline-none"
                />
                <span className="border-l border-slate-300 px-3 py-2 text-slate-700">萬</span>
              </div>
            </label>
          </div>

          <Select
            label="選擇當品"
            value={form.pawnItem}
            onChange={(v: string) => update("pawnItem", v)}
            options={["汽車", "機車", "無當", "其他"]}
          />

          <TextArea label="資金用途" value={form.fundingPurpose} onChange={(v: string) => update("fundingPurpose", cleanPurpose(v))} />

          <Input label="緊急聯絡人姓名" value={form.emergencyName} onChange={(v: string) => update("emergencyName", v.slice(0, 40))} />

          <Input
            label="緊急聯絡人電話"
            value={form.emergencyPhone}
            maxLength={10}
            placeholder="例如 0912345678"
            onChange={(v: string) => update("emergencyPhone", cleanDigits(v, 10))}
          />

          <Input label="緊急聯絡人關係" value={form.emergencyRelation} onChange={(v: string) => update("emergencyRelation", v.slice(0, 20))} />

          <label className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.agreeFollowUp}
              onChange={(e) => update("agreeFollowUp", e.target.checked)}
            />
            <span>我同意後續審核時，依需求補充相關資料。</span>
          </label>

          <label className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.agreePrivacy}
              onChange={(e) => update("agreePrivacy", e.target.checked)}
            />
            <span>本人同意基於申請審核、聯繫、資料確認之目的，蒐集並使用本人所提供之資料。</span>
          </label>

          {message && (
            <div className="rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "送出中..." : "送出申請"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Input(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  maxLength?: number;
  placeholder?: string;
  note?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{props.label}</span>
      <input
        type={props.type || "text"}
        value={props.value}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={props.onBlur}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
      />
      {props.note && (
        <span className="mt-1 block text-xs leading-5 text-slate-500">{props.note}</span>
      )}
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
      <span className="mb-1 block text-sm font-medium text-slate-700">{props.label}</span>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={props.onBlur}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
      >
        <option value="">請選擇</option>
        {props.options.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{props.label}</span>
      <textarea
        rows={4}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
      />
    </label>
  );
}
