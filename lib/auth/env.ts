import "server-only";

const DEFAULT_SECRET_PLACEHOLDER = "replace-with-a-long-random-secret";

export function getAuthSecret() {
  const secret = (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET)?.trim();

  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET/NEXTAUTH_SECRET no esta configurado o es demasiado corto. " +
        'Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
    );
  }

  if (secret === DEFAULT_SECRET_PLACEHOLDER) {
    throw new Error(
      "AUTH_SECRET/NEXTAUTH_SECRET contiene el valor por defecto del .env.example. Reemplazalo por uno seguro.",
    );
  }

  return secret;
}

export function isGoogleAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export function getGoogleAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}
