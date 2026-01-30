# Spec 12: 药品推荐功能 - 需求文档

## 文档信息

**Spec编号:** Spec 12  
**功能名称:** 药品推荐功能  
**所属阶段:** 阶段六 - 优化功能  
**创建日期:** 2026-01-23  
**依赖关系:** 依赖阶段一和阶段二（Spec 1, 2, 3, 4, 5）

---

## 1. 简介

### 1.1 功能概述

为药品商城提供智能推荐功能，根据不同场景推荐合适的药品，提升用户购买转化率和用户体验。

### 1.2 业务价值

- 提升用户购买转化率
- 增加用户停留时间
- 提高客单价
- 改善用户体验

### 1.3 术语表

| 术语 | 定义 |
|------|------|
| 热销药品 | 销量排名靠前的药品 |
| 新品药品 | 最近上架的药品 |
| 相关推荐 | 与当前浏览药品相关的其他药品 |
| 分类推荐 | 同分类下的热门药品 |
| 推荐权重 | 影响推荐排序的权重因子 |

---

## 2. 功能需求

### 2.1 核心功能（EARS格式）

#### FR-1: 商城首页推荐

**WHEN** 用户打开药品商城首页  
**THEN** 系统应展示以下推荐模块：
- 热销药品（销量Top 10）
- 新品推荐（最近7天上架的药品，最多10个）
- 分类推荐（每个快捷分类推荐3个热门药品）

#### FR-2: 药品详情页相关推荐

**WHEN** 用户查看药品详情页  
**THEN** 系统应推荐相关药品：
- 同分类下的热销药品（最多6个）
- 排除当前正在查看的药品

#### FR-3: 搜索结果页推荐

**WHEN** 用户搜索药品但结果为空  
**THEN** 系统应推荐热销药品（最多10个）

#### FR-4: 推荐排序规则

**WHEN** 系统生成推荐列表  
**THEN** 系统应按以下规则排序：
- 热销推荐：按销量降序
- 新品推荐：按上架时间降序
- 分类推荐：按销量降序

#### FR-5: 推荐缓存

**WHEN** 系统生成推荐列表  
**THEN** 系统应将推荐结果缓存30分钟  
**AND** 缓存Key应区分不同的推荐场景

---

## 3. 非功能性需求

### 3.1 性能要求

| 指标 | 要求 |
|------|------|
| 响应时间 | 首次查询 < 1秒，缓存命中 < 200ms |
| 并发支持 | 支持500个用户同时请求推荐 |
| 缓存命中率 | > 90% |

### 3.2 可用性要求

- 推荐功能失败不应影响主流程
- 推荐列表为空时应有友好提示
- 推荐算法应可配置

### 3.3 可扩展性要求

- 推荐算法应易于扩展
- 支持添加新的推荐场景
- 支持A/B测试不同推荐策略

---

## 4. 约束条件

### 4.1 技术约束

- 必须使用Redis缓存推荐结果
- 推荐算法应简单高效
- 不依赖复杂的机器学习模型

### 4.2 业务约束

- 只推荐上架状态的药品
- 只推荐有库存的药品
- 推荐药品必须有图片

### 4.3 数据约束

- 热销推荐基于sales字段
- 新品推荐基于create_time字段
- 每个推荐场景最多返回10个药品

---

## 5. API接口定义

### 5.1 获取首页推荐

**接口路径:** `GET /api/patient/mall/drug/recommend/home`

**请求参数:** 无

**响应示例:**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "hotSales": [
      {
        "drugId": 1,
        "drugName": "阿莫西林胶囊",
        "drugImage": "https://oss.example.com/drug1.jpg",
        "price": 15.80,
        "sales": 1250,
        "isFreeShipping": true
      }
    ],
    "newArrivals": [
      {
        "drugId": 2,
        "drugName": "维生素C片",
        "drugImage": "https://oss.example.com/drug2.jpg",
        "price": 28.00,
        "sales": 85,
        "createTime": "2026-01-20"
      }
    ],
    "categoryRecommends": [
      {
        "categoryId": 1,
        "categoryName": "感冒用药",
        "drugs": [
          {
            "drugId": 3,
            "drugName": "感冒灵颗粒",
            "drugImage": "https://oss.example.com/drug3.jpg",
            "price": 12.50,
            "sales": 980
          }
        ]
      }
    ]
  }
}
```

### 5.2 获取药品详情页相关推荐

**接口路径:** `GET /api/patient/mall/drug/recommend/related/{drugId}`

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| drugId | Long | 是 | 药品ID |

**响应示例:**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "relatedDrugs": [
      {
        "drugId": 4,
        "drugName": "布洛芬缓释胶囊",
        "drugImage": "https://oss.example.com/drug4.jpg",
        "price": 18.50,
        "sales": 756,
        "isFreeShipping": false
      }
    ]
  }
}
```

### 5.3 获取热销药品推荐

**接口路径:** `GET /api/patient/mall/drug/recommend/hot`

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | Integer | 否 | 返回数量，默认10，最大20 |

**响应示例:**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "hotDrugs": [
      {
        "drugId": 1,
        "drugName": "阿莫西林胶囊",
        "drugImage": "https://oss.example.com/drug1.jpg",
        "price": 15.80,
        "sales": 1250,
        "isFreeShipping": true
      }
    ]
  }
}
```

---

## 6. 数据模型

### 6.1 推荐药品DTO

```java
public class RecommendDrugDTO {
    private Long drugId;              // 药品ID
    private String drugName;          // 药品名称
    private String drugImage;         // 药品图片
    private BigDecimal price;         // 价格
    private Integer sales;            // 销量
    private Boolean isFreeShipping;   // 是否包邮
    private String createTime;        // 上架时间（新品推荐用）
}
```

### 6.2 首页推荐DTO

```java
public class HomeRecommendDTO {
    private List<RecommendDrugDTO> hotSales;           // 热销药品
    private List<RecommendDrugDTO> newArrivals;        // 新品推荐
    private List<CategoryRecommendDTO> categoryRecommends;  // 分类推荐
}
```

### 6.3 分类推荐DTO

```java
public class CategoryRecommendDTO {
    private Long categoryId;          // 分类ID
    private String categoryName;      // 分类名称
    private List<RecommendDrugDTO> drugs;  // 推荐药品列表
}
```

---

## 7. 验收标准

### 7.1 功能验收

- [ ] 首页能展示热销药品推荐
- [ ] 首页能展示新品推荐
- [ ] 首页能展示分类推荐
- [ ] 药品详情页能展示相关推荐
- [ ] 搜索无结果时能展示热销推荐
- [ ] 推荐列表按规则正确排序

### 7.2 性能验收

- [ ] 首次查询响应时间 < 1秒
- [ ] 缓存命中响应时间 < 200ms
- [ ] 缓存命中率 > 90%
- [ ] 支持500个用户并发请求

### 7.3 数据质量验收

- [ ] 只推荐上架状态的药品
- [ ] 只推荐有库存的药品
- [ ] 推荐药品都有图片
- [ ] 推荐列表不包含重复药品

### 7.4 缓存验收

- [ ] 推荐结果正确缓存
- [ ] 缓存过期时间为30分钟
- [ ] 不同场景使用不同缓存Key

---

## 8. 测试场景

### 8.1 正常场景

| 场景 | 前置条件 | 操作 | 预期结果 |
|------|---------|------|---------|
| 查看首页推荐 | 有足够的药品数据 | 打开商城首页 | 显示热销、新品、分类推荐 |
| 查看相关推荐 | 查看药品详情页 | 滚动到推荐区域 | 显示同分类热销药品 |
| 搜索无结果推荐 | 搜索不存在的药品 | 查看搜索结果 | 显示热销药品推荐 |
| 缓存命中 | 30分钟内重复请求 | 再次请求推荐 | 快速返回缓存数据 |

### 8.2 边界场景

| 场景 | 前置条件 | 操作 | 预期结果 |
|------|---------|------|---------|
| 药品数量不足 | 某分类只有1个药品 | 查看分类推荐 | 只显示1个药品 |
| 无新品药品 | 7天内无新上架药品 | 查看新品推荐 | 显示空列表或提示 |
| 无库存药品 | 所有药品库存为0 | 查看推荐 | 不显示推荐或显示提示 |

---

## 9. 依赖关系

### 9.1 前置依赖

- ✅ Spec 1: t_drug表商城字段扩展（需要sales字段）
- ✅ Spec 2: 药品图片JSON解析（需要图片数据）
- ✅ Spec 3: 药品分类查询（需要分类数据）
- ✅ Spec 5: 药品详情查询（相关推荐依赖）

### 9.2 后置影响

- 为商城首页提供内容填充
- 提升用户购买转化率
- 为后续个性化推荐打基础

---

## 10. 风险与限制

### 10.1 风险

- 推荐算法过于简单，可能不够精准
- 缓存时间过长可能导致推荐不够实时
- 热销药品可能长期不变，缺乏新鲜感

### 10.2 限制

- 当前只支持基于销量和时间的简单推荐
- 不支持个性化推荐
- 不支持基于用户行为的推荐

### 10.3 未来优化方向

- 引入协同过滤算法
- 基于用户浏览历史推荐
- 基于用户购买历史推荐
- A/B测试不同推荐策略

---

**文档创建日期:** 2026-01-23  
**创建人员:** Kiro AI Assistant  
**状态:** 待评审
