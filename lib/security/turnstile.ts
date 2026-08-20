import "server-only";

export interface TurnstileVerificationResult {
  ok: boolean;
  error?: string;
}

interface TurnstileApiResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

const CLOUDFLARE_TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifica un token de Cloudflare Turnstile en servidor contra la API oficial de Cloudflare.
 * 
 * @param token - Token generado por el widget de Turnstile en el frontend.
 * @param clientIp - IP del cliente para validación adicional (opcional).
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  clientIp?: string,
): Promise<TurnstileVerificationResult> {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return { ok: false, error: "missing_token" };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey || secretKey.trim().length === 0) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY no está configurada en las variables de entorno.");
    return { ok: false, error: "missing_secret_key" };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey.trim());
    formData.append("response", token.trim());

    if (clientIp && clientIp !== "unknown") {
      formData.append("remoteip", clientIp);
    }

    formData.append("idempotency_key", crypto.randomUUID());

    const response = await fetch(CLOUDFLARE_TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(
        `[turnstile] Error HTTP en la verificación: ${response.status} ${response.statusText}`,
      );
      return { ok: false, error: `http_error_${response.status}` };
    }

    const data = (await response.json()) as TurnstileApiResponse;

    if (!data.success) {
      console.warn("[turnstile] Verificación fallida de Cloudflare:", data["error-codes"]);
      return {
        ok: false,
        error: data["error-codes"]?.join(", ") ?? "invalid_token",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("[turnstile] Error inesperado verificando token:", error);
    return { ok: false, error: "network_or_timeout_error" };
  }
}
