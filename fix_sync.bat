@echo off
chcp 65001 >nul

:: 检查Git是否安装
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Git未安装，请先下载安装Git：https://git-scm.com/downloads
    pause
    exit /b 1
)

echo === 修复GitHub同步问题 ===
echo.

:: 拉取远程仓库的最新更改
echo 1. 拉取远程仓库的最新更改...
git fetch origin
if %errorlevel% neq 0 (
    echo 拉取失败，请检查网络连接或仓库URL
    pause
    exit /b 1
)

:: 尝试合并远程更改
echo 2. 合并远程更改...
git merge origin/master --no-ff
if %errorlevel% neq 0 (
    echo 合并失败，存在冲突！请手动解决冲突后重新运行此脚本
    echo 冲突文件：
    git status --short | findstr "UU"
    pause
    exit /b 1
)

:: 如果没有冲突，检查是否有需要提交的更改
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo 3. 没有需要提交的更改
) else (
    echo 3. 添加所有更改到暂存区...
    git add .
    
    echo 4. 提交更改...
    git commit -m "Auto fix sync: %date% %time%"
    if %errorlevel% neq 0 (
        echo 提交失败
        pause
        exit /b 1
    )
)

:: 推送更改到GitHub
echo 5. 推送到GitHub仓库...
git push origin master
if %errorlevel% neq 0 (
    echo 推送失败，尝试强制推送...
    git push origin master --force
    if %errorlevel% neq 0 (
        echo 强制推送也失败，请检查GitHub权限或网络连接
        pause
        exit /b 1
    )
)

echo.
echo === 同步修复完成！ ===
echo 仓库地址：https://github.com/waynezyx007/student-picker-app.git
pause
