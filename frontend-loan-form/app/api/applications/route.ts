import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.hasVehicle) {
      return NextResponse.json(
        {
          success: false,
          message: "請選擇當品",
        },
        { status: 400 }
      );
    }

    const application = {
      id: crypto.randomUUID(),
      status: "待初審",
      createdAt: new Date().toISOString(),
      ...body,
    };

    console.log("New application:", application);

    return NextResponse.json({
      success: true,
      message: "申請已送出",
      data: {
        id: application.id,
        status: application.status,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "資料格式錯誤",
      },
      { status: 400 }
    );
  }
}
