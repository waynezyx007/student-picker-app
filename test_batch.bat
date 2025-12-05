@echo off
chcp 65001 >nul

echo 测试批处理文件功能...
echo 当前目录: %cd%
echo.

echo 检查Git配置:
echo -----------------
git --version
echo.
git config --list

echo.
echo 按任意键退出...
pause >nul