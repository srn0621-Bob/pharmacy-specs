# Pharmacy Specs 快速设置脚本
# 用于快速初始化和推送到 GitHub

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Pharmacy Specs 快速设置向导" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "README.md")) {
    Write-Host "错误: 请在 pharmacy-specs 目录下运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查 Git 是否已初始化
if (-not (Test-Path ".git")) {
    Write-Host "初始化 Git 仓库..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git 仓库已初始化" -ForegroundColor Green
} else {
    Write-Host "✓ Git 仓库已存在" -ForegroundColor Green
}

# 检查 Git 配置
Write-Host ""
Write-Host "检查 Git 配置..." -ForegroundColor Yellow
$userName = git config user.name
$userEmail = git config user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "需要配置 Git 用户信息" -ForegroundColor Yellow
    $userName = Read-Host "请输入你的名字"
    $userEmail = Read-Host "请输入你的邮箱"
    
    git config --global user.name $userName
    git config --global user.email $userEmail
    Write-Host "✓ Git 配置已完成" -ForegroundColor Green
} else {
    Write-Host "✓ Git 已配置: $userName <$userEmail>" -ForegroundColor Green
}

# 添加所有文件
Write-Host ""
Write-Host "添加文件到 Git..." -ForegroundColor Yellow
git add .
Write-Host "✓ 文件已添加" -ForegroundColor Green

# 检查是否有提交
$hasCommits = git log --oneline 2>$null
if (-not $hasCommits) {
    Write-Host ""
    Write-Host "创建初始提交..." -ForegroundColor Yellow
    git commit -m "初始化 pharmacy-specs 项目"
    Write-Host "✓ 初始提交已完成" -ForegroundColor Green
} else {
    Write-Host ""
    $commitMsg = Read-Host "输入提交信息（留空跳过提交）"
    if ($commitMsg) {
        git commit -m $commitMsg
        Write-Host "✓ 提交已完成" -ForegroundColor Green
    }
}

# 询问是否配置远程仓库
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "GitHub 远程仓库配置" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$configRemote = Read-Host "是否配置 GitHub 远程仓库? (y/n)"

if ($configRemote -eq "y" -or $configRemote -eq "Y") {
    # 检查是否已有远程仓库
    $remoteUrl = git remote get-url origin 2>$null
    
    if ($remoteUrl) {
        Write-Host "当前远程仓库: $remoteUrl" -ForegroundColor Yellow
        $changeRemote = Read-Host "是否修改远程仓库地址? (y/n)"
        
        if ($changeRemote -eq "y" -or $changeRemote -eq "Y") {
            $newUrl = Read-Host "输入新的仓库地址"
            git remote set-url origin $newUrl
            Write-Host "✓ 远程仓库地址已更新" -ForegroundColor Green
        }
    } else {
        Write-Host ""
        Write-Host "请先在 GitHub 创建仓库，然后输入仓库地址" -ForegroundColor Yellow
        Write-Host "格式示例: https://github.com/username/pharmacy-specs.git" -ForegroundColor Gray
        Write-Host "或 SSH: git@github.com:username/pharmacy-specs.git" -ForegroundColor Gray
        Write-Host ""
        
        $repoUrl = Read-Host "输入 GitHub 仓库地址"
        
        if ($repoUrl) {
            git remote add origin $repoUrl
            Write-Host "✓ 远程仓库已添加" -ForegroundColor Green
        }
    }
    
    # 询问是否推送
    Write-Host ""
    $doPush = Read-Host "是否立即推送到 GitHub? (y/n)"
    
    if ($doPush -eq "y" -or $doPush -eq "Y") {
        Write-Host ""
        Write-Host "推送到 GitHub..." -ForegroundColor Yellow
        
        # 检查当前分支名
        $currentBranch = git branch --show-current
        
        if (-not $currentBranch) {
            # 如果没有分支名，创建 main 分支
            git branch -M main
            $currentBranch = "main"
        }
        
        Write-Host "推送分支: $currentBranch" -ForegroundColor Gray
        
        try {
            git push -u origin $currentBranch
            Write-Host ""
            Write-Host "✓ 推送成功！" -ForegroundColor Green
            Write-Host ""
            Write-Host "你的仓库地址: $repoUrl" -ForegroundColor Cyan
        } catch {
            Write-Host ""
            Write-Host "推送失败，可能需要身份验证" -ForegroundColor Red
            Write-Host "请参考 GITHUB_SETUP.md 文档配置认证" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host ""
    Write-Host "跳过远程仓库配置" -ForegroundColor Gray
    Write-Host "稍后可以手动配置，参考 GITHUB_SETUP.md 文档" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "设置完成！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "1. 查看 README.md 了解项目结构" -ForegroundColor White
Write-Host "2. 查看 MIGRATION_GUIDE.md 了解如何迁移现有 specs" -ForegroundColor White
Write-Host "3. 查看 GITHUB_SETUP.md 了解 GitHub 使用详情" -ForegroundColor White
Write-Host "4. 使用 templates/ 目录下的模板创建新的 spec" -ForegroundColor White
Write-Host ""

# 显示当前状态
Write-Host "当前 Git 状态:" -ForegroundColor Cyan
git status --short
Write-Host ""

Read-Host "按 Enter 键退出"
