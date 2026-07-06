/**
 * @file route.ts
 * @description API route proxying tile usage telemetry to the n8n telemetry webhook.
 * @author Éole <hi@eole>
 * @creation-date 2026-07-06
 * @license MIT
 */

import { NextResponse } from "next/server";
import { after } from "next/server";

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ status: "skipped", reason: "dev_environment" });
    }

    const body = await request.json();
    // Add platform environment
    body.platform = "prod";
    
    const n8nBaseUrl = process.env.N8N_BASE_URL || "https://n8n.eole.me";
    const webhookUrl = process.env.TELEMETRY_WEBHOOK_URL || `${n8nBaseUrl.replace(/\/$/, "")}/webhook/improv-telemetry`;
    
    // Execute n8n webhook call asynchronously after the client receives the response
    after(async () => {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-n8n-token": process.env.X_N8N_TOKEN || ""
          },
          body: JSON.stringify(body),
        });
        
        if (!response.ok) {
          console.error(`[Telemetry Background Task Error]: n8n webhook returned status ${response.status}`);
        }
      } catch (err) {
        console.error("[Telemetry Background Task Exception]:", err);
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Telemetry API Proxy Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
