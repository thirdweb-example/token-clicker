import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// Cookie names
export const SESSION_COOKIE_NAME = "app_session";
export const CSRF_COOKIE_NAME = "csrf-token";

// CSRF-protected methods
const DEFAULT_CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function generateCsrfToken(): string {
  // 32 bytes random base64 url-safe
  const bytes = randomBytes(32);
  const base64 = bytes.toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function setSessionCookies(
  response: NextResponse,
  params: {
    authToken: string;
    sessionMaxAgeSeconds?: number; // default 1 hour
    csrfMaxAgeSeconds?: number; // default 15 minutes
    csrfToken?: string; // optional override for deterministic token pairing
  }
) {
  const sessionMaxAge = params.sessionMaxAgeSeconds ?? 60 * 60; // 1 hour
  const csrfMaxAge = params.csrfMaxAgeSeconds ?? 15 * 60; // 15 minutes

  const csrfToken = params.csrfToken ?? generateCsrfToken();

  // HttpOnly session cookie storing the thirdweb auth token
  response.cookies.set(SESSION_COOKIE_NAME, params.authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge,
  });

  // Non-HttpOnly CSRF cookie so the client can read it if needed
  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax",
    path: "/",
    maxAge: csrfMaxAge,
  });

  // Also echo in header for immediate consumption by the client
  response.headers.set("X-CSRF-Token", csrfToken);

  return csrfToken;
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(CSRF_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getSessionAuthToken(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value || null;
}

export function getRequestCsrfHeader(request: NextRequest): string | null {
  return request.headers.get("x-csrf-token");
}

export function getCookieCsrfToken(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

export function verifyOriginOrReferer(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const expectedOrigin = request.nextUrl.origin;

  // If neither provided, pass (some environments omit)
  if (!origin && !referer) return true;

  const value = origin || referer || "";
  try {
    const url = new URL(value);
    return url.origin === expectedOrigin;
  } catch {
    return false;
  }
}

export function verifySessionAndCsrf(
  request: NextRequest,
  options?: { requireCsrfForMethods?: Set<string> }
): { authToken: string } {
  const requireCsrfForMethods = options?.requireCsrfForMethods || DEFAULT_CSRF_METHODS;

  const authToken = getSessionAuthToken(request);
  if (!authToken) {
    throw new Error("NO_SESSION");
  }

  if (requireCsrfForMethods.has(request.method.toUpperCase())) {
    const csrfHeader = getRequestCsrfHeader(request);
    const csrfCookie = getCookieCsrfToken(request);
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      throw new Error("INVALID_CSRF");
    }

    // Optional origin/referer check
    if (!verifyOriginOrReferer(request)) {
      throw new Error("BAD_ORIGIN");
    }
  }

  return { authToken };
}


