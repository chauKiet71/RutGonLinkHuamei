@echo off
REM Docker helper script for Windows

if "%1"=="" goto usage

if "%1"=="start" (
    echo Starting application with Docker...
    if exist .env.docker copy .env.docker .env >nul 2>&1
    docker-compose up --build
    goto end
)

if "%1"=="stop" (
    echo Stopping application...
    docker-compose down
    goto end
)

if "%1"=="restart" (
    echo Restarting application...
    docker-compose restart
    goto end
)

if "%1"=="logs" (
    echo Showing logs...
    docker-compose logs -f app
    goto end
)

if "%1"=="build" (
    echo Building Docker image...
    docker-compose build
    goto end
)

if "%1"=="clean" (
    echo Removing all Docker containers and volumes...
    docker-compose down -v
    goto end
)

:usage
echo NestJS Docker Helper
echo.
echo Usage: docker.bat {start^|stop^|restart^|logs^|build^|clean}
echo.
echo Commands:
echo   start    - Start application (builds if needed)
echo   stop     - Stop application
echo   restart  - Restart application
echo   logs     - Show live logs
echo   build    - Build Docker image
echo   clean    - Remove containers and volumes

:end
