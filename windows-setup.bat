@echo off
REM ── Windows Setup ──────────────────────────────────────────────────────────
REM Run this on a fresh Windows machine to get everything ready for google-scrape.
REM Usage: Right-click > Run as Administrator, or: windows-setup.bat
REM ───────────────────────────────────────────────────────────────────────────

echo.
echo  Google Scrape - Windows Setup
echo ===============================
echo.

REM ── Check for Python ───────────────────────────────────────────────────────
echo [1/4] Checking for Python...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    Python not found. Attempting to install via winget...
    where winget >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo    ERROR: Neither Python nor winget found.
        echo    Please install Python 3.10+ manually from https://www.python.org/downloads/
        echo    Make sure to check "Add Python to PATH" during installation.
        echo.
        pause
        exit /b 1
    )
    winget install Python.Python.3.12 --accept-source-agreements --accept-package-agreements
    echo.
    echo    Python installed. You may need to restart this terminal and run setup again.
    echo    Make sure Python is in your PATH.
    pause
    exit /b 0
)

REM ── Verify Python version ──────────────────────────────────────────────────
echo [2/4] Verifying Python version...
python --version 2>&1 | findstr /R "3\.1[0-9] 3\.[2-9][0-9]" >nul
if %ERRORLEVEL% NEQ 0 (
    echo    WARNING: Python 3.10+ is required. Your version may be too old.
    echo    Download the latest from https://www.python.org/downloads/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo    Found: %%v

REM ── Install pip dependencies ───────────────────────────────────────────────
echo [3/4] Installing Python packages...
python -m pip install --upgrade pip 2>nul
python -m pip install requests beautifulsoup4 rich

REM ── Install Git (optional) ─────────────────────────────────────────────────
echo [4/4] Checking for Git...
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    Git not found. Installing via winget...
    where winget >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        winget install Git.Git --accept-source-agreements --accept-package-agreements
    ) else (
        echo    Git not found and winget unavailable. Install Git from https://git-scm.com
    )
) else (
    echo    Git found.
)

echo.
echo =============================================
echo  All set! You can now run:
echo.
echo    python scrape.py "your query" --level low
echo    python scrape.py "your query" --level medium
echo    python scrape.py "your query" --level high
echo.
echo  Or use the quick scripts in Git Bash / WSL:
echo    ./scrape-low  "your query"
echo    ./scrape-med  "your query"
echo    ./scrape-high "your query"
echo =============================================
echo.
pause
