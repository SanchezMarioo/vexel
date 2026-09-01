import { NextRequest, NextResponse } from "next/server";
import { getRouteMarkdown, estimateTokens } from "@/lib/markdown/getRouteMarkdown";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path") || "/";

  const markdown = await getRouteMarkdown(path);
  const tokenCount = estimateTokens(markdown);

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(tokenCount),
      Vary: "Accept",
      "Content-Signal": "ai-train=no, search=yes, ai-input=yes",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

export async function HEAD(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path") || "/";

  const markdown = await getRouteMarkdown(path);
  const tokenCount = estimateTokens(markdown);

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(tokenCount),
      Vary: "Accept",
      "Content-Signal": "ai-train=no, search=yes, ai-input=yes",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
