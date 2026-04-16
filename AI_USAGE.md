# Uso de Inteligencia Artificial en el Desarrollo - OptiPlant

En cumplimiento con la **Sección 9** de la prueba técnica de **OptiPlant Consultores**, se documenta a continuación el uso de herramientas de Inteligencia Artificial durante la concepción y desarrollo de este proyecto.

## 1. Herramientas Utilizadas
Para este proyecto se utilizó **Antigravity**, un asistente de IA de codificación avanzada desarrollado por Google DeepMind, integrado directamente en el entorno de desarrollo.

## 2. Áreas de Aplicación y Evidencia

### A. Diseño de Arquitectura y Decisiones Técnicas
Se utilizó la IA para proponer y validar una arquitectura **Hexagonal (Ports & Adapters)** que garantizara la separación de capas (Sección 5 y 8).
*   **Prompt**: *"Diseña la estructura de paquetes para un backend en Java que siga arquitectura hexagonal y permita la gestión multi-sucursal de inventarios."*
*   **Resultado**: Se definieron los paquetes `domain`, `application`, e `infrastructure` para cada módulo (`inventory`, `transfer`, `auth`, etc.).

### B. Generación de Código y Lógica de Negocio
La IA asistió en la creación de servicios críticos, como el cálculo del **Costo Promedio Ponderado** (Sección 3.2).
*   **Prompt**: *"En el servicio de inventario, implementa la actualización del costo promedio ponderado cada vez que se registra un ingreso de mercancía, considerando el stock total de todas las sucursales."*

### C. Auditoría y Trazabilidad (Funcionalidad Adicional)
Se utilizó para implementar el **Registro de Auditoría Global** como la funcionalidad adicional (Sección 4).
*   **Acción**: La IA propuso capturar cada movimiento (`InventoryMovement`) con el ID del responsable y el motivo, y luego expuso este log en una vista exclusiva para el Administrador.

## 3. Evaluación Crítica

### Aportes de la IA
*   **Velocidad**: Se redujo drásticamente el tiempo de creación de CRUDs y de integración entre Frontend y Backend mediante la generación de tipos basados en OpenAPI.
*   **Arquitectura**: Ayudó a mantener la consistencia en el patrón Hexagonal, evitando el acoplamiento directo entre la base de datos y la lógica de negocio.

### Ajustes Manuales Necesarios
*   **Seguridad**: Fue necesario ajustar manualmente el manejo de sesiones en el Frontend (`AuthSession`) para incluir el `sucursalId` y permitir el filtrado correcto de alertas por sede.
*   **Integración Docker**: La configuración de los puertos y volúmenes de PostgreSQL en el `docker-compose.yml` requirió supervisión manual para asegurar la persistencia.

## 4. Estimación de Código Generado
*   **Estructura Base y Boilerplate**: 80% (generado por prompts descriptivos).
*   **Lógica de Negocio Compleja**: 40% (co-creada mediante iteraciones).
*   **Documentación y Diagramas**: 90% (generada por IA basada en el código implementado).
