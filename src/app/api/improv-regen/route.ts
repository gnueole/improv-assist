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
    
    // Set a 10-second timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
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
        // Intercept n8n execution timeout message
        const errMsg = (errorData.message || "").toLowerCase();
        if (errMsg.includes("timeout") || errMsg.includes("timed out")) {
          return NextResponse.json(
            { error: "Timeout issued (from Message a model)" },
            { status: 504 }
          );
        }
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
  } catch (error: any) {
    console.error("[Improv Regen API Proxy Error]:", error);
    if (error.name === "AbortError" || (error instanceof Error && error.name === "TimeoutError")) {
      return NextResponse.json(
        { error: "Timeout issued (from Message a model)" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
