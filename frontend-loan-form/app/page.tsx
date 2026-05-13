"use client";

import { useState } from "react";

type FormData = {
  name: string;
  birthDate: string;
  idLast4: string;
  phone: string;
  lineId: string;
  cityArea: string;
  jobType: string;
  workYears: string;
  incomeRange: string;
  hasPayrollOrLaborInsurance: string;
  fundingAmount: string;
  fundingPurpose: string;
  hasVehicle: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  agreeFollowUp: boolean;
  agreePrivacy: boolean;
};

const initialForm: FormData = {
  name: "",
  birthDate: "",
  idLast4: "",
  phone: "",
  lineId: "",
  cityArea: "",
  jobType: "",
  workYears: "",
  incomeRange: "",
  hasPayrollOrLaborInsurance: "",
  fundingAmount: "",
  fundingPurpose: "",
  hasVehicle: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
  agreeFollowUp: false,
  agreePrivacy: false,
};

export default function ApplicationPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const update = (key: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return "請填寫姓名";
    if (!form.birthDate) return "請填寫出生年月日";
    if (!/^\d{4}$/.test(form.idLast4)) return "身分證字號後四碼需為 4 位數字";
    if (!/^09\d{8}$/.test(form.phone)) return "請填寫正確手機號碼";
    if (!form.lineId.trim()) return "請填寫 LINE ID";
    if (!form.cityArea.trim()) return "請填寫現居縣市／區域";
    if (!form.jobType) return "請選擇工作類型";
    if (!form.workYears.trim()) return "請填寫任職年資";
    if (!form.incomeRange) return "請選擇月收入區間";
    if (!form.hasPayrollOrLaborInsurance) return "請選擇是否有薪轉／勞保";
    if (!form.fundingAmount.trim()) return "請填寫資金需求金額";
    if (!form.fundingPurpose.trim()) return "請填寫資金用途";
    if (!form.hasVehicle) return "請選擇當品";
    if (!form.emergencyName.trim()) return "請填寫緊急聯絡人姓名";
    if (!/^09\d{8}$/.test(form.emergencyPhone)) return "請填寫正確緊急聯絡人電話";
    if (!form.emergencyRelation.trim()) return "請填寫緊急聯絡人關係";
    if (!form.agreeFollowUp) return "請同意後續補件審核";
    if (!form.agreePrivacy) return "請同意個資蒐集與使用聲明";
    return "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "送出失敗");
        return;
      }

      setForm(initialForm);
      setMessage("申請已送出，將由專人聯繫。");
    } catch {
      setMessage("系統連線異常，請稍後再試。");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-900">初審申請表</h1>

        <form onSubmit={submit} className="mt-6 space-y-8">
          <section>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="姓名" value={form.name} onChange={(v) => update("name", v)} />
              <Input
                label="出生年月日"
                type="date"
                value={form.birthDate}
                onChange={(v) => update("birthDate", v)}
              />
              <Input
                label="身分證字號後四碼"
                value={form.idLast4}
                maxLength={4}
                onChange={(v) => update("idLast4", v.replace(/\D/g, ""))}
              />
              <Input
                label="手機號碼"
                value={form.phone}
                maxLength={10}
                onChange={(v) => update("phone", v.replace(/\D/g, ""))}
              />
              <Input label="LINE ID" value={form.lineId} onChange={(v) => update("lineId", v)} />
              <Input
                label="現居縣市／區域"
                value={form.cityArea}
                onChange={(v) => update("cityArea", v)}
              />

              <Select
                label="工作類型"
                value={form.jobType}
                onChange={(v) => update("jobType", v)}
                options={["正職", "兼職", "自營", "臨時工", "其他"]}
              />

              <Input
                label="任職年資"
                placeholder="例：2年3個月"
                value={form.workYears}
                onChange={(v) => update("workYears", v)}
              />

              <Select
                label="月收入區間"
                value={form.incomeRange}
                onChange={(v) => update("incomeRange", v)}
                options={["2萬以下", "2萬至4萬", "4萬至6萬", "6萬以上"]}
              />

              <Select
                label="是否有薪轉／勞保"
                value={form.hasPayrollOrLaborInsurance}
                onChange={(v) => update("hasPayrollOrLaborInsurance", v)}
                options={["都有", "只有薪轉", "只有勞保", "都沒有"]}
              />

              <Input
                label="資金需求金額"
                placeholder="例：50000"
                value={form.fundingAmount}
                onChange={(v) => update("fundingAmount", v.replace(/\D/g, ""))}
              />

              <Select
                label="選擇當品"
                value={form.hasVehicle}
                onChange={(v) => update("hasVehicle", v)}
                options={["汽車", "機車", "無當", "其他"]}
              />

              <div className="md:col-span-2">
                <TextArea
                  label="資金用途"
                  value={form.fundingPurpose}
                  onChange={(v) => update("fundingPurpose", v)}
                />
              </div>

              <Input
                label="緊急聯絡人姓名"
                value={form.emergencyName}
                onChange={(v) => update("emergencyName", v)}
              />
              <Input
                label="緊急聯絡人電話"
                value={form.emergencyPhone}
                maxLength={10}
                onChange={(v) => update("emergencyPhone", v.replace(/\D/g, ""))}
              />
              <Input
                label="緊急聯絡人關係"
                value={form.emergencyRelation}
                onChange={(v) => update("emergencyRelation", v)}
              />
            </div>
          </section>

          <section className="space-y-3 rounded-xl bg-slate-50 p-4">
            <CheckBox
              checked={form.agreeFollowUp}
              onChange={(v) => update("agreeFollowUp", v)}
              label="我同意後續審核時，依需求補充相關資料。"
            />

            <CheckBox
              checked={form.agreePrivacy}
              onChange={(v) => update("agreePrivacy", v)}
              label="本人同意基於申請審核、聯繫、資料確認之目的，蒐集並使用本人所提供之資料。"
            />
          </section>

          {message && (
            <div className="rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "送出中..." : "送出申請"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Input(props: any) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{props.label}</span>
      <input
        type={props.type || "text"}
        value={props.value}
        placeholder={props.placeholder}
        maxLength={props.maxLength}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
      />
    </label>
  );
}

function Select(props: any) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{props.label}</span>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
      >
        <option value="">請選擇</option>
        {props.options.map((x: string) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea(props: any) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{props.label}</span>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        rows={4}
        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
      />
    </label>
  );
}

function CheckBox(props: any) {
  return (
    <label className="flex gap-3 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
        className="mt-1"
      />
      <span>{props.label}</span>
    </label>
  );
}
