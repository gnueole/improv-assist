import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "notionConstraints.json");
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json(JSON.parse(fileContent));
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error("[Constraints API Error]:", error);
    return NextResponse.json(
      { error: "Failed to read constraints data" },
      { status: 500 }
    );
  }
}
