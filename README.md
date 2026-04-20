flowchart LR
%% Definición de Actores
Admin(["Administrador"])
Gerente(["Gerente de Sucursal"])
Operador(["Operador de Inventario"])
Cajero(["Cajero / Vendedor"])

    %% Sistema Zen Inventory
    subgraph "Zen Inventory ERP"
        UC1(Gestión de Usuarios y Sedes)
        UC2(Catálogo, Precios y Proveedores)
        UC3(Ventas y Facturación)
        UC4(Gestión de Inventario y Alertas)
        UC5(Traslados entre Sucursales)
        UC6(Órdenes de Compra)
        UC7(Solicitudes de Devolución)
    end

    %% Relaciones Admin
    Admin ---> UC1
    Admin ---> UC2
    Admin ---> UC4
    Admin ---> UC6

    %% Relaciones Gerente
    Gerente ---> UC2
    Gerente ---> UC4
    Gerente ---> UC5
    Gerente ---> UC6
    Gerente ---> UC7

    %% Relaciones Operador
    Operador ---> UC4
    Operador ---> UC5

    %% Relaciones Cajero
    Cajero ---> UC3
    Cajero ---> UC7


    ## 2. Flujo de Transferencia entre Sucursales

    flowchart TD
    subgraph "Sucursal Origen"
        O1([Inicio: Bodeguero Origen]) --> O2(Crear Solicitud de Traslado)
        O2 --> O3{¿Validar Stock?}
        O3 -- Insuficiente --> O4([Rechazar Solicitud])
        O3 -- OK --> O5(Gerente: Autorizar Traslado)
        O5 --> O6(Despachar Mercancía)
    end

    subgraph "Ruta Logística"
        O6 --> L1(Transporte en Tránsito)
    end

    subgraph "Sucursal Destino"
        L1 --> D1(Bodeguero Destino: Recibir Mercancía)
        D1 --> D2{¿Hay Faltantes?}
        D2 -- Sí --> D3(Registrar Novedad / Ajuste)
        D2 -- No --> D4(Confirmar Recepción Completa)
        D3 --> D5(Actualizar Inventario Destino)
        D4 --> D5
        D5 --> D6([Fin: Traslado Completado])
    end


    ## 3. Flujo de Venta

    flowchart TD
    V1([Inicio: Vendedor]) --> V2(Escanear / Buscar Producto)
    V2 --> V3{¿Stock > 0?}
    V3 -- No --> V4(Alerta: Stock Insuficiente) --> V2
    V3 -- Sí --> V5(Seleccionar Lista de Precios)
    V5 --> V6(Aplicar Descuentos / Calcular Subtotal)
    V6 --> V7{¿Añadir más productos?}
    V7 -- Sí --> V2
    V7 -- No --> V8(Procesar Pago y Facturación)
    V8 --> V9(Descontar Stock Local)
    V9 --> V10{¿Stock < Stock Mínimo?}
    V10 -- Sí --> V11(Generar Alerta de Stock)
    V10 -- No --> V12([Completar Venta])
    V11 --> V12


    ##Diagrama de Arquitectura (Vista Técnica)

    flowchart TD
    Client["Navegador Web / UI React"]

    subgraph "Infraestructura Perimetral"
        HAProxy["HAProxy Load Balancer\n(Puerto 80/443)"]
    end

    subgraph "Backend - Spring Boot (Java 21)"
        API["Capa de Presentación\n(Controladores REST)"]
        Security["Filtros de Seguridad\n(Spring Security + JWT)"]
        Service["Capa de Aplicación / Dominio\n(Lógica de Negocio)"]
        Persistence["Capa de Infraestructura\n(Spring Data JPA / Adapters)"]

        API --> Security
        Security --> Service
        Service --> Persistence
    end

    subgraph "Capa de Datos"
        DB[("PostgreSQL 16\n(inventario_multisucursal)")]
        Flyway["Flyway\n(Migraciones V1 a V41)"]
    end

    Client <-->|HTTPS / JSON| HAProxy
    HAProxy <-->|HTTP| API
    Persistence <-->|JDBC / Hibernate| DB
    Flyway -->|DDL / DML| DB
