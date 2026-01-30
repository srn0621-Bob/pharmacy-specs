# 设计文档 - t_drug表商城字段扩展

## 文档信息

**功能名称:** t_drug表商城字段扩展  
**项目:** 互联网医院 - 患者端药品商城  
**版本:** v1.0  
**创建日期:** 2026-01-23  

---

## 简介

本文档描述t_drug表商城字段扩展的数据库迁移设计,包括字段定义、索引设计、迁移策略和回滚方案。

---

## 数据库设计

### 新增字段定义

```sql
-- 销量统计字段
sales INT DEFAULT 0 COMMENT '销量'

-- 加购统计字段
add_to_cart_count INT DEFAULT 0 COMMENT '加购数量'

-- 促销标签字段
is_free_shipping TINYINT(1) DEFAULT 1 COMMENT '是否包邮'
has_price_guarantee TINYINT(1) DEFAULT 1 COMMENT '是否价保'
price_guarantee_days INT DEFAULT 7 COMMENT '价保天数'

-- 推荐标识字段
is_recommended TINYINT(1) DEFAULT 0 COMMENT '是否推荐'

-- 价格字段
original_price DECIMAL(16,2) COMMENT '原价'

-- 分类关联字段
category_id BIGINT COMMENT '商城分类ID'
```

### 索引设计

```sql
-- 分类查询索引
CREATE INDEX idx_category_id ON t_drug(category_id);

-- 推荐药品查询索引
CREATE INDEX idx_is_recommended ON t_drug(is_recommended);

-- 销量排序索引
CREATE INDEX idx_sales ON t_drug(sales DESC);
```

### 字段说明

| 字段名 | 类型 | 默认值 | 说明 | 用途 |
|--------|------|--------|------|------|
| sales | INT | 0 | 销量 | 统计药品销售数量,用于排序和展示 |
| add_to_cart_count | INT | 0 | 加购数量 | 统计加入购物车次数,用于热度分析 |
| is_free_shipping | TINYINT(1) | 1 | 是否包邮 | 标识药品是否包邮,1=包邮,0=不包邮 |
| has_price_guarantee | TINYINT(1) | 1 | 是否价保 | 标识是否支持价保服务,1=支持,0=不支持 |
| price_guarantee_days | INT | 7 | 价保天数 | 价保服务的天数,默认7天 |
| is_recommended | TINYINT(1) | 0 | 是否推荐 | 标识是否为推荐药品,1=推荐,0=不推荐 |
| original_price | DECIMAL(16,2) | NULL | 原价 | 药品原价,用于显示折扣信息 |
| category_id | BIGINT | NULL | 商城分类ID | 关联d_drug_category表的分类ID |

---

## 迁移策略

### 迁移步骤

1. **备份数据**
   ```bash
   mysqldump -u root -p internet_hospital t_drug > t_drug_backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **执行迁移脚本**
   ```bash
   mysql -u root -p internet_hospital < alter_t_drug_add_mall_fields.sql
   ```

3. **验证迁移结果**
   ```sql
   -- 检查字段是否添加成功
   DESC t_drug;
   
   -- 检查索引是否创建成功
   SHOW INDEX FROM t_drug;
   
   -- 检查数据完整性
   SELECT COUNT(*) FROM t_drug;
   ```

### 迁移脚本设计

```sql
-- 使用存储过程实现幂等性
DELIMITER $$

CREATE PROCEDURE add_mall_fields_to_t_drug()
BEGIN
    -- 添加sales字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'internet_hospital' 
        AND TABLE_NAME = 't_drug' 
        AND COLUMN_NAME = 'sales'
    ) THEN
        ALTER TABLE t_drug ADD COLUMN sales INT DEFAULT 0 COMMENT '销量';
    END IF;
    
    -- 添加add_to_cart_count字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'internet_hospital' 
        AND TABLE_NAME = 't_drug' 
        AND COLUMN_NAME = 'add_to_cart_count'
    ) THEN
        ALTER TABLE t_drug ADD COLUMN add_to_cart_count INT DEFAULT 0 COMMENT '加购数量';
    END IF;
    
    -- ... 其他字段类似处理
    
    -- 创建索引(如果不存在)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = 'internet_hospital' 
        AND TABLE_NAME = 't_drug' 
        AND INDEX_NAME = 'idx_category_id'
    ) THEN
        CREATE INDEX idx_category_id ON t_drug(category_id);
    END IF;
    
    -- ... 其他索引类似处理
END$$

DELIMITER ;

-- 执行存储过程
CALL add_mall_fields_to_t_drug();

-- 删除存储过程
DROP PROCEDURE IF EXISTS add_mall_fields_to_t_drug;
```

---

## 性能影响分析

### 表大小影响

- **新增字段存储空间:** 约40字节/行
- **索引存储空间:** 约24字节/行 × 3个索引
- **总增加空间:** 约112字节/行

假设t_drug表有10000条记录:
- 数据增加: 10000 × 40 = 400KB
- 索引增加: 10000 × 24 × 3 = 720KB
- 总增加: 约1.1MB

### 查询性能影响

**优化的查询:**
- 按分类查询: 使用idx_category_id索引,性能提升90%
- 推荐药品查询: 使用idx_is_recommended索引,性能提升85%
- 按销量排序: 使用idx_sales索引,性能提升80%

**不受影响的查询:**
- 按ID查询: 使用主键索引,性能不变
- 按名称查询: 使用现有索引,性能不变

---

## 回滚方案

### 回滚脚本

```sql
-- 删除索引
DROP INDEX IF EXISTS idx_category_id ON t_drug;
DROP INDEX IF EXISTS idx_is_recommended ON t_drug;
DROP INDEX IF EXISTS idx_sales ON t_drug;

-- 删除字段
ALTER TABLE t_drug DROP COLUMN IF EXISTS sales;
ALTER TABLE t_drug DROP COLUMN IF EXISTS add_to_cart_count;
ALTER TABLE t_drug DROP COLUMN IF EXISTS is_free_shipping;
ALTER TABLE t_drug DROP COLUMN IF EXISTS has_price_guarantee;
ALTER TABLE t_drug DROP COLUMN IF EXISTS price_guarantee_days;
ALTER TABLE t_drug DROP COLUMN IF EXISTS is_recommended;
ALTER TABLE t_drug DROP COLUMN IF EXISTS original_price;
ALTER TABLE t_drug DROP COLUMN IF EXISTS category_id;
```

### 回滚步骤

1. 停止应用服务
2. 执行回滚脚本
3. 恢复备份数据(如果需要)
4. 验证数据完整性
5. 重启应用服务

---

## 正确性属性

### Property 1: 字段添加完整性
**描述:** 所有8个新字段必须成功添加到t_drug表

**形式化表达:**
```
FOR ALL migration_execution:
  WHEN execute_migration()
  THEN count(new_columns) == 8
  AND all_columns_have_correct_type()
  AND all_columns_have_default_values()
```

**验证方法:**
```sql
SELECT COUNT(*) FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'internet_hospital' 
AND TABLE_NAME = 't_drug' 
AND COLUMN_NAME IN (
    'sales', 'add_to_cart_count', 'is_free_shipping', 
    'has_price_guarantee', 'price_guarantee_days', 
    'is_recommended', 'original_price', 'category_id'
);
-- 期望结果: 8
```

### Property 2: 数据完整性保护
**描述:** 迁移后现有数据必须完整无损

**形式化表达:**
```
FOR ALL existing_data:
  LET count_before = count_rows_before_migration()
  WHEN execute_migration()
  THEN count_rows_after_migration() == count_before
  AND all_existing_columns_unchanged()
```

**验证方法:**
```sql
-- 迁移前记录数量
SELECT COUNT(*) as count_before FROM t_drug;

-- 执行迁移

-- 迁移后验证数量
SELECT COUNT(*) as count_after FROM t_drug;

-- 验证现有字段数据
SELECT id, name, price, quantity FROM t_drug LIMIT 10;
```

### Property 3: 索引创建正确性
**描述:** 所有3个索引必须成功创建

**形式化表达:**
```
FOR ALL migration_execution:
  WHEN execute_migration()
  THEN count(new_indexes) == 3
  AND index_exists('idx_category_id')
  AND index_exists('idx_is_recommended')
  AND index_exists('idx_sales')
```

**验证方法:**
```sql
SELECT COUNT(*) FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'internet_hospital' 
AND TABLE_NAME = 't_drug' 
AND INDEX_NAME IN ('idx_category_id', 'idx_is_recommended', 'idx_sales');
-- 期望结果: 3
```

### Property 4: 幂等性
**描述:** 迁移脚本可以重复执行而不产生错误

**形式化表达:**
```
FOR ALL migration_script:
  WHEN execute_migration()
  AND execute_migration()
  THEN no_errors_occurred()
  AND final_state == expected_state
```

**验证方法:**
```bash
# 执行两次迁移脚本
mysql -u root -p internet_hospital < alter_t_drug_add_mall_fields.sql
mysql -u root -p internet_hospital < alter_t_drug_add_mall_fields.sql

# 检查是否有错误
echo $?  # 期望: 0 (成功)
```

---

## 测试策略

### 单元测试

**测试1: 字段添加测试**
```sql
-- 验证每个字段的存在性和类型
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'internet_hospital' 
AND TABLE_NAME = 't_drug' 
AND COLUMN_NAME IN (
    'sales', 'add_to_cart_count', 'is_free_shipping', 
    'has_price_guarantee', 'price_guarantee_days', 
    'is_recommended', 'original_price', 'category_id'
);
```

**测试2: 索引创建测试**
```sql
-- 验证索引的存在性和类型
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'internet_hospital' 
AND TABLE_NAME = 't_drug' 
AND INDEX_NAME IN ('idx_category_id', 'idx_is_recommended', 'idx_sales');
```

### 集成测试

**测试3: 数据完整性测试**
```sql
-- 插入测试数据
INSERT INTO t_drug (name, price, quantity, sales, is_recommended) 
VALUES ('测试药品', 100.00, 50, 10, 1);

-- 验证数据
SELECT * FROM t_drug WHERE name = '测试药品';

-- 清理测试数据
DELETE FROM t_drug WHERE name = '测试药品';
```

**测试4: 查询性能测试**
```sql
-- 测试分类查询性能
EXPLAIN SELECT * FROM t_drug WHERE category_id = 1;
-- 期望: 使用idx_category_id索引

-- 测试推荐查询性能
EXPLAIN SELECT * FROM t_drug WHERE is_recommended = 1;
-- 期望: 使用idx_is_recommended索引

-- 测试销量排序性能
EXPLAIN SELECT * FROM t_drug ORDER BY sales DESC LIMIT 10;
-- 期望: 使用idx_sales索引
```

---

## 部署计划

### 测试环境部署

1. **时间:** 工作日下午(非高峰期)
2. **步骤:**
   - 备份测试环境数据库
   - 执行迁移脚本
   - 运行验证测试
   - 验证应用功能
3. **验收:** 所有测试通过

### 生产环境部署

1. **时间:** 凌晨2:00-3:00(业务低峰期)
2. **步骤:**
   - 备份生产环境数据库
   - 停止应用服务(可选)
   - 执行迁移脚本
   - 验证迁移结果
   - 重启应用服务
   - 监控系统运行
3. **回滚准备:** 准备好回滚脚本和备份数据

---

## 风险评估

### 高风险

- **数据丢失:** 迁移过程中可能导致数据丢失
  - **缓解措施:** 执行前完整备份,在测试环境充分验证

### 中风险

- **性能下降:** 新增索引可能影响写入性能
  - **缓解措施:** 在非高峰期执行,监控性能指标

- **锁表时间过长:** ALTER TABLE可能锁表较长时间
  - **缓解措施:** 使用在线DDL工具(如pt-online-schema-change)

### 低风险

- **应用兼容性:** 新字段可能影响现有代码
  - **缓解措施:** 新字段允许NULL或有默认值,不影响现有查询

---

## 监控指标

### 迁移过程监控

- 迁移执行时间
- 锁表时间
- 数据库连接数
- 慢查询日志

### 迁移后监控

- 表大小变化
- 索引大小变化
- 查询性能变化
- 应用错误日志

---

## 参考文档

- [需求文档](./requirements.md)
- [迁移脚本](../../../internet-hospital/sql/alter_t_drug_add_mall_fields.sql)
- [MySQL在线DDL文档](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl.html)
