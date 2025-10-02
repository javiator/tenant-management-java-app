# Infrastructure Diagrams

This document contains comprehensive infrastructure and deployment diagrams for the Tenant Management System.

## Container Architecture

### Development Environment

```mermaid
graph TB
    subgraph "Development Environment"
        subgraph "Local Development"
            DevMachine[Development Machine<br/>Local Environment]
            
            subgraph "Services"
                H2DB[H2 Database<br/>File-based<br/>./data/dev-db]
                SpringBoot[Spring Boot<br/>Port 8080<br/>Debug Mode]
                React[React Dev Server<br/>Port 3000<br/>Hot Reload]
            end
            
            subgraph "Development Tools"
                IDE[IDE/Editor<br/>IntelliJ IDEA<br/>VS Code]
                Maven[Maven<br/>Dependency Management]
                NPM[NPM<br/>Frontend Dependencies]
            end
        end
    end
    
    DevMachine --> H2DB
    DevMachine --> SpringBoot
    DevMachine --> React
    DevMachine --> IDE
    DevMachine --> Maven
    DevMachine --> NPM
    
    SpringBoot --> H2DB
    React --> SpringBoot
    
    classDef dev fill:#81c784,stroke:#388e3c,stroke-width:2px,color:#000
    class DevMachine,H2DB,SpringBoot,React,IDE,Maven,NPM dev
```

### Production Environment

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Load Balancer"
            LB[Load Balancer<br/>Nginx/HAProxy<br/>SSL Termination<br/>Port 80/443]
        end
        
        subgraph "Application Tier"
            App1[Application Instance 1<br/>Spring Boot<br/>Port 8080]
            App2[Application Instance 2<br/>Spring Boot<br/>Port 8080]
            App3[Application Instance 3<br/>Spring Boot<br/>Port 8080]
        end
        
        subgraph "Database Tier"
            PrimaryDB[Primary Database<br/>PostgreSQL<br/>Read/Write<br/>Port 5432]
            ReplicaDB[Replica Database<br/>PostgreSQL<br/>Read Only<br/>Port 5432]
        end
        
        subgraph "Storage"
            DBStorage[Database Storage<br/>Persistent Volumes<br/>Backup Storage]
            AppStorage[Application Storage<br/>Static Files<br/>Logs]
        end
        
        subgraph "Monitoring"
            Monitoring[Monitoring Stack<br/>Health Checks<br/>Metrics Collection<br/>Log Aggregation]
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
    
    Monitoring --> App1
    Monitoring --> App2
    Monitoring --> App3
    Monitoring --> PrimaryDB
    Monitoring --> ReplicaDB
    
    classDef production fill:#66bb6a,stroke:#2e7d32,stroke-width:3px,color:#fff
    class LB,App1,App2,App3,PrimaryDB,ReplicaDB,DBStorage,AppStorage,Monitoring production
```

## Docker Compose Architecture

### Development Docker Compose

```mermaid
graph TB
    subgraph "Development Docker Compose"
        DevCompose[docker-compose.yml<br/>Development Configuration]
        
        subgraph "Services"
            DevBackend[Backend Service<br/>Spring Boot<br/>H2 Database<br/>Debug Mode]
            DevFrontend[Frontend Service<br/>React Dev Server<br/>Hot Reload<br/>Proxy to Backend]
        end
        
        subgraph "Configuration"
            DevEnv[Development Environment<br/>H2 Database<br/>Debug Mode<br/>Hot Reload]
            DevVolumes[Development Volumes<br/>Source Code Mounting<br/>Live Reload]
        end
        
        subgraph "Networks"
            DevNetwork[Development Network<br/>Internal Communication<br/>Service Discovery]
        end
    end
    
    DevCompose --> DevBackend
    DevCompose --> DevFrontend
    DevCompose --> DevEnv
    DevCompose --> DevVolumes
    DevCompose --> DevNetwork
    
    DevBackend -.-> DevNetwork
    DevFrontend -.-> DevNetwork
    
    classDef compose fill:#ab47bc,stroke:#6a1b9a,stroke-width:2px,color:#fff
    class DevCompose,DevBackend,DevFrontend,DevEnv,DevVolumes,DevNetwork compose
```

### Production Docker Compose

```mermaid
graph TB
    subgraph "Production Docker Compose"
        ProdCompose[docker-compose.prod.yml<br/>Production Configuration]
        
        subgraph "Services"
            ProdBackend[Backend Service<br/>Spring Boot<br/>PostgreSQL<br/>Optimized Settings]
            ProdFrontend[Frontend Service<br/>Nginx<br/>Static Files<br/>Production Build]
            ProdDB[Database Service<br/>PostgreSQL<br/>Persistent Storage<br/>Health Checks]
        end
        
        subgraph "Configuration"
            ProdEnv[Production Environment<br/>PostgreSQL<br/>Optimized Settings<br/>Security Hardening]
            ProdVolumes[Production Volumes<br/>Persistent Storage<br/>Backup Volumes]
        end
        
        subgraph "Networks"
            ProdNetwork[Production Network<br/>Secure Communication<br/>Service Isolation]
        end
    end
    
    ProdCompose --> ProdBackend
    ProdCompose --> ProdFrontend
    ProdCompose --> ProdDB
    ProdCompose --> ProdEnv
    ProdCompose --> ProdVolumes
    ProdCompose --> ProdNetwork
    
    ProdBackend -.-> ProdNetwork
    ProdFrontend -.-> ProdNetwork
    ProdDB -.-> ProdNetwork
    
    classDef prod fill:#ffa726,stroke:#ef6c00,stroke-width:2px,color:#000
    class ProdCompose,ProdBackend,ProdFrontend,ProdDB,ProdEnv,ProdVolumes,ProdNetwork prod
```

## Network Architecture

### Network Topology

```mermaid
graph TB
    subgraph "Network Architecture"
        subgraph "External Network"
            Internet[Internet<br/>Public Access<br/>Port 80/443]
        end
        
        subgraph "DMZ (Demilitarized Zone)"
            LoadBalancer[Load Balancer<br/>Nginx/HAProxy<br/>SSL Termination<br/>Port 80/443]
            WebServer[Web Server<br/>Static Files<br/>Port 80]
        end
        
        subgraph "Application Network"
            App1[Application 1<br/>Spring Boot<br/>Port 8080]
            App2[Application 2<br/>Spring Boot<br/>Port 8080]
            App3[Application 3<br/>Spring Boot<br/>Port 8080]
        end
        
        subgraph "Database Network"
            PrimaryDB[Primary Database<br/>PostgreSQL<br/>Port 5432]
            ReplicaDB[Replica Database<br/>PostgreSQL<br/>Port 5432]
        end
        
        subgraph "Management Network"
            Monitoring[Monitoring<br/>Health Checks<br/>Metrics]
            Logging[Logging<br/>Centralized Logs<br/>Error Tracking]
        end
    end
    
    Internet --> LoadBalancer
    LoadBalancer --> WebServer
    LoadBalancer --> App1
    LoadBalancer --> App2
    LoadBalancer --> App3
    
    App1 --> PrimaryDB
    App2 --> PrimaryDB
    App3 --> PrimaryDB
    
    App1 --> ReplicaDB
    App2 --> ReplicaDB
    App3 --> ReplicaDB
    
    Monitoring --> App1
    Monitoring --> App2
    Monitoring --> App3
    Monitoring --> PrimaryDB
    Monitoring --> ReplicaDB
    
    Logging --> App1
    Logging --> App2
    Logging --> App3
    
    classDef network fill:#4fc3f7,stroke:#0277bd,stroke-width:3px,color:#000
    class Internet,LoadBalancer,WebServer,App1,App2,App3,PrimaryDB,ReplicaDB,Monitoring,Logging network
```

## Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Security Architecture"
        subgraph "Network Security"
            Firewall[Firewall Rules<br/>Port Restrictions<br/>IP Whitelisting]
            SSL[SSL/TLS Encryption<br/>Certificate Management<br/>HTTPS Only]
        end
        
        subgraph "Application Security"
            InputValidation[Input Validation<br/>SQL Injection Prevention<br/>XSS Protection]
            Authentication[Authentication<br/>JWT Tokens<br/>Session Management]
            Authorization[Authorization<br/>Role-based Access<br/>Resource Permissions]
        end
        
        subgraph "Database Security"
            DBEncryption[Database Encryption<br/>At Rest and In Transit<br/>Key Management]
            AccessControl[Access Control<br/>User Permissions<br/>Connection Security]
        end
        
        subgraph "Infrastructure Security"
            ContainerSecurity[Container Security<br/>Image Scanning<br/>Runtime Protection]
            SecretsManagement[Secrets Management<br/>Environment Variables<br/>Secure Storage]
        end
    end
    
    classDef security fill:#ffcdd2,stroke:#d32f2f,stroke-width:2px,color:#000
    class Firewall,SSL,InputValidation,Authentication,Authorization,DBEncryption,AccessControl,ContainerSecurity,SecretsManagement security
```

## Monitoring and Observability

### Monitoring Stack

```mermaid
graph TB
    subgraph "Monitoring and Observability"
        subgraph "Application Monitoring"
            SpringActuator[Spring Actuator<br/>Health Checks<br/>Metrics Endpoints<br/>Custom Metrics]
            CustomMetrics[Custom Metrics<br/>Business KPIs<br/>Performance Metrics<br/>User Behavior]
        end
        
        subgraph "Infrastructure Monitoring"
            ContainerMetrics[Container Metrics<br/>CPU, Memory<br/>Network I/O<br/>Disk Usage]
            DatabaseMetrics[Database Metrics<br/>Connection Pool<br/>Query Performance<br/>Storage Usage]
        end
        
        subgraph "Logging"
            StructuredLogs[Structured Logging<br/>JSON Format<br/>Correlation IDs<br/>Request Tracing]
            CentralizedLogs[Centralized Logging<br/>Log Aggregation<br/>Search and Analysis<br/>Alerting]
        end
        
        subgraph "Alerting"
            PerformanceAlerts[Performance Alerts<br/>Response Time Thresholds<br/>Error Rate Limits<br/>Throughput Monitoring]
            BusinessAlerts[Business Alerts<br/>Usage Anomalies<br/>Feature Adoption<br/>User Engagement]
        end
    end
    
    classDef monitoring fill:#b3e5fc,stroke:#0288d1,stroke-width:2px,color:#000
    class SpringActuator,CustomMetrics,ContainerMetrics,DatabaseMetrics,StructuredLogs,CentralizedLogs,PerformanceAlerts,BusinessAlerts monitoring
```

## Scaling Strategy

### Horizontal Scaling

```mermaid
graph TB
    subgraph "Horizontal Scaling Strategy"
        subgraph "Load Balancer"
            LB[Load Balancer<br/>Traffic Distribution<br/>Health Checks<br/>Session Affinity]
        end
        
        subgraph "Application Tier"
            App1[App Instance 1<br/>Spring Boot<br/>Stateless Design]
            App2[App Instance 2<br/>Spring Boot<br/>Stateless Design]
            App3[App Instance 3<br/>Spring Boot<br/>Stateless Design]
            AppN[App Instance N<br/>Spring Boot<br/>Stateless Design]
        end
        
        subgraph "Database Tier"
            PrimaryDB[Primary Database<br/>Write Operations<br/>Master Database]
            Replica1[Replica 1<br/>Read Operations<br/>Slave Database]
            Replica2[Replica 2<br/>Read Operations<br/>Slave Database]
            ReplicaN[Replica N<br/>Read Operations<br/>Slave Database]
        end
        
        subgraph "Caching Layer"
            Redis[Redis Cache<br/>Session Storage<br/>Application Cache<br/>Distributed Cache]
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
    AppN --> ReplicaN
    
    App1 --> Redis
    App2 --> Redis
    App3 --> Redis
    AppN --> Redis
    
    classDef scaling fill:#66bb6a,stroke:#2e7d32,stroke-width:3px,color:#fff
    class LB,App1,App2,App3,AppN,PrimaryDB,Replica1,Replica2,ReplicaN,Redis scaling
```

## Disaster Recovery

### Backup and Recovery Strategy

```mermaid
graph TD
    subgraph "Disaster Recovery Strategy"
        subgraph "Backup Strategy"
            DailyBackup[Daily Backups<br/>Full Database<br/>Incremental Changes<br/>Point-in-time Recovery]
            WeeklyBackup[Weekly Backups<br/>Full System Backup<br/>Configuration Backup<br/>Code Repository Backup]
            MonthlyBackup[Monthly Backups<br/>Long-term Storage<br/>Archive Backup<br/>Compliance Backup]
        end
        
        subgraph "Recovery Process"
            DatabaseRestore[Database Restore<br/>Point-in-time Recovery<br/>Data Consistency<br/>Transaction Logs]
            ApplicationRestore[Application Restore<br/>Code Deployment<br/>Configuration Restore<br/>Service Restart]
            SystemRestore[System Restore<br/>Infrastructure Provisioning<br/>Network Configuration<br/>Security Settings]
        end
        
        subgraph "Testing and Validation"
            BackupTest[Backup Testing<br/>Recovery Validation<br/>Data Integrity<br/>Performance Testing]
            DRTest[Disaster Recovery Test<br/>Full System Test<br/>Failover Testing<br/>Recovery Time Testing]
        end
        
        subgraph "Monitoring and Alerting"
            BackupMonitoring[Backup Monitoring<br/>Success/Failure Alerts<br/>Storage Usage<br/>Retention Policy]
            RecoveryMonitoring[Recovery Monitoring<br/>RTO/RPO Tracking<br/>Recovery Success<br/>Performance Impact]
        end
    end
    
    DailyBackup --> DatabaseRestore
    WeeklyBackup --> ApplicationRestore
    MonthlyBackup --> SystemRestore
    
    DatabaseRestore --> BackupTest
    ApplicationRestore --> BackupTest
    SystemRestore --> BackupTest
    
    BackupTest --> DRTest
    
    BackupMonitoring --> DailyBackup
    BackupMonitoring --> WeeklyBackup
    BackupMonitoring --> MonthlyBackup
    
    RecoveryMonitoring --> DatabaseRestore
    RecoveryMonitoring --> ApplicationRestore
    RecoveryMonitoring --> SystemRestore
    
    classDef backup fill:#ffa726,stroke:#ef6c00,stroke-width:2px,color:#000
    classDef recovery fill:#66bb6a,stroke:#2e7d32,stroke-width:2px,color:#fff
    classDef testing fill:#ab47bc,stroke:#6a1b9a,stroke-width:2px,color:#fff
    classDef monitoring fill:#b3e5fc,stroke:#0288d1,stroke-width:2px,color:#000
    
    class DailyBackup,WeeklyBackup,MonthlyBackup backup
    class DatabaseRestore,ApplicationRestore,SystemRestore recovery
    class BackupTest,DRTest testing
    class BackupMonitoring,RecoveryMonitoring monitoring
```

## Deployment Pipelines

### CI/CD Pipeline

```mermaid
graph LR
    subgraph "CI/CD Pipeline"
        subgraph "Source Control"
            Git[Git Repository<br/>Code Management<br/>Version Control<br/>Branch Strategy]
        end
        
        subgraph "Build Stage"
            Build[Build Process<br/>Maven Build<br/>Docker Build<br/>Dependency Check]
            Test[Testing<br/>Unit Tests<br/>Integration Tests<br/>Code Quality]
        end
        
        subgraph "Deploy Stage"
            Staging[Staging Deployment<br/>Testing Environment<br/>Integration Testing<br/>User Acceptance]
            Production[Production Deployment<br/>Blue-Green Deployment<br/>Rolling Updates<br/>Health Checks]
        end
        
        subgraph "Monitoring"
            DeployMonitoring[Deployment Monitoring<br/>Health Checks<br/>Performance Monitoring<br/>Error Tracking]
        end
    end
    
    Git --> Build
    Build --> Test
    Test --> Staging
    Staging --> Production
    Production --> DeployMonitoring
    
    classDef pipeline fill:#4fc3f7,stroke:#0277bd,stroke-width:2px,color:#000
    class Git,Build,Test,Staging,Production,DeployMonitoring pipeline
```
