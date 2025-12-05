@echo off
chcp 65001 >nul

REM 简单版本的同步脚本

set GITHUB_REPO=https://github.com/waynezyx007/student-picker-app.git
set BRANCH=master

echo 学生抽选系统 - 简单同步工具
echo ------------------------
echo.

REM 检查Git是否存在
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Git。请先安装Git。
    echo 下载地址: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo 1. 正在添加所有文件...
git add .
git add --update .

echo 2. 正在提交更改...
git commit -m "自动同步: %date% %time%" 2>nul
if %errorlevel% neq 0 (
    echo    没有需要提交的更改
)

echo 3. 正在推送到GitHub...
git push %GITHUB_REPO% %BRANCH%

if %errorlevel% equ 0 (
    echo.  
    echo 同步成功！
    echo 您的文件已上传到GitHub仓库。
) else (
    echo.  
    echo 同步失败！
    echo 请检查：
    echo - 网络连接是否正常
    echo - 是否有GitHub访问权限
    echo - 仓库地址是否正确
)

echo.
echo 按任意键退出...
pause >nul