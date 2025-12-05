@echo off
chcp 65001 >nul
echo ==========================================
echo 学生抽选系统 - GitHub同步工具
echo ==========================================
echo.

:: 检查Git是否安装
echo 1. 检查Git是否安装...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   错误: 未检测到Git。请先安装Git后再运行此脚本。
    echo   下载地址: https://git-scm.com/downloads
    pause
    exit /b
)
echo   ✓ Git已安装

:: 检查是否在Git仓库中
echo.  
echo 2. 检查Git仓库状态...
if not exist .git (
    echo   正在初始化Git仓库...
    git init
    if %errorlevel% neq 0 (
        echo   错误: Git仓库初始化失败。
        pause
        exit /b
    )
    echo   ✓ Git仓库初始化完成
    
    echo   设置GitHub远程仓库...
    git remote add origin https://github.com/waynezyx007/student-picker-app.git
    echo   ✓ GitHub远程仓库设置完成
) else (
    echo   ✓ 已在Git仓库中
)

:: 检查远程仓库连接
echo.
echo 3. 检查远程仓库连接...
git remote -v
if %errorlevel% neq 0 (
    echo   重新设置GitHub远程仓库...
    git remote remove origin 2>nul
    git remote add origin https://github.com/waynezyx007/student-picker-app.git
    echo   ✓ 远程仓库重新设置完成
)

:: 拉取最新代码（避免冲突）
echo.
echo 4. 拉取GitHub最新代码...
git pull origin master --rebase 2>nul
if %errorlevel% neq 0 (
    echo   注意: 拉取代码失败，可能存在冲突或网络问题。
    echo   继续尝试同步本地更改...
) else (
    echo   ✓ 已获取最新代码
)

:: 显示当前文件状态
echo.
echo 5. 当前文件变更状态：
git status

:: 添加所有文件到暂存区（包括新增、修改和删除的文件）
echo.
echo 6. 添加所有更改到暂存区...
git add .
git add --update .
if %errorlevel% neq 0 (
    echo   错误: 添加文件失败。
    pause
    exit /b
)
echo   ✓ 所有更改已添加到暂存区

:: 检查是否有更改需要提交
echo.
echo 7. 检查是否有更改需要提交...
git diff-index --quiet HEAD --
if %errorlevel% equ 0 (
    echo   ✓ 没有检测到任何更改，仓库已与GitHub保持一致！
    pause
    exit /b
)

:: 提交更改
echo.
echo 8. 提交本地更改...
echo   按Enter使用默认提交信息，或输入自定义信息后按Enter：
set /p commit_msg=
if "%commit_msg%"=="" (
    set commit_msg=自动同步: %date% %time%
)
git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo   错误: 提交失败。
    pause
    exit /b
)
echo   ✓ 更改已提交

:: 推送到GitHub
echo.
echo 9. 推送到GitHub仓库...
git push origin master
if %errorlevel% neq 0 (
    echo   尝试推送到main分支...
    git push origin main
    if %errorlevel% neq 0 (
        echo   尝试强制推送...
        git push origin master --force
        if %errorlevel% neq 0 (
            echo   错误: 推送失败。请检查网络连接和GitHub权限。
            echo   建议：确保您有仓库的写入权限，网络连接正常。
            pause
            exit /b
        )
    )
)
echo   ✓ 成功推送到GitHub

:: 完成
echo.
echo ==========================================
echo ✓ 同步完成！
echo 所有文件的增减变化已成功同步到GitHub仓库。
echo 仓库地址: https://github.com/waynezyx007/student-picker-app.git
echo 您可以在浏览器中打开上述地址查看同步结果。
echo ==========================================
pause