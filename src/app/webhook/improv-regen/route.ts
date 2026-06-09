import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch("https://n8n.eole.me/webhook/improv-regen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Ensure we don't hit cache and always get fresh items
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `n8n responded with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Webhook proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
