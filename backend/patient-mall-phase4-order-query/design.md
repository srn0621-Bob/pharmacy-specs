# Spec 9: 订单查询功能 - 设计文档

## 文档信息

**Spec编号:** patient-mall-phase4-order-query  
**功能名称:** 订单查询功能  
**所属阶段:** 阶段四 - 订单功能  
**创建日期:** 2026-01-23

---

## 系统架构

```
Controller Layer
  ↓
Service Layer
  ├─ OrderService.getOrderList()
  └─ OrderService.getOrderDetail()
  ↓
Mapper Layer
  ├─ OrderMapper.selectOrderList()
  ├─ OrderMapper.selectOrderCount()
  ├─ OrderMapper.selectOrderById()
  └─ OrderMapper.selectOrderItems()
```

---

## 核心查询SQL

### 订单列表查询

```sql
SELECT 
    o.id,
    o.order_num,
    o.total_amount,
    o.shipping_fee,
    o.actual_amount,
    o.status,
    o.pay_status,
    o.pay_time,
    o.create_time
FROM t_hos_pre_drug_order o
WHERE o.patient_user_id = #{patientUserId}
<if test="status != null and status != 0">
    AND o.status = #{status}
</if>
<if test="keyword != null and keyword != ''">
    AND (o.order_num LIKE CONCAT('%', #{keyword}, '%')
         OR EXISTS (
             SELECT 1 FROM t_hos_pre_drug_order_item oi
             WHERE oi.order_id = o.id
             AND oi.drug_name LIKE CONCAT('%', #{keyword}, '%')
         ))
</if>
ORDER BY o.create_time DESC
LIMIT #{offset}, #{pageSize}
```

### 订单详情查询

```sql
SELECT 
    o.*
FROM t_hos_pre_drug_order o
WHERE o.id = #{orderId}
AND o.patient_user_id = #{patientUserId}
```

### 订单商品查询

```sql
SELECT 
    oi.*
FROM t_hos_pre_drug_order_item oi
WHERE oi.order_id = #{orderId}
ORDER BY oi.id
```

---

## 数据脱敏

### 手机号脱敏
```java
/**
 * 手机号脱敏
 * 138****8000
 */
public static String maskPhone(String phone) {
    if (phone == null || phone.length() != 11) {
        return phone;
    }
    return phone.substring(0, 3) + "****" + phone.substring(7);
}
```

---

## 缓存策略

### 订单详情缓存
```java
// 缓存key: order:detail:{orderId}
// 缓存时间: 5分钟
String cacheKey = "order:detail:" + orderId;
DrugOrderDTO order = redisTemplate.opsForValue().get(cacheKey);
if (order == null) {
    order = orderMapper.selectOrderById(orderId);
    redisTemplate.opsForValue().set(cacheKey, order, 5, TimeUnit.MINUTES);
}
```

---

## 性能优化

1. **索引优化**
   - `idx_patient_user_id_create_time` 复合索引
   - `idx_status` 状态索引

2. **分页优化**
   - 使用LIMIT分页
   - 避免深度分页

3. **N+1查询优化**
   - 批量查询订单商品
   - 使用JOIN减少查询次数

---

## 相关文档

- [需求文档](./requirements.md)
- [任务列表](./tasks.md)
- [订单创建设计](../patient-mall-phase4-order-create/design.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
