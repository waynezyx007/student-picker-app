<#
.SYNOPSIS
学生抽选系统 - GitHub同步工具

.DESCRIPTION
一键同步本地文件到GitHub仓库，支持新增、修改和删除的文件同步

.EXAMPLE
直接双击运行或在PowerShell中执行: .\sync_to_github.ps1
#>

# 设置UTF-8编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 清除屏幕
Clear-Host

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "学生抽选系统 - GitHub同步工具" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host

# 检查Git是否安装
Write-Host "1. 检查Git是否安装..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "   ✓ Git已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   错误: 未检测到Git。请先安装Git后再运行此脚本。" -ForegroundColor Red
    Write-Host "   下载地址: https://git-scm.com/downloads" -ForegroundColor Red
    Read-Host "按Enter键退出..."
    exit 1
}

# 检查是否在Git仓库中
Write-Host
Write-Host "2. 检查Git仓库状态..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "   正在初始化Git仓库..." -ForegroundColor Yellow
    try {
        git init
        Write-Host "   ✓ Git仓库初始化完成" -ForegroundColor Green
        
        Write-Host "   设置GitHub远程仓库..." -ForegroundColor Yellow
        git remote add origin https://github.com/waynezyx007/student-picker-app.git
        Write-Host "   ✓ GitHub远程仓库设置完成" -ForegroundColor Green
    } catch {
        Write-Host "   错误: Git仓库初始化失败。" -ForegroundColor Red
        Read-Host "按Enter键退出..."
        exit 1
    }
} else {
    Write-Host "   ✓ 已在Git仓库中" -ForegroundColor Green
}

# 检查远程仓库连接
Write-Host
Write-Host "3. 检查远程仓库连接..." -ForegroundColor Yellow
try {
    $remoteInfo = git remote -v
    Write-Host $remoteInfo
} catch {
    Write-Host "   重新设置GitHub远程仓库..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin https://github.com/waynezyx007/student-picker-app.git
    Write-Host "   ✓ 远程仓库重新设置完成" -ForegroundColor Green
}

# 拉取最新代码
Write-Host
Write-Host "4. 拉取GitHub最新代码..." -ForegroundColor Yellow
try {
    git pull origin master --rebase
    Write-Host "   ✓ 已获取最新代码" -ForegroundColor Green
} catch {
    Write-Host "   注意: 拉取代码失败，可能存在冲突或网络问题。" -ForegroundColor Yellow
    Write-Host "   继续尝试同步本地更改..." -ForegroundColor Yellow
}

# 显示当前文件状态
Write-Host
Write-Host "5. 当前文件变更状态：" -ForegroundColor Yellow
git status

# 添加所有文件到暂存区
Write-Host
Write-Host "6. 添加所有更改到暂存区..." -ForegroundColor Yellow
try {
    git add .
    git add --update .
    Write-Host "   ✓ 所有更改已添加到暂存区" -ForegroundColor Green
} catch {
    Write-Host "   错误: 添加文件失败。" -ForegroundColor Red
    Read-Host "按Enter键退出..."
    exit 1
}

# 检查是否有更改需要提交
Write-Host
Write-Host "7. 检查是否有更改需要提交..." -ForegroundColor Yellow
try {
    $hasChanges = git diff-index --quiet HEAD --
    if (-not $LASTEXITCODE) {
        Write-Host "   ✓ 没有检测到任何更改，仓库已与GitHub保持一致！" -ForegroundColor Green
        Read-Host "按Enter键退出..."
        exit 0
    }
} catch {
    Write-Host "   警告: 无法检查更改状态，继续执行..." -ForegroundColor Yellow
}

# 提交更改
Write-Host
Write-Host "8. 提交本地更改..." -ForegroundColor Yellow
Write-Host "   按Enter使用默认提交信息，或输入自定义信息后按Enter："
$commitMsg = Read-Host
if ([string]::IsNullOrEmpty($commitMsg)) {
    $commitMsg = "自动同步: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

try {
    git commit -m "$commitMsg"
    Write-Host "   ✓ 更改已提交" -ForegroundColor Green
} catch {
    Write-Host "   错误: 提交失败。" -ForegroundColor Red
    Read-Host "按Enter键退出..."
    exit 1
}

# 推送到GitHub
Write-Host
Write-Host "9. 推送到GitHub仓库..." -ForegroundColor Yellow
try {
    git push origin master
    Write-Host "   ✓ 成功推送到GitHub" -ForegroundColor Green
} catch {
    try {
        Write-Host "   尝试推送到main分支..." -ForegroundColor Yellow
        git push origin main
        Write-Host "   ✓ 成功推送到GitHub main分支" -ForegroundColor Green
    } catch {
        try {
            Write-Host "   尝试强制推送..." -ForegroundColor Yellow
            git push origin master --force
            Write-Host "   ✓ 成功强制推送到GitHub" -ForegroundColor Green
        } catch {
            Write-Host "   错误: 推送失败。请检查网络连接和GitHub权限。" -ForegroundColor Red
            Write-Host "   建议：确保您有仓库的写入权限，网络连接正常。" -ForegroundColor Yellow
            Read-Host "按Enter键退出..."
            exit 1
        }
    }
}

# 完成
Write-Host
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✓ 同步完成！" -ForegroundColor Green
Write-Host "所有文件的增减变化已成功同步到GitHub仓库。" -ForegroundColor Cyan
Write-Host "仓库地址: https://github.com/waynezyx007/student-picker-app.git" -ForegroundColor Cyan
Write-Host "您可以在浏览器中打开上述地址查看同步结果。" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Read-Host "按Enter键退出..."
