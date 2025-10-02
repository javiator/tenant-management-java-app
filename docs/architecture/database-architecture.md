# Database Architecture

This document describes the database design, relationships, and data flow for the Tenant Management System.

## Database Overview

The system uses a relational database design with clear entity relationships and proper normalization.

## Entity Relationship Diagram

```mermaid
erDiagram
    TENANT {
        bigint id PK
        varchar name
        bigint property_id FK
        varchar passport
        date passport_validity
        varchar aadhar_no
        varchar employment_details
        varchar permanent_address
        varchar contact_no
        varchar emergency_contact_no
        decimal rent
        decimal security
        date move_in_date
        date contract_start_date
        date contract_expiry_date
        timestamp created_date
        varchar created_by
        timestamp last_updated
        varchar last_updated_by
    }
    
    PROPERTY {
        bigint id PK
        varchar name
        varchar address
        varchar type
        decimal rent_amount
        varchar status
        varchar description
        timestamp created_date
        varchar created_by
        timestamp last_updated
        varchar last_updated_by
    }
    
    TRANSACTION {
        bigint id PK
        bigint tenant_id FK
        bigint property_id FK
        decimal amount
        varchar type
        varchar description
        date transaction_date
        varchar status
        timestamp created_date
        varchar created_by
        timestamp last_updated
        varchar last_updated_by
    }
    
    TENANT ||--o{ TRANSACTION : "has many"
    PROPERTY ||--o{ TENANT : "has many"
    PROPERTY ||--o{ TRANSACTION : "has many"
```

## Database Schema

### Tables Structure

```mermaid
graph TB
    subgraph "Database Schema"
        subgraph "Core Tables"
            TenantTable["Tenant Table<br/>- id (PK)<br/>- name<br/>- property_id (FK)<br/>- passport<br/>- contact_no<br/>- rent<br/>- contract_dates"]
            PropertyTable["Property Table<br/>- id (PK)<br/>- name<br/>- address<br/>- type<br/>- rent_amount<br/>- status"]
            TransactionTable["Transaction Table<br/>- id (PK)<br/>- tenant_id (FK)<br/>- property_id (FK)<br/>- amount<br/>- type<br/>- transaction_date"]
        end
        
        subgraph "Audit Fields"
            AuditFields["Audit Fields<br/>- created_date<br/>- created_by<br/>- last_updated<br/>- last_updated_by"]
        end
        
        subgraph "Indexes"
            TenantIndexes["Tenant Indexes<br/>- property_id<br/>- name<br/>- contact_no"]
            PropertyIndexes["Property Indexes<br/>- name<br/>- status<br/>- type"]
            TransactionIndexes["Transaction Indexes<br/>- tenant_id<br/>- property_id<br/>- transaction_date<br/>- type"]
        end
    end
    
    TenantTable --> AuditFields
    PropertyTable --> AuditFields
    TransactionTable --> AuditFields
    
    TenantTable --> TenantIndexes
    PropertyTable --> PropertyIndexes
    TransactionTable --> TransactionIndexes
    
    classDef table fill:#66bb6a,stroke:#2e7d32,stroke-width:3px,color:#fff
    classDef audit fill:#ffa726,stroke:#ef6c00,stroke-width:3px,color:#000
    classDef index fill:#42a5f5,stroke:#1565c0,stroke-width:3px,color:#fff
    
    class TenantTable,PropertyTable,TransactionTable table
    class AuditFields audit
    class TenantIndexes,PropertyIndexes,TransactionIndexes index
```

## Database Configuration

### Development (H2 Database)

```mermaid
graph LR
    subgraph "H2 Configuration"
        H2File["H2 File Database<br/>./data/dev-db"]
        H2Console["H2 Console<br/>http://localhost:8080/h2-console"]
        H2Mem["H2 In-Memory<br/>jdbc:h2:mem:testdb"]
    end
    
    H2File --> H2Console
    H2Mem --> H2Console
    
    classDef h2 fill:#81c784,stroke:#388e3c,stroke-width:2px,color:#000
    class H2File,H2Console,H2Mem h2
```

### Production (PostgreSQL)

```mermaid
graph LR
    subgraph "PostgreSQL Configuration"
        PGContainer["PostgreSQL Container<br/>Port 5432"]
        PGVolume["PostgreSQL Volume<br/>Persistent Storage"]
        PGConnection["Connection Pool<br/>HikariCP"]
    end
    
    PGContainer --> PGVolume
    PGContainer --> PGConnection
    
    classDef postgres fill:#64b5f6,stroke:#1976d2,stroke-width:2px,color:#fff
    class PGContainer,PGVolume,PGConnection postgres
```

## Database Migrations

### Migration Strategy

```mermaid
graph TD
    subgraph "Flyway Migrations"
        V1["V1__init.sql<br/>Initial Schema"]
        V2["V2__seed.sql<br/>Seed Data"]
        V3["V3__add_indexes.sql<br/>Performance Indexes"]
        V4["V4__add_audit_fields.sql<br/>Audit Trail"]
    end
    
    V1 --> V2
    V2 --> V3
    V3 --> V4
    
    classDef migration fill:#ab47bc,stroke:#6a1b9a,stroke-width:2px,color:#fff
    class V1,V2,V3,V4 migration
```

### Migration Files Structure

```
src/main/resources/db/migration/
├── V1__init.sql          # Initial schema creation
├── V2__seed.sql          # Seed data for development
├── V3__add_indexes.sql   # Performance optimization
└── V4__add_audit_fields.sql # Audit trail implementation
```

## Data Flow Architecture

### Read Operations

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant Repository
    participant Database
    
    Client->>Controller: GET /api/tenants
    Controller->>Service: findAll()
    Service->>Repository: findAll()
    Repository->>Database: SELECT * FROM tenant
    Database-->>Repository: Result Set
    Repository-->>Service: List<Tenant>
    Service-->>Controller: List<TenantDto>
    Controller-->>Client: JSON Response
```

### Write Operations

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant Repository
    participant Database
    
    Client->>Controller: POST /api/tenants
    Controller->>Service: create(tenantDto)
    Service->>Repository: save(tenant)
    Repository->>Database: INSERT INTO tenant
    Database-->>Repository: Generated ID
    Repository-->>Service: Saved Tenant
    Service-->>Controller: TenantDto
    Controller-->>Client: 201 Created
```

## Database Relationships

### One-to-Many Relationships

```mermaid
graph LR
    subgraph "Property to Tenants"
        Property[Property] --> Tenant1[Tenant 1]
        Property --> Tenant2[Tenant 2]
        Property --> Tenant3[Tenant 3]
    end
    
    subgraph "Tenant to Transactions"
        Tenant[Tenant] --> Transaction1[Transaction 1]
        Tenant --> Transaction2[Transaction 2]
        Tenant --> Transaction3[Transaction 3]
    end
    
    subgraph "Property to Transactions"
        Property2[Property] --> Transaction4[Transaction 4]
        Property2 --> Transaction5[Transaction 5]
    end
    
    classDef entity fill:#66bb6a,stroke:#2e7d32,stroke-width:2px,color:#fff
    class Property,Tenant,Property2,Tenant1,Tenant2,Tenant3,Transaction1,Transaction2,Transaction3,Transaction4,Transaction5 entity
```

## Performance Optimization

### Database Indexes

```mermaid
graph TB
    subgraph "Index Strategy"
        PrimaryIndexes[Primary Key Indexes<br/>- tenant.id<br/>- property.id<br/>- transaction.id]
        ForeignKeyIndexes[Foreign Key Indexes<br/>- tenant.property_id<br/>- transaction.tenant_id<br/>- transaction.property_id]
        QueryIndexes[Query Optimization Indexes<br/>- tenant.name<br/>- tenant.contact_no<br/>- property.status<br/>- transaction.transaction_date]
        CompositeIndexes[Composite Indexes<br/>- (tenant_id, transaction_date)<br/>- (property_id, status)]
    end
    
    classDef index fill:#42a5f5,stroke:#1565c0,stroke-width:2px,color:#fff
    class PrimaryIndexes,ForeignKeyIndexes,QueryIndexes,CompositeIndexes index
```

### Connection Pooling

```mermaid
graph LR
    subgraph "HikariCP Configuration"
        App[Spring Boot App] --> Pool[Connection Pool]
        Pool --> DB1[Database Connection 1]
        Pool --> DB2[Database Connection 2]
        Pool --> DB3[Database Connection 3]
        Pool --> DB4[Database Connection 4]
    end
    
    classDef connection fill:#ab47bc,stroke:#6a1b9a,stroke-width:2px,color:#fff
    class App,Pool,DB1,DB2,DB3,DB4 connection
```

## Data Validation

### Database Constraints

```mermaid
graph TB
    subgraph "Database Constraints"
        NotNull[NOT NULL Constraints<br/>- tenant.name<br/>- property.name<br/>- transaction.amount]
        Unique[UNIQUE Constraints<br/>- tenant.contact_no<br/>- property.address]
        Check[CHECK Constraints<br/>- transaction.amount > 0<br/>- tenant.rent >= 0]
        ForeignKey[FOREIGN KEY Constraints<br/>- tenant.property_id<br/>- transaction.tenant_id<br/>- transaction.property_id]
    end
    
    classDef constraint fill:#ffa726,stroke:#ef6c00,stroke-width:2px,color:#000
    class NotNull,Unique,Check,ForeignKey constraint
```

## Backup and Recovery

### Backup Strategy

```mermaid
graph TD
    subgraph "Backup Strategy"
        DailyBackup[Daily Backups<br/>Full Database Export]
        WeeklyBackup[Weekly Backups<br/>Incremental Changes]
        MonthlyBackup[Monthly Backups<br/>Long-term Storage]
        
        subgraph "Backup Types"
            FullBackup[Full Backup<br/>Complete Database]
            IncrementalBackup[Incremental Backup<br/>Changes Only]
            LogicalBackup[Logical Backup<br/>SQL Dump]
        end
    end
    
    DailyBackup --> FullBackup
    WeeklyBackup --> IncrementalBackup
    MonthlyBackup --> LogicalBackup
    
    classDef backup fill:#66bb6a,stroke:#2e7d32,stroke-width:2px,color:#fff
    class DailyBackup,WeeklyBackup,MonthlyBackup,FullBackup,IncrementalBackup,LogicalBackup backup
```

## Security Considerations

### Database Security

```mermaid
graph TB
    subgraph "Security Measures"
        AccessControl[Access Control<br/>- User Authentication<br/>- Role-based Access<br/>- Connection Encryption]
        DataProtection[Data Protection<br/>- Sensitive Data Encryption<br/>- Audit Trail<br/>- Data Masking]
        NetworkSecurity[Network Security<br/>- SSL/TLS Encryption<br/>- Firewall Rules<br/>- VPN Access]
    end
    
    classDef security fill:#ffcdd2,stroke:#d32f2f,stroke-width:2px,color:#000
    class AccessControl,DataProtection,NetworkSecurity security
```

## Monitoring and Maintenance

### Database Monitoring

```mermaid
graph LR
    subgraph "Monitoring Tools"
        SpringActuator[Spring Actuator<br/>Health Checks]
        DatabaseMetrics[Database Metrics<br/>Connection Pool<br/>Query Performance]
        Logging[Application Logging<br/>SQL Queries<br/>Performance Logs]
    end
    
    classDef monitoring fill:#b3e5fc,stroke:#0288d1,stroke-width:2px,color:#000
    class SpringActuator,DatabaseMetrics,Logging monitoring
```
