import { NextRequest, NextResponse } from "next/server";

const TAIWAN_ID_CODES: Record<string, number> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
  K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
  U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
};

function isValidTaiwanId(value: string) {
  const id = String(value || "").toUpperCase();

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
  const sum = digits.reduce((total, digit, index) => total + digit * weights[index], 0);

  return sum % 10 === 0;
}

function validate(body: any) {
  if (!/^[\u4e00-\u9fa5A-Za-z·．\s]{2,30}$/.test(body.name || "")) return "姓名格式不正確";
  if (!body.birthDate) return "請填寫出生年月日";
  if (!isValidTaiwanId(body.identityNumber)) return "請填寫正確的身分證字號";
  if (!/^09\d{8}$/.test(body.phone || "")) return "手機號碼格式不正確";
  if (!/^[A-Za-z0-9._@-]{2,50}$/.test(body.lineId || "")) return "LINE ID 格式不正確";
  if (!/^[\u4e00-\u9fa5A-Za-z0-9\s\-／/.]{2,50}$/.test(body.cityArea || "")) return "現居地區格式不正確";
  if (!["正職", "兼職", "自營", "臨時工", "其他"].includes(body.jobType)) return "請選擇工作類型";
  if (!/^[\u4e00-\u9fa5A-Za-z0-9\s\-／/.]{1,50}$/.test(body.workYears || "")) return "任職年資格式不正確";
  if (!["2萬以下", "2萬至4萬", "4萬至6萬", "6萬以上"].includes(body.incomeRange)) return "請選擇月收入區間";
  if (!["都有", "只有薪轉", "只有勞保", "都沒有"].includes(body.hasPayrollOrLaborInsurance)) return "請選擇是否有薪轉／勞保";
  if (!/^\d{4,8}$/.test(body.fundingAmount || "")) return "資金需求金額格式不正確";
  if (!/^[\u4e00-\u9fa5A-Za-z0-9\s，。,.、；;：:（）()\-／/]{2,200}$/.test(body.fundingPurpose || "")) return "資金用途格式不正確";
  if (!["汽車", "機車", "無當", "其他"].includes(body.pawnItem)) return "請選擇當品";
  if (!/^[\u4e00-\u9fa5A-Za-z·．\s]{2,30}$/.test(body.emergencyName || "")) return "緊急聯絡人姓名格式不正確";
  if (!/^09\d{8}$/.test(body.emergencyPhone || "")) return "緊急聯絡人電話格式不正確";
  if (!/^[\u4e00-\u9fa5A-Za-z\s]{1,20}$/.test(body.emergencyRelation || "")) return "緊急聯絡人關係格式不正確";
  if (body.agreeFollowUp !== true) return "請同意後續補件審核";
  if (body.agreePrivacy !== true) return "請同意個資蒐集與使用";
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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

    const application = {
      id: crypto.randomUUID(),
      status: "待初審",
      createdAt: new Date().toISOString(),
      ...body,
      identityNumber: String(body.identityNumber).toUpperCase(),
    };

    console.log("Application:", application);

    return NextResponse.json({
      success: true,
      message: "申請成功",
      data: {
        id: application.id,
        status: application.status,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "系統錯誤",
      },
      {
        status: 500,
      }
    );
  }
}
