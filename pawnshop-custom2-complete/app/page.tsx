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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSending(true);
    setMessage("");

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

      setMessage("申請已送出，將由專人聯繫。");
      setForm(initialForm);
    } catch {
      setMessage("系統異常");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">初審申請表</h1>

        <form onSubmit={submit} className="grid gap-4">
          <Input label="姓名" value={form.name} onChange={(v:string)=>update("name",v)} />
          <Input label="出生年月日" type="date" value={form.birthDate} onChange={(v:string)=>update("birthDate",v)} />
          <Input label="身分證後四碼" value={form.idLast4} onChange={(v:string)=>update("idLast4",v)} />
          <Input label="手機號碼" value={form.phone} onChange={(v:string)=>update("phone",v)} />
          <Input label="LINE ID" value={form.lineId} onChange={(v:string)=>update("lineId",v)} />
          <Input label="現居地區" value={form.cityArea} onChange={(v:string)=>update("cityArea",v)} />

          <Select
            label="工作類型"
            value={form.jobType}
            onChange={(v:string)=>update("jobType",v)}
            options={["正職","兼職","自營","臨時工","其他"]}
          />

          <Input label="任職年資" value={form.workYears} onChange={(v:string)=>update("workYears",v)} />

          <Select
            label="月收入區間"
            value={form.incomeRange}
            onChange={(v:string)=>update("incomeRange",v)}
            options={["2萬以下","2萬至4萬","4萬至6萬","6萬以上"]}
          />

          <Select
            label="是否有薪轉／勞保"
            value={form.hasPayrollOrLaborInsurance}
            onChange={(v:string)=>update("hasPayrollOrLaborInsurance",v)}
            options={["都有","只有薪轉","只有勞保","都沒有"]}
          />

          <Input label="資金需求金額" value={form.fundingAmount} onChange={(v:string)=>update("fundingAmount",v)} />

          <Select
            label="選擇當品"
            value={form.hasVehicle}
            onChange={(v:string)=>update("hasVehicle",v)}
            options={["汽車","機車","無當","其他"]}
          />

          <TextArea
            label="資金用途"
            value={form.fundingPurpose}
            onChange={(v:string)=>update("fundingPurpose",v)}
          />

          <Input
            label="緊急聯絡人姓名"
            value={form.emergencyName}
            onChange={(v:string)=>update("emergencyName",v)}
          />

          <Input
            label="緊急聯絡人電話"
            value={form.emergencyPhone}
            onChange={(v:string)=>update("emergencyPhone",v)}
          />

          <Input
            label="緊急聯絡人關係"
            value={form.emergencyRelation}
            onChange={(v:string)=>update("emergencyRelation",v)}
          />

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={form.agreePrivacy}
              onChange={(e)=>update("agreePrivacy",e.target.checked)}
            />
            <span>同意個資蒐集與使用</span>
          </label>

          {message && (
            <div className="rounded bg-slate-900 p-3 text-white">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-slate-900 px-5 py-3 text-white"
          >
            {sending ? "送出中..." : "送出申請"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Input(props:any) {
  return (
    <div>
      <div className="mb-1 text-sm">{props.label}</div>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={(e)=>props.onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2"
      />
    </div>
  );
}

function Select(props:any) {
  return (
    <div>
      <div className="mb-1 text-sm">{props.label}</div>
      <select
        value={props.value}
        onChange={(e)=>props.onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2"
      >
        <option value="">請選擇</option>
        {props.options.map((x:string)=>(
          <option key={x} value={x}>{x}</option>
        ))}
      </select>
    </div>
  );
}

function TextArea(props:any) {
  return (
    <div>
      <div className="mb-1 text-sm">{props.label}</div>
      <textarea
        rows={4}
        value={props.value}
        onChange={(e)=>props.onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2"
      />
    </div>
  );
}
