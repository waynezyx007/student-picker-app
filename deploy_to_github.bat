@chcp 65001 >nul
@echo off
setlocal enabledelayedexpansion
echo ==========================================
echo 正在部署学生抽选系统到GitHub...
echo ==========================================

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

REM 检查是否已初始化Git仓库
if not exist .git (
    echo 初始化Git仓库...
    git init
    if %errorlevel% neq 0 (
        echo 错误: Git仓库初始化失败。
        pause
        exit /b
    )
)

REM 添加所有文件到暂存区
echo 添加所有文件到暂存区...
git add .
if %errorlevel% neq 0 (
    echo 错误: 添加文件到暂存区失败。
    pause
    exit /b
)

REM 检查是否有更改需要提交
git diff-index --quiet HEAD >nul 2>&1
if %errorlevel% equ 0 (
    echo 没有检测到文件更改，跳过提交...
) else (
    REM 提交更改
    echo 提交更改...
    git commit -m "更新学生抽选系统"
    if %errorlevel% neq 0 (
        echo 错误: 提交更改失败。
        pause
        exit /b
    )
)

REM 检查是否存在远程仓库
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo 自动设置远程仓库地址...
    git remote add origin https://github.com/waynezyx007/student-picker-app.git
    if %errorlevel% neq 0 (
        echo 错误: 设置远程仓库失败。
        pause
        exit /b
    )
)

REM 检查远程仓库地址是否正确
echo 检查远程仓库地址...
git remote -v | findstr "origin"
if %errorlevel% neq 0 (
    echo 警告: 无法验证远程仓库地址。
)

REM 检查当前分支
for /f "delims=" %%i in ('git branch --show-current') do set current_branch=%%i
echo 当前分支: !current_branch!

REM 推送到GitHub
echo 推送到GitHub...
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
                echo.
                pause
                exit /b
            )
        )
    )
)

echo ==============================
echo 部署完成！
echo ==============================
pause