package co.com.optiplant.inventario.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Optiplant Inventory API")
                        .version("1.0.0")
                        .description("""
                                API REST para gestión de inventario multi-sucursal.
                                
                                **Cómo autenticarse:**
                                1. Realiza un `POST /api/auth/login` con tus credenciales.
                                2. Copia el `token` de la respuesta.
                                3. Haz clic en **Authorize** 🔒 e ingresa: `Bearer <token>`.
                                
                                **Usuarios de prueba del seed:**
                                | Email | Contraseña | Rol |
                                |---|---|---|
                                | admin@optiplant.co | admin123 | ADMIN |
                                | gerente@optiplant.co | gerente123 | GERENTE_SUCURSAL |
                                | operador@optiplant.co | operador123 | OPERADOR_INVENTARIO |
                                """)
                        .contact(new Contact()
                                .name("Optiplant Dev Team")
                                .email("dev@optiplant.co")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
