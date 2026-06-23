/**
 * @file route.ts
 * @description API route proxying user feedback to the n8n feedback webhook.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import { NextResponse } from "next/server";
import { after } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL || "https://n8n.eole.me/webhook/improv-feedback";
    
    // Execute n8n webhook call asynchronously after the response has been sent
    after(async () => {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        
        if (!response.ok) {
          console.error(`[Feedback Background Task Error]: n8n webhook returned status ${response.status}`);
        }
      } catch (err) {
        console.error("[Feedback Background Task Exception]:", err);
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Feedback API Proxy Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
