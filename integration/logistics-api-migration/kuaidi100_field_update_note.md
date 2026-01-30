# 快递100集成 - 字段使用说明

## 字段变更说明

### 原计划
最初计划添加新字段 `express_company` 用于存储快递公司编码。

### 最终方案
经过讨论，决定**复用现有字段** `express_code`，无需添加新字段。

## 字段对比

| 项目 | 原计划 | 最终方案 |
|-----|--------|---------|
| 字段名 | express_company | express_code |
| 是否新增 | 是 | 否（复用现有） |
| 数据库操作 | ADD COLUMN | MODIFY COLUMN |
| Java字段名 | expressCompany | expressCode |

## 优势

1. **无需数据迁移** - 复用现有字段，避免数据迁移
2. **保持一致性** - 与现有字段命名保持一致
3. **减少变更** - 只需更新默认值和注释，不需要添加新字段
4. **向后兼容** - 现有数据无需修改

## 数据库变更

### SQL脚本
**文件**: `sql/alter_t_hos_pre_drug_order_update_express_code.sql`

```sql
-- 更新express_code字段的默认值为'yunda'（韵达）
ALTER TABLE t_hos_pre_drug_order 
MODIFY COLUMN express_code VARCHAR(50) DEFAULT 'yunda' 
COMMENT '快递公司编码（yunda-韵达，shunfeng-顺丰，yuantong-圆通，zhongtong-中通，shentong-申通，jd-京东）';

-- 为express_code字段添加索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_express_code ON t_hos_pre_drug_order(express_code);
```

### 变更内容
1. 更新 `express_code` 字段的默认值为 'yunda'
2. 更新字段注释，说明支持的快递公司编码
3. 添加索引（如果不存在），提高查询性能

## Java代码

### 模型类
**文件**: `HosPreDrugOrder.java`

```java
@ApiModelProperty(value = "快递公司编码")
@TableField("express_code")
private String expressCode;
```

**说明**: 使用现有的 `expressCode` 字段，无需添加新字段。

### Service层
**文件**: `HosPreDrugOrderServiceImpl.java`

```java
// 获取快递公司编码，如果为空则使用默认值（韵达）
String expressCode = preDrugOrder.getExpressCode();
if (StringUtils.isEmpty(expressCode)) {
    expressCode = ExpressCompanyCode.DEFAULT;
}

// 调用快递100 API查询物流信息
List logistics = Kuaidi100Util.queryLogistics(
    kuaidi100Properties.getUrl(),
    kuaidi100Properties.getCustomer(),
    kuaidi100Properties.getKey(),
    expressCode,
    logisticsNumber
);
```

## 支持的快递公司编码

| 快递公司 | 编码值 | 常量 |
|---------|-------|------|
| 韵达快递 | yunda | ExpressCompanyCode.YUNDA |
| 顺丰快递 | shunfeng | ExpressCompanyCode.SHUNFENG |
| 圆通快递 | yuantong | ExpressCompanyCode.YUANTONG |
| 中通快递 | zhongtong | ExpressCompanyCode.ZHONGTONG |
| 申通快递 | shentong | ExpressCompanyCode.SHENTONG |
| 京东快递 | jd | ExpressCompanyCode.JD |
| 默认 | yunda | ExpressCompanyCode.DEFAULT |

## 数据更新建议

如果现有订单的 `express_code` 字段为空，建议根据 `express_name` 字段更新：

```sql
-- 更新韵达快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'yunda' 
WHERE express_name LIKE '%韵达%' AND (express_code IS NULL OR express_code = '');

-- 更新顺丰快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'shunfeng' 
WHERE express_name LIKE '%顺丰%' AND (express_code IS NULL OR express_code = '');

-- 更新圆通快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'yuantong' 
WHERE express_name LIKE '%圆通%' AND (express_code IS NULL OR express_code = '');

-- 更新中通快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'zhongtong' 
WHERE express_name LIKE '%中通%' AND (express_code IS NULL OR express_code = '');

-- 更新申通快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'shentong' 
WHERE express_name LIKE '%申通%' AND (express_code IS NULL OR express_code = '');

-- 更新京东快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'jd' 
WHERE express_name LIKE '%京东%' AND (express_code IS NULL OR express_code = '');
```

## 兼容性说明

### 向后兼容
- 如果 `express_code` 为空，系统自动使用默认值 'yunda'
- 现有订单无需修改即可正常工作
- 新订单会自动使用默认值

### 数据完整性
- 建议在发货时同时设置 `express_code` 和 `express_name`
- `express_code` 用于快递100 API查询
- `express_name` 用于前端显示

## 测试建议

1. **测试空值处理**
   - 创建 `express_code` 为空的订单
   - 验证系统使用默认值 'yunda'

2. **测试不同快递公司**
   - 分别测试6家快递公司的查询
   - 验证返回的物流信息正确

3. **测试数据更新**
   - 执行数据更新SQL
   - 验证 `express_code` 字段正确更新

## 相关文档

- [完整实现文档](kuaidi100_logistics_integration_complete.md)
- [快速开始指南](kuaidi100_quick_start.md)
- [实现总结](.kiro/specs/logistics-api-migration/IMPLEMENTATION_SUMMARY.md)
