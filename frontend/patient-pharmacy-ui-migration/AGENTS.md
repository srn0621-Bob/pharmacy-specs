# Specs目录架构文档

## 目录结构

```
.kiro/specs/
├── patient-drug-mall/                    # 患者端药品商城 - 主项目文档
│   ├── requirements.md                   # 原始需求文档
│   ├── design.md                         # 原始设计文档
│   ├── tasks.md                          # 原始任务列表
│   ├── SPEC_SPLIT_PLAN.md               # 需求拆分方案
│   ├── SPEC_CREATION_SUMMARY.md         # Spec创建总结
│   ├── BATCH2_SPEC_CREATION_SUMMARY.md  # 第二批Spec创建总结
│   ├── CHANGELOG.md                      # 变更日志
│   └── ...                               # 其他辅助文档
│
├── patient-mall-phase1-db-extension/    # 阶段一 Spec 1: 数据库扩展
│   ├── requirements.md                   # 需求文档
│   ├── design.md                         # 设计文档
│   └── tasks.md                          # 任务列表
│
├── patient-mall-phase1-image-parser/    # 阶段一 Spec 2: 图片解析
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── patient-mall-phase2-category-query/  # 阶段二 Spec 3: 分类查询
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── patient-mall-phase2-drug-search/     # 阶段二 Spec 4: 药品搜索
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── patient-mall-phase2-drug-detail/     # 阶段二 Spec 5: 药品详情
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── patient-mall-phase3-cart-basic/      # 阶段三 Spec 6: 购物车基础
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── patient-mall-phase3-cart-advanced/   # 阶段三 Spec 7: 购物车高级
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── api-farmacy-interface/               # 医生端药房接口集成
├── patient-pharmacy-order-push/         # 患者端药房订单推送
├── doc-pharmacy-api/                    # 医生端药房API日志
├── logistics-api-migration/             # 物流API迁移
├── logistics-webhook/                   # 物流回调
├── logistics-webhook-appsecret/         # 物流回调AppSecret认证
├── prescription-audit-webhook/          # 处方审核回调
└── api-to-pharmacy/                     # 对药房提供的API文档

```

## 命名规范

### 患者端药品商城项目
采用 `patient-mall-{phase}-{feature}` 格式：
- **patient-mall**: 项目前缀，表示患者端药品商城
- **phase1/phase2/phase3**: 阶段序号，表示实施顺序
- **feature**: 功能描述，简洁的英文

### 其他项目
保持原有命名，按功能模块组织

## 模块职责

### 患者端药品商城 (Patient Drug Mall)

#### 主项目文档 (patient-drug-mall/)
- **职责**: 存放项目的原始需求、设计文档和拆分方案
- **关键文档**:
  - `SPEC_SPLIT_PLAN.md`: 13个spec的拆分方案
  - `SPEC_CREATION_SUMMARY.md`: Spec创建进度总结
  - `CHANGELOG.md`: 项目变更日志

#### 阶段一: 基础数据准备 (Phase 1)

**Spec 1: patient-mall-phase1-db-extension**
- **职责**: 为t_drug表添加商城所需的扩展字段
- **核心内容**: 数据库迁移脚本、索引创建、幂等性保证
- **工作量**: 3小时
- **依赖**: 无
- **状态**: ✅ 文档完成

**Spec 2: patient-mall-phase1-image-parser**
- **职责**: 实现药品图片JSON解析功能
- **核心内容**: DrugImageParser工具类、JSON解析、错误处理
- **工作量**: 4小时
- **依赖**: Spec 1
- **状态**: ✅ 文档完成

#### 阶段二: 核心查询功能 (Phase 2)

**Spec 3: patient-mall-phase2-category-query**
- **职责**: 实现药品分类查询和按分类获取药品列表
- **核心内容**: 分类列表、快捷分类、按分类查询、Redis缓存
- **工作量**: 5小时
- **依赖**: Spec 1, Spec 2
- **状态**: ✅ 文档完成

**Spec 4: patient-mall-phase2-drug-search**
- **职责**: 实现药品搜索功能，支持多条件搜索和智能排序
- **核心内容**: 多条件搜索、相关性排序、搜索历史、热门搜索
- **工作量**: 6.5小时
- **依赖**: Spec 1, Spec 2
- **状态**: ✅ 文档完成

**Spec 5: patient-mall-phase2-drug-detail**
- **职责**: 实现药品详情查询，提供完整的药品信息
- **核心内容**: 详情查询、图片解析、价格计算、相关推荐
- **工作量**: 5小时
- **依赖**: Spec 1, Spec 2
- **状态**: ✅ 文档完成

#### 阶段三: 购物车功能 (Phase 3)

**Spec 6: patient-mall-phase3-cart-basic**
- **职责**: 实现购物车的基础CRUD功能
- **核心内容**: 添加商品、更新数量、删除商品、查询列表、购物车数量缓存
- **工作量**: 2-3小时
- **依赖**: Spec 1, Spec 2, Spec 5
- **状态**: ✅ 文档完成

**Spec 7: patient-mall-phase3-cart-advanced**
- **职责**: 实现购物车的高级功能
- **核心内容**: 选中状态管理、批量操作、清空购物车、汇总计算
- **工作量**: 2-3小时
- **依赖**: Spec 6
- **状态**: ✅ 文档完成

#### 阶段四至六: 待创建 (Phase 4-6)
- 阶段四: 订单功能 (3个spec)
- 阶段五: 物流功能 (1个spec)
- 阶段六: 优化功能 (2个spec)

### 药房集成相关

**api-farmacy-interface**
- **职责**: 医生端与药房系统的接口集成
- **核心内容**: 订单推送、处方审核触发、数据转换

**patient-pharmacy-order-push**
- **职责**: 患者端订单推送到药房系统
- **核心内容**: 订单数据转换、API调用、日志记录

**doc-pharmacy-api**
- **职责**: 医生端药房API调用日志
- **核心内容**: 日志记录、查询接口、统计分析

### 物流相关

**logistics-api-migration**
- **职责**: 物流查询API从旧接口迁移到快递100
- **核心内容**: 快递100集成、签名计算、错误处理

**logistics-webhook**
- **职责**: 接收药房推送的物流信息回调
- **核心内容**: Webhook接口、数据解析、订单状态更新

**logistics-webhook-appsecret**
- **职责**: 为物流回调和药品更新接口添加AppSecret认证
- **核心内容**: 拦截器、签名验证、Shiro集成

### 处方审核

**prescription-audit-webhook**
- **职责**: 接收药房推送的处方审核结果回调
- **核心内容**: Webhook接口、审核状态更新、日志记录

### API文档

**api-to-pharmacy**
- **职责**: 对药房提供的API接口文档
- **核心内容**: 药品更新API、物流回调API、处方审核回调API

## 依赖关系

### 患者端药品商城依赖链
```
Phase 1:
  Spec 1 (DB扩展) → Spec 2 (图片解析)
    ↓
Phase 2:
  Spec 3 (分类查询) ← 可并行
  Spec 4 (药品搜索) ← 可并行
  Spec 5 (药品详情) ← 可并行
    ↓
Phase 3:
  Spec 6 (购物车基础) → Spec 7 (购物车高级)
    ↓
Phase 4-6: 待创建
```

### 跨项目依赖
- `patient-mall-phase2-drug-detail` 依赖 `patient-mall-phase1-image-parser`
- 所有阶段二spec都依赖阶段一的数据库扩展

## 文档标准

每个spec包含三个标准文档：

1. **requirements.md** - 需求文档
   - EARS格式的验收标准
   - 非功能性需求
   - API接口定义
   - 验收标准清单

2. **design.md** - 设计文档
   - 系统架构
   - 数据模型设计
   - API详细设计
   - 缓存策略
   - 错误处理策略
   - 测试策略

3. **tasks.md** - 任务列表
   - 详细的实施步骤
   - 每个任务的验收标准
   - 代码示例
   - 测试用例
   - 预计工作量

## 变更历史

### 2026-01-23 - 阶段三Spec创建

**变更内容:**
- 创建Spec 6: 购物车基础功能
- 创建Spec 7: 购物车高级功能
- 每个spec包含完整的requirements、design、tasks文档
- 总工作量: 4-6小时

**文档位置:**
- `.kiro/specs/patient-mall-phase3-cart-basic/`
- `.kiro/specs/patient-mall-phase3-cart-advanced/`

**详见:** `.kiro/specs/patient-drug-mall/CHANGELOG.md`

---

### 2026-01-23 - Spec文件夹重命名
- 将5个药品商城spec重命名为统一的命名规范
- 采用 `patient-mall-phase{N}-{feature}` 格式
- 更新所有文档中的路径引用
- 详见: `.kiro/specs/patient-drug-mall/CHANGELOG.md`

## 使用指南

### 查找特定功能的spec
1. 确定功能属于哪个项目（患者端商城、药房集成、物流等）
2. 如果是患者端商城，查看阶段序号（phase1, phase2等）
3. 根据功能描述找到对应的spec文件夹

### 创建新的spec
1. 确定项目归属和阶段
2. 按照命名规范创建文件夹
3. 创建三个标准文档：requirements.md, design.md, tasks.md
4. 更新本文档的目录结构和模块职责部分
5. 更新主项目的SPEC_CREATION_SUMMARY.md

### 实施spec
1. 阅读requirements.md了解需求
2. 阅读design.md了解设计方案
3. 按照tasks.md的步骤逐步实施
4. 完成后更新CHANGELOG.md记录变更

---

**最后更新**: 2026-01-23  
**维护人员**: Kiro AI Assistant  
**文档版本**: 1.0
