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
  collateral?: string;
  fundingNeed?: string;
  fundingNeedWan?: string;
  fundingPurpose?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
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

async function ensureCustomersTable(sql: ReturnType<typeof neon>) {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text,
      national_id text,
      city text,
      district text,
      income_type text DEFAULT 'monthly',
      income_amount numeric,
      income_label text,
      collateral text,
      funding_need text,
      status text DEFAULT 'pending',
      selfie_url text,
      id_card_front_url text,
      id_card_back_url text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS name text,
      ADD COLUMN IF NOT EXISTS national_id text,
      ADD COLUMN IF NOT EXISTS city text,
      ADD COLUMN IF NOT EXISTS district text,
      ADD COLUMN IF NOT EXISTS income_type text DEFAULT 'monthly',
      ADD COLUMN IF NOT EXISTS income_amount numeric,
      ADD COLUMN IF NOT EXISTS income_label text,
      ADD COLUMN IF NOT EXISTS collateral text,
      ADD COLUMN IF NOT EXISTS funding_need text,
      ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS selfie_url text,
      ADD COLUMN IF NOT EXISTS id_card_front_url text,
      ADD COLUMN IF NOT EXISTS id_card_back_url text,
      ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
      ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
      ADD COLUMN IF NOT EXISTS birth_date text,
      ADD COLUMN IF NOT EXISTS phone text,
      ADD COLUMN IF NOT EXISTS line_id text,
      ADD COLUMN IF NOT EXISTS job_type text,
      ADD COLUMN IF NOT EXISTS work_years text,
      ADD COLUMN IF NOT EXISTS payroll_insurance text,
      ADD COLUMN IF NOT EXISTS has_payroll_or_labor_insurance text,
      ADD COLUMN IF NOT EXISTS funding_amount_wan text,
      ADD COLUMN IF NOT EXISTS funding_purpose text,
      ADD COLUMN IF NOT EXISTS emergency_name text,
      ADD COLUMN IF NOT EXISTS emergency_phone text,
      ADD COLUMN IF NOT EXISTS emergency_relation text,
      ADD COLUMN IF NOT EXISTS area text,
      ADD COLUMN IF NOT EXISTS pawn_item text
  `;

  await sql`ALTER TABLE customers ALTER COLUMN income_type SET DEFAULT 'monthly'`;
  await sql`ALTER TABLE customers ALTER COLUMN status SET DEFAULT 'pending'`;
  await sql`ALTER TABLE customers ALTER COLUMN created_at SET DEFAULT now()`;
  await sql`ALTER TABLE customers ALTER COLUMN updated_at SET DEFAULT now()`;

  await sql`
    DO $$
    DECLARE
      id_type text;
    BEGIN
      SELECT data_type
      INTO id_type
      FROM information_schema.columns
      WHERE table_name = 'customers'
        AND column_name = 'id'
      LIMIT 1;

      IF id_type = 'uuid' THEN
        EXECUTE 'ALTER TABLE customers ALTER COLUMN id SET DEFAULT gen_random_uuid()';
      ELSIF id_type IN ('text', 'character varying') THEN
        EXECUTE 'ALTER TABLE customers ALTER COLUMN id SET DEFAULT gen_random_uuid()::text';
      END IF;
    END $$;
  `;

  await sql`
    UPDATE customers
    SET status = 'pending'
    WHERE status IS NULL
       OR status NOT IN ('pending', 'approved')
  `;

  await sql`
    DO $$
    DECLARE
      constraint_record record;
    BEGIN
      FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'customers'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%status%'
      LOOP
        EXECUTE format('ALTER TABLE customers DROP CONSTRAINT %I', constraint_record.conname);
      END LOOP;
    END $$;
  `;

  await sql`
    ALTER TABLE customers
    ADD CONSTRAINT customers_status_check
    CHECK (status IN ('pending', 'approved'))
  `;
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
    await ensureCustomersTable(sql);

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
        birth_date,
        phone,
        line_id,
        job_type,
        work_years,
        payroll_insurance,
        has_payroll_or_labor_insurance,
        funding_amount_wan,
        funding_purpose,
        emergency_name,
        emergency_phone,
        emergency_relation,
        area,
        pawn_item,
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
        ${cleanNullableString(body.birthDate)},
        ${cleanNullableString(body.phone)},
        ${cleanNullableString(body.lineId)},
        ${cleanNullableString(body.jobType)},
        ${cleanNullableString(body.workYears)},
        ${cleanNullableString(body.payrollInsurance)},
        ${cleanNullableString(body.payrollInsurance)},
        ${cleanNullableString(body.fundingNeedWan)},
        ${cleanNullableString(body.fundingPurpose)},
        ${cleanNullableString(body.emergencyName)},
        ${cleanNullableString(body.emergencyPhone)},
        ${cleanNullableString(body.emergencyRelation)},
        ${cleanString(body.district)},
        ${cleanString(body.collateral)},
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
        message: "資料庫寫入失敗，請確認 DATABASE_URL 與 customers 表欄位",
      },
      {
        status: 500,
      }
    );
  }
}
