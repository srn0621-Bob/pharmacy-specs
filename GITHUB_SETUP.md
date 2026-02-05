# GitHub 上传指南

## 前置准备

1. 确保已安装 Git
2. 拥有 GitHub 账号
3. 配置 Git 用户信息（如果还没配置）

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

## 步骤 1: 在 GitHub 创建仓库

1. 登录 GitHub (https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `pharmacy-specs` (或你喜欢的名称)
   - **Description**: `互联网医院药房商城技术规范文档库`
   - **Visibility**: 
     - Private (私有仓库，推荐用于内部项目)
     - Public (公开仓库)
   - **不要勾选** "Initialize this repository with a README"（我们已经有了）
4. 点击 "Create repository"

## 步骤 2: 关联远程仓库

在本地项目目录执行以下命令：

```bash
# 进入项目目录
cd pharmacy-specs

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/pharmacy-specs.git

# 或使用 SSH（需要先配置 SSH 密钥）
git remote add origin git@github.com:YOUR_USERNAME/pharmacy-specs.git
```

## 步骤 3: 推送到 GitHub

```bash
# 推送到远程仓库的 main 分支
git push -u origin master

# 如果 GitHub 默认分支是 main，可以重命名本地分支
git branch -M main
git push -u origin main
```

## 步骤 4: 验证上传

1. 刷新 GitHub 仓库页面
2. 确认所有文件已成功上传
3. 查看 README.md 是否正确显示

## 后续使用

### 添加新文件或修改

```bash
# 查看状态
git status

# 添加所有修改
git add .

# 或添加特定文件
git add path/to/file

# 提交修改
git commit -m "描述你的修改"

# 推送到远程
git push
```

### 拉取最新代码

```bash
git pull
```

### 查看提交历史

```bash
git log --oneline
```

## 常见问题

### 问题 1: 推送时要求输入用户名密码

**解决方案 1**: 使用 Personal Access Token (推荐)

1. 在 GitHub 设置中生成 Personal Access Token
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 点击 "Generate new token"
   - 勾选 `repo` 权限
   - 生成并保存 token
2. 推送时使用 token 作为密码

**解决方案 2**: 配置 SSH 密钥

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 将公钥添加到 GitHub
# 复制 ~/.ssh/id_ed25519.pub 的内容
# 在 GitHub Settings → SSH and GPG keys 中添加
```

### 问题 2: 推送被拒绝 (rejected)

```bash
# 先拉取远程更改
git pull --rebase origin main

# 解决冲突后推送
git push
```

### 问题 3: 修改远程仓库地址

```bash
# 查看当前远程仓库
git remote -v

# 修改远程仓库地址
git remote set-url origin NEW_URL
```

## 分支管理建议

```bash
# 创建开发分支
git checkout -b develop

# 创建功能分支
git checkout -b feature/new-spec

# 合并分支
git checkout main
git merge feature/new-spec

# 删除已合并的分支
git branch -d feature/new-spec
```

## .gitignore 说明

项目已配置 `.gitignore` 文件，以下类型的文件不会被提交：

- 操作系统临时文件 (.DS_Store, Thumbs.db)
- 编辑器配置文件 (.vscode/, .idea/)
- 临时文件和备份 (*.tmp, *.bak)
- 敏感信息文件 (*secret*, *password*)
- 个人笔记 (NOTES.md, TODO.md)

## 协作建议

1. **提交前检查**: 使用 `git status` 和 `git diff` 检查修改
2. **清晰的提交信息**: 使用有意义的 commit message
3. **小步提交**: 每次提交只包含一个逻辑修改
4. **定期同步**: 经常 pull 和 push，避免冲突累积
5. **使用分支**: 重要修改在分支上进行，测试通过后再合并

## 提交信息规范

建议使用以下格式：

```
[类型] 简短描述

详细说明（可选）

相关 Issue: #123
```

类型示例：
- `[新增]` - 新增规范文档
- `[修改]` - 修改现有文档
- `[修复]` - 修复文档错误
- `[优化]` - 优化文档结构或内容
- `[删除]` - 删除过时文档

示例：
```bash
git commit -m "[新增] 添加药房接口集成规范

- 完成需求分析
- 完成设计方案
- 添加实施任务清单"
```

---

如有问题，请参考 [GitHub 官方文档](https://docs.github.com/)
