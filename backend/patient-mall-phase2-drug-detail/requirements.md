# 需求文档 - 药品详情查询功能

## 文档信息

**功能名称:** 药品详情查询功能  
**项目:** 互联网医院 - 患者端药品商城  
**版本:** v1.0  
**创建日期:** 2026-01-23  
**父级Spec:** patient-drug-mall

---

## 简介

实现药品详情查询功能,提供完整的药品信息展示,包括基本信息、图片、价格、库存、商城扩展信息等,为用户提供全面的药品信息。

---

## 术语表 (Glossary)

- **Drug_Detail**: 药品详情
- **Drug_Images**: 药品图片列表
- **Stock_Info**: 库存信息
- **Price_Info**: 价格信息
- **Promotion_Info**: 促销信息

---

## 需求

### Requirement 1: 基本信息查询

**User Story:** 作为患者用户,我想查看药品的基本信息,以便了解药品详情

#### Acceptance Criteria

1. WHEN Patient_User 请求药品详情 THEN THE System SHALL 返回完整的药品信息
2. THE System SHALL 返回药品ID、名称、编码、规格、单位
3. THE System SHALL 返回生产厂家、批准文号
4. THE System SHALL 返回药品分类、适应症、用法用量
5. WHEN 药品不存在 THEN THE System SHALL 返回404错误
6. WHEN 药品已禁用(status=0) THEN THE System SHALL 返回"药品已下架"错误

---

### Requirement 2: 图片信息

**User Story:** 作为患者用户,我想查看药品的多张图片,以便全面了解药品外观

#### Acceptance Criteria

1. THE System SHALL 返回药品图片列表(drugImages)
2. THE System SHALL 解析pic_position字段的JSON格式
3. THE System SHALL 返回图片URL数组
4. WHEN pic_position为空 THEN THE System SHALL 返回空数组
5. THE System SHALL 支持多张图片展示

---

### Requirement 3: 价格和库存信息

**User Story:** 作为患者用户,我想查看药品的价格和库存,以便决定是否购买

#### Acceptance Criteria

1. THE System SHALL 返回药品当前价格(price)
2. THE System SHALL 返回药品原价(originalPrice)
3. THE System SHALL 计算并返回折扣信息
4. THE System SHALL 返回库存数量(quantity)
5. THE System SHALL 标识库存状态(有货/缺货/预售)
6. WHEN 库存为0 THEN THE System SHALL 显示"缺货"状态

---

### Requirement 4: 商城扩展信息

**User Story:** 作为患者用户,我想查看药品的促销信息,以便了解优惠政策

#### Acceptance Criteria

1. THE System SHALL 返回销量信息(sales)
2. THE System SHALL 返回是否包邮(isFreeShipping)
3. THE System SHALL 返回是否价保(hasPriceGuarantee)
4. THE System SHALL 返回价保天数(priceGuaranteeDays)
5. THE System SHALL 返回是否推荐(isRecommended)
6. THE System SHALL 返回加购数量(addToCartCount)

---

### Requirement 5: 药品说明信息

**User Story:** 作为患者用户,我想查看药品的详细说明,以便安全用药

#### Acceptance Criteria

1. THE System SHALL 返回药品成分(ingredients)
2. THE System SHALL 返回适应症(indications)
3. THE System SHALL 返回用法用量(dosage)
4. THE System SHALL 返回不良反应(adverseReactions)
5. THE System SHALL 返回禁忌(contraindications)
6. THE System SHALL 返回注意事项(precautions)
7. THE System SHALL 返回贮藏方法(storage)

---

### Requirement 6: 相关推荐

**User Story:** 作为患者用户,我希望看到相关药品推荐,以便发现类似产品

#### Acceptance Criteria

1. THE System SHALL 返回相关药品列表
2. THE System SHALL 基于分类推荐相关药品
3. THE System SHALL 限制推荐数量不超过10个
4. THE System SHALL 排除当前药品
5. THE System SHALL 优先推荐同厂家药品

---

### Requirement 7: 性能要求

**User Story:** 作为系统管理员,我需要优化详情查询性能,以便提供快速响应

#### Acceptance Criteria

1. THE System SHALL 在500ms内返回药品详情
2. THE System SHALL 使用主键索引查询
3. THE System SHALL 缓存热门药品详情
4. THE System SHALL 支持并发1000个查询请求

---

### Requirement 8: 错误处理

**User Story:** 作为患者用户,当查询出错时,我希望看到清晰的错误提示

#### Acceptance Criteria

1. WHEN 药品ID无效 THEN THE System SHALL 返回"药品ID无效"
2. WHEN 药品不存在 THEN THE System SHALL 返回"药品不存在"
3. WHEN 药品已下架 THEN THE System SHALL 返回"药品已下架"
4. WHEN 数据库查询失败 THEN THE System SHALL 返回"查询失败,请稍后重试"
5. THE System SHALL 记录所有错误日志

---

## 非功能性需求

### 性能要求

1. THE System SHALL 在500ms内返回药品详情
2. THE System SHALL 支持并发1000个查询请求
3. THE System SHALL 数据库查询时间<200ms

### 兼容性要求

1. THE System SHALL 兼容现有的DrugMallController
2. THE System SHALL 复用现有的DrugDTO模型
3. THE System SHALL 与图片解析功能集成

### 数据完整性要求

1. THE System SHALL 返回所有必需字段
2. THE System SHALL 处理空值字段
3. THE System SHALL 保证数据一致性

---

## 约束条件

1. 必须验证现有API实现是否满足需求
2. 如需补充,必须保持API风格一致
3. 必须集成图片JSON解析功能
4. 热门药品详情缓存5分钟

---

## API接口定义

### 1. 获取药品详情
```
GET /api/v1/mall/drugs/{drugId}

Response:
{
  "code": 200,
  "data": {
    "drugId": 1001,
    "drugName": "阿莫西林胶囊",
    "drugCode": "AMX001",
    "drugImages": [
      "http://img1.jpg",
      "http://img2.jpg"
    ],
    "price": 15.50,
    "originalPrice": 20.00,
    "discount": 0.78,
    "quantity": 500,
    "stockStatus": "有货",
    "sales": 1200,
    "isFreeShipping": true,
    "hasPriceGuarantee": true,
    "priceGuaranteeDays": 7,
    "isRecommended": true,
    "categoryId": 4,
    "categoryName": "中西药品",
    "manufacturer": "XX制药有限公司",
    "approvalNumber": "国药准字H12345678",
    "specification": "0.25g*24粒",
    "unit": "盒",
    "ingredients": "阿莫西林",
    "indications": "用于敏感菌所致的感染",
    "dosage": "口服,一次0.5g,每6-8小时1次",
    "adverseReactions": "可能出现恶心、呕吐等",
    "contraindications": "对青霉素过敏者禁用",
    "precautions": "孕妇及哺乳期妇女慎用",
    "storage": "遮光,密封,在干燥处保存"
  }
}
```

### 2. 获取药品库存
```
GET /api/v1/mall/drugs/{drugId}/stock

Response:
{
  "code": 200,
  "data": {
    "drugId": 1001,
    "quantity": 500,
    "stockStatus": "有货"
  }
}
```

### 3. 获取相关推荐
```
GET /api/v1/mall/drugs/{drugId}/related?limit=10

Response:
{
  "code": 200,
  "data": [
    {
      "drugId": 1002,
      "drugName": "头孢氨苄胶囊",
      "drugImages": ["http://img.jpg"],
      "price": 18.00,
      "sales": 800
    }
  ]
}
```

---

## 验收标准

- [ ] 能查询药品详情
- [ ] 返回完整的药品信息
- [ ] 图片列表正确解析
- [ ] 价格和库存信息准确
- [ ] 商城扩展信息完整
- [ ] 相关推荐功能正常
- [ ] 错误处理完善
- [ ] 性能满足要求
- [ ] 所有测试通过

---

## 参考文档

- [DrugMallController实现](../../../internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/mall/controller/DrugMallController.java)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
- [图片解析Spec](../patient-mall-phase1-image-parser/requirements.md)
- [父级需求文档](../patient-drug-mall/requirements.md)
