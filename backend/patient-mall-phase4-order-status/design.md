# Spec 10: 订单状态管理 - 设计文档

## 文档信息

**Spec编号:** patient-mall-phase4-order-status  
**功能名称:** 订单状态管理  
**所属阶段:** 阶段四 - 订单功能  
**创建日期:** 2026-01-23

---

## 系统架构

```
Controller Layer
  ├─ cancelOrder()
  └─ confirmReceipt()
  ↓
Service Layer
  ├─ OrderService.cancelOrder()
  │   ├─ validateCancelPermission()
  │   ├─ updateOrderStatus()
  │   └─ restoreInventory()
  └─ OrderService.confirmReceipt()
      ├─ validateConfirmPermission()
      └─ updateOrderStatus()
  ↓
Mapper Layer
  ├─ OrderMapper.updateStatus()
  └─ InventoryMapper.increaseStock()
```

---

## 状态机设计

### 状态转换表

| 当前状态 | 允许的操作 | 目标状态 | 副作用 |
|---------|-----------|---------|--------|
| 待支付(1) | 取消订单 | 已取消(5) | 恢复库存 |
| 待支付(1) | 支付成功 | 待发货(2) | 无 |
| 待发货(2) | 取消订单 | 已取消(5) | 恢复库存、退款 |
| 待发货(2) | 商家发货 | 待收货(3) | 无 |
| 待收货(3) | 确认收货 | 已完成(4) | 无 |
| 待收货(3) | 超时自动 | 已完成(4) | 无 |

### 状态验证器

```java
/**
 * 订单状态验证器
 */
public class OrderStatusValidator {
    
    /**
     * 验证是否可以取消订单
     */
    public static boolean canCancel(Integer currentStatus) {
        return currentStatus == OrderStatus.PENDING_PAYMENT.getCode()
            || currentStatus == OrderStatus.PENDING_SHIPMENT.getCode();
    }
    
    /**
     * 验证是否可以确认收货
     */
    public static boolean canConfirm(Integer currentStatus) {
        return currentStatus == OrderStatus.PENDING_RECEIPT.getCode();
    }
    
    /**
     * 验证状态流转是否合法
     */
    public static boolean isValidTransition(Integer fromStatus, Integer toStatus) {
        // 定义合法的状态转换
        Map<Integer, List<Integer>> validTransitions = new HashMap<>();
        validTransitions.put(1, Arrays.asList(2, 5)); // 待支付 -> 待发货/已取消
        validTransitions.put(2, Arrays.asList(3, 5)); // 待发货 -> 待收货/已取消
        validTransitions.put(3, Arrays.asList(4));    // 待收货 -> 已完成
        
        List<Integer> allowedTargets = validTransitions.get(fromStatus);
        return allowedTargets != null && allowedTargets.contains(toStatus);
    }
}
```

---

## 核心流程设计

### 取消订单流程

```
开始
  ↓
1. 参数验证
  ├─ 验证订单ID
  └─ 验证用户ID
  ↓
2. 查询订单信息
  └─ 验证订单是否存在
  ↓
3. 权限验证
  └─ 验证订单是否属于当前用户
  ↓
4. 状态验证
  ├─ 验证当前状态是否可取消
  └─ 待支付或待发货可取消
  ↓
5. 更新订单状态
  └─ 状态改为"已取消"
  ↓
6. 恢复库存
  ├─ 遍历订单商品
  └─ 增加对应药品库存
  ↓
7. 触发退款（如已支付）
  └─ 调用支付服务退款
  ↓
结束
```

### 确认收货流程

```
开始
  ↓
1. 参数验证
  ↓
2. 查询订单信息
  ↓
3. 权限验证
  ↓
4. 状态验证
  └─ 验证当前状态是否为"待收货"
  ↓
5. 更新订单状态
  ├─ 状态改为"已完成"
  └─ 记录确认收货时间
  ↓
结束
```

---

## 核心实现

### 取消订单Service

```java
@Override
@Transactional(rollbackFor = Exception.class)
public void cancelOrder(Long orderId, Long patientUserId, String cancelReason) {
    logger.info("开始取消订单 - 订单ID: {}, 用户ID: {}", orderId, patientUserId);
    
    // 1. 查询订单信息
    HosPreDrugOrder order = orderMapper.selectById(orderId);
    if (order == null) {
        throw new BusinessException("订单不存在");
    }
    
    // 2. 权限验证
    if (!order.getPatientUserId().equals(patientUserId)) {
        throw new BusinessException("无权操作此订单");
    }
    
    // 3. 状态验证
    if (!OrderStatusValidator.canCancel(order.getStatus())) {
        throw new BusinessException("当前订单状态不允许取消");
    }
    
    // 4. 更新订单状态
    order.setStatus(OrderStatus.CANCELLED.getCode());
    order.setCancelReason(cancelReason);
    order.setCancelTime(LocalDateTime.now());
    orderMapper.updateById(order);
    
    // 5. 恢复库存
    restoreInventory(orderId);
    
    // 6. 如果已支付，触发退款
    if (order.getPayStatus() == PayStatus.PAID.getCode()) {
        refundService.createRefund(orderId);
    }
    
    logger.info("订单取消成功 - 订单ID: {}", orderId);
}

/**
 * 恢复库存
 */
private void restoreInventory(Long orderId) {
    // 查询订单商品
    List<OrderItem> orderItems = orderItemMapper.selectByOrderId(orderId);
    
    // 恢复每个商品的库存
    for (OrderItem item : orderItems) {
        int rows = inventoryMapper.increaseStock(item.getDrugId(), item.getQuantity());
        if (rows == 0) {
            logger.error("库存恢复失败 - 药品ID: {}, 数量: {}", 
                item.getDrugId(), item.getQuantity());
            throw new RuntimeException("库存恢复失败");
        }
        logger.info("库存恢复成功 - 药品ID: {}, 恢复数量: {}", 
            item.getDrugId(), item.getQuantity());
    }
}
```

### 确认收货Service

```java
@Override
@Transactional(rollbackFor = Exception.class)
public void confirmReceipt(Long orderId, Long patientUserId) {
    logger.info("开始确认收货 - 订单ID: {}, 用户ID: {}", orderId, patientUserId);
    
    // 1. 查询订单信息
    HosPreDrugOrder order = orderMapper.selectById(orderId);
    if (order == null) {
        throw new BusinessException("订单不存在");
    }
    
    // 2. 权限验证
    if (!order.getPatientUserId().equals(patientUserId)) {
        throw new BusinessException("无权操作此订单");
    }
    
    // 3. 状态验证
    if (!OrderStatusValidator.canConfirm(order.getStatus())) {
        throw new BusinessException("当前订单状态不允许确认收货");
    }
    
    // 4. 更新订单状态
    order.setStatus(OrderStatus.COMPLETED.getCode());
    order.setConfirmTime(LocalDateTime.now());
    orderMapper.updateById(order);
    
    logger.info("确认收货成功 - 订单ID: {}", orderId);
}
```

### 库存恢复Mapper

```xml
<!-- 增加库存 -->
<update id="increaseStock">
    UPDATE t_drug
    SET stock = stock + #{quantity},
        update_time = NOW()
    WHERE id = #{drugId}
</update>
```

---

## 异常处理

### 异常类型

| 异常 | 错误码 | 说明 |
|------|--------|------|
| OrderNotFoundException | 40401 | 订单不存在 |
| PermissionDeniedException | 40301 | 无权操作 |
| InvalidStatusException | 40002 | 状态不允许操作 |
| InventoryRestoreException | 50002 | 库存恢复失败 |

---

## 正确性属性

### Property 1: 状态流转合法性
```
∀ order ∈ Orders, transition ∈ Transitions:
  isValidTransition(order.currentStatus, transition.targetStatus) = true
```

### Property 2: 库存一致性
```
∀ order ∈ CancelledOrders:
  Σ(drug.stock_after) = Σ(drug.stock_before) + Σ(orderItem.quantity)
```

### Property 3: 操作幂等性
```
∀ order ∈ Orders:
  cancelOrder(order.id) × N = cancelOrder(order.id) × 1
```

---

## 相关文档

- [需求文档](./requirements.md)
- [任务列表](./tasks.md)
- [订单创建设计](../patient-mall-phase4-order-create/design.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
