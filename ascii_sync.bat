@echo off

rem Simple GitHub sync script
rem This script uses only ASCII characters to avoid encoding issues

set GITHUB_REPO=https://github.com/waynezyx007/student-picker-app.git
set BRANCH=master

echo Student Picker - GitHub Sync Tool
echo --------------------------------
echo.

rem Check if Git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git not found. Please install Git first.
    echo Download: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo 1. Adding all files...
git add .
git add --update .

echo 2. Committing changes...
git commit -m "Auto sync: %date% %time%" 2>nul
if %errorlevel% neq 0 (
    echo    No changes to commit
)

echo 3. Pushing to GitHub...
git push %GITHUB_REPO% %BRANCH%

if %errorlevel% equ 0 (
    echo.  
    echo SYNC SUCCESSFUL!
    echo Your files have been uploaded to GitHub.
) else (
    echo.  
    echo SYNC FAILED!
    echo Please check:
    echo - Network connection
    echo - GitHub access permissions
    echo - Repository URL
)

echo.
echo Press any key to exit...
pause >nul