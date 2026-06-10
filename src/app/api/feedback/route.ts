import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL || "https://n8n.eole.me/webhook/improv-feedback";
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `n8n webhook returned status ${response.status}` },
        { status: response.status }
      );
    }
    
    // Try parsing response if there is any content, otherwise return success
    let responseData: any = { success: true };
    const text = await response.text();
    if (text) {
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        responseData = { success: true, message: text };
      }
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Feedback API Proxy Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
