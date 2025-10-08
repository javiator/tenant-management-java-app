# Tenant Management Backend

Spring Boot REST API for tenant management system with JPA, H2/PostgreSQL, and Flyway migrations.

## Technology Stack

- **Java 21** with Spring Boot 3.3.4
- **Spring Data JPA** for database operations
- **H2 Database** (development) / **PostgreSQL** (production)
- **Flyway** for database migrations
- **Springdoc OpenAPI** for API documentation
- **Spring Boot Actuator** for health monitoring
- **Maven** for dependency management

## Project Structure

```
backend/
├── src/main/java/com/example/tenantmanagement/
│   ├── TenantManagementApplication.java    # Main Spring Boot app
│   ├── domain/                             # JPA Entities
│   │   ├── Property.java
│   │   ├── Tenant.java
│   │   └── Transaction.java
│   ├── repository/                         # Data Access Layer
│   │   ├── PropertyRepository.java
│   │   ├── TenantRepository.java
│   │   └── TransactionRepository.java
│   ├── service/                           # Business Logic
│   │   ├── PropertyService.java
│   │   ├── TenantService.java
│   │   ├── TransactionService.java
│   │   └── Mapping.java
│   └── web/                               # REST Controllers
│       ├── PropertyController.java
│       ├── TenantController.java
│       ├── TransactionController.java
│       ├── GlobalExceptionHandler.java
│       └── dto/                           # Data Transfer Objects
│           ├── PropertyDto.java
│           ├── TenantDto.java
│           └── TransactionDto.java
├── src/main/resources/
│   ├── application.yml                    # Configuration
│   └── db/migration/                     # Flyway migrations
│       ├── V1__init.sql
│       └── V2__seed.sql
├── pom.xml                               # Maven configuration
├── Dockerfile                            # Container configuration
└── docker-compose.yml                    # Backend-only orchestration
```

## Quick Start

### Development Mode (H2 Database) - Default

```bash
# Run with Maven (uses H2 automatically)
mvn spring-boot:run

# Or build and run JAR
mvn clean package
java -jar target/tenant-management-0.0.1-SNAPSHOT.jar
```

**Access Points:**
- API: http://localhost:8080
- H2 Console: http://localhost:8080/h2-console
- Swagger UI: http://localhost:8080/swagger-ui.html
- Actuator: http://localhost:8080/actuator

### Production Mode (PostgreSQL)

```bash
# Simple production mode (requires PostgreSQL running)
mvn spring-boot:run -Dspring.profiles.active=prod

# Using Docker Compose (starts PostgreSQL automatically)
PROFILE=prod docker compose up --build
```

## API Endpoints

### Properties
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create new property
- `PUT /api/properties/{id}` - Update property
- `DELETE /api/properties/{id}` - Delete property
- `GET /api/properties/{id}/transactions` - Get transactions for a specific property

### Tenants
- `GET /api/tenants` - List all tenants
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/{id}` - Update tenant
- `DELETE /api/tenants/{id}` - Delete tenant
- `GET /api/tenants/{id}/transactions` - Get transactions for a specific tenant

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

## Transaction Summary Endpoints

### Tenant Transactions
- **Endpoint**: `GET /api/tenants/{id}/transactions`
- **Description**: Get all transactions for a specific tenant
- **Response**: Array of transaction objects with property and tenant details
- **Example**:
  ```bash
  curl http://localhost:8080/api/tenants/1/transactions
  ```
  ```json
  [
    {
      "id": 1,
      "propertyId": 1,
      "propertyAddress": "B175 - 10B (W)",
      "tenantId": 1,
      "tenantName": "John Doe",
      "type": "rent",
      "forMonth": "January",
      "amount": 25000.0,
      "transactionDate": "2025-01-05",
      "comments": "January rent"
    }
  ]
  ```

### Property Transactions
- **Endpoint**: `GET /api/properties/{id}/transactions`
- **Description**: Get all transactions for a specific property
- **Response**: Array of transaction objects with property and tenant details
- **Example**:
  ```bash
  curl http://localhost:8080/api/properties/1/transactions
  ```
  ```json
  [
    {
      "id": 1,
      "propertyId": 1,
      "propertyAddress": "B175 - 10B (W)",
      "tenantId": 1,
      "tenantName": "John Doe",
      "type": "rent",
      "forMonth": "January",
      "amount": 25000.0,
      "transactionDate": "2025-01-05",
      "comments": "January rent"
    }
  ]
  ```

## Database Configuration

### Automatic Database Selection
Spring Boot automatically chooses the right database based on the active profile:

| Profile | Database | Configuration | Command |
|---------|----------|---------------|---------|
| `dev` (default) | H2 | Automatic | `mvn spring-boot:run` |
| `prod` | PostgreSQL | Environment variables | `mvn spring-boot:run -Dspring.profiles.active=prod` |

### Development (H2) - Default
```properties
# application-dev.properties (minimal configuration)
spring.datasource.url=jdbc:h2:file:./data/dev-db;MODE=PostgreSQL;...
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
```

### Production (PostgreSQL)
```properties
# application-prod.properties (minimal configuration)
spring.datasource.driver-class-name=org.postgresql.Driver
spring.h2.console.enabled=false
```

**Database URL provided via environment variables in Docker Compose**

## Database Migrations

Flyway manages database schema and data migrations:

- **V1__init.sql**: Creates tables (property, tenant, transaction)
- **V2__seed.sql**: Seeds initial data

### Adding New Migrations

1. Create new file: `V3__description.sql`
2. Use versioned naming: `V4__`, `V5__`, etc.
3. Flyway runs migrations in order

### Reset Development Database

```bash
# Clear H2 database files
rm -f data/dev-db*

# Restart application
mvn spring-boot:run
```

## Docker Deployment

### Build Image
```bash
docker build -t tenant-management-backend .
```

### Run Container
```bash
# Development (H2)
docker run -p 8080:8080 tenant-management-backend

# Production (PostgreSQL)
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/tenant_management \
  tenant-management-backend
```

### Docker Compose
```bash
# Development with H2 (default)
docker compose up

# Production with PostgreSQL
PROFILE=prod docker compose up
```

## Development

### Prerequisites
- Java 21+
- Maven 3.6+
- Docker (optional)

### Building
```bash
# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package application
mvn clean package

# Skip tests
mvn clean package -DskipTests
```

### Code Quality
```bash
# Check dependencies
mvn dependency:tree

# Analyze dependencies
mvn dependency:analyze

# Generate site documentation
mvn site
```

## Configuration

### Application Properties
Key configuration options in `application.yml`:

- **Database**: H2 (dev) / PostgreSQL (prod)
- **Flyway**: Automatic migration on startup
- **CORS**: Configured for frontend integration
- **Actuator**: Health and metrics endpoints
- **OpenAPI**: Swagger documentation

### Environment Variables
- `SPRING_PROFILES_ACTIVE`: `dev` or `prod`
- `SPRING_DATASOURCE_URL`: Database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password

## Monitoring & Health

### Actuator Endpoints
- `/actuator/health` - Application health
- `/actuator/info` - Application information
- `/actuator/metrics` - Application metrics
- `/actuator/env` - Environment properties

### Logging
- Logback configuration for structured logging
- Different log levels for dev/prod environments
- Request/response logging for debugging

## Application Logs

### Development Mode Logs

#### Direct Maven Execution
```bash
# View logs in terminal
mvn spring-boot:run

# Enable debug logging
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"

# Enable trace logging
mvn spring-boot:run -Dspring-boot.run.arguments="--trace"
```

#### Log Output Locations
- **Console**: Direct terminal output when running Maven
- **File Logging**: Configure in `application.yml` (if enabled)
- **H2 Console**: Database logs at http://localhost:8080/h2-console

### Docker Logs

#### Docker Compose Logs
```bash
# View all service logs
docker compose logs

# View backend logs only
docker compose logs backend

# Follow logs in real-time
docker compose logs -f backend

# View logs with timestamps
docker compose logs -t backend

# View recent logs (last 50 lines)
docker compose logs --tail=50 backend

# View logs from specific time
docker compose logs --since="2024-01-01T00:00:00" backend
```

#### Individual Container Logs
```bash
# View backend container logs
docker logs tenant-management-backend

# Follow logs in real-time
docker logs -f tenant-management-backend

# View logs with timestamps
docker logs -t tenant-management-backend
```

### Log Levels and Configuration

#### Available Log Levels
- **ERROR**: Error conditions
- **WARN**: Warning conditions  
- **INFO**: Informational messages (default)
- **DEBUG**: Debug-level messages
- **TRACE**: Trace-level messages

#### Log Configuration
```yaml
# In application.yml
logging:
  level:
    com.example.tenantmanagement: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

### Log Monitoring

#### Actuator Endpoints
- **Health**: http://localhost:8080/actuator/health
- **Info**: http://localhost:8080/actuator/info
- **Metrics**: http://localhost:8080/actuator/metrics
- **Environment**: http://localhost:8080/actuator/env

#### Database Logs
- **H2 Console**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`, **Password**: (empty)

### Troubleshooting with Logs

#### Common Log Patterns
```bash
# Check for startup errors
docker compose logs backend | grep -i error

# Check for database connection issues
docker compose logs backend | grep -i "datasource\|connection"

# Check for migration issues
docker compose logs backend | grep -i "flyway\|migration"

# Check for CORS issues
docker compose logs backend | grep -i "cors\|origin"
```

#### Log Analysis Commands
```bash
# Filter logs by level
docker compose logs backend | grep -i "ERROR\|WARN"

# Search for specific patterns
docker compose logs backend | grep -i "tenant\|property\|transaction"

# View logs from specific time range
docker compose logs --since="1h" backend
docker compose logs --until="2024-01-01T12:00:00" backend
```

### Production Logging

#### Docker Compose with Log Rotation
```yaml
# Add to docker-compose.yml
services:
  backend:
    # ... existing config
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### Log Aggregation
```bash
# Export logs to file
docker compose logs backend > backend.log

# Compress old logs
gzip backend.log

# View compressed logs
zcat backend.log.gz | grep ERROR
```

## Troubleshooting

### Common Issues

1. **Port 8080 in use**: Change port in `application.yml`
2. **Database connection failed**: Check database is running
3. **Migration errors**: Clear database and restart
4. **CORS errors**: Verify frontend URL in configuration

### Debug Mode
```bash
# Enable debug logging
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"
```

### Database Console
- H2 Console: http://localhost:8080/h2-console (development only)
- JDBC URL: `jdbc:h2:file:./data/dev-db`
- Username: `sa`, Password: (empty)

## API Documentation

Interactive API documentation available at:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## Contributing

1. Follow Java coding standards
2. Add unit tests for new features
3. Update API documentation
4. Test with both H2 and PostgreSQL
5. Ensure Docker build works

## License

This project is licensed under the MIT License.
