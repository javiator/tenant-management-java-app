# System Architecture

This document provides a high-level overview of the Tenant Management System architecture.

## Architecture Overview

The system follows a modern, layered architecture with clear separation of concerns between the frontend, backend, and data layers.

## System Architecture Diagram

```mermaid
graph TB
    %% External Users
    User[👤 User]
    
    %% Frontend Layer
    subgraph "Frontend Layer"
        React[React SPA<br/>Port 3000]
        Components[Components<br/>- Dashboard<br/>- Tenants<br/>- Properties<br/>- Transactions]
        React --> Components
    end
    
    %% API Gateway/Load Balancer
    subgraph "API Layer"
        Nginx[Nginx<br/>Reverse Proxy<br/>Port 80/443]
    end
    
    %% Backend Layer
    subgraph "Backend Layer - Spring Boot"
        API[Spring Boot API<br/>Port 8080]
        
        subgraph "Web Layer"
            Controllers[Controllers<br/>- TenantController<br/>- PropertyController<br/>- TransactionController]
            DTOs[DTOs<br/>- TenantDto<br/>- PropertyDto<br/>- TransactionDto]
            ExceptionHandler[GlobalExceptionHandler]
        end
        
        subgraph "Service Layer"
            Services[Services<br/>- TenantService<br/>- PropertyService<br/>- TransactionService]
            Mapping[Mapping Service]
        end
        
        subgraph "Repository Layer"
            Repositories[Repositories<br/>- TenantRepository<br/>- PropertyRepository<br/>- TransactionRepository]
        end
        
        subgraph "Domain Layer"
            Entities[Entities<br/>- Tenant<br/>- Property<br/>- Transaction]
        end
        
        API --> Controllers
        Controllers --> DTOs
        Controllers --> ExceptionHandler
        Controllers --> Services
        Services --> Mapping
        Services --> Repositories
        Repositories --> Entities
    end
    
    %% Database Layer
    subgraph "Database Layer"
        H2Dev[H2 Database<br/>Development<br/>File-based]
        PostgreSQL[PostgreSQL<br/>Production<br/>Port 5432]
        Flyway[Flyway<br/>Database Migrations]
    end
    
    %% Infrastructure
    subgraph "Infrastructure"
        Docker[Docker Containers]
        DockerCompose[Docker Compose]
    end
    
    %% External Services
    subgraph "External Services"
        SwaggerUI[Swagger UI<br/>API Documentation<br/>/swagger-ui.html]
        Actuator[Spring Actuator<br/>Health/Metrics<br/>/actuator]
    end
    
    %% Connections
    User --> React
    React --> Nginx
    Nginx --> API
    
    API --> H2Dev
    API --> PostgreSQL
    API --> Flyway
    
    API --> SwaggerUI
    API --> Actuator
    
    Docker --> API
    Docker --> PostgreSQL
    DockerCompose --> Docker
    
    %% Styling
    classDef frontend fill:#4fc3f7,stroke:#0277bd,stroke-width:3px,color:#000
    classDef backend fill:#66bb6a,stroke:#2e7d32,stroke-width:3px,color:#fff
    classDef database fill:#42a5f5,stroke:#1565c0,stroke-width:3px,color:#fff
    classDef infrastructure fill:#ff7043,stroke:#d84315,stroke-width:3px,color:#fff
    classDef external fill:#ab47bc,stroke:#6a1b9a,stroke-width:3px,color:#fff
    
    class React,Components frontend
    class API,Controllers,Services,Repositories,Entities backend
    class H2Dev,PostgreSQL,Flyway database
    class Docker,DockerCompose infrastructure
    class SwaggerUI,Actuator external
```

## Layered Architecture

```mermaid
graph TD
    subgraph "Presentation Layer"
        A["React Frontend<br/>- Dashboard<br/>- Tenants Management<br/>- Properties Management<br/>- Transactions Management"]
    end
    
    subgraph "API Layer"
        B["Spring Boot REST API<br/>- Controllers<br/>- DTOs<br/>- Exception Handling"]
    end
    
    subgraph "Business Layer"
        C["Service Layer<br/>- TenantService<br/>- PropertyService<br/>- TransactionService<br/>- Mapping Service"]
    end
    
    subgraph "Data Access Layer"
        D["Repository Layer<br/>- JPA Repositories<br/>- Data Access Objects"]
    end
    
    subgraph "Database Layer"
        E["Database<br/>- H2 (Development)<br/>- PostgreSQL (Production)<br/>- Flyway Migrations"]
    end
    
    subgraph "Infrastructure"
        F["Docker Containers<br/>- Application Container<br/>- Database Container<br/>- Nginx Container"]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    F --> B
    F --> E
    
    classDef presentation fill:#4fc3f7,stroke:#0277bd,stroke-width:3px,color:#000
    classDef api fill:#66bb6a,stroke:#2e7d32,stroke-width:3px,color:#fff
    classDef business fill:#ab47bc,stroke:#6a1b9a,stroke-width:3px,color:#fff
    classDef data fill:#42a5f5,stroke:#1565c0,stroke-width:3px,color:#fff
    classDef database fill:#ff7043,stroke:#d84315,stroke-width:3px,color:#fff
    classDef infrastructure fill:#ffa726,stroke:#ef6c00,stroke-width:3px,color:#000
    
    class A presentation
    class B api
    class C business
    class D data
    class E database
    class F infrastructure
```

## Architecture Principles

### 1. Separation of Concerns
- **Frontend**: User interface and user experience
- **Backend**: Business logic and data processing
- **Database**: Data persistence and integrity

### 2. Layered Architecture
- **Presentation Layer**: React components and UI logic
- **API Layer**: REST endpoints and request/response handling
- **Business Layer**: Core business logic and rules
- **Data Access Layer**: Database operations and ORM
- **Domain Layer**: Entity models and business objects

### 3. Dependency Injection
- Spring's IoC container manages object lifecycle
- Loose coupling between components
- Easy testing and mocking

### 4. Database Abstraction
- JPA/Hibernate for ORM
- Repository pattern for data access
- Flyway for version-controlled migrations

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Frontend** | React | 18.2.0 | User interface |
| **Styling** | Tailwind CSS | 3.4.3 | Responsive design |
| **HTTP Client** | Axios | 1.4.0 | API communication |
| **Backend** | Spring Boot | 3.3.4 | Application framework |
| **Language** | Java | 21 | Programming language |
| **ORM** | Spring Data JPA | 3.3.4 | Database abstraction |
| **Database (Dev)** | H2 | 2.2.224 | In-memory database |
| **Database (Prod)** | PostgreSQL | 16 | Production database |
| **Migration** | Flyway | 8.5.13 | Database versioning |
| **Documentation** | Springdoc OpenAPI | 2.5.0 | API documentation |
| **Monitoring** | Spring Actuator | 3.3.4 | Health checks |
| **Container** | Docker | Latest | Containerization |
| **Orchestration** | Docker Compose | Latest | Multi-container management |
| **Web Server** | Nginx | Latest | Reverse proxy |

## Key Features

### Frontend Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Architecture**: Reusable React components
- **State Management**: React hooks for local state
- **API Integration**: Axios for HTTP requests
- **Routing**: React Router for navigation

### Backend Features
- **RESTful APIs**: Standard HTTP methods and status codes
- **Validation**: Bean validation with custom error handling
- **Documentation**: Auto-generated OpenAPI/Swagger docs
- **Health Monitoring**: Actuator endpoints for monitoring
- **Database Migrations**: Version-controlled schema changes

### Infrastructure Features
- **Containerization**: Docker for consistent environments
- **Orchestration**: Docker Compose for multi-service management
- **Database Options**: H2 for development, PostgreSQL for production
- **Reverse Proxy**: Nginx for load balancing and SSL termination

## Security Considerations

- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: JPA/Hibernate parameterized queries
- **CORS Configuration**: Controlled cross-origin requests
- **Error Handling**: Secure error messages without sensitive data
- **Database Security**: Connection encryption and access controls

## Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: HikariCP for database connections
- **Caching**: Spring's built-in caching mechanisms
- **Lazy Loading**: JPA lazy loading for related entities
- **Frontend Optimization**: Code splitting and bundle optimization

## Scalability Considerations

- **Stateless Design**: No server-side session state
- **Database Scaling**: Read replicas and connection pooling
- **Container Scaling**: Horizontal scaling with Docker Swarm/Kubernetes
- **API Versioning**: Backward-compatible API evolution
- **Microservices Ready**: Modular design for future service extraction
