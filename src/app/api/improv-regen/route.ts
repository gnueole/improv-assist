/**
 * @file route.ts
 * @description API route proxying prompts regeneration requests to the n8n BaaS webhook.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const webhookUrl = process.env.N8N_POPULATE_URL || "https://n8n.eole.me/webhook/improv-regen";
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      let errorData: any = null;
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        }
      } catch (e) {
        // Not JSON
      }

      if (errorData) {
        return NextResponse.json(errorData, { status: response.status });
      }

      return NextResponse.json(
        { error: `n8n webhook returned status ${response.status}` },
        { status: response.status }
      );
    }
    
    let responseData = {};
    const text = await response.text();
    if (text) {
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        responseData = { text };
      }
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Improv Regen API Proxy Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
