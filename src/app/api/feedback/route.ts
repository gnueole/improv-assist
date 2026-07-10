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
    
    // Map payload to match the unified n8n feedback workflow schema
    const mappedBody = {
      name: body.name,
      email: body.email,
      stars: body.score,
      category: body.type === "Demande" ? "Comment" : (body.type === "Suggestion" ? "Improvement" : "Bug"),
      message: body.comment,
      app: "improv-assist",
      platform: process.env.NODE_ENV === "production" ? "prod" : "dev",
      timestamp: new Date().toISOString()
    };
    
    const webhookUrl = process.env.N8N_FEEDBACK_WEBHOOK_URL || "https://n8n.eole.me/webhook/jobby-feedback";
    
    // Execute n8n webhook call asynchronously after the response has been sent
    after(async () => {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mappedBody),
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
