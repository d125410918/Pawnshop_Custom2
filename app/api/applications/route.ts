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

const CITIES = [
  "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
  "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣",
  "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
  "台東縣", "澎湖縣", "金門縣", "連江縣"
];

const JOB_TYPES = ["正職", "兼職", "自營", "臨時工", "其他"];
const INCOME_LABELS = ["2萬以下", "2萬至4萬", "4萬至6萬", "6萬以上"];
const PAYROLL_INSURANCE_OPTIONS = ["都有", "只有薪轉", "只有勞保", "都沒有"];
const COLLATERALS = ["汽車", "機車", "無當", "其他"];

const TAIWAN_ID_CODES: Record<string, number> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
  K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
  U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
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

function isOneOf(value: string, options: string[]) {
  return options.includes(value);
}

function isValidTaiwanId(value: unknown) {
  const id = cleanString(value).toUpperCase();

  if (!/^[A-Z][12]\d{8}$/.test(id)) {
    return false;
  }

  const code = TAIWAN_ID_CODES[id[0]];

  if (!code) {
    return false;
  }

  const digits = [
    Math.floor(code / 10),
    code % 10,
    ...id.slice(1).split("").map((x) => Number(x)),
  ];

  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];

  const sum = digits.reduce((total, digit, index) => {
    return total + digit * weights[index];
  }, 0);

  return sum % 10 === 0;
}

function isValidBirthDate(value: unknown) {
  const text = cleanString(value);

  if (!/^\d{8}$/.test(text)) {
    return false;
  }

  const year = Number(text.slice(0, 4));
  const month = Number(text.slice(4, 6));
  const day = Number(text.slice(6, 8));

  const currentYear = new Date().getFullYear();

  if (year < 1911 || year > currentYear) {
    return false;
  }

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isValidLineId(value: unknown) {
  const text = cleanString(value);
  return /^[A-Za-z0-9._@\-\/\s]{2,50}$/.test(text);
}

function isValidDistrict(value: unknown) {
  const text = cleanString(value);
  return /^[\u4e00-\u9fa5A-Za-z0-9\s-]{1,30}$/.test(text);
}

function isValidShortText(value: unknown, maxLength: number) {
  const text = cleanString(value);
  return text.length > 0 && text.length <= maxLength;
}

function isValidFundingNeedWan(value: unknown) {
  const text = cleanString(value);
  return /^\d{1,4}$/.test(text) && Number(text) > 0;
}

function isValidImageUrl(value: unknown) {
  const text = cleanNullableString(value);

  if (text === null) {
    return true;
  }

  if (text.length > 1000) {
    return false;
  }

  try {
    const url = new URL(text);

    if (url.protocol !== "https:") {
      return false;
    }

    if (!url.hostname.includes("blob.vercel-storage.com")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function validate(body: Payload) {
  const name = cleanString(body.name);
  const birthDate = cleanString(body.birthDate);
  const identityNumber = cleanString(body.identityNumber).toUpperCase();
  const phone = cleanString(body.phone);
  const lineId = cleanString(body.lineId);
  const city = cleanString(body.city);
  const district = cleanString(body.district);
  const jobType = cleanString(body.jobType);
  const workYears = cleanString(body.workYears);
  const incomeType = cleanString(body.incomeType) || "monthly";
  const incomeLabel = cleanString(body.incomeLabel);
  const payrollInsurance = cleanString(body.payrollInsurance);
  const fundingNeedWan = cleanString(body.fundingNeedWan);
  const fundingPurpose = cleanString(body.fundingPurpose);
  const collateral = cleanString(body.collateral);

  if (!isValidShortText(name, 40)) {
    return "請填寫姓名";
  }

  if (!isValidBirthDate(birthDate)) {
    return "出生年月日請輸入正確的 8 位西元日期";
  }

  if (!isValidTaiwanId(identityNumber)) {
    return "請填寫正確的身分證字號";
  }

  if (!/^09\d{8}$/.test(phone)) {
    return "手機號碼格式不正確";
  }

  if (!isValidLineId(lineId)) {
    return "LINE ID 格式不正確";
  }

  if (!isOneOf(city, CITIES)) {
    return "請選擇正確的縣市";
  }

  if (!isValidDistrict(district)) {
    return "請填寫正確的現居區域";
  }

  if (!isOneOf(jobType, JOB_TYPES)) {
    return "請選擇正確的工作類型";
  }

  if (!isValidShortText(workYears, 30)) {
    return "請填寫任職年資";
  }

  if (incomeType !== "monthly") {
    return "收入類型不正確";
  }

  if (!isOneOf(incomeLabel, INCOME_LABELS)) {
    return "請選擇正確的月收入區間";
  }

  if (!isOneOf(payrollInsurance, PAYROLL_INSURANCE_OPTIONS)) {
    return "請選擇正確的薪轉／勞保狀態";
  }

  if (!isValidFundingNeedWan(fundingNeedWan)) {
    return "資金需求請輸入 1 到 4 位數字";
  }

  if (!isValidShortText(fundingPurpose, 300)) {
    return "請填寫資金用途";
  }

  if (!isOneOf(collateral, COLLATERALS)) {
    return "請選擇正確的當品";
  }

  if (!normalizeBoolean(body.agreeFollowUp)) {
    return "請同意後續補件審核";
  }

  if (!normalizeBoolean(body.agreePrivacy)) {
    return "請同意個資蒐集與使用";
  }

  if (!isValidImageUrl(body.selfieUrl)) {
    return "自拍照網址格式不正確";
  }

  if (!isValidImageUrl(body.idCardFrontUrl)) {
    return "身分證正面網址格式不正確";
  }

  if (!isValidImageUrl(body.idCardBackUrl)) {
    return "身分證反面網址格式不正確";
  }

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

    const fundingNeedWan = cleanString(body.fundingNeedWan);

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
        ${fundingNeedWan},
        ${`${fundingNeedWan}萬`},
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
          message: "資料寫入失敗，請稍後再試",
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
        message: "系統忙碌，請稍後再試",
      },
      {
        status: 500,
      }
    );
  }
}
