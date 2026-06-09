import { NextResponse } from "next/server";
import { getIconSvg } from "../icon-helper";

export function GET() {
  return new NextResponse(getIconSvg(), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
