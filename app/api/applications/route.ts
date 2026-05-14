import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

type Payload = {
  name?: string;
  identityNumber?: string;
  city?: string;
  district?: string;
  incomeType?: string;
  incomeAmount?: number | null;
  incomeLabel?: string;
  collateral?: string;
  fundingNeed?: string;
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

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown database error";
}

function validate(body: Payload) {
  if (!cleanString(body.name)) return "請填寫姓名";
  if (!cleanString(body.identityNumber)) return "請填寫身分證字號";
  if (!cleanString(body.city)) return "請選擇縣市";
  if (!cleanString(body.district)) return "請填寫區域";
  if (!cleanString(body.incomeLabel)) return "請選擇收入";
  if (!cleanString(body.collateral)) return "請選擇當品";
  if (!cleanString(body.fundingNeed)) return "請填寫資金需求";
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
        national_id,
        city,
        district,
        income_type,
        income_amount,
        income_label,
        collateral,
        funding_need,
        status,
        selfie_url,
        id_card_front_url,
        id_card_back_url,
        created_at,
        updated_at
      )
      VALUES (
        ${cleanString(body.name)},
        ${cleanString(body.identityNumber).toUpperCase()},
        ${cleanString(body.city)},
        ${cleanString(body.district)},
        ${cleanString(body.incomeType) || "monthly"},
        ${normalizeIncomeAmount(body.incomeAmount)},
        ${cleanString(body.incomeLabel)},
        ${cleanString(body.collateral)},
        ${cleanString(body.fundingNeed)},
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
