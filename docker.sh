#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

case "$1" in
  start)
    echo -e "${BLUE}Starting application with Docker...${NC}"
    cp .env.docker .env 2>/dev/null || true
    docker-compose up --build
    ;;
  stop)
    echo -e "${BLUE}Stopping application...${NC}"
    docker-compose down
    ;;
  restart)
    echo -e "${BLUE}Restarting application...${NC}"
    docker-compose restart
    ;;
  logs)
    echo -e "${BLUE}Showing logs...${NC}"
    docker-compose logs -f app
    ;;
  build)
    echo -e "${BLUE}Building Docker image...${NC}"
    docker-compose build
    ;;
  clean)
    echo -e "${YELLOW}Removing all Docker containers and volumes...${NC}"
    docker-compose down -v
    ;;
  *)
    echo -e "${GREEN}NestJS Docker Helper${NC}"
    echo ""
    echo "Usage: ./docker.sh {start|stop|restart|logs|build|clean}"
    echo ""
    echo "Commands:"
    echo "  start    - Start application (builds if needed)"
    echo "  stop     - Stop application"
    echo "  restart  - Restart application"
    echo "  logs     - Show live logs"
    echo "  build    - Build Docker image"
    echo "  clean    - Remove containers and volumes"
    ;;
esac
