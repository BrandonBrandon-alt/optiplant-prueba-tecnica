import { apiClient } from "./client";

const AUTH_TOKEN_KEY = "optiplant_token";
const AUTH_EMAIL_KEY = "optiplant_email";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  email: string;
}

/**
 * Realiza el Login contra el Backend OptiPlant.
 * Retorna la sesión (token + email) o lanza un error con mensaje legible.
 */
export async function login(payload: LoginPayload): Promise<AuthSession> {
  const { data, error } = await apiClient.POST("/api/auth/login", {
    body: payload,
  });

  if (error || !data?.token || !data?.email) {
    throw new Error("Credenciales incorrectas. Inténtalo de nuevo.");
  }

  // Persiste en localStorage para navegaciones futuras
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_EMAIL_KEY, data.email);

  return { token: data.token, email: data.email };
}

/** Elimina la sesión activa (Logout) */
export function logout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
}

/** Recupera la sesión guardada, o null si no hay ninguna */
export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null; // SSR safe
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const email = localStorage.getItem(AUTH_EMAIL_KEY);
  if (!token || !email) return null;
  return { token, email };
}
