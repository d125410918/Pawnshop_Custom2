import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Application:", body);

    return NextResponse.json({
      success: true,
      message: "申請成功"
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "系統錯誤"
      },
      {
        status: 500
      }
    );
  }
}
