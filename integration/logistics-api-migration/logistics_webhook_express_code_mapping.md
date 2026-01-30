# 物流Webhook快递公司代码映射实现

## 一、需求说明

在物流webhook接口 `api/v1/logistics/webhook` 接收到发货事件时，需要根据传入的 `logistics_company`（快递公司名称）自动映射到对应的快递公司代码，并更新到 `t_hos_pre_drug_order` 表的 `express_code` 字段。

## 二、快递公司映射表

| 快递公司名称 | 快递公司代码 |
|------------|------------|
| 申通快递 | shentong |
| 韵达国际 | yunda |
| 韵达快递 | yunda |
| 中通快递 | zhongtong |
| 圆通快递 | yuantong |
| 邮政快递 | youzhengguonei |
| EMS | ems |
| 顺丰速运 | shunfeng |
| 顺丰快递 | shunfeng |
| 优速快递 | youshuwuliu |
| 德邦快递 | debangkuaidi |
| 极兔速递 | jtexpress |
| 菜鸟速递 | danniao |
| 京东快递 | jd |

## 三、实现方案

### 3.1 更新ExpressCompanyCode常量类

**文件位置**：`internet-hospital/adinnet-common/src/main/java/com/adinnet/common/constants/ExpressCompanyCode.java`

**主要改动**：
1. 添加所有快递公司的代码常量
2. 创建快递公司名称到代码的映射表（HashMap）
3. 提供静态方法进行名称到代码的转换

**核心方法**：
```java
/**
 * 根据快递公司名称获取对应的快递公司代码
 * 
 * @param companyName 快递公司名称
 * @return 快递公司代码，如果未找到则返回null
 */
public static String getCodeByName(String companyName)

/**
 * 根据快递公司名称获取对应的快递公司代码，如果未找到则返回默认值
 * 
 * @param companyName 快递公司名称
 * @param defaultCode 默认代码
 * @return 快递公司代码
 */
public static String getCodeByNameOrDefault(String companyName, String defaultCode)

/**
 * 检查快递公司名称是否被支持
 * 
 * @param companyName 快递公司名称
 * @return 是否支持
 */
public static boolean isSupportedCompany(String companyName)
```

### 3.2 更新HosPreDrugMapper

**Mapper接口**：`internet-hospital/adinnet-admin/src/main/java/com/adinnet/admin/system/mapper/HosPreDrugMapper.java`

**改动**：在 `updateLogisticsInfo` 方法中添加 `expressCode` 参数

```java
int updateLogisticsInfo(@Param("orderNum") String orderNum,
                       @Param("shippingNo") String shippingNo,
                       @Param("expressName") String expressName,
                       @Param("expressCode") String expressCode);
```

**XML映射文件**：`internet-hospital/adinnet-admin/src/main/resources/xml/HosPreDrugMapper.xml`

**改动**：在UPDATE语句中添加 `express_code` 字段的更新

```xml
<update id="updateLogisticsInfo">
    UPDATE t_hos_pre_drug_order
    SET shipping_no = #{shippingNo},
        express_name = #{expressName},
        <if test="expressCode != null and expressCode != ''">
        express_code = #{expressCode},
        </if>
        update_time = NOW()
    WHERE order_num = #{orderNum}
</update>
```

**说明**：使用 `<if>` 标签判断，只有当 `expressCode` 不为空时才更新该字段，避免将已有的代码清空。

### 3.3 更新LogisticsWebhookServiceImpl

**文件位置**：`internet-hospital/adinnet-admin/src/main/java/com/adinnet/admin/system/service/impl/LogisticsWebhookServiceImpl.java`

**主要改动**：

1. 导入 `ExpressCompanyCode` 类
```java
import com.adinnet.common.constants.ExpressCompanyCode;
```

2. 在更新订单物流信息时，添加快递公司代码映射逻辑
```java
// 6. 更新订单物流信息
String orderId = event.getData().getOrderId();
String logisticsCompany = event.getData().getLogisticsCompany();
String logisticsCode = event.getData().getLogisticsCode();

// 根据快递公司名称获取快递公司代码
String expressCode = ExpressCompanyCode.getCodeByName(logisticsCompany);

if (expressCode != null) {
    logger.info("Mapped logistics company '{}' to express code: {}", 
                logisticsCompany, expressCode);
} else {
    logger.warn("No express code mapping found for logistics company: {}, " +
                "will not update express_code field", logisticsCompany);
}

int updated = hosPreDrugMapper.updateLogisticsInfo(
        orderId,
        logisticsCode,
        logisticsCompany,
        expressCode
);
```

## 四、处理逻辑

### 4.1 正常流程

1. Webhook接收到发货事件，包含 `logistics_company` 字段（如"申通快递"）
2. 调用 `ExpressCompanyCode.getCodeByName("申通快递")`
3. 返回对应的代码 `"shentong"`
4. 更新数据库时同时更新：
   - `shipping_no` = 快递单号
   - `express_name` = "申通快递"
   - `express_code` = "shentong"
   - `update_time` = 当前时间

### 4.2 未匹配情况

如果传入的快递公司名称不在映射表中（如"其他快递"）：
1. `ExpressCompanyCode.getCodeByName("其他快递")` 返回 `null`
2. 记录警告日志
3. 更新数据库时：
   - `shipping_no` = 快递单号
   - `express_name` = "其他快递"
   - `express_code` = 不更新（保持原值或NULL）
   - `update_time` = 当前时间

### 4.3 日志记录

**成功映射**：
```
INFO - Mapped logistics company '申通快递' to express code: shentong
INFO - Successfully updated logistics info for order: ORDER123, express_code: shentong
```

**未找到映射**：
```
WARN - No express code mapping found for logistics company: 其他快递, will not update express_code field
INFO - Successfully updated logistics info for order: ORDER123, express_code: null
```

## 五、测试验证

### 5.1 测试用例

#### 测试用例1：申通快递
**请求**：
```json
{
  "id": "evt_001",
  "type": "order.shipped",
  "timestamp": 1705651200000,
  "data": {
    "order_id": "ORDER123",
    "logistics_code": "123456789",
    "logistics_company": "申通快递"
  }
}
```

**预期结果**：
- `express_code` 更新为 `"shentong"`
- 日志显示映射成功

#### 测试用例2：韵达国际
**请求**：
```json
{
  "id": "evt_002",
  "type": "order.shipped",
  "timestamp": 1705651200000,
  "data": {
    "order_id": "ORDER124",
    "logistics_code": "987654321",
    "logistics_company": "韵达国际"
  }
}
```

**预期结果**：
- `express_code` 更新为 `"yunda"`
- 日志显示映射成功

#### 测试用例3：未知快递公司
**请求**：
```json
{
  "id": "evt_003",
  "type": "order.shipped",
  "timestamp": 1705651200000,
  "data": {
    "order_id": "ORDER125",
    "logistics_code": "111222333",
    "logistics_company": "未知快递"
  }
}
```

**预期结果**：
- `express_code` 不更新（保持原值）
- 日志显示警告信息

### 5.2 数据库验证

**查询SQL**：
```sql
SELECT 
    order_num,
    shipping_no,
    express_name,
    express_code,
    update_time
FROM t_hos_pre_drug_order
WHERE order_num IN ('ORDER123', 'ORDER124', 'ORDER125');
```

**预期结果**：
| order_num | shipping_no | express_name | express_code | update_time |
|-----------|------------|-------------|--------------|-------------|
| ORDER123 | 123456789 | 申通快递 | shentong | 2026-01-19 ... |
| ORDER124 | 987654321 | 韵达国际 | yunda | 2026-01-19 ... |
| ORDER125 | 111222333 | 未知快递 | NULL | 2026-01-19 ... |

## 六、扩展性

### 6.1 添加新的快递公司

如需添加新的快递公司映射，只需在 `ExpressCompanyCode` 类中：

1. 添加常量定义：
```java
/**
 * 新快递公司
 */
public static final String NEW_EXPRESS = "new_express";
```

2. 在静态初始化块中添加映射：
```java
static {
    // ... 其他映射
    COMPANY_NAME_TO_CODE_MAP.put("新快递公司", NEW_EXPRESS);
}
```

### 6.2 支持模糊匹配

如果需要支持模糊匹配（如"顺丰"匹配"顺丰速运"），可以扩展 `getCodeByName` 方法：

```java
public static String getCodeByName(String companyName) {
    if (companyName == null || companyName.trim().isEmpty()) {
        return null;
    }
    
    String trimmedName = companyName.trim();
    
    // 1. 精确匹配
    String code = COMPANY_NAME_TO_CODE_MAP.get(trimmedName);
    if (code != null) {
        return code;
    }
    
    // 2. 模糊匹配
    for (Map.Entry<String, String> entry : COMPANY_NAME_TO_CODE_MAP.entrySet()) {
        if (entry.getKey().contains(trimmedName) || trimmedName.contains(entry.getKey())) {
            return entry.getValue();
        }
    }
    
    return null;
}
```

## 七、注意事项

1. **大小写敏感**：当前实现对快递公司名称大小写敏感，需要完全匹配
2. **空格处理**：已使用 `trim()` 处理前后空格
3. **NULL处理**：如果快递公司名称为NULL或未找到映射，`express_code` 字段不会被更新
4. **向后兼容**：现有的订单数据不受影响，只有新的webhook事件会更新 `express_code`
5. **日志监控**：建议监控警告日志，及时发现未映射的快递公司名称

## 八、相关文件

### 修改的文件
1. `internet-hospital/adinnet-common/src/main/java/com/adinnet/common/constants/ExpressCompanyCode.java`
2. `internet-hospital/adinnet-admin/src/main/java/com/adinnet/admin/system/mapper/HosPreDrugMapper.java`
3. `internet-hospital/adinnet-admin/src/main/resources/xml/HosPreDrugMapper.xml`
4. `internet-hospital/adinnet-admin/src/main/java/com/adinnet/admin/system/service/impl/LogisticsWebhookServiceImpl.java`

### 相关文档
1. `internet-hospital/docs/logistics_webhook_field_fix.md` - 物流webhook字段修复文档
2. `.kiro/specs/logistics-webhook/design.md` - 物流webhook设计文档

---

**文档版本**：v1.0  
**创建日期**：2026-01-19  
**作者**：System
