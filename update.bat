@echo off
REM ===================================
REM Juice Finder - Script de mise à jour
REM ===================================
setlocal enabledelayedexpansion

echo =============================
echo  JUICE FINDER UPDATE
echo =============================
echo.

REM Configuration
set "REPO_PATH=%~dp0"
set "ERROR_LEVEL=0"

REM Vérifier si on est dans le bon répertoire
if not exist "%REPO_PATH%package.json" (
    echo [ERREUR] package.json introuvable. Verifiez le chemin.
    exit /b 1
)

cd /d "%REPO_PATH%"

REM 1. Git fetch et pull
echo [1/5] Git fetch et pull...
git fetch --all
if errorlevel 1 (
    echo [ERREUR] Echec du git fetch
    exit /b 2
)

git pull --rebase
if errorlevel 1 (
    echo [ERREUR] Echec du git pull
    exit /b 3
)
echo [OK] Code mis a jour.
echo.

REM 2. Installation des dépendances
echo [2/5] Installation des dependances...
if exist package-lock.json (
    call npm ci
) else (
    call npm install
)
if errorlevel 1 (
    echo [ERREUR] Echec installation dependances
    exit /b 4
)
echo [OK] Dependances installees.
echo.

REM 3. Génération Prisma
echo [3/5] Prisma generate...
call npx prisma generate
if errorlevel 1 (
    echo [ERREUR] Echec prisma generate
    exit /b 5
)
echo [OK] Client Prisma genere.
echo.

REM 4. Migrations Prisma
echo [4/5] Prisma migrate deploy...
call npx prisma migrate deploy
if errorlevel 1 (
    echo [ERREUR] Echec migrations
    exit /b 6
)
echo [OK] Migrations appliquees.
echo.

REM 5. Build Next.js
echo [5/5] Build Next.js...
call npm run build
if errorlevel 1 (
    echo [AVERTISSEMENT] Le build a echoue, verifiez manuellement.
    set "ERROR_LEVEL=7"
) else (
    echo [OK] Build termine.
)
echo.

if %ERROR_LEVEL% equ 0 (
    echo =============================
    echo  UPDATE TERMINE AVEC SUCCES
    echo =============================
) else (
    echo =============================
    echo  UPDATE TERMINE AVEC WARNINGS
    echo =============================
)

endlocal
exit /b %ERROR_LEVEL%

