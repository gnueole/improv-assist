/**
 * @file route.ts
 * @description API route proxying prompts regeneration requests to the n8n BaaS webhook with prompt chunking.
 * @author Éole <hi@eole>
 * @creation-date 2026-06-12
 * @license MIT
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Parses the master.prompt file dynamically depending on the requested category and count
function parsePrompt(category?: string, count: number = 350): string {
  const filePath = path.join(process.cwd(), "n8n", "prompts", "master.prompt");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file not found at: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  
  let currentSection: string | null = null;
  const basePromptLines: string[] = [];
  const footerPromptLines: string[] = [];
  const sections: Record<string, string[]> = {};
  
  for (const line of lines) {
    const stripped = line.trim();
    if (stripped === "# BASE SYSTEM PROMPT") {
      currentSection = "BASE";
      continue;
    } else if (stripped === "# FOOTER") {
      currentSection = "FOOTER";
      continue;
    } else if (stripped.startsWith("# SECTION ")) {
      currentSection = stripped.replace("# SECTION ", "").trim();
      continue;
    } else if (stripped.startsWith("# =") || (stripped.startsWith("#") && stripped.length < 5)) {
      continue;
    }
    
    if (currentSection === "BASE") {
      basePromptLines.push(line);
    } else if (currentSection === "FOOTER") {
      footerPromptLines.push(line);
    } else if (currentSection) {
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      sections[currentSection].push(line);
    }
  }
  
  const basePrompt = basePromptLines.join("\n").trim();
  const footerPrompt = footerPromptLines.join("\n").trim();
  
  const sectionsStr: Record<string, string> = {};
  for (const [name, val] of Object.entries(sections)) {
    sectionsStr[name] = val.join("\n").trim();
  }
  
  if (category && sectionsStr[category]) {
    const secContent = sectionsStr[category].replace("{{count}}", count.toString());
    return `${basePrompt}\n\n${secContent}\n\n${footerPrompt}`;
  } else {
    const allSections = ["scenarios", "categories", "themes", "echauffements", "emotions", "locations", "eras", "characters", "animals", "objects"];
    const allSectionsContent = allSections.map((secName) => {
      const secBody = sectionsStr[secName] || "";
      const itemsCount = Math.floor(count / allSections.length) || 50;
      return secBody.replace("{{count}}", itemsCount.toString());
    });
    return `${basePrompt}\n\n${allSectionsContent.join("\n\n")}\n\n${footerPrompt}`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const webhookUrl = process.env.N8N_POPULATE_URL || "https://n8n.eole.me/webhook/improv-regen";
    
    let category = body.category;
    if (category === "mgt" || category === "warmup") {
      category = "echauffements";
    }
    
    let categoriesRequired = body.categories_required;
    if (Array.isArray(categoriesRequired)) {
      categoriesRequired = categoriesRequired.map((c: string) => (c === "mgt" || c === "warmup") ? "echauffements" : c);
    }
    
    const count = body.count || (category ? 50 : 400);
    
    // Parse system prompt dynamically from master.prompt
    let systemPrompt: string;
    try {
      systemPrompt = parsePrompt(category, count);
    } catch (e: any) {
      console.error("[Improv Regen Prompt Parse Error]:", e);
      return NextResponse.json({ error: e.message || "Failed to parse prompt template" }, { status: 500 });
    }

    const n8nBody: Record<string, any> = {
      count,
      system_prompt: systemPrompt,
      source: process.env.NODE_ENV === "production" ? "prod" : "dev"
    };
    if (category) {
      n8nBody.category = category;
    } else if (categoriesRequired) {
      n8nBody.categories_required = categoriesRequired;
    }

    // Set a 10-second timeout using AbortController to keep the user experience fast
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-n8n-token": process.env.X_N8N_TOKEN || ""
      },
      body: JSON.stringify(n8nBody),
      signal: controller.signal,
      cache: "no-store"
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
