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
