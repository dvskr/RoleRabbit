@echo off
echo.
echo ================================================================
echo   DEPLOYING EMBEDDING-BASED ATS SYSTEM
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/2] Checking configuration...
findstr /C:"ATS_USE_EMBEDDINGS=true" .env >nul
if %errorlevel% equ 0 (
    echo       [OK] ATS_USE_EMBEDDINGS=true
) else (
    echo       [FAIL] Feature flag not set!
    echo.
    echo Please ensure .env contains: ATS_USE_EMBEDDINGS=true
    pause
    exit /b 1
)

echo.
echo [2/2] Starting backend with embeddings enabled...
echo.
echo ================================================================
echo   BACKEND STARTING
echo   Port: 5001
echo   Embeddings: ENABLED
echo ================================================================
echo.
echo Backend will start now. Keep this window open!
echo.
echo To test: Open another terminal and run:
echo   cd apps\api
echo   node test-embedding-ats-live.js
echo.
echo ================================================================
echo.

npm run dev

