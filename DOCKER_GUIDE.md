# Docker Setup Guide

This guide explains how to run the NestJS application using Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed (includes Docker Engine and Docker Compose)
- For Windows: Windows 10 Pro or higher

## Quick Start (Recommended)

### 1. Using Docker Compose (All platforms)

```bash
# Copy Docker environment configuration
cp .env.docker .env

# Start the application (builds and runs)
docker-compose up --build

# Open in browser: http://localhost:3000
```

The database will be created automatically and migrations will run.

### 2. Using Helper Scripts

**On Mac/Linux:**
```bash
chmod +x docker.sh
./docker.sh start
```

**On Windows (PowerShell):**
```bash
.\docker.bat start
```

## Configuration Options

### Option A: Local PostgreSQL (Default)

Best for development and testing. Database runs in a container.

```bash
cp .env.docker .env
docker-compose up --build
```

Database credentials are in `.env.docker`:
- Host: `db` (from within Docker network)
- User: `postgres`
- Password: `postgres`
- Database: `neondb`
- Port: `5432`

### Option B: Neon PostgreSQL (Production)

If you have an existing Neon database, use it instead of local PostgreSQL:

```bash
# Set your actual Neon connection string
export DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-1.aws.neon.tech/database?sslmode=require"

# Run only the app container (skip database)
docker-compose up --build app
```

Or edit `.env` before running:
```env
DATABASE_URL="postgresql://..."
```

## Docker Compose Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild images
docker-compose up --build

# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Logs for specific service
docker-compose logs -f app
docker-compose logs -f db

# Stop services
docker-compose stop

# Remove containers
docker-compose down

# Remove containers and volumes (clean everything)
docker-compose down -v

# Restart services
docker-compose restart

# Execute command in container
docker-compose exec app npx prisma studio
```

## Manual Docker Commands

### Build image
```bash
docker build -t rutgon-app:latest .
```

### Run container
```bash
docker run \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  rutgon-app:latest
```

### Interactive shell
```bash
docker-compose exec app sh
```

## Useful Commands

### View database
```bash
# Access Prisma Studio
docker-compose exec app npx prisma studio

# Access PostgreSQL CLI
docker-compose exec db psql -U postgres -d neondb
```

### Run migrations manually
```bash
docker-compose exec app npx prisma migrate dev
```

### Reset database
```bash
# WARNING: This deletes all data!
docker-compose exec app npx prisma migrate reset
```

### Check container status
```bash
docker-compose ps
```

## Troubleshooting

### Port already in use
```bash
# Change port in docker-compose.yml
# Change: "3000:3000" to "3001:3000"
docker-compose up
```

### Permission denied (Mac/Linux)
```bash
chmod +x docker.sh docker-entrypoint.sh
```

### Container exits immediately
```bash
# Check logs
docker-compose logs app

# Rebuild without cache
docker-compose build --no-cache
docker-compose up
```

### Database connection failed
```bash
# Ensure database is healthy
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Need to clear everything and start fresh
```bash
docker-compose down -v
docker system prune
docker-compose up --build
```

## File Structure

```
Dockerfile              # Multi-stage Docker build
docker-compose.yml      # Services configuration
docker-entrypoint.sh    # Startup script (migrations + app start)
.dockerignore          # Files excluded from build
.env.docker            # Example Docker environment variables
docker.sh              # Helper script for Mac/Linux
docker.bat             # Helper script for Windows
```

## Performance Tips

1. **Use .dockerignore** - Reduces build context size
2. **Multi-stage builds** - Smaller final image
3. **Production database** - Use Neon for better performance
4. **Resource limits** - Set in docker-compose.yml if needed

## Deployment

### Push to Docker Hub
```bash
docker tag rutgon-app:latest your-username/rutgon-app:latest
docker push your-username/rutgon-app:latest
```

### Deploy to cloud platforms
- **Vercel**: Docker support via `vercel.json`
- **Railway**: Connect GitHub repo, auto-deploys
- **Render**: Select "Docker" as environment
- **DigitalOcean**: App Platform with Dockerfile
- **AWS ECS**: Push to ECR then deploy
- **Azure**: Container Instances or App Service

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/deployment/docker)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
