<<<<<<< HEAD
# 互联网医院药房商城项目工作区

这是一个包含前后端项目的工作区，用于开发和维护互联网医院药房商城系统。

## 项目结构

```
mshlwyy_phamacy_mall/
├── mshlwyy_patient-mall/          # Android患者端应用
│   └── [独立Git仓库]
├── internet-hospital-mall/        # Java后端服务
│   └── [独立Git仓库]
├── .kiro/                         # Kiro AI助手配置
│   └── specs/                     # 功能规范文档
│       └── api-compatibility-audit/  # API兼容性审计规范
│           ├── requirements.md    # 需求文档
│           ├── design.md          # 设计文档
│           └── tasks.md           # 任务列表
└── README.md                      # 本文件
```

## 子项目

### 1. mshlwyy_patient-mall (患者端应用)
- **技术栈**: Android, Java, Retrofit, RxJava
- **仓库**: https://github.com/srn0621-Bob/mshlwyy_patient.git
- **分支**: main
- **功能**: 患者端移动应用，包含药品浏览、购物车、订单管理等功能

### 2. internet-hospital-mall (后端服务)
- **技术栈**: Spring Boot, MyBatis, MySQL
- **仓库**: https://github.com/srn0621-Bob/internet-hospital.git
- **分支**: master
- **功能**: 提供RESTful API服务，支持药品商城、订单管理、用户认证等

## 规范文档

### API兼容性审计规范
位于 `.kiro/specs/api-compatibility-audit/`

这个规范定义了一个自动化系统，用于：
- 扫描前端Retrofit API接口定义
- 扫描后端Spring MVC Controller定义
- 对比前后端API，识别不匹配问题
- 生成详细的兼容性审计报告
- 提供具体的解决方案

**主要文档**:
- `requirements.md` - 7个主要需求和验收标准
- `design.md` - 系统架构、组件设计、数据模型
- `tasks.md` - 17个实施任务的详细计划

## 开发指南

### 克隆项目
```bash
# 克隆工作区
git clone <workspace-repo-url> mshlwyy_phamacy_mall
cd mshlwyy_phamacy_mall

# 克隆子项目
git clone https://github.com/srn0621-Bob/mshlwyy_patient.git mshlwyy_patient-mall
git clone https://github.com/srn0621-Bob/internet-hospital.git internet-hospital-mall
```

### 使用Kiro AI助手
1. 在VS Code中打开工作区
2. 打开 `.kiro/specs/api-compatibility-audit/tasks.md`
3. 点击任务旁的"Start task"按钮开始实施

## 最近更新

- **2026-01-05**: 创建API兼容性审计规范
- **2026-01-05**: 整理项目文档到docs目录
- **2026-01-05**: 修复购物车功能和用户认证

## 许可证

[待定]
=======
# 互联网医院药房商城 - 技术规范文档库

## 项目简介

本仓库集中管理互联网医院药房商城系统的所有技术规范文档（Specs），包括需求分析、设计方案、实施任务和交付总结。

## 文档结构

```
pharmacy-specs/
├── backend/              # 后端 API 规范 (13 个)
│   ├── Phase 1: 基础设施 (2 个)
│   ├── Phase 2: 药品浏览 (3 个)
│   ├── Phase 3: 购物车 (2 个)
│   ├── Phase 4: 订单管理 (3 个)
│   ├── Phase 5: 物流 (1 个)
│   └── Phase 6: 优化 (2 个)
├── frontend/            # 前端 UI 规范 (13 个)
│   ├── 综合项目 (2 个)
│   └── UI 分阶段实现 (11 个)
├── integration/         # 第三方集成规范 (10 个)
│   ├── 药房系统集成 (3 个)
│   ├── 处方审核 (1 个)
│   ├── 物流集成 (3 个)
│   └── API 审计与映射 (3 个)
├── templates/           # 规范模板
└── SPECS_INDEX.md       # 📋 完整规范索引
```

**📋 查看完整规范索引**: [SPECS_INDEX.md](SPECS_INDEX.md)

### 分类导航

- [后端 API 规范](backend/README.md) - 13 个规范
- [前端 UI 规范](frontend/README.md) - 13 个规范
- [第三方集成规范](integration/README.md) - 10 个规范

## 规范文档标准结构

每个 spec 目录通常包含以下文件：

- `requirements.md` - 需求说明
- `design.md` - 设计方案
- `tasks.md` - 实施任务清单
- `CHANGELOG.md` - 变更日志（可选）
- `bugs.jsonl` - 问题记录（可选）
- 其他实施文档和总结

## 使用指南

### 创建新规范

1. 在对应目录下创建新的 spec 文件夹
2. 使用 `templates/` 中的模板创建基础文件
3. 按照标准结构填写内容

### 规范命名约定

- **后端 API**: `api-{功能名称}`
- **前端功能**: `{端}-{模块}-{功能}`
- **集成项目**: `{系统名称}-{集成类型}`

示例：
- `api-pharmacy-interface` - 药房接口集成
- `patient-mall-ui-home` - 患者端商城首页
- `logistics-webhook` - 物流回调集成

## 相关项目

- **后端服务**: [internet-hospital](../internet-hospital/)
- **患者端**: [mshlwyy_patient](../mshlwyy_patient/)
- **医生端**: [mshlwyy_doctor](../mshlwyy_doctor/)

## 技术栈

### 后端
- Spring Boot 2.1.4
- MyBatis Plus 3.0.7
- MySQL 8.0
- Redis
- RabbitMQ

### 前端
- Android SDK 28
- Retrofit 2.2.0
- RxJava 2.1.7
- 腾讯 IM SDK

## 贡献指南

1. 所有文档使用中文编写
2. 代码示例中的注释使用中文
3. 遵循既有的文档结构和命名规范
4. 重要变更需更新对应的 CHANGELOG.md

## 许可证

内部项目文档，仅供团队使用。

---

最后更新：2026-01-29
>>>>>>> 1e292842d0ecfe79259d1a5106d92bdcb7f3e2e4
