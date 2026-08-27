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
      // "improv", not "improv-assist": this lands in the Platform select of the
      // shared "Feedback & Contacts" Notion table, whose options are
      // jobby | improv | www. Sending the engine name would have Notion create a
      // fourth option and split this app's feedback across two labels.
      app: "improv",
      platform: process.env.NODE_ENV === "production" ? "prod" : "dev",
      timestamp: new Date().toISOString()
    };
    
    // Container-internal address: the VPS /etc/hosts maps n8n.eole.me to
    // 127.0.1.1 and containers inherit it, so the public hostname answers
    // ECONNREFUSED from in here. n8n-server is the container name on
    // eole_shared_network.
    const webhookUrl = process.env.N8N_FEEDBACK_WEBHOOK_URL || "http://n8n-server:5678/webhook/feedback";
    
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
