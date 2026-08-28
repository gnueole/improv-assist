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
    // The Axiom dashboards group by `application`; without it every project's
    // events pile into one anonymous heap.
    body.application = "improv";

    // Vector, not n8n. Telemetry used to reach a Notion database through a
    // workflow that failed on every single event — 66 runs, 66 failures — while
    // Notion is the wrong store for a time series anyway. Vector ships straight
    // to the Axiom eole-telemetry dataset.
    const webhookUrl = process.env.TELEMETRY_WEBHOOK_URL || "http://vector:8080";
    
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
