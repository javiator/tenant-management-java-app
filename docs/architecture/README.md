# Architecture Documentation

This directory contains comprehensive architecture documentation for the Tenant Management Java Application.

## Documentation Structure

- [System Architecture](./system-architecture.md) - High-level system overview
- [Component Architecture](./component-architecture.md) - Detailed component interactions
- [Database Architecture](./database-architecture.md) - Database design and relationships
- [Deployment Architecture](./deployment-architecture.md) - Infrastructure and deployment
- [API Architecture](./api-architecture.md) - API design and endpoints

## Quick Reference

### Architecture Overview
The application follows a modern microservices-inspired architecture with clear separation of concerns:

- **Frontend**: React SPA with component-based architecture
- **Backend**: Spring Boot with layered architecture
- **Database**: H2 (dev) / PostgreSQL (prod) with Flyway migrations
- **Infrastructure**: Docker containerization with orchestration

### Key Design Principles
- **Separation of Concerns**: Clear boundaries between layers
- **Dependency Injection**: Spring's IoC container for loose coupling
- **RESTful APIs**: Standard HTTP methods and status codes
- **Database Migrations**: Version-controlled schema changes
- **Containerization**: Consistent deployment across environments

## Diagrams

All architectural diagrams are created using Mermaid and can be viewed in any Markdown-compatible viewer or rendered on GitHub/GitLab.

### Viewing Diagrams
- **GitHub/GitLab**: Diagrams render automatically in markdown files
- **VS Code**: Install "Mermaid Preview" extension
- **Online**: Use [Mermaid Live Editor](https://mermaid.live/)
- **Local**: Use `mermaid-cli` for PNG/SVG export

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18, Tailwind CSS | User interface |
| API Gateway | Nginx | Reverse proxy, load balancing |
| Backend | Spring Boot 3.3.4, Java 21 | Business logic, API |
| Database | H2 (dev), PostgreSQL (prod) | Data persistence |
| Migration | Flyway | Database versioning |
| Container | Docker, Docker Compose | Orchestration |
| Documentation | Springdoc OpenAPI | API documentation |
| Monitoring | Spring Actuator | Health checks, metrics |
