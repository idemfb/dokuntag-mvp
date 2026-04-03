import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { code, message } = body;

    console.log("Yeni mesaj:", { code, message });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}