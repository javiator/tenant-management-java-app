# API Architecture

This document describes the REST API design, endpoints, and integration patterns for the Tenant Management System.

## API Overview

The system provides a RESTful API built with Spring Boot, following REST principles and OpenAPI standards.

## API Architecture Diagram

```mermaid
graph TB
    subgraph "API Architecture"
        subgraph "Client Layer"
            WebClient["Web Client<br/>React Frontend"]
            MobileClient["Mobile Client<br/>Future Mobile App"]
            ExternalClient["External Client<br/>Third-party Integration"]
        end
        
        subgraph "API Gateway"
            Nginx["Nginx<br/>Reverse Proxy<br/>Load Balancing"]
        end
        
        subgraph "API Layer"
            RestController["REST Controllers<br/>HTTP Endpoints"]
            ExceptionHandler["Global Exception Handler<br/>Error Management"]
            Validation["Request Validation<br/>Bean Validation"]
        end
        
        subgraph "Service Layer"
            BusinessLogic["Business Logic<br/>Service Layer"]
            Mapping["DTO Mapping<br/>Entity Conversion"]
        end
        
        subgraph "Data Layer"
            Repository["Repository Layer<br/>Data Access"]
            Database[("Database<br/>H2/PostgreSQL")]
        end
        
        subgraph "Documentation"
            SwaggerUI["Swagger UI<br/>Interactive Documentation"]
            OpenAPI["OpenAPI Specification<br/>API Contract"]
        end
    end
    
    WebClient --> Nginx
    MobileClient --> Nginx
    ExternalClient --> Nginx
    
    Nginx --> RestController
    RestController --> ExceptionHandler
    RestController --> Validation
    RestController --> BusinessLogic
    
    BusinessLogic --> Mapping
    BusinessLogic --> Repository
    Repository --> Database
    
    RestController --> SwaggerUI
    RestController --> OpenAPI
    
    classDef client fill:#4fc3f7,stroke:#0277bd,stroke-width:2px,color:#000
    classDef gateway fill:#ff7043,stroke:#d84315,stroke-width:2px,color:#fff
    classDef api fill:#66bb6a,stroke:#2e7d32,stroke-width:2px,color:#fff
    classDef service fill:#ab47bc,stroke:#6a1b9a,stroke-width:2px,color:#fff
    classDef data fill:#42a5f5,stroke:#1565c0,stroke-width:2px,color:#fff
    classDef docs fill:#ffa726,stroke:#ef6c00,stroke-width:2px,color:#000
    
    class WebClient,MobileClient,ExternalClient client
    class Nginx gateway
    class RestController,ExceptionHandler,Validation api
    class BusinessLogic,Mapping service
    class Repository,Database data
    class SwaggerUI,OpenAPI docs
```

## API Endpoints

### Tenant Management API

```mermaid
graph LR
    subgraph "Tenant API Endpoints"
        TenantAPI[Tenant API<br/>/api/tenants]
        
        subgraph "CRUD Operations"
            GetTenants["GET /api/tenants<br/>List all tenants"]
            GetTenant["GET /api/tenants/{id}<br/>Get tenant by ID"]
            CreateTenant["POST /api/tenants<br/>Create new tenant"]
            UpdateTenant["PUT /api/tenants/{id}<br/>Update tenant"]
            DeleteTenant["DELETE /api/tenants/{id}<br/>Delete tenant"]
        end
        
        subgraph "Related Operations"
            GetTenantTransactions["GET /api/tenants/{id}/transactions<br/>Get tenant transactions"]
        end
    end
    
    TenantAPI --> GetTenants
    TenantAPI --> GetTenant
    TenantAPI --> CreateTenant
    TenantAPI --> UpdateTenant
    TenantAPI --> DeleteTenant
    TenantAPI --> GetTenantTransactions
    
    classDef endpoint fill:#81c784,stroke:#388e3c,stroke-width:2px,color:#000
    class TenantAPI,GetTenants,GetTenant,CreateTenant,UpdateTenant,DeleteTenant,GetTenantTransactions endpoint
```

### Property Management API

```mermaid
graph LR
    subgraph "Property API Endpoints"
        PropertyAPI[Property API<br/>/api/properties]
        
        subgraph "CRUD Operations"
            GetProperties["GET /api/properties<br/>List all properties"]
            GetProperty["GET /api/properties/{id}<br/>Get property by ID"]
            CreateProperty["POST /api/properties<br/>Create new property"]
            UpdateProperty["PUT /api/properties/{id}<br/>Update property"]
            DeleteProperty["DELETE /api/properties/{id}<br/>Delete property"]
        end
        
        subgraph "Related Operations"
            GetPropertyTransactions["GET /api/properties/{id}/transactions<br/>Get property transactions"]
        end
    end
    
    PropertyAPI --> GetProperties
    PropertyAPI --> GetProperty
    PropertyAPI --> CreateProperty
    PropertyAPI --> UpdateProperty
    PropertyAPI --> DeleteProperty
    PropertyAPI --> GetPropertyTransactions
    
    classDef endpoint fill:#64b5f6,stroke:#1976d2,stroke-width:2px,color:#fff
    class PropertyAPI,GetProperties,GetProperty,CreateProperty,UpdateProperty,DeleteProperty,GetPropertyTransactions endpoint
```

### Transaction Management API

```mermaid
graph LR
    subgraph "Transaction API Endpoints"
        TransactionAPI[Transaction API<br/>/api/transactions]
        
        subgraph "CRUD Operations"
            GetTransactions["GET /api/transactions<br/>List all transactions"]
            GetTransaction["GET /api/transactions/{id}<br/>Get transaction by ID"]
            CreateTransaction["POST /api/transactions<br/>Create new transaction"]
            UpdateTransaction["PUT /api/transactions/{id}<br/>Update transaction"]
            DeleteTransaction["DELETE /api/transactions/{id}<br/>Delete transaction"]
        end
        
        subgraph "Filtering Operations"
            FilterByTenant["GET /api/transactions?tenantId={id}<br/>Filter by tenant"]
            FilterByProperty["GET /api/transactions?propertyId={id}<br/>Filter by property"]
            FilterByDate["GET /api/transactions?startDate={date}&endDate={date}<br/>Filter by date range"]
        end
    end
    
    TransactionAPI --> GetTransactions
    TransactionAPI --> GetTransaction
    TransactionAPI --> CreateTransaction
    TransactionAPI --> UpdateTransaction
    TransactionAPI --> DeleteTransaction
    TransactionAPI --> FilterByTenant
    TransactionAPI --> FilterByProperty
    TransactionAPI --> FilterByDate
    
    classDef endpoint fill:#f06292,stroke:#c2185b,stroke-width:2px,color:#fff
    class TransactionAPI,GetTransactions,GetTransaction,CreateTransaction,UpdateTransaction,DeleteTransaction,FilterByTenant,FilterByProperty,FilterByDate endpoint
```

## API Request/Response Flow

### Request Processing Flow

```mermaid
sequenceDiagram
    participant Client
    participant Nginx
    participant Controller
    participant Service
    participant Repository
    participant Database
    
    Client->>Nginx: HTTP Request
    Nginx->>Controller: Forward Request
    Controller->>Controller: Validate Input
    Controller->>Service: Business Logic
    Service->>Repository: Data Access
    Repository->>Database: SQL Query
    Database-->>Repository: Result Set
    Repository-->>Service: Entity Objects
    Service-->>Controller: DTO Objects
    Controller-->>Nginx: HTTP Response
    Nginx-->>Client: Response
```

### Error Handling Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant ExceptionHandler
    participant Service
    
    Client->>Controller: Invalid Request
    Controller->>Service: Business Logic
    Service-->>Controller: Exception Thrown
    Controller->>ExceptionHandler: Global Exception Handler
    ExceptionHandler->>ExceptionHandler: Format Error Response
    ExceptionHandler-->>Client: Structured Error Response
```

## API Data Models

### DTO Structure

```mermaid
graph TB
    subgraph "Data Transfer Objects"
        subgraph "Tenant DTO"
            TenantDto[TenantDto<br/>- id: Long<br/>- name: String<br/>- propertyId: Long<br/>- contactNo: String<br/>- rent: BigDecimal<br/>- contractDates: LocalDate]
        end
        
        subgraph "Property DTO"
            PropertyDto[PropertyDto<br/>- id: Long<br/>- name: String<br/>- address: String<br/>- type: String<br/>- rentAmount: BigDecimal<br/>- status: String]
        end
        
        subgraph "Transaction DTO"
            TransactionDto[TransactionDto<br/>- id: Long<br/>- tenantId: Long<br/>- propertyId: Long<br/>- amount: BigDecimal<br/>- type: String<br/>- transactionDate: LocalDate]
        end
    end
    
    classDef dto fill:#a5d6a7,stroke:#4caf50,stroke-width:2px,color:#000
    class TenantDto,PropertyDto,TransactionDto dto
```

### Entity Relationships

```mermaid
graph LR
    subgraph "Entity Relationships"
        TenantEntity[Tenant Entity] --> PropertyEntity[Property Entity]
        TenantEntity --> TransactionEntity[Transaction Entity]
        PropertyEntity --> TransactionEntity
        
        subgraph "Relationships"
            TenantProperty[Tenant -> Property<br/>Many-to-One]
            TenantTransaction[Tenant -> Transaction<br/>One-to-Many]
            PropertyTransaction[Property -> Transaction<br/>One-to-Many]
        end
    end
    
    TenantEntity -.-> TenantProperty
    TenantEntity -.-> TenantTransaction
    PropertyEntity -.-> PropertyTransaction
    
    classDef entity fill:#90caf9,stroke:#1976d2,stroke-width:2px,color:#000
    classDef relationship fill:#ce93d8,stroke:#7b1fa2,stroke-width:2px,color:#000
    
    class TenantEntity,PropertyEntity,TransactionEntity entity
    class TenantProperty,TenantTransaction,PropertyTransaction relationship
```

## API Documentation

### Swagger/OpenAPI Integration

```mermaid
graph TB
    subgraph "API Documentation"
        subgraph "OpenAPI Specification"
            OpenAPISpec[OpenAPI 3.0 Specification<br/>- API Contract<br/>- Request/Response Schemas<br/>- Authentication Requirements]
        end
        
        subgraph "Interactive Documentation"
            SwaggerUI[Swagger UI<br/>- Interactive API Explorer<br/>- Request Testing<br/>- Response Examples]
        end
        
        subgraph "Code Generation"
            ClientSDK[Client SDK Generation<br/>- TypeScript Client<br/>- Java Client<br/>- Python Client]
        end
    end
    
    OpenAPISpec --> SwaggerUI
    OpenAPISpec --> ClientSDK
    
    classDef docs fill:#ffb74d,stroke:#f57c00,stroke-width:2px,color:#000
    class OpenAPISpec,SwaggerUI,ClientSDK docs
```

## API Security

### Security Layers

```mermaid
graph TB
    subgraph "API Security"
        subgraph "Input Validation"
            BeanValidation["Bean Validation<br/>@Valid annotations<br/>Custom validators"]
            SQLInjection[SQL Injection Prevention<br/>JPA/Hibernate<br/>Parameterized queries]
        end
        
        subgraph "Authentication & Authorization"
            JWT[JWT Token Authentication<br/>Stateless authentication<br/>Token validation]
            RBAC[Role-Based Access Control<br/>User permissions<br/>Resource access]
        end
        
        subgraph "Network Security"
            HTTPS[HTTPS Encryption<br/>SSL/TLS<br/>Certificate management]
            CORS[CORS Configuration<br/>Cross-origin requests<br/>Allowed origins]
        end
    end
    
    classDef security fill:#ffcdd2,stroke:#d32f2f,stroke-width:2px,color:#000
    class BeanValidation,SQLInjection,JWT,RBAC,HTTPS,CORS security
```

## API Performance

### Performance Optimization

```mermaid
graph TB
    subgraph "Performance Optimization"
        subgraph "Caching Strategy"
            ResponseCache[Response Caching<br/>HTTP Cache Headers<br/>ETag support]
            DatabaseCache[Database Caching<br/>Query result caching<br/>Connection pooling]
        end
        
        subgraph "Query Optimization"
            Pagination[Pagination<br/>Page-based results<br/>Limit/Offset]
            Filtering[Filtering<br/>Query parameters<br/>Database indexes]
        end
        
        subgraph "Response Optimization"
            Compression[Response Compression<br/>GZIP compression<br/>Content encoding]
            JSONOptimization[JSON Optimization<br/>Minimal payload<br/>Field selection]
        end
    end
    
    classDef performance fill:#c8e6c9,stroke:#388e3c,stroke-width:2px,color:#000
    class ResponseCache,DatabaseCache,Pagination,Filtering,Compression,JSONOptimization performance
```

## API Testing

### Testing Strategy

```mermaid
graph TB
    subgraph "API Testing"
        subgraph "Unit Testing"
            ControllerTest["Controller Tests<br/>@WebMvcTest<br/>MockMvc"]
            ServiceTest["Service Tests<br/>@ExtendWith(MockitoExtension.class)<br/>Mock dependencies"]
        end
        
        subgraph "Integration Testing"
            IntegrationTest["Integration Tests<br/>@SpringBootTest<br/>TestContainers"]
            DatabaseTest["Database Tests<br/>@DataJpaTest<br/>H2 test database"]
        end
        
        subgraph "API Testing"
            PostmanTest["Postman Collections<br/>Manual testing<br/>API validation"]
            AutomatedTest["Automated API Tests<br/>REST Assured<br/>Contract testing"]
        end
    end
    
    classDef testing fill:#e1bee7,stroke:#8e24aa,stroke-width:2px,color:#000
    class ControllerTest,ServiceTest,IntegrationTest,DatabaseTest,PostmanTest,AutomatedTest testing
```

## API Versioning

### Versioning Strategy

```mermaid
graph LR
    subgraph "API Versioning"
        subgraph "URL Versioning"
            V1API[API v1<br/>/api/v1/tenants]
            V2API[API v2<br/>/api/v2/tenants]
        end
        
        subgraph "Header Versioning"
            AcceptHeader[Accept Header<br/>application/vnd.api+json;version=1]
            CustomHeader[Custom Header<br/>API-Version: 1.0]
        end
        
        subgraph "Backward Compatibility"
            Deprecation[Deprecation Strategy<br/>Sunset headers<br/>Migration guides]
            BreakingChanges[Breaking Changes<br/>Major version bumps<br/>Feature flags]
        end
    end
    
    classDef versioning fill:#fff9c4,stroke:#f9a825,stroke-width:2px,color:#000
    class V1API,V2API,AcceptHeader,CustomHeader,Deprecation,BreakingChanges versioning
```

## API Monitoring

### Monitoring and Observability

```mermaid
graph TB
    subgraph "API Monitoring"
        subgraph "Metrics Collection"
            RequestMetrics[Request Metrics<br/>Response times<br/>Request counts<br/>Error rates]
            BusinessMetrics[Business Metrics<br/>API usage<br/>Feature adoption<br/>User behavior]
        end
        
        subgraph "Logging"
            StructuredLogs[Structured Logging<br/>JSON format<br/>Correlation IDs<br/>Request tracing]
            ErrorLogs[Error Logging<br/>Exception tracking<br/>Stack traces<br/>Context information]
        end
        
        subgraph "Alerting"
            PerformanceAlerts[Performance Alerts<br/>Response time thresholds<br/>Error rate limits<br/>Throughput monitoring]
            BusinessAlerts[Business Alerts<br/>Usage anomalies<br/>Feature adoption<br/>User engagement]
        end
    end
    
    classDef monitoring fill:#b3e5fc,stroke:#0288d1,stroke-width:2px,color:#000
    class RequestMetrics,BusinessMetrics,StructuredLogs,ErrorLogs,PerformanceAlerts,BusinessAlerts monitoring
```
