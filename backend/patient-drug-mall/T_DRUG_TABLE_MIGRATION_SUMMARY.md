# 药品表迁移总结 - 使用现有t_drug表

## 更新日期
2026-01-23

## 更新概述

将药品商城功能的数据表从计划中的 `d_drug_list` 改为使用现有的 `t_drug` 表,避免数据重复,提高系统一致性。

---

## 变更内容

### 1. 数据表变更

**原计划:**
- 创建新表 `d_drug_list` 存储商城药品数据

**现方案:**
- 使用现有表 `t_drug`
- 添加商城所需的扩展字段

### 2. t_drug表结构说明

**现有关键字段:**
```sql
id                  BIGINT          主键ID
name                VARCHAR(100)    药品名称
sku_code            VARCHAR(100)    药品编号(唯一)
pic_position        TEXT            图片位置(JSON格式)
size                VARCHAR(100)    药品规格
price               DECIMAL(16,2)   药品单价
quantity            INT(6)          库存数量
manufacturers       VARCHAR(100)    厂家
approval_number     VARCHAR(100)    批准文号
content             LONGTEXT        药品说明书(HTML)
status              TINYINT(4)      状态(1:启用 0:停用)
create_time         DATETIME        创建时间
update_time         DATETIME        更新时间
```

**需要添加的商城字段:**
```sql
sales                   INT             销量
add_to_cart_count       INT             加购数量
is_free_shipping        TINYINT(1)      是否包邮
has_price_guarantee     TINYINT(1)      是否价保
price_guarantee_days    INT             价保天数
has_installment         TINYINT(1)      是否支持分期
installment_info        VARCHAR(100)    分期信息
is_new                  TINYINT(1)      是否新品
is_recommended          TINYINT(1)      是否推荐
original_price          DECIMAL(16,2)   原价
category_id             BIGINT          商城分类ID
```

### 3. 字段映射关系

| 原设计字段 | t_drug字段 | 说明 |
|-----------|-----------|------|
| drugId | id | 主键ID |
| drugName | name | 药品名称 |
| drugCode | sku_code | 药品编码 |
| drugImages | pic_position | 图片(JSON格式,需解析) |
| specification | size | 规格 |
| price | price | 价格 |
| stock | quantity | 库存 |
| manufacturer | manufacturers | 生产厂家 |
| approvalNumber | approval_number | 批准文号 |
| instructions | content | 说明书(HTML) |
| - | status | 状态(1:启用 0:停用) |

---

## 已更新的文档

### 1. design.md ✅
- 更新了数据模型部分的Drug类定义
- 更新了数据库表设计,改为使用t_drug表
- 添加了字段映射说明

### 2. API需求补充说明.md ✅
- 更新了数据模型补充部分
- 修改了SQL脚本,使用ALTER TABLE t_drug
- 更新了后端开发任务清单

### 3. 药品商城功能详细修改文档.md ✅
- 更新了数据模型部分的Drug类定义
- 添加了字段对应关系注释

### 4. requirements.md ✅
- 更新了术语表,标注Drug对应t_drug表

### 5. 新增SQL迁移脚本 ✅
- 创建了 `alter_t_drug_add_mall_fields.sql`
- 包含所有需要添加的字段和索引
- 添加了执行注意事项

---

## 数据迁移脚本

**文件位置:** `internet-hospital/sql/alter_t_drug_add_mall_fields.sql`

**执行步骤:**
1. 备份t_drug表数据
2. 执行ALTER TABLE语句添加新字段
3. 更新现有药品数据,设置合适的默认值
4. 验证字段添加成功

**关键SQL:**
```sql
-- 添加商城相关字段
ALTER TABLE t_drug ADD COLUMN sales INT DEFAULT 0 COMMENT '销量';
ALTER TABLE t_drug ADD COLUMN add_to_cart_count INT DEFAULT 0 COMMENT '加购数量';
ALTER TABLE t_drug ADD COLUMN is_free_shipping TINYINT(1) DEFAULT 1 COMMENT '是否包邮';
ALTER TABLE t_drug ADD COLUMN has_price_guarantee TINYINT(1) DEFAULT 1 COMMENT '是否价保';
ALTER TABLE t_drug ADD COLUMN price_guarantee_days INT DEFAULT 7 COMMENT '价保天数';
ALTER TABLE t_drug ADD COLUMN has_installment TINYINT(1) DEFAULT 0 COMMENT '是否支持分期';
ALTER TABLE t_drug ADD COLUMN installment_info VARCHAR(100) COMMENT '分期信息';
ALTER TABLE t_drug ADD COLUMN is_new TINYINT(1) DEFAULT 0 COMMENT '是否新品';
ALTER TABLE t_drug ADD COLUMN is_recommended TINYINT(1) DEFAULT 0 COMMENT '是否推荐';
ALTER TABLE t_drug ADD COLUMN original_price DECIMAL(16,2) COMMENT '原价';
ALTER TABLE t_drug ADD COLUMN category_id BIGINT COMMENT '商城分类ID';

-- 添加索引
ALTER TABLE t_drug ADD INDEX idx_category_id (category_id);
ALTER TABLE t_drug ADD INDEX idx_is_recommended (is_recommended);
ALTER TABLE t_drug ADD INDEX idx_sales (sales);
```

---

## 代码实现注意事项

### 1. 图片处理

**t_drug.pic_position字段说明:**
- 存储格式: JSON字符串
- 需要在Service层解析为List<String>
- 示例: `["http://example.com/img1.jpg", "http://example.com/img2.jpg"]`

**处理代码示例:**
```java
// 解析图片JSON
private List<String> parseDrugImages(String picPosition) {
    if (StringUtils.isEmpty(picPosition)) {
        return Collections.emptyList();
    }
    try {
        return JSON.parseArray(picPosition, String.class);
    } catch (Exception e) {
        log.error("解析药品图片失败: {}", picPosition, e);
        return Collections.emptyList();
    }
}
```

### 2. Mapper查询

**DrugMapper.xml示例:**
```xml
<select id="selectById" resultType="Drug">
    SELECT 
        id,
        name,
        sku_code as skuCode,
        pic_position as picPosition,
        size,
        price,
        quantity,
        manufacturers,
        approval_number as approvalNumber,
        content,
        category_id as categoryId,
        sales,
        add_to_cart_count as addToCartCount,
        is_free_shipping as isFreeShipping,
        has_price_guarantee as hasPriceGuarantee,
        price_guarantee_days as priceGuaranteeDays,
        is_recommended as isRecommended,
        original_price as originalPrice,
        create_time as createTime,
        update_time as updateTime
    FROM t_drug
    WHERE id = #{drugId}
    AND status = 1
</select>
```

### 3. 库存管理

**注意事项:**
- t_drug.quantity字段已存在,用于库存管理
- 订单创建时需要扣减库存
- 使用乐观锁防止超卖
- 订单取消时需要恢复库存

**库存扣减示例:**
```java
@Update("UPDATE t_drug SET quantity = quantity - #{quantity} " +
        "WHERE id = #{drugId} AND quantity >= #{quantity}")
int deductStock(@Param("drugId") Long drugId, @Param("quantity") Integer quantity);
```

### 4. 状态过滤

**重要:**
- t_drug.status字段: 1=启用, 0=停用
- 所有查询都需要添加 `status = 1` 条件
- 只展示启用状态的药品

---

## 优势分析

### 1. 数据一致性
- 避免药品数据重复存储
- 统一的药品信息管理
- 减少数据同步问题

### 2. 维护成本
- 无需维护两套药品数据
- 药品信息更新自动同步
- 减少数据不一致风险

### 3. 系统集成
- 与现有处方系统共享药品数据
- 便于未来功能扩展
- 统一的药品编码体系

---

## 后续工作

### 高优先级
1. ✅ 更新相关文档
2. ⚠️ 执行数据库迁移脚本
3. ⚠️ 实现图片JSON解析逻辑
4. ⚠️ 更新DrugMapper查询语句
5. ⚠️ 实现库存管理逻辑

### 中优先级
6. ⚠️ 初始化现有药品的商城字段数据
7. ⚠️ 创建药品分类关联关系
8. ⚠️ 测试图片显示功能

### 低优先级
9. 优化图片加载性能
10. 实现图片CDN加速

---

## 风险提示

### 1. 数据迁移风险
- **风险:** 添加字段可能影响现有功能
- **缓解:** 执行前备份数据,在测试环境先验证

### 2. 图片格式兼容性
- **风险:** pic_position字段可能存在非JSON格式数据
- **缓解:** 添加异常处理,兼容空值和错误格式

### 3. 库存并发问题
- **风险:** 高并发下可能出现超卖
- **缓解:** 使用乐观锁或分布式锁

---

## 验收标准

### 数据库层面
- [ ] t_drug表成功添加所有新字段
- [ ] 索引创建成功
- [ ] 现有数据不受影响

### 代码层面
- [ ] Drug模型类字段映射正确
- [ ] 图片JSON解析功能正常
- [ ] Mapper查询返回完整数据
- [ ] 库存扣减逻辑正确

### 功能层面
- [ ] 商城首页能正常显示药品
- [ ] 药品详情页信息完整
- [ ] 图片能正常加载显示
- [ ] 库存数量准确

---

## 总结

通过使用现有的t_drug表,我们实现了:
1. 数据统一管理,避免重复
2. 降低维护成本
3. 提高系统一致性
4. 便于未来扩展

所有相关文档已更新完成,数据库迁移脚本已准备就绪,可以开始后端开发工作。

---

**文档更新完成日期:** 2026-01-23  
**文档版本:** v1.0  
**更新人员:** Kiro AI Assistant
