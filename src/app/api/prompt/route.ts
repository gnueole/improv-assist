/**
 * @file route.ts
 * @description API route reading and serving the Gemini system prompt dynamically from master.prompt.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-11
 * @license MIT
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "n8n", "prompts", "master.prompt");
    if (!fs.existsSync(filePath)) {
      console.warn(`Prompt file not found at ${filePath}`);
      return NextResponse.json({ error: "Prompt file not found" }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Error reading master.prompt:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
