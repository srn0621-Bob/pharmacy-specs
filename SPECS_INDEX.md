# 药房商城规范文档索引

本文档提供所有功能规范的完整索引和快速导航。

## 📊 统计概览

- **后端 API 规范**: 13 个
- **前端 UI 规范**: 13 个  
- **第三方集成规范**: 10 个
- **总计**: 36 个功能规范

## 🗂️ 分类导航

### 1️⃣ 后端 API 规范 (Backend)

详见: [backend/README.md](backend/README.md)

#### Phase 1: 基础设施
| 规范名称 | 说明 | 路径 |
|---------|------|------|
| patient-mall-phase1-db-extension | 数据库扩展与表结构设计 | [backend/patient-mall-phase1-db-extension](backend/patient-mall-phase1-db-extension) |
| patient-mall-phase1-image-parser | 图片解析服务 | [backend/patient-mall-phase1-image-parser](backend/patient-mall-phase1-image-parser) |

#### Phase 2: 药品浏览
| 规范名称 | 说明 | 路径 |
|---------|------|------|
| patient-mall-phase2-category-query | 药品分类查询 API | [backend/patient-mall-phase2-category-query](backend/patient-mall-phase2-category-query) |
| patient-mall-phase2-drug-detail | 药品详情查询 API | [backend/patient-mall-phase2-drug-detail](backend/patient-mall-phase2-drug-detail) |
| patient-mall-phase2-drug-search | 药品搜索功能 API | [backend/patient-mall-phase2-drug-search](backend/patient-mall-phase2-drug-search) |

#### Phase 3: 购物车
| 规范名称 | 说明 | 路径 |
|---------|------|------|
| patient-mall-phase3-cart-basic | 购物车基础功能 | [backend/patient-mall-phase3-cart-basic](backend/patient-mall-phase3-cart-basic) |
| patient-mall-phase3-cart-advanced | 购物车高级功能 | [backend/patient-mall-phase3-cart-advanced](backend/patient-mall-phase3-cart-advanced) |

#### Phase 4: 订单管理
| 规范名称 | 说明 | 路径 |
|---------|------|------|
| patient-mall-phase4-order-create | 订单创建 API | [backend/patient-mall-phase4-order-create](backend/patient-mall-phase4-order-create) |
| patient-mall-phase4-order-query | 订单查询 API | [backend/patient-mall-phase4-order-query](backend/patient-mall-phase4-order-query) |
| patient-mall-phase4-order-status | 订单状态管理 API | [backend/patient-mall-phase4-order-status](backend/patient-mall-phase4-order-status) |

#### Phase 5: 物流
| 规范名称 | 说明 | 路径 |
|---------|------|------|
| patient-mall-phase5-logistics-query | 物流查询 API | [backend/patient-mall-phase5-logistics-query](backend/patient-mall-phase5-logistics-query) |

#### Phase 6: 优化
| 规范名称 | 说明 | 路径 |
|---------|------|------|
| patient-mall-phase6-cache-optimization | 缓存优化 | [backend/patient-mall-phase6-cache-optimization](backend/patient-mall-phase6-cache-optimization) |
| patient-mall-phase6-drug-recommendation | 药品推荐算法 | [backend/patient-mall-phase6-drug-recommendation](backend/patient-mall-phase6-drug-recommendation) |

---

### 2️⃣ 前端 UI 规范 (Frontend)

详见: [frontend/README.md](frontend/README.md)

#### 综合项目
| 规范名称 | 说明 | 文档数 | 路径 |
|---------|------|--------|------|
| patient-drug-mall | 患者端药品商城完整实现 | 45 | [frontend/patient-drug-mall](frontend/patient-drug-mall) |
| patient-pharmacy-ui-migration | 患者端药房 UI 迁移 | 15 | [frontend/patient-pharmacy-ui-migration](frontend/patient-pharmacy-ui-migration) |

#### UI 分阶段实现
| 规范名称 | 说明 | 路径 |
|---------|------|------|
| patient-mall-ui-01-foundation | UI 基础框架搭建 | [frontend/patient-mall-ui-01-foundation](frontend/patient-mall-ui-01-foundation) |
| patient-mall-ui-02-resources | 资源文件准备 | [frontend/patient-mall-ui-02-resources](frontend/patient-mall-ui-02-resources) |
| patient-mall-ui-03-home | 商城首页实现 | [frontend/patient-mall-ui-03-home](frontend/patient-mall-ui-03-home) |
| patient-mall-ui-04-detail | 药品详情页实现 | [frontend/patient-mall-ui-04-detail](frontend/patient-mall-ui-04-detail) |
| patient-mall-ui-05-cart | 购物车页面 | [frontend/patient-mall-ui-05-cart](frontend/patient-mall-ui-05-cart) |
| patient-mall-ui-06-checkout | 订单结算页面 | [frontend/patient-mall-ui-06-checkout](frontend/patient-mall-ui-06-checkout) |
| patient-mall-ui-07-search | 药品搜索页面 | [frontend/patient-mall-ui-07-search](frontend/patient-mall-ui-07-search) |
| patient-mall-ui-08-category | 药品分类页面 | [frontend/patient-mall-ui-08-category](frontend/patient-mall-ui-08-category) |
| patient-mall-ui-09-navigation | 页面导航实现 | [frontend/patient-mall-ui-09-navigation](frontend/patient-mall-ui-09-navigation) |
| patient-mall-ui-10-optimization | UI 性能优化 | [frontend/patient-mall-ui-10-optimization](frontend/patient-mall-ui-10-optimization) |
| patient-mall-ui-11-testing | UI 功能测试 | [frontend/patient-mall-ui-11-testing](frontend/patient-mall-ui-11-testing) |

---

### 3️⃣ 第三方集成规范 (Integration)

详见: [integration/README.md](integration/README.md)

#### 药房系统集成
| 规范名称 | 说明 | 文档数 | 路径 |
|---------|------|--------|------|
| api-farmacy-interface | 药房接口集成核心实现 | 11 | [integration/api-farmacy-interface](integration/api-farmacy-interface) |
| api-to-pharmacy | 提供给药房的 API 文档 | 4 | [integration/api-to-pharmacy](integration/api-to-pharmacy) |
| patient-pharmacy-order-push | 订单推送到药房系统 | 3 | [integration/patient-pharmacy-order-push](integration/patient-pharmacy-order-push) |

#### 处方审核
| 规范名称 | 说明 | 文档数 | 路径 |
|---------|------|--------|------|
| prescription-audit-webhook | 处方审核回调接口 | 5 | [integration/prescription-audit-webhook](integration/prescription-audit-webhook) |

#### 物流集成
| 规范名称 | 说明 | 文档数 | 路径 |
|---------|------|--------|------|
| logistics-api-migration | 物流 API 迁移到快递100 | 23 | [integration/logistics-api-migration](integration/logistics-api-migration) |
| logistics-webhook | 物流状态回调接口 | 3 | [integration/logistics-webhook](integration/logistics-webhook) |
| logistics-webhook-appsecret | 物流回调鉴权机制 | 14 | [integration/logistics-webhook-appsecret](integration/logistics-webhook-appsecret) |

#### API 审计与映射
| 规范名称 | 说明 | 文档数 | 路径 |
|---------|------|--------|------|
| api-compatibility-audit | API 兼容性审计 | 3 | [integration/api-compatibility-audit](integration/api-compatibility-audit) |
| api-field-mapping | API 字段映射关系 | 2 | [integration/api-field-mapping](integration/api-field-mapping) |
| doc-pharmacy-api | 药房 API 文档化与日志 | 4 | [integration/doc-pharmacy-api](integration/doc-pharmacy-api) |

---

## 🔍 按功能域查找

### 药品管理
- 后端: phase2-category-query, phase2-drug-detail, phase2-drug-search, phase6-drug-recommendation
- 前端: ui-03-home, ui-04-detail, ui-07-search, ui-08-category

### 购物车
- 后端: phase3-cart-basic, phase3-cart-advanced
- 前端: ui-05-cart

### 订单管理
- 后端: phase4-order-create, phase4-order-query, phase4-order-status
- 前端: ui-06-checkout
- 集成: patient-pharmacy-order-push

### 物流
- 后端: phase5-logistics-query
- 集成: logistics-api-migration, logistics-webhook, logistics-webhook-appsecret

### 处方审核
- 集成: prescription-audit-webhook

### 药房集成
- 集成: api-farmacy-interface, api-to-pharmacy, doc-pharmacy-api

---

## 📝 规范文档结构

每个规范目录通常包含以下标准文件:

- `requirements.md` - 需求说明
- `design.md` - 设计方案
- `tasks.md` - 任务分解

部分规范还包含:
- `CHANGELOG.md` - 变更日志
- `bugs.jsonl` - 问题记录
- 各种实现总结和进度报告文档

---

## 🚀 快速开始

1. 查看 [QUICK_START.md](QUICK_START.md) 了解如何使用这些规范
2. 查看 [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) 了解迁移指南
3. 使用 [templates/](templates/) 目录下的模板创建新规范

---

## 📚 相关文档

- [README.md](README.md) - 项目总览
- [GITHUB_SETUP.md](GITHUB_SETUP.md) - GitHub 配置指南
- [templates/](templates/) - 规范文档模板

---

*最后更新: 2026-01-29*
