const API_RESPONSE_HEADERS = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
};

export function secureJson(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);

  for (const [key, value] of Object.entries(API_RESPONSE_HEADERS)) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }

  return Response.json(data, {
    ...init,
    headers,
  });
}
