# Spec 10: 订单状态管理 - 任务列表

## 文档信息

**Spec编号:** patient-mall-phase4-order-status  
**功能名称:** 订单状态管理  
**所属阶段:** 阶段四 - 订单功能  
**创建日期:** 2026-01-23  
**预计工作量:** 2-3小时

---

## 任务概览

| 任务ID | 任务名称 | 预计时间 | 依赖 | 状态 |
|--------|---------|---------|------|------|
| T10.1 | 创建状态验证器 | 0.5小时 | 无 | 待开始 |
| T10.2 | 实现库存恢复功能 | 0.5小时 | 无 | 待开始 |
| T10.3 | 实现取消订单功能 | 1小时 | T10.1-T10.2 | 待开始 |
| T10.4 | 实现确认收货功能 | 0.5小时 | T10.1 | 待开始 |
| T10.5 | 实现Controller接口 | 0.5小时 | T10.3-T10.4 | 待开始 |
| T10.6 | 编写单元测试 | 0.5小时 | T10.3-T10.4 | 待开始 |
| T10.7 | 集成测试和验证 | 0.5小时 | T10.5-T10.6 | 待开始 |

---

## 任务详情

### T10.1 创建状态验证器

**目标:** 创建订单状态验证工具类

**实现代码:**
```java
package com.patient.api.app.mall.util;

import com.patient.api.app.mall.enums.OrderStatus;
import java.util.*;

/**
 * 订单状态验证器
 */
public class OrderStatusValidator {
    
    /**
     * 合法的状态转换映射
     */
    private static final Map<Integer, List<Integer>> VALID_TRANSITIONS = new HashMap<>();
    
    static {
        // 待支付 -> 待发货/已取消
        VALID_TRANSITIONS.put(OrderStatus.PENDING_PAYMENT.getCode(), 
            Arrays.asList(OrderStatus.PENDING_SHIPMENT.getCode(), OrderStatus.CANCELLED.getCode()));
        
        // 待发货 -> 待收货/已取消
        VALID_TRANSITIONS.put(OrderStatus.PENDING_SHIPMENT.getCode(), 
            Arrays.asList(OrderStatus.PENDING_RECEIPT.getCode(), OrderStatus.CANCELLED.getCode()));
        
        // 待收货 -> 已完成
        VALID_TRANSITIONS.put(OrderStatus.PENDING_RECEIPT.getCode(), 
            Arrays.asList(OrderStatus.COMPLETED.getCode()));
    }
    
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
        List<Integer> allowedTargets = VALID_TRANSITIONS.get(fromStatus);
        return allowedTargets != null && allowedTargets.contains(toStatus);
    }
    
    /**
     * 获取允许的目标状态列表
     */
    public static List<Integer> getAllowedTargetStatuses(Integer currentStatus) {
        return VALID_TRANSITIONS.getOrDefault(currentStatus, Collections.emptyList());
    }
}
```

**单元测试:**
```java
@Test
public void testCanCancel() {
    assertTrue(OrderStatusValidator.canCancel(1));  // 待支付
    assertTrue(OrderStatusValidator.canCancel(2));  // 待发货
    assertFalse(OrderStatusValidator.canCancel(3)); // 待收货
    assertFalse(OrderStatusValidator.canCancel(4)); // 已完成
}

@Test
public void testIsValidTransition() {
    assertTrue(OrderStatusValidator.isValidTransition(1, 2));  // 待支付 -> 待发货
    assertTrue(OrderStatusValidator.isValidTransition(1, 5));  // 待支付 -> 已取消
    assertFalse(OrderStatusValidator.isValidTransition(1, 4)); // 待支付 -> 已完成（非法）
}
```

**验收标准:**
- [ ] 状态验证逻辑正确
- [ ] 单元测试通过
- [ ] 代码注释完整

---

### T10.2 实现库存恢复功能

**目标:** 实现订单取消时的库存恢复

**Mapper接口:**
```java
/**
 * 增加库存
 */
int increaseStock(@Param("drugId") Long drugId, @Param("quantity") Integer quantity);
```

**Mapper XML:**
```xml
<update id="increaseStock">
    UPDATE t_drug
    SET stock = stock + #{quantity},
        update_time = NOW()
    WHERE id = #{drugId}
</update>
```

**Service实现:**
```java
/**
 * 恢复库存
 */
private void restoreInventory(Long orderId) {
    logger.info("开始恢复库存 - 订单ID: {}", orderId);
    
    // 查询订单商品
    List<OrderItem> orderItems = orderItemMapper.selectByOrderId(orderId);
    
    if (orderItems.isEmpty()) {
        logger.warn("订单无商品，无需恢复库存 - 订单ID: {}", orderId);
        return;
    }
    
    // 恢复每个商品的库存
    for (OrderItem item : orderItems) {
        int rows = inventoryMapper.increaseStock(item.getDrugId(), item.getQuantity());
        
        if (rows == 0) {
            logger.error("库存恢复失败 - 药品ID: {}, 数量: {}", 
                item.getDrugId(), item.getQuantity());
            throw new InventoryRestoreException("库存恢复失败");
        }
        
        logger.info("库存恢复成功 - 药品ID: {}, 恢复数量: {}", 
            item.getDrugId(), item.getQuantity());
    }
    
    logger.info("库存恢复完成 - 订单ID: {}", orderId);
}
```

**验收标准:**
- [ ] 库存恢复功能正常
- [ ] 恢复数量正确
- [ ] 异常处理完善
- [ ] 日志记录完整

---

### T10.3 实现取消订单功能

**目标:** 实现完整的取消订单业务逻辑

**Service实现:**（参考design.md中的实现）

**验收标准:**
- [ ] 取消订单功能正常
- [ ] 状态验证正确
- [ ] 权限验证正确
- [ ] 库存恢复正常
- [ ] 事务管理正确

---

### T10.4 实现确认收货功能

**目标:** 实现确认收货业务逻辑

**Service实现:**（参考design.md中的实现）

**验收标准:**
- [ ] 确认收货功能正常
- [ ] 状态验证正确
- [ ] 权限验证正确
- [ ] 确认时间记录正确

---

### T10.5 实现Controller接口

**目标:** 实现订单状态管理的API接口

**取消订单接口:**
```java
/**
 * 取消订单
 */
@PostMapping("/cancel")
public Result<Void> cancelOrder(@RequestBody @Valid OrderCancelDTO cancelDTO) {
    logger.info("接收取消订单请求 - 订单ID: {}, 用户ID: {}", 
        cancelDTO.getOrderId(), cancelDTO.getPatientUserId());
    
    try {
        orderService.cancelOrder(
            cancelDTO.getOrderId(), 
            cancelDTO.getPatientUserId(), 
            cancelDTO.getCancelReason()
        );
        return Result.success();
    } catch (BusinessException e) {
        logger.error("取消订单失败", e);
        return Result.error(e.getMessage());
    }
}
```

**确认收货接口:**
```java
/**
 * 确认收货
 */
@PostMapping("/confirm")
public Result<Void> confirmReceipt(@RequestBody @Valid OrderConfirmDTO confirmDTO) {
    logger.info("接收确认收货请求 - 订单ID: {}, 用户ID: {}", 
        confirmDTO.getOrderId(), confirmDTO.getPatientUserId());
    
    try {
        orderService.confirmReceipt(
            confirmDTO.getOrderId(), 
            confirmDTO.getPatientUserId()
        );
        return Result.success();
    } catch (BusinessException e) {
        logger.error("确认收货失败", e);
        return Result.error(e.getMessage());
    }
}
```

**验收标准:**
- [ ] API接口路径正确
- [ ] 参数验证正常
- [ ] 异常处理完善
- [ ] 返回结果正确

---

### T10.6 编写单元测试

**测试用例:**

**1. 取消订单测试**
```java
@Test
public void testCancelOrder_PendingPayment() {
    // 测试取消待支付订单
}

@Test
public void testCancelOrder_PendingShipment() {
    // 测试取消待发货订单
}

@Test(expected = BusinessException.class)
public void testCancelOrder_InvalidStatus() {
    // 测试取消待收货订单（应失败）
}

@Test(expected = BusinessException.class)
public void testCancelOrder_PermissionDenied() {
    // 测试取消其他用户的订单（应失败）
}
```

**2. 确认收货测试**
```java
@Test
public void testConfirmReceipt_Success() {
    // 测试正常确认收货
}

@Test(expected = BusinessException.class)
public void testConfirmReceipt_InvalidStatus() {
    // 测试确认待支付订单（应失败）
}
```

**3. 库存恢复测试**
```java
@Test
public void testRestoreInventory() {
    // 测试库存恢复功能
    // 验证库存数量正确增加
}
```

**验收标准:**
- [ ] 测试覆盖率 > 80%
- [ ] 所有测试用例通过
- [ ] 边界情况测试完整

---

### T10.7 集成测试和验证

**测试场景:**

**场景1: 完整的取消订单流程**
1. 创建订单
2. 记录初始库存
3. 取消订单
4. 验证订单状态为"已取消"
5. 验证库存已恢复

**场景2: 完整的确认收货流程**
1. 创建订单
2. 支付订单
3. 发货
4. 确认收货
5. 验证订单状态为"已完成"

**场景3: 非法操作测试**
1. 尝试取消已发货订单
2. 尝试确认未发货订单
3. 尝试操作其他用户的订单

**验收标准:**
- [ ] 端到端流程正常
- [ ] 数据一致性正确
- [ ] 异常处理完善
- [ ] 性能满足要求

---

## 注意事项

1. **事务管理**: 状态更新和库存恢复必须在同一事务中
2. **幂等性**: 重复取消订单不应报错
3. **并发控制**: 防止并发操作导致状态不一致
4. **日志记录**: 记录所有状态变更和库存操作
5. **异常处理**: 完善的异常处理和回滚机制

---

## 相关文档

- [需求文档](./requirements.md)
- [设计文档](./design.md)
- [订单创建任务](../patient-mall-phase4-order-create/tasks.md)
- [订单查询任务](../patient-mall-phase4-order-query/tasks.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
