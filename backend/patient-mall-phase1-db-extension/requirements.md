# 需求文档 - t_drug表商城字段扩展

## 文档信息

**功能名称:** t_drug表商城字段扩展  
**项目:** 互联网医院 - 患者端药品商城  
**版本:** v1.0  
**创建日期:** 2026-01-23  
**父级Spec:** patient-drug-mall

---

## 简介

为现有的t_drug表添加药品商城所需的扩展字段,支持商城功能的销量统计、促销标签、分类管理等特性。这是药品商城功能的基础数据准备工作。

---

## 术语表 (Glossary)

- **t_drug**: 现有的药品表
- **Mall_Extension_Fields**: 商城扩展字段
- **Database_Migration**: 数据库迁移
- **Index**: 数据库索引

---

## 需求

### Requirement 1: 添加商城扩展字段

**User Story:** 作为系统管理员,我需要为t_drug表添加商城扩展字段,以便支持药品商城功能

#### Acceptance Criteria

1. THE System SHALL 在t_drug表中添加sales字段(INT类型,默认值0)用于记录销量
2. THE System SHALL 在t_drug表中添加add_to_cart_count字段(INT类型,默认值0)用于记录加购数量
3. THE System SHALL 在t_drug表中添加is_free_shipping字段(TINYINT类型,默认值1)用于标识是否包邮
4. THE System SHALL 在t_drug表中添加has_price_guarantee字段(TINYINT类型,默认值1)用于标识是否价保
5. THE System SHALL 在t_drug表中添加price_guarantee_days字段(INT类型,默认值7)用于记录价保天数
6. THE System SHALL 在t_drug表中添加is_recommended字段(TINYINT类型,默认值0)用于标识是否推荐
7. THE System SHALL 在t_drug表中添加original_price字段(DECIMAL类型)用于记录原价
8. THE System SHALL 在t_drug表中添加category_id字段(BIGINT类型)用于关联商城分类

---

### Requirement 2: 创建索引优化查询

**User Story:** 作为系统管理员,我需要为新增字段创建索引,以便提高查询性能

#### Acceptance Criteria

1. THE System SHALL 为category_id字段创建索引idx_category_id
2. THE System SHALL 为is_recommended字段创建索引idx_is_recommended
3. THE System SHALL 为sales字段创建索引idx_sales用于按销量排序
4. WHEN 创建索引 THEN THE System SHALL 不影响现有数据和查询

---

### Requirement 3: 数据完整性保护

**User Story:** 作为系统管理员,我需要确保数据库迁移不影响现有数据,以便保证系统稳定运行

#### Acceptance Criteria

1. WHEN 执行数据库迁移 THEN THE System SHALL 保留所有现有数据
2. WHEN 执行数据库迁移 THEN THE System SHALL 保留所有现有索引和约束
3. WHEN 执行数据库迁移 THEN THE System SHALL 为新字段设置合理的默认值
4. WHEN 迁移失败 THEN THE System SHALL 支持回滚操作

---

### Requirement 4: 迁移脚本可重复执行

**User Story:** 作为系统管理员,我需要迁移脚本支持重复执行,以便在不同环境中安全部署

#### Acceptance Criteria

1. WHEN 字段已存在 THEN THE System SHALL 跳过字段创建不报错
2. WHEN 索引已存在 THEN THE System SHALL 跳过索引创建不报错
3. THE System SHALL 在脚本中使用IF NOT EXISTS检查
4. THE System SHALL 记录迁移执行日志

---

## 非功能性需求

### 性能要求

1. THE System SHALL 在5分钟内完成数据库迁移
2. THE System SHALL 在迁移过程中不锁表超过10秒
3. THE System SHALL 支持在线迁移(不停机)

### 安全要求

1. THE System SHALL 在执行迁移前备份数据
2. THE System SHALL 在测试环境验证后再在生产环境执行
3. THE System SHALL 记录迁移操作的审计日志

---

## 约束条件

1. 必须使用ALTER TABLE语句而非重建表
2. 必须保持与现有t_drug表结构的兼容性
3. 必须在非业务高峰期执行迁移
4. 迁移脚本必须支持MySQL 8.0

---

## 验收标准

- [ ] t_drug表成功添加所有8个新字段
- [ ] 所有新字段都有正确的数据类型和默认值
- [ ] 成功创建3个新索引
- [ ] 现有数据完整无损
- [ ] 现有功能正常运行
- [ ] 迁移脚本可重复执行
- [ ] 在测试环境验证通过

---

## 参考文档

- [数据库迁移脚本](../../../internet-hospital/sql/alter_t_drug_add_mall_fields.sql)
- [t_drug表结构](../../../internet-hospital/sql/t_drug.sql)
- [父级需求文档](../patient-drug-mall/requirements.md)
