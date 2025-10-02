# Deployment Architecture

This document describes the deployment architecture, infrastructure, and containerization strategy for the Tenant Management System.

## Deployment Overview

The system is designed for containerized deployment with Docker and Docker Compose, supporting both development and production environments.

## Container Architecture

```mermaid
graph TB
    subgraph "Docker Environment"
        subgraph "Application Containers"
            FrontendContainer[Frontend Container<br/>React SPA<br/>Port 3000]
            BackendContainer[Backend Container<br/>Spring Boot API<br/>Port 8080]
        end
        
        subgraph "Database Containers"
            DatabaseContainer[Database Container<br/>PostgreSQL<br/>Port 5432]
        end
        
        subgraph "Web Server Containers"
            NginxContainer[Nginx Container<br/>Reverse Proxy<br/>Port 80/443]
        end
        
        subgraph "Volumes"
            DatabaseVolume[Database Volume<br/>PostgreSQL Data]
            AppVolume[Application Volume<br/>Static Files]
        end
        
        subgraph "Networks"
            AppNetwork[Application Network<br/>Internal Communication]
        end
    end
    
    FrontendContainer --> NginxContainer
    BackendContainer --> DatabaseContainer
    NginxContainer --> BackendContainer
    DatabaseContainer --> DatabaseVolume
    FrontendContainer --> AppVolume
    
    FrontendContainer -.-> AppNetwork
    BackendContainer -.-> AppNetwork
    DatabaseContainer -.-> AppNetwork
    NginxContainer -.-> AppNetwork
    
    classDef container fill:#4fc3f7,stroke:#0277bd,stroke-width:3px,color:#000
    classDef volume fill:#66bb6a,stroke:#2e7d32,stroke-width:3px,color:#fff
    classDef network fill:#ab47bc,stroke:#6a1b9a,stroke-width:3px,color:#fff
    
    class FrontendContainer,BackendContainer,DatabaseContainer,NginxContainer container
    class DatabaseVolume,AppVolume volume
    class AppNetwork network
```

## Development Environment

### Local Development Setup

```mermaid
graph LR
    subgraph "Development Environment"
        DevMachine[Development Machine]
        
        subgraph "Local Services"
            H2DB[H2 Database<br/>File-based<br/>./data/dev-db]
            SpringBoot[Spring Boot<br/>Port 8080]
            React[React Dev Server<br/>Port 3000]
        end
        
        subgraph "Development Tools"
            IDE[IDE/Editor<br/>IntelliJ IDEA<br/>VS Code]
            Maven[Maven<br/>Dependency Management]
            NPM[NPM<br/>Frontend Dependencies]
        end
    end
    
    DevMachine --> H2DB
    DevMachine --> SpringBoot
    DevMachine --> React
    DevMachine --> IDE
    DevMachine --> Maven
    DevMachine --> NPM
    
    classDef dev fill:#81c784,stroke:#388e3c,stroke-width:2px,color:#000
    class DevMachine,H2DB,SpringBoot,React,IDE,Maven,NPM dev
```

### Development Docker Compose

```mermaid
graph TD
    subgraph "Development Docker Compose"
        DevCompose[docker-compose.yml]
        
        subgraph "Services"
            DevBackend[Backend Service<br/>Spring Boot<br/>H2 Database]
            DevFrontend[Frontend Service<br/>React Dev Server]
        end
        
        subgraph "Configuration"
            DevEnv[Development Environment<br/>H2 Database<br/>Debug Mode]
        end
    end
    
    DevCompose --> DevBackend
    DevCompose --> DevFrontend
    DevCompose --> DevEnv
    
    classDef compose fill:#ab47bc,stroke:#6a1b9a,stroke-width:2px,color:#fff
    class DevCompose,DevBackend,DevFrontend,DevEnv compose
```

## Production Environment

### Production Deployment

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Load Balancer"
            LB[Load Balancer<br/>Nginx/HAProxy<br/>SSL Termination]
        end
        
        subgraph "Application Tier"
            App1[Application Instance 1<br/>Spring Boot]
            App2[Application Instance 2<br/>Spring Boot]
            App3[Application Instance 3<br/>Spring Boot]
        end
        
        subgraph "Database Tier"
            PrimaryDB[Primary Database<br/>PostgreSQL<br/>Read/Write]
            ReplicaDB[Replica Database<br/>PostgreSQL<br/>Read Only]
        end
        
        subgraph "Storage"
            DBStorage[Database Storage<br/>Persistent Volumes]
            AppStorage[Application Storage<br/>Static Files]
        end
    end
    
    LB --> App1
    LB --> App2
    LB --> App3
    
    App1 --> PrimaryDB
    App2 --> PrimaryDB
    App3 --> PrimaryDB
    
    App1 --> ReplicaDB
    App2 --> ReplicaDB
    App3 --> ReplicaDB
    
    PrimaryDB --> DBStorage
    ReplicaDB --> DBStorage
    App1 --> AppStorage
    App2 --> AppStorage
    App3 --> AppStorage
    
    classDef production fill:#66bb6a,stroke:#2e7d32,stroke-width:3px,color:#fff
    class LB,App1,App2,App3,PrimaryDB,ReplicaDB,DBStorage,AppStorage production
```

### Production Docker Compose

```mermaid
graph TD
    subgraph "Production Docker Compose"
        ProdCompose[docker-compose.prod.yml]
        
        subgraph "Services"
            ProdBackend[Backend Service<br/>Spring Boot<br/>PostgreSQL]
            ProdFrontend[Frontend Service<br/>Nginx<br/>Static Files]
            ProdDB[Database Service<br/>PostgreSQL<br/>Persistent Storage]
        end
        
        subgraph "Configuration"
            ProdEnv[Production Environment<br/>PostgreSQL<br/>Optimized Settings]
        end
    end
    
    ProdCompose --> ProdBackend
    ProdCompose --> ProdFrontend
    ProdCompose --> ProdDB
    ProdCompose --> ProdEnv
    
    classDef prod fill:#fff3e0
    class ProdCompose,ProdBackend,ProdFrontend,ProdDB,ProdEnv prod
```

## Infrastructure Components

### Docker Configuration

```mermaid
graph TB
    subgraph "Docker Configuration"
        subgraph "Backend Dockerfile"
            BackendDockerfile[Backend Dockerfile<br/>- Java 21 Base Image<br/>- Spring Boot JAR<br/>- Health Checks]
        end
        
        subgraph "Frontend Dockerfile"
            FrontendDockerfile[Frontend Dockerfile<br/>- Node.js Build Stage<br/>- Nginx Runtime<br/>- Static File Serving]
        end
        
        subgraph "Database Configuration"
            DBConfig[Database Configuration<br/>- PostgreSQL 16<br/>- Persistent Volumes<br/>- Health Checks]
        end
        
        subgraph "Nginx Configuration"
            NginxConfig[Nginx Configuration<br/>- Reverse Proxy<br/>- Static File Serving<br/>- SSL Termination]
        end
    end
    
    classDef docker fill:#e1f5fe
    class BackendDockerfile,FrontendDockerfile,DBConfig,NginxConfig docker
```

### Network Architecture

```mermaid
graph TB
    subgraph "Network Architecture"
        subgraph "External Network"
            Internet[Internet<br/>Port 80/443]
        end
        
        subgraph "Application Network"
            Nginx[Nginx<br/>Port 80/443]
            Frontend[Frontend<br/>Port 3000]
            Backend[Backend<br/>Port 8080]
        end
        
        subgraph "Database Network"
            Database[Database<br/>Port 5432]
        end
        
        subgraph "Internal Communication"
            InternalNet[Internal Network<br/>Docker Network]
        end
    end
    
    Internet --> Nginx
    Nginx --> Frontend
    Nginx --> Backend
    Backend --> Database
    
    Frontend -.-> InternalNet
    Backend -.-> InternalNet
    Database -.-> InternalNet
    
    classDef network fill:#f3e5f5
    class Internet,Nginx,Frontend,Backend,Database,InternalNet network
```

## Deployment Strategies

### Blue-Green Deployment

```mermaid
graph LR
    subgraph "Blue-Green Deployment"
        subgraph "Blue Environment"
            BlueLB[Blue Load Balancer]
            BlueApp[Blue Application]
            BlueDB[Blue Database]
        end
        
        subgraph "Green Environment"
            GreenLB[Green Load Balancer]
            GreenApp[Green Application]
            GreenDB[Green Database]
        end
        
        subgraph "Switch"
            Switch[Traffic Switch<br/>DNS/Load Balancer]
        end
    end
    
    Switch --> BlueLB
    Switch --> GreenLB
    
    BlueLB --> BlueApp
    GreenLB --> GreenApp
    
    BlueApp --> BlueDB
    GreenApp --> GreenDB
    
    classDef blue fill:#e1f5fe
    classDef green fill:#e8f5e8
    classDef switch fill:#fff3e0
    
    class BlueLB,BlueApp,BlueDB blue
    class GreenLB,GreenApp,GreenDB green
    class Switch switch
```

### Rolling Deployment

```mermaid
graph TD
    subgraph "Rolling Deployment"
        subgraph "Step 1"
            Step1[Deploy New Version<br/>to Instance 1]
        end
        
        subgraph "Step 2"
            Step2[Deploy New Version<br/>to Instance 2]
        end
        
        subgraph "Step 3"
            Step3[Deploy New Version<br/>to Instance 3]
        end
        
        subgraph "Load Balancer"
            LB[Load Balancer<br/>Health Checks]
        end
    end
    
    Step1 --> Step2
    Step2 --> Step3
    LB --> Step1
    LB --> Step2
    LB --> Step3
    
    classDef step fill:#f3e5f5
    class Step1,Step2,Step3,LB step
```

## Monitoring and Observability

### Application Monitoring

```mermaid
graph TB
    subgraph "Monitoring Stack"
        subgraph "Application Metrics"
            SpringActuator[Spring Actuator<br/>Health Checks<br/>Metrics]
            CustomMetrics[Custom Metrics<br/>Business KPIs<br/>Performance]
        end
        
        subgraph "Infrastructure Metrics"
            ContainerMetrics[Container Metrics<br/>CPU, Memory<br/>Network I/O]
            DatabaseMetrics[Database Metrics<br/>Connection Pool<br/>Query Performance]
        end
        
        subgraph "Logging"
            AppLogs[Application Logs<br/>Structured Logging<br/>Error Tracking]
            AccessLogs[Access Logs<br/>Nginx Logs<br/>Request Tracking]
        end
    end
    
    classDef monitoring fill:#e1f5fe
    class SpringActuator,CustomMetrics,ContainerMetrics,DatabaseMetrics,AppLogs,AccessLogs monitoring
```

### Health Checks

```mermaid
graph LR
    subgraph "Health Check Strategy"
        subgraph "Application Health"
            AppHealth[Application Health<br/>/actuator/health]
            DBHealth[Database Health<br/>Connection Test]
        end
        
        subgraph "Infrastructure Health"
            ContainerHealth[Container Health<br/>Docker Health Checks]
            ServiceHealth[Service Health<br/>Port Availability]
        end
    end
    
    classDef health fill:#e8f5e8
    class AppHealth,DBHealth,ContainerHealth,ServiceHealth health
```

## Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Security Architecture"
        subgraph "Network Security"
            Firewall[Firewall Rules<br/>Port Restrictions]
            SSL[SSL/TLS Encryption<br/>Certificate Management]
        end
        
        subgraph "Application Security"
            InputValidation[Input Validation<br/>SQL Injection Prevention]
            Authentication[Authentication<br/>JWT Tokens]
            Authorization[Authorization<br/>Role-based Access]
        end
        
        subgraph "Database Security"
            DBEncryption[Database Encryption<br/>At Rest and In Transit]
            AccessControl[Access Control<br/>User Permissions]
        end
    end
    
    classDef security fill:#fce4ec
    class Firewall,SSL,InputValidation,Authentication,Authorization,DBEncryption,AccessControl security
```

## Scaling Strategy

### Horizontal Scaling

```mermaid
graph TB
    subgraph "Horizontal Scaling"
        subgraph "Load Balancer"
            LB[Load Balancer<br/>Traffic Distribution]
        end
        
        subgraph "Application Instances"
            App1[App Instance 1]
            App2[App Instance 2]
            App3[App Instance 3]
            AppN[App Instance N]
        end
        
        subgraph "Database Cluster"
            PrimaryDB[Primary Database<br/>Write Operations]
            Replica1[Replica 1<br/>Read Operations]
            Replica2[Replica 2<br/>Read Operations]
        end
    end
    
    LB --> App1
    LB --> App2
    LB --> App3
    LB --> AppN
    
    App1 --> PrimaryDB
    App2 --> PrimaryDB
    App3 --> PrimaryDB
    AppN --> PrimaryDB
    
    App1 --> Replica1
    App2 --> Replica1
    App3 --> Replica2
    AppN --> Replica2
    
    classDef scaling fill:#e1f5fe
    class LB,App1,App2,App3,AppN,PrimaryDB,Replica1,Replica2 scaling
```

## Disaster Recovery

### Backup Strategy

```mermaid
graph TD
    subgraph "Disaster Recovery"
        subgraph "Backup Strategy"
            DailyBackup[Daily Backups<br/>Full Database]
            WeeklyBackup[Weekly Backups<br/>Incremental]
            MonthlyBackup[Monthly Backups<br/>Long-term Storage]
        end
        
        subgraph "Recovery Process"
            Restore[Database Restore<br/>Point-in-time Recovery]
            Failover[Application Failover<br/>Secondary Region]
        end
        
        subgraph "Testing"
            BackupTest[Backup Testing<br/>Recovery Validation]
            DRTest[Disaster Recovery Test<br/>Full System Test]
        end
    end
    
    DailyBackup --> Restore
    WeeklyBackup --> Restore
    MonthlyBackup --> Restore
    
    Restore --> Failover
    Failover --> BackupTest
    BackupTest --> DRTest
    
    classDef recovery fill:#fff3e0
    class DailyBackup,WeeklyBackup,MonthlyBackup,Restore,Failover,BackupTest,DRTest recovery
```
