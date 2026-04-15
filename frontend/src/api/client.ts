import createClient from "openapi-fetch";
import type { paths } from "./schema";

/**
 * Cliente TypeScript Type-Safe generado desde el contrato Swagger de OptiPlant.
 * El middleware inyecta automáticamente el JWT desde localStorage en cada petición.
 */
export const apiClient = createClient<paths>({
  baseUrl: "http://localhost:8080",
});

// Middleware: lee el token en cada request (siempre fresco desde localStorage)
apiClient.use({
  onRequest: ({ request }) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("optiplant_token");
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return request;
  },
});
