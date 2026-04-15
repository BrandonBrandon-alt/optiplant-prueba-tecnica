import { apiClient } from "./client";

const AUTH_TOKEN_KEY = "optiplant_token";
const AUTH_EMAIL_KEY = "optiplant_email";
const AUTH_NAME_KEY  = "optiplant_nombre";
const AUTH_ROLE_KEY  = "optiplant_rol";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  email: string;
  nombre: string;
  rol: string;
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
  localStorage.setItem(AUTH_NAME_KEY,  data.nombre || "");
  localStorage.setItem(AUTH_ROLE_KEY,  data.rol || "");

  return { 
    token:  data.token, 
    email:  data.email, 
    nombre: data.nombre || "", 
    rol:    data.rol || "" 
  };
}

/** Elimina la sesión activa (Logout) */
export function logout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
  localStorage.removeItem(AUTH_NAME_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
}

/** Recupera la sesión guardada, o null si no hay ninguna */
export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null; // SSR safe
  const token  = localStorage.getItem(AUTH_TOKEN_KEY);
  const email  = localStorage.getItem(AUTH_EMAIL_KEY);
  const nombre = localStorage.getItem(AUTH_NAME_KEY);
  const rol    = localStorage.getItem(AUTH_ROLE_KEY);
  if (!token || !email) return null;
  return { 
    token, 
    email, 
    nombre: nombre || "", 
    rol:    rol || "" 
  };
}
