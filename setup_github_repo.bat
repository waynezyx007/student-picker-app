@chcp 65001 >nul
@echo off
setlocal enabledelayedexpansion
echo ==============================
echo 设置GitHub远程仓库...
echo ==============================

REM 检查Git是否安装
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Git。请先安装Git后再运行此脚本。
    echo 下载地址: https://git-scm.com/downloads
    pause
    exit /b
)

REM 检查并配置Git用户信息
echo 检查Git用户配置...
git config --global user.email >nul 2>&1
if %errorlevel% neq 0 (
    echo 未检测到Git用户邮箱，正在配置...
    set /p user_email="请输入您的Git邮箱地址: "
    if "!user_email!"=="" (
        set user_email=student-picker@example.com
        echo 使用默认邮箱: !user_email!
    )
    git config --global user.email "!user_email!"
) else (
    for /f "delims=" %%i in ('git config --global user.email') do set current_email=%%i
    echo 当前Git邮箱: !current_email!
)

git config --global user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo 未检测到Git用户名，正在配置...
    set /p user_name="请输入您的Git用户名: "
    if "!user_name!"=="" (
        set user_name=StudentPickerUser
        echo 使用默认用户名: !user_name!
    )
    git config --global user.name "!user_name!"
) else (
    for /f "delims=" %%i in ('git config --global user.name') do set current_name=%%i
    echo 当前Git用户名: !current_name!
)

set repo_url=https://github.com/waynezyx007/student-picker-app.git

echo 设置远程仓库地址...
git remote add origin %repo_url%
if %errorlevel% neq 0 (
    echo 警告: 远程仓库可能已存在，尝试更新...
    git remote set-url origin %repo_url%
)

echo 检查远程仓库设置...
git remote -v

REM 检查本地是否有main或master分支
echo 检查本地分支...
git branch
echo.

REM 尝试创建初始提交（如果没有的话）
echo 检查仓库状态...
git status
echo.

REM 如果没有提交，创建初始提交
git rev-parse HEAD >nul 2>&1
if %errorlevel% neq 0 (
    echo 创建初始提交...
    git add .
    git commit -m "Initial commit: 学生抽选系统"
)

REM 检查当前分支
for /f "delims=" %%i in ('git branch --show-current') do set current_branch=%%i
echo 当前分支: !current_branch!

echo 首次推送代码到GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo 尝试推送到master分支...
    git push -u origin master
    if %errorlevel% neq 0 (
        echo 尝试强制推送到main分支...
        git push -u origin main --force
        if %errorlevel% neq 0 (
            echo 尝试强制推送到master分支...
            git push -u origin master --force
            if %errorlevel% neq 0 (
                echo 错误: 推送失败，请检查网络连接和仓库权限。
                echo.
                echo 请尝试以下解决方案:
                echo 1. 确保您有该仓库的写入权限
                echo 2. 检查网络连接是否正常
                echo 3. 确认仓库URL是否正确: https://github.com/waynezyx007/student-picker-app.git
                echo 4. 如果仓库不是全新的，请尝试手动克隆并合并
                echo.
                pause
                exit /b
            )
        )
    )
)

echo ==============================
echo 远程仓库设置完成！
echo ==============================
pause