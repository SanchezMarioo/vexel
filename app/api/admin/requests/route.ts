import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { listAllRequests } from "@/lib/data/requests";
import { secureJson } from "@/lib/security/response";
import type { RequestStatus } from "@/lib/supabase/types";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return errorResponse("No autorizado.", 403);
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") as RequestStatus | null;

  const requests = await listAllRequests(statusParam ?? undefined);

  return secureJson({ ok: true, requests });
}
