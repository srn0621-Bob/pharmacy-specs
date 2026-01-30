# 需求文档 - 药品分类查询功能

## 文档信息

**功能名称:** 药品分类查询功能  
**项目:** 互联网医院 - 患者端药品商城  
**版本:** v1.0  
**创建日期:** 2026-01-23  
**父级Spec:** patient-drug-mall

---

## 简介

实现药品分类查询功能,包括获取分类列表、快捷分类列表和按分类查询药品。支持商城首页的分类导航和分类药品展示。

---

## 术语表 (Glossary)

- **Drug_Category**: 药品分类
- **Quick_Category**: 快捷分类(首页横向滚动展示)
- **Category_List**: 分类列表
- **Category_Drug_List**: 分类药品列表

---

## 需求

### Requirement 1: 获取药品分类列表

**User Story:** 作为患者用户,我想查看药品分类列表,以便选择我需要的药品类别

#### Acceptance Criteria

1. WHEN Patient_User 请求分类列表 THEN THE System SHALL 返回所有启用的药品分类
2. THE System SHALL 按sortOrder字段升序排序分类
3. THE System SHALL 返回分类ID、名称、图标、排序字段
4. WHEN 分类为空 THEN THE System SHALL 返回空数组
5. THE System SHALL 支持分类层级结构(父子分类)

---

### Requirement 2: 获取快捷分类列表

**User Story:** 作为患者用户,我想在首页看到快捷分类,以便快速访问常用分类

#### Acceptance Criteria

1. WHEN Patient_User 请求快捷分类 THEN THE System SHALL 返回标记为快捷分类的分类列表
2. THE System SHALL 只返回isQuickCategory=true的分类
3. THE System SHALL 按sortOrder升序排序
4. THE System SHALL 限制返回数量不超过10个
5. THE System SHALL 返回分类图标URL和本地资源ID

---

### Requirement 3: 按分类查询药品

**User Story:** 作为患者用户,我想查看某个分类下的所有药品,以便浏览和选购

#### Acceptance Criteria

1. WHEN Patient_User 选择分类 THEN THE System SHALL 返回该分类下的所有药品
2. THE System SHALL 只返回status=1的启用药品
3. THE System SHALL 支持分页查询(pageNum, pageSize)
4. THE System SHALL 返回药品总数和分页信息
5. WHEN 分类不存在 THEN THE System SHALL 返回错误提示
6. WHEN 分类下无药品 THEN THE System SHALL 返回空列表

---

### Requirement 4: 分类药品数量统计

**User Story:** 作为患者用户,我想看到每个分类的药品数量,以便了解分类规模

#### Acceptance Criteria

1. WHEN 返回分类列表 THEN THE System SHALL 包含每个分类的药品数量
2. THE System SHALL 只统计status=1的启用药品
3. WHEN 分类下无药品 THEN THE System SHALL 显示数量为0
4. THE System SHALL 使用缓存优化统计性能

---

### Requirement 5: 分类数据缓存

**User Story:** 作为系统管理员,我需要缓存分类数据,以便提高查询性能

#### Acceptance Criteria

1. THE System SHALL 缓存分类列表数据
2. THE System SHALL 设置缓存过期时间为1小时
3. WHEN 分类数据更新 THEN THE System SHALL 刷新缓存
4. THE System SHALL 提供手动刷新缓存接口

---

### Requirement 6: 错误处理

**User Story:** 作为患者用户,当查询出错时,我希望看到清晰的错误提示

#### Acceptance Criteria

1. WHEN 分类ID无效 THEN THE System SHALL 返回"分类不存在"错误
2. WHEN 数据库查询失败 THEN THE System SHALL 返回"查询失败,请稍后重试"
3. WHEN 参数错误 THEN THE System SHALL 返回具体的参数错误信息
4. THE System SHALL 记录所有错误日志

---

## 非功能性需求

### 性能要求

1. THE System SHALL 在500ms内返回分类列表
2. THE System SHALL 在1秒内返回分类药品列表(100条)
3. THE System SHALL 支持并发1000个查询请求

### 兼容性要求

1. THE System SHALL 兼容现有的DrugMallController
2. THE System SHALL 复用现有的DrugDTO模型
3. THE System SHALL 与图片解析功能集成

---

## 约束条件

1. 必须验证现有API实现是否满足需求
2. 如需补充,必须保持API风格一致
3. 必须使用现有的分类数据结构
4. 分类数据可以硬编码或从数据库读取

---

## API接口定义

### 1. 获取分类列表
```
GET /api/v1/mall/drugs/categories

Response:
{
  "code": 200,
  "data": [
    {
      "categoryId": 1,
      "categoryName": "为你推荐",
      "categoryIcon": "http://...",
      "sortOrder": 1,
      "drugCount": 120
    }
  ]
}
```

### 2. 获取快捷分类
```
GET /api/v1/mall/drugs/quick-categories

Response:
{
  "code": 200,
  "data": [
    {
      "categoryId": 1,
      "categoryName": "隐形美瞳",
      "categoryIcon": "http://...",
      "iconResId": "ic_category_lenses",
      "sortOrder": 1,
      "isHot": true
    }
  ]
}
```

### 3. 按分类查询药品
```
GET /api/v1/mall/drugs/category/{categoryId}?pageNum=1&pageSize=20

Response:
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 50,
    "pageNum": 1,
    "pageSize": 20
  }
}
```

---

## 验收标准

- [ ] 能获取药品分类列表
- [ ] 能获取快捷分类列表
- [ ] 能按分类查询药品
- [ ] 分类数量统计正确
- [ ] 分页功能正常
- [ ] 缓存功能正常
- [ ] 错误处理完善
- [ ] 性能满足要求
- [ ] 所有测试通过

---

## 参考文档

- [DrugMallController实现](../../../internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/mall/controller/DrugMallController.java)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
- [父级需求文档](../patient-drug-mall/requirements.md)
