# Docker Setup for NodeWave Blog

This project is containerized using Docker and Docker Compose for easy development with live reload.

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

## Services

The application consists of three services:

1. **PostgreSQL Database** - Running on port 5432
2. **Strapi Backend** - Running on port 1337
3. **Vue Frontend** - Running on port 5173

## Quick Start

1. **Copy environment file (optional)**:

   ```bash
   cp .env.docker .env
   ```

2. **Build and start all services**:

   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend/Strapi Admin: http://localhost:1337/admin
   - PostgreSQL: localhost:5432

## Development with Live Reload

The setup includes live reload for both frontend and backend:

- **Frontend**: Vite's hot module replacement (HMR) automatically reloads on file changes
- **Backend**: Strapi's watch mode automatically restarts on file changes
- **Code Changes**: Edit files in `./frontend` or `./backend` directories, and changes will be reflected immediately

## Useful Commands

### Start services in detached mode

```bash
docker-compose up -d
```

### Stop all services

```bash
docker-compose down
```

### Stop and remove volumes (clean database)

```bash
docker-compose down -v
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart a specific service

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild a specific service

```bash
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Execute commands inside containers

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# PostgreSQL shell
docker-compose exec postgres psql -U strapi -d nodewave_blog
```

### Install new dependencies

```bash
# Backend
docker-compose exec backend npm install <package-name>

# Frontend
docker-compose exec frontend npm install <package-name>
```

## Database Management

### Access PostgreSQL

```bash
docker-compose exec postgres psql -U strapi -d nodewave_blog
```

### Backup database

```bash
docker-compose exec postgres pg_dump -U strapi nodewave_blog > backup.sql
```

### Restore database

```bash
docker-compose exec -T postgres psql -U strapi -d nodewave_blog < backup.sql
```

## Troubleshooting

### Ports already in use

If you get port conflicts, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - '5432:5432' # Change to "5433:5432" if 5432 is taken
  - '1337:1337' # Change to "1338:1337" if 1337 is taken
  - '5173:5173' # Change to "3000:5173" if 5173 is taken
```

### Permission issues

If you encounter permission issues with volumes:

```bash
sudo chown -R $USER:$USER backend/public/uploads
```

### Clean start

To completely reset and start fresh:

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Node modules issues

If you have issues with node_modules:

```bash
# Remove local node_modules
rm -rf backend/node_modules frontend/node_modules

# Rebuild containers
docker-compose down
docker-compose up --build
```

## Production Deployment

For production, you should:

1. Create separate Dockerfiles with multi-stage builds
2. Use production environment variables
3. Enable SSL/TLS
4. Use external database services
5. Set up proper volume backups
6. Configure reverse proxy (nginx)

See `docs/PRODUCTION.md` for detailed production setup instructions.

## Notes

- The database data persists in a Docker volume named `postgres_data`
- Uploaded files persist in a Docker volume named `backend_uploads`
- Source code is mounted as volumes for live reload
- Node modules are excluded from volume mounts using anonymous volumes
