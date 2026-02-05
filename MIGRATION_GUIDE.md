# Specs 迁移指南

本文档说明如何将现有的 specs 文档从 `.kiro/specs/` 迁移到独立的 `pharmacy-specs` 项目。

## 迁移策略

### 方案 1: 复制迁移（推荐）

保留原有 specs 在 `.kiro/specs/` 中，同时复制到新项目。

**优点**:
- 不影响现有工作流
- 可以逐步迁移
- 保留历史记录

**步骤**:

```bash
# 1. 复制整个 specs 目录到新项目的 archive 目录
cp -r .kiro/specs/* pharmacy-specs/archive/

# 2. 根据分类整理到对应目录
# 例如：将 API 相关的移到 backend/api/
# 将前端相关的移到 frontend/patient/ 或 frontend/doctor/
```

### 方案 2: 移动迁移

将 specs 从原位置移动到新项目。

**优点**:
- 避免重复
- 统一管理

**缺点**:
- 需要更新引用路径
- 可能影响现有工作流

## 目录映射建议

根据现有 specs 的内容，建议按以下方式分类：

### 后端 API 相关
```
.kiro/specs/api-farmacy-interface/          → backend/api/pharmacy-interface/
.kiro/specs/api-compatibility-audit/        → backend/api/compatibility-audit/
.kiro/specs/api-field-mapping/              → backend/api/field-mapping/
.kiro/specs/doc-pharmacy-api/               → backend/api/pharmacy-api-doc/
```

### Webhook 相关
```
.kiro/specs/logistics-webhook/              → backend/webhook/logistics/
.kiro/specs/logistics-webhook-appsecret/    → backend/webhook/logistics-auth/
.kiro/specs/prescription-audit-webhook/     → backend/webhook/prescription-audit/
```

### 患者端前端
```
.kiro/specs/patient-drug-mall/              → frontend/patient/drug-mall/
.kiro/specs/patient-mall-ui-*/              → frontend/patient/mall-ui/
.kiro/specs/patient-pharmacy-ui-migration/  → frontend/patient/pharmacy-ui-migration/
.kiro/specs/patient-pharmacy-order-push/    → frontend/patient/order-push/
```

### 第三方集成
```
.kiro/specs/logistics-api-migration/        → integration/logistics/api-migration/
.kiro/specs/api-to-pharmacy/                → integration/pharmacy/api-doc/
```

### 后端业务功能
```
.kiro/specs/patient-mall-phase*/            → backend/optimization/mall-phases/
```

## 迁移脚本示例

### Windows PowerShell 脚本

创建文件 `migrate-specs.ps1`:

```powershell
# 设置源目录和目标目录
$sourceDir = ".kiro/specs"
$targetDir = "pharmacy-specs/archive"

# 创建目标目录
New-Item -ItemType Directory -Force -Path $targetDir

# 复制所有 specs
Copy-Item -Path "$sourceDir/*" -Destination $targetDir -Recurse -Force

Write-Host "迁移完成！请检查 $targetDir 目录"
```

执行：
```bash
powershell -ExecutionPolicy Bypass -File migrate-specs.ps1
```

### 手动迁移步骤

1. **创建归档目录**
   ```bash
   mkdir pharmacy-specs/archive
   ```

2. **复制 specs**
   ```bash
   # 复制所有内容到 archive
   cp -r .kiro/specs/* pharmacy-specs/archive/
   ```

3. **整理分类**（可选）
   - 根据上面的目录映射，将文档移动到对应分类目录
   - 保持原有的文件结构

4. **提交到 Git**
   ```bash
   cd pharmacy-specs
   git add .
   git commit -m "[迁移] 从 .kiro/specs 迁移所有规范文档"
   git push
   ```

## 迁移后的整理建议

### 1. 清理重复文档

某些 specs 可能包含大量临时文档和进度报告，建议：

- 保留核心文档：`requirements.md`, `design.md`, `tasks.md`
- 保留重要总结：`*_SUMMARY.md`, `*_COMPLETE.md`
- 归档或删除：临时进度报告、调试日志

### 2. 统一文档结构

为每个 spec 创建标准结构：

```
spec-name/
├── requirements.md      # 需求说明
├── design.md           # 设计方案
├── tasks.md            # 任务清单
├── CHANGELOG.md        # 变更日志（如果有）
├── bugs.jsonl          # 问题记录（如果有）
└── docs/               # 其他补充文档
    ├── implementation/
    └── summary/
```

### 3. 创建索引文档

在每个分类目录下创建 `INDEX.md`，列出所有 specs：

```markdown
# API 集成规范索引

## 已完成

- [药房接口集成](./pharmacy-interface/) - 2026-01-15 完成
- [字段映射规范](./field-mapping/) - 2026-01-10 完成

## 进行中

- [兼容性审计](./compatibility-audit/) - 进行中

## 计划中

- 待定
```

## 迁移检查清单

- [ ] 所有 specs 已复制到新项目
- [ ] 目录结构已整理
- [ ] 重复文档已清理
- [ ] 创建了分类索引
- [ ] 更新了主 README.md
- [ ] 提交到 Git
- [ ] 推送到 GitHub
- [ ] 团队成员已知晓新位置

## 保持同步

如果选择复制迁移，需要考虑如何保持两边同步：

### 选项 1: 逐步废弃旧位置

1. 新的 specs 只在新项目创建
2. 旧的 specs 保持只读
3. 逐步将活跃的 specs 迁移到新项目

### 选项 2: 使用符号链接

```bash
# 在原位置创建符号链接指向新项目
# 注意：Windows 需要管理员权限
mklink /D .kiro/specs pharmacy-specs
```

### 选项 3: Git Submodule

将 pharmacy-specs 作为 submodule 添加到主项目：

```bash
cd mshlwyy_phamacy_mall
git submodule add https://github.com/YOUR_USERNAME/pharmacy-specs.git .kiro/specs-new
```

## 注意事项

1. **备份**: 迁移前先备份原有 specs
2. **测试**: 迁移后验证文档完整性
3. **通知**: 告知团队成员新的文档位置
4. **更新引用**: 如果有其他文档引用了 specs 路径，需要更新
5. **权限**: 确保团队成员有新仓库的访问权限

---

如有问题，请联系项目负责人。
