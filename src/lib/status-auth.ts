import { createHmac, timingSafeEqual } from "crypto";

export const STATUS_AUTH_COOKIE = "book_keep_status_auth";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

export function getStatusAuthConfigError(): string | null {
  if (!process.env.STATUS_USERNAME) {
    return "Missing STATUS_USERNAME.";
  }

  if (!process.env.STATUS_PASSWORD) {
    return "Missing STATUS_PASSWORD.";
  }

  if (!process.env.STATUS_SESSION_SECRET) {
    return "Missing STATUS_SESSION_SECRET.";
  }

  return null;
}

export function getStatusAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/status",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

export function validateStatusCredentials(username: string, password: string) {
  const configError = getStatusAuthConfigError();

  if (configError) {
    return {
      ok: false as const,
      message: `${configError} Add status login env vars.`,
    };
  }

  const valid =
    safeCompare(username, process.env.STATUS_USERNAME!) &&
    safeCompare(password, process.env.STATUS_PASSWORD!);

  return valid
    ? { ok: true as const, token: createStatusSessionToken() }
    : {
        ok: false as const,
        message: "Incorrect username or password.",
      };
}

export function isValidStatusSession(token: string | undefined) {
  const configError = getStatusAuthConfigError();

  if (configError || !token) {
    return false;
  }

  return safeCompare(token, createStatusSessionToken());
}

function createStatusSessionToken() {
  return createHmac("sha256", process.env.STATUS_SESSION_SECRET!)
    .update(`${process.env.STATUS_USERNAME}:${process.env.STATUS_PASSWORD}`)
    .digest("hex");
}

function safeCompare(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    valueBuffer.length === expectedBuffer.length &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}
