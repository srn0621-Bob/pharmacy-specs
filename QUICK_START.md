# 快速开始

## 项目已创建完成 ✓

你的 `pharmacy-specs` 项目已经准备就绪！

## 项目结构

```
pharmacy-specs/
├── .git/                    # Git 仓库（已初始化）
├── .gitignore              # Git 忽略规则
├── README.md               # 项目说明
├── GITHUB_SETUP.md         # GitHub 上传详细指南
├── MIGRATION_GUIDE.md      # 现有 specs 迁移指南
├── QUICK_START.md          # 本文件
├── quick-setup.ps1         # 快速设置脚本
│
├── backend/                # 后端相关规范
│   └── README.md
├── frontend/               # 前端相关规范
│   └── README.md
├── integration/            # 第三方集成规范
│   └── README.md
│
└── templates/              # 规范文档模板
    ├── requirements.md     # 需求模板
    ├── design.md          # 设计模板
    ├── tasks.md           # 任务模板
    ├── CHANGELOG.md       # 变更日志模板
    └── bugs.jsonl         # 问题记录模板
```

## 下一步操作

### 方式 1: 使用快速设置脚本（推荐）

```powershell
# 在 pharmacy-specs 目录下运行
.\quick-setup.ps1
```

脚本会引导你完成：
- Git 配置检查
- 文件提交
- GitHub 远程仓库配置
- 推送到 GitHub

### 方式 2: 手动设置

#### 1. 在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 仓库名称: `pharmacy-specs`
3. 描述: `互联网医院药房商城技术规范文档库`
4. 选择 Private 或 Public
5. **不要勾选** "Initialize this repository with a README"
6. 点击 "Create repository"

#### 2. 关联并推送

```bash
# 进入项目目录
cd pharmacy-specs

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/pharmacy-specs.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

#### 3. 验证

访问你的 GitHub 仓库页面，确认文件已上传。

## 开始使用

### 创建新的 Spec

1. **选择合适的目录**
   - 后端 API: `backend/api/`
   - Webhook: `backend/webhook/`
   - 患者端: `frontend/patient/`
   - 医生端: `frontend/doctor/`
   - 第三方集成: `integration/`

2. **创建 spec 目录**
   ```bash
   mkdir backend/api/my-new-spec
   ```

3. **复制模板文件**
   ```bash
   cp templates/requirements.md backend/api/my-new-spec/
   cp templates/design.md backend/api/my-new-spec/
   cp templates/tasks.md backend/api/my-new-spec/
   ```

4. **编辑文档**
   根据实际需求填写内容

5. **提交到 Git**
   ```bash
   git add .
   git commit -m "[新增] 添加 XXX 功能规范"
   git push
   ```

### 迁移现有 Specs

参考 `MIGRATION_GUIDE.md` 文档，将 `.kiro/specs/` 中的文档迁移到新项目。

推荐步骤：
1. 复制所有 specs 到 `archive/` 目录
2. 根据分类整理到对应目录
3. 清理重复和临时文档
4. 提交到 Git

## 日常使用

### 查看状态
```bash
git status
```

### 提交修改
```bash
git add .
git commit -m "[修改] 更新 XXX 规范"
git push
```

### 拉取更新
```bash
git pull
```

### 查看历史
```bash
git log --oneline
```

## 提交信息规范

使用以下格式：

```
[类型] 简短描述

详细说明（可选）
```

类型：
- `[新增]` - 新增规范文档
- `[修改]` - 修改现有文档
- `[修复]` - 修复文档错误
- `[优化]` - 优化文档结构
- `[删除]` - 删除过时文档
- `[迁移]` - 迁移文档

示例：
```bash
git commit -m "[新增] 添加药品搜索功能规范

- 完成需求分析
- 完成接口设计
- 添加数据库表设计"
```

## 常见问题

### Q: 推送时要求输入密码？

A: GitHub 已不支持密码认证，需要使用 Personal Access Token 或 SSH 密钥。详见 `GITHUB_SETUP.md`。

### Q: 如何邀请团队成员？

A: 在 GitHub 仓库页面：Settings → Collaborators → Add people

### Q: 如何查看某个文件的修改历史？

A: 
```bash
git log --follow -- path/to/file
```

### Q: 如何撤销未提交的修改？

A: 
```bash
# 撤销单个文件
git checkout -- path/to/file

# 撤销所有修改
git checkout .
```

## 获取帮助

- **GitHub 文档**: https://docs.github.com/
- **Git 教程**: https://git-scm.com/book/zh/v2
- **项目 README**: 查看 `README.md`
- **GitHub 设置**: 查看 `GITHUB_SETUP.md`
- **迁移指南**: 查看 `MIGRATION_GUIDE.md`

---

祝使用愉快！🚀
