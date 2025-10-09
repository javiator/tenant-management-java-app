# Tenant Management System - Java Spring Boot + React

A full-stack tenant management application with Spring Boot backend and React frontend, designed for containerized deployment.

## Project Structure

```
tenant-management-java-app/
├── backend/                 # Spring Boot application
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── docker-compose.yml   # Backend-only compose
├── backend-mcp/             # MCP server exposing backend APIs (TypeScript/Node)
├── frontend/                # React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml       # Full-stack orchestration
└── README.md
```

> The Python/uv MCP server now lives in its own repository (`tenant-management-mcp`). Clone it alongside this project when you need MCP access from Python-based agents.

## Technology Stack

### Backend
- **Java 21** with Spring Boot 3.3.4
- **Spring Data JPA** for database operations
- **H2** (development) / **PostgreSQL** (production)
- **Flyway** for database migrations
- **Springdoc OpenAPI** for API documentation
- **Docker** for containerization

### Frontend
- **React 18** with modern hooks
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Nginx** for production serving

### MCP Servers
- **Node.js 20** with TypeScript (`backend-mcp/`) using `@modelcontextprotocol/server`
- **Python 3.11+** with `uv` (see the separate [`tenant-management-mcp`](https://github.com/javiator/tenant-management-mcp) repo) using the `mcp` FastMCP implementation, `pydantic`, and `httpx`

## Quick Start

### Option 1: Full Stack with Docker Compose (Recommended)

```bash
# Development (H2 Database) - Default
docker compose up --build

# Production (PostgreSQL Database)
PROFILE=prod docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# API Docs: http://localhost:8080/swagger-ui.html
# H2 Console (dev only): http://localhost:8080/h2-console
```

### Option 2: Development Mode

#### Backend Only
```bash
cd backend
# Development with H2 (default)
mvn spring-boot:run

# Production with PostgreSQL (requires PostgreSQL running)
mvn spring-boot:run -Dspring.profiles.active=prod
```

#### Frontend Only
```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

#### MCP Server Only
```bash
cd backend-mcp
npm install
cp .env.example .env   # adjust BACKEND_MCP_BASE_URL if needed
npm run dev            # Starts MCP server on stdio for compatible clients

cd ../tenant-management-mcp
uv sync
uv run backend-mcp-uv --transport streamable-http  # HTTP transport for local testing
```

## API Endpoints

### Properties
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create property
- `PUT /api/properties/{id}` - Update property
- `DELETE /api/properties/{id}` - Delete property

### Tenants
- `GET /api/tenants` - List all tenants
- `POST /api/tenants` - Create tenant
- `PUT /api/tenants/{id}` - Update tenant
- `DELETE /api/tenants/{id}` - Delete tenant

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

## Database

### Automatic Database Selection
The application automatically chooses the right database based on the Spring profile:

| Environment | Command | Database | Access |
|-------------|---------|----------|---------|
| **Development** | `docker compose up` | H2 | H2 Console: http://localhost:8080/h2-console |
| **Production** | `PROFILE=prod docker compose up` | PostgreSQL | Database connection required |

### Development (H2)
- File-based database with console at `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/dev-db`
- Username: `sa`, Password: (empty)
- **No external database required**

### Production (PostgreSQL)
- Persistent database with Docker volume
- Automatically started with `PROFILE=prod docker compose up`
- Connection details configured automatically

## Features

- **Property Management**: Add, edit, delete properties
- **Tenant Management**: Track tenant details, contracts, payments
- **Transaction Management**: Record rent payments and other transactions
- **Responsive UI**: Modern React interface with Tailwind CSS
- **API Documentation**: Interactive Swagger UI
- **Health Monitoring**: Spring Boot Actuator endpoints

## Development

### Backend Development
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### MCP Server Development
```bash
cd backend-mcp
npm install
npm run dev      # hot-reloads with tsx
npm run build    # produce dist/ output
```

### Database Migrations
- Flyway migrations in `backend/src/main/resources/db/migration/`
- Add new migrations with version numbers (V3__, V4__, etc.)

## Deployment

### Docker Production Build
```bash
# Build and run with production database
docker compose -f docker-compose.yml up --build
```

### Individual Service Deployment
```bash
# Backend only
cd backend
docker compose up

# Frontend only (requires backend running)
cd frontend
docker build -t tenant-frontend .
docker run -p 3000:3000 tenant-frontend
```

## Configuration

### Simple Environment-Based Configuration
The application uses a **single configuration** that automatically switches databases:

```bash
# Development (H2) - Default
docker compose up

# Production (PostgreSQL) - Just set environment variable
PROFILE=prod docker compose up
```

### Environment Variables
- `PROFILE`: `dev` (default, H2) or `prod` (PostgreSQL)
- `REACT_APP_API_URL`: Backend API URL for frontend

### Database Configuration
- **Development**: H2 file-based database (automatic)
- **Production**: PostgreSQL with persistent storage (automatic)

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8080, 5432 are available
2. **Database connection**: Check PostgreSQL container is running
3. **Frontend API calls**: Verify `REACT_APP_API_URL` points to backend
4. **Migration errors**: Clear H2 database files and restart

### Reset Database
```bash
# For H2 development
rm -f backend/data/dev-db*
docker compose up

# For PostgreSQL production
docker compose down -v
PROFILE=prod docker compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker Compose
5. Submit a pull request

## License

This project is licensed under the MIT License.
