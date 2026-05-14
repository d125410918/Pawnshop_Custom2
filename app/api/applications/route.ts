import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

type Payload = {
  name?: string;
  birthDate?: string;
  identityNumber?: string;
  phone?: string;
  lineId?: string;
  city?: string;
  district?: string;
  jobType?: string;
  workYears?: string;
  incomeType?: string;
  incomeAmount?: number | null;
  incomeLabel?: string;
  payrollInsurance?: string;
  fundingNeedWan?: string;
  fundingNeed?: string;
  fundingPurpose?: string;
  collateral?: string;
  agreeFollowUp?: boolean;
  agreePrivacy?: boolean;
  selfieUrl?: string | null;
  idCardFrontUrl?: string | null;
  idCardBackUrl?: string | null;
};

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL");
  }

  return neon(databaseUrl);
}

function cleanString(value: unknown) {
  return String(value || "").trim();
}

function cleanNullableString(value: unknown) {
  const text = cleanString(value);
  return text || null;
}

function normalizeIncomeAmount(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeBoolean(value: unknown) {
  return value === true;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown database error";
}

function validate(body: Payload) {
  if (!cleanString(body.name)) return "請填寫姓名";
  if (!cleanString(body.birthDate)) return "請填寫出生年月日";
  if (!cleanString(body.identityNumber)) return "請填寫身分證字號";
  if (!cleanString(body.phone)) return "請填寫手機號碼";
  if (!cleanString(body.lineId)) return "請填寫 LINE ID";
  if (!cleanString(body.city)) return "請選擇縣市";
  if (!cleanString(body.district)) return "請填寫區域";
  if (!cleanString(body.jobType)) return "請選擇工作類型";
  if (!cleanString(body.workYears)) return "請填寫任職年資";
  if (!cleanString(body.incomeLabel)) return "請選擇收入";
  if (!cleanString(body.payrollInsurance)) return "請選擇是否有薪轉／勞保";
  if (!cleanString(body.fundingNeedWan)) return "請填寫資金需求";
  if (!cleanString(body.fundingNeed)) return "請填寫資金需求";
  if (!cleanString(body.fundingPurpose)) return "請填寫資金用途";
  if (!cleanString(body.collateral)) return "請選擇當品";
  if (!normalizeBoolean(body.agreeFollowUp)) return "請同意後續補件審核";
  if (!normalizeBoolean(body.agreePrivacy)) return "請同意個資蒐集與使用";
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload;

    const error = validate(body);
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        {
          status: 400,
        }
      );
    }

    const sql = getDb();

    const result = await sql`
      INSERT INTO customers (
        name,
        birth_date,
        national_id,
        phone,
        line_id,
        city,
        district,
        job_type,
        work_years,
        income_type,
        income_amount,
        income_label,
        payroll_insurance,
        funding_need_wan,
        funding_need,
        funding_purpose,
        collateral,
        agree_follow_up,
        agree_privacy,
        status,
        selfie_url,
        id_card_front_url,
        id_card_back_url,
        created_at,
        updated_at
      )
      VALUES (
        ${cleanString(body.name)},
        ${cleanString(body.birthDate)},
        ${cleanString(body.identityNumber).toUpperCase()},
        ${cleanString(body.phone)},
        ${cleanString(body.lineId)},
        ${cleanString(body.city)},
        ${cleanString(body.district)},
        ${cleanString(body.jobType)},
        ${cleanString(body.workYears)},
        ${cleanString(body.incomeType) || "monthly"},
        ${normalizeIncomeAmount(body.incomeAmount)},
        ${cleanString(body.incomeLabel)},
        ${cleanString(body.payrollInsurance)},
        ${cleanString(body.fundingNeedWan)},
        ${cleanString(body.fundingNeed)},
        ${cleanString(body.fundingPurpose)},
        ${cleanString(body.collateral)},
        ${normalizeBoolean(body.agreeFollowUp)},
        ${normalizeBoolean(body.agreePrivacy)},
        'pending',
        ${cleanNullableString(body.selfieUrl)},
        ${cleanNullableString(body.idCardFrontUrl)},
        ${cleanNullableString(body.idCardBackUrl)},
        NOW(),
        NOW()
      )
      RETURNING id, status, created_at
    `;

    const insertedRows = result as Array<{
      id: unknown;
      status: unknown;
      created_at: unknown;
    }>;

    if (insertedRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "資料庫未回傳寫入結果",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "申請成功",
      data: insertedRows[0],
    });
  } catch (error) {
    console.error("Insert customers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: `資料庫寫入失敗：${errorMessage(error)}`,
      },
      {
        status: 500,
      }
    );
  }
}
