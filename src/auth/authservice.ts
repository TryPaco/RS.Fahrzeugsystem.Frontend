import type { LoginResponse } from "../types/auth";

const TOKEN_KEY = "rs_token";
const USER_KEY = "rs_user";
const EXPIRES_KEY = "rs_token_expires";

export function saveAuth(data: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, data.token);

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      username: data.username,
      displayName: data.displayName,
      roles: data.roles,
      permissions: data.permissions,
    })
  );

  localStorage.setItem(EXPIRES_KEY, data.expiresAtUtc);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function isLoggedIn(): boolean {
  const token = getToken();
  const expires = localStorage.getItem(EXPIRES_KEY);

  if (!token || !expires) return false;

  return Date.now() < new Date(expires).getTime();
}