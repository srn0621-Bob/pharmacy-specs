# 需求文档 - 药品搜索功能

## 文档信息

**功能名称:** 药品搜索功能  
**项目:** 互联网医院 - 患者端药品商城  
**版本:** v1.0  
**创建日期:** 2026-01-23  
**父级Spec:** patient-drug-mall

---

## 简介

实现药品搜索功能,支持按名称、编码、厂家等多条件搜索,提供分页查询和结果排序,为用户提供快速准确的药品查找能力。

---

## 术语表 (Glossary)

- **Search_Keyword**: 搜索关键词
- **Drug_Name**: 药品名称
- **Drug_Code**: 药品编码/SKU
- **Manufacturer**: 生产厂家
- **Fuzzy_Match**: 模糊匹配
- **Search_Result**: 搜索结果

---

## 需求

### Requirement 1: 基础搜索功能

**User Story:** 作为患者用户,我想通过关键词搜索药品,以便快速找到我需要的药品

#### Acceptance Criteria

1. WHEN Patient_User 输入搜索关键词 THEN THE System SHALL 返回匹配的药品列表
2. THE System SHALL 支持按药品名称模糊搜索
3. THE System SHALL 支持按药品编码精确搜索
4. THE System SHALL 支持按生产厂家模糊搜索
5. THE System SHALL 只返回status=1的启用药品
6. WHEN 关键词为空 THEN THE System SHALL 返回错误提示

---

### Requirement 2: 搜索结果排序

**User Story:** 作为患者用户,我希望搜索结果按相关性排序,以便优先看到最匹配的药品

#### Acceptance Criteria

1. THE System SHALL 按以下优先级排序搜索结果:
   - 药品名称完全匹配 (最高优先级)
   - 药品名称前缀匹配
   - 药品名称包含关键词
   - 厂家名称匹配
2. THE System SHALL 在同等匹配度下按销量降序排序
3. THE System SHALL 支持用户自定义排序(销量、价格)

---

### Requirement 3: 分页查询

**User Story:** 作为患者用户,我希望搜索结果分页显示,以便浏览大量结果

#### Acceptance Criteria

1. THE System SHALL 支持分页参数(pageNum, pageSize)
2. THE System SHALL 默认每页显示20条结果
3. THE System SHALL 返回总记录数和总页数
4. WHEN pageNum超出范围 THEN THE System SHALL 返回空列表
5. THE System SHALL 限制pageSize最大为100

---

### Requirement 4: 搜索结果高亮

**User Story:** 作为患者用户,我希望搜索关键词在结果中高亮显示,以便快速识别匹配内容

#### Acceptance Criteria

1. THE System SHALL 在药品名称中高亮关键词
2. THE System SHALL 使用HTML标签包裹关键词
3. WHEN 关键词出现多次 THEN THE System SHALL 高亮所有出现位置
4. THE System SHALL 支持多个关键词高亮

---

### Requirement 5: 搜索历史记录

**User Story:** 作为患者用户,我希望保存搜索历史,以便快速重复搜索

#### Acceptance Criteria

1. THE System SHALL 保存用户最近10次搜索记录
2. THE System SHALL 按时间倒序返回搜索历史
3. THE System SHALL 支持清空搜索历史
4. THE System SHALL 支持删除单条搜索记录
5. WHEN 搜索相同关键词 THEN THE System SHALL 更新记录时间

---

### Requirement 6: 热门搜索推荐

**User Story:** 作为患者用户,我希望看到热门搜索词,以便发现常用药品

#### Acceptance Criteria

1. THE System SHALL 返回热门搜索词列表
2. THE System SHALL 限制返回数量不超过10个
3. THE System SHALL 基于搜索频率统计热门词
4. THE System SHALL 每小时更新热门搜索词

---

### Requirement 7: 搜索性能优化

**User Story:** 作为系统管理员,我需要优化搜索性能,以便提供快速响应

#### Acceptance Criteria

1. THE System SHALL 在1秒内返回搜索结果
2. THE System SHALL 使用数据库索引优化查询
3. THE System SHALL 缓存热门搜索结果
4. THE System SHALL 支持并发1000个搜索请求

---

### Requirement 8: 错误处理

**User Story:** 作为患者用户,当搜索出错时,我希望看到清晰的错误提示

#### Acceptance Criteria

1. WHEN 关键词为空 THEN THE System SHALL 返回"请输入搜索关键词"
2. WHEN 关键词过长(>50字符) THEN THE System SHALL 返回"关键词过长"
3. WHEN 数据库查询失败 THEN THE System SHALL 返回"搜索失败,请稍后重试"
4. THE System SHALL 记录所有错误日志

---

## 非功能性需求

### 性能要求

1. THE System SHALL 在1秒内返回搜索结果(100条)
2. THE System SHALL 支持并发1000个搜索请求
3. THE System SHALL 数据库查询时间<500ms

### 兼容性要求

1. THE System SHALL 兼容现有的DrugMallController
2. THE System SHALL 复用现有的DrugDTO模型
3. THE System SHALL 与图片解析功能集成

### 安全要求

1. THE System SHALL 防止SQL注入攻击
2. THE System SHALL 过滤特殊字符
3. THE System SHALL 限制搜索频率(防止爬虫)

---

## 约束条件

1. 必须验证现有API实现是否满足需求
2. 如需补充,必须保持API风格一致
3. 搜索历史存储在Redis中
4. 热门搜索词每小时更新一次

---

## API接口定义

### 1. 搜索药品
```
GET /api/v1/mall/drugs/search?keyword={keyword}&pageNum=1&pageSize=20&sortBy=sales

Response:
{
  "code": 200,
  "data": {
    "list": [
      {
        "drugId": 1001,
        "drugName": "阿莫西林胶囊",
        "drugImages": ["http://img1.jpg"],
        "price": 15.50,
        "sales": 1200,
        "manufacturer": "XX制药"
      }
    ],
    "total": 50,
    "pageNum": 1,
    "pageSize": 20
  }
}
```

### 2. 获取搜索历史
```
GET /api/v1/mall/drugs/search/history?userId={userId}

Response:
{
  "code": 200,
  "data": [
    {
      "keyword": "阿莫西林",
      "searchTime": "2026-01-23 10:30:00"
    }
  ]
}
```

### 3. 清空搜索历史
```
DELETE /api/v1/mall/drugs/search/history?userId={userId}

Response:
{
  "code": 200,
  "message": "清空成功"
}
```

### 4. 获取热门搜索
```
GET /api/v1/mall/drugs/search/hot

Response:
{
  "code": 200,
  "data": [
    {
      "keyword": "感冒药",
      "searchCount": 1500
    }
  ]
}
```

---

## 验收标准

- [ ] 能按关键词搜索药品
- [ ] 支持模糊匹配和精确匹配
- [ ] 搜索结果按相关性排序
- [ ] 分页功能正常
- [ ] 搜索历史功能正常
- [ ] 热门搜索功能正常
- [ ] 性能满足要求
- [ ] 错误处理完善
- [ ] 所有测试通过

---

## 参考文档

- [DrugMallController实现](../../../internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/mall/controller/DrugMallController.java)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
- [父级需求文档](../patient-drug-mall/requirements.md)
