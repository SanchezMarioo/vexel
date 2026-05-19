const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ALLOWED_PATH_PREFIX = "/storage/v1/object/public/message-images/";

const supabaseOrigin = (() => {
  try {
    return SUPABASE_URL ? new URL(SUPABASE_URL).origin : null;
  } catch {
    return null;
  }
})();

export function isAllowedImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 500) {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") {
    return false;
  }

  if (!supabaseOrigin || parsed.origin !== supabaseOrigin) {
    return false;
  }

  return parsed.pathname.startsWith(ALLOWED_PATH_PREFIX);
}
