# Spec 7: 购物车高级功能 - 设计文档

## 文档信息

**Spec ID:** patient-mall-phase3-cart-advanced  
**创建日期:** 2026-01-23  
**所属阶段:** 阶段三 - 购物车功能

---

## 系统架构

### 架构层次

```
┌─────────────────────────────────────────┐
│         Android患者端                    │
│  ShoppingCartActivity                   │
│  - 全选/取消全选                         │
│  - 批量删除                              │
│  - 清空购物车                            │
│  - 汇总信息显示                          │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────────┐
│      adinnet-patient-api                │
│  ┌────────────────────────────────────┐ │
│  │  CartController                     │ │
│  │  - selectCartItem()                 │ │
│  │  - batchSelect()                    │ │
│  │  - batchRemove()                    │ │
│  │  - clearCart()                      │ │
│  │  - getCartSummary()                 │ │
│  └──────────┬─────────────────────────┘ │
│  ┌──────────▼─────────────────────────┐ │
│  │  CartService                        │ │
│  │  - 选中状态管理                     │ │
│  │  - 批量操作事务                     │ │
│  │  - 汇总信息计算                     │ │
│  └──────────┬─────────────────────────┘ │
└─────────────┼───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         MySQL数据库                      │
│  t_mall_cart.selected字段               │
└─────────────────────────────────────────┘
```

---

## 核心功能设计

### 1. 选中状态管理

**数据模型:**
```java
public class CartItem {
    private Long id;
    private Long userId;
    private Long drugId;
    private Integer quantity;
    private Boolean selected;  // 选中状态
    // ...
}
```

**Service实现:**
```java
public CartSelectResponse selectCartItem(Long itemId, Boolean selected) {
    // 1. 更新选中状态
    CartItem cartItem = cartMapper.selectById(itemId);
    cartItem.setSelected(selected);
    cartMapper.updateById(cartItem);
    
    // 2. 计算汇总信息
    CartSummary summary = calculateSummary(cartItem.getUserId());
    
    // 3. 返回结果
    return CartSelectResponse.builder()
        .cartItemId(itemId)
        .selected(selected)
        .summary(summary)
        .build();
}
```

---

### 2. 批量选中/取消选中

**Service实现:**
```java
@Transactional
public CartBatchSelectResponse batchSelect(Long userId, Boolean selected) {
    // 1. 批量更新选中状态
    int affectedCount = cartMapper.updateSelectedByUserId(userId, selected);
    
    // 2. 计算汇总信息
    CartSummary summary = calculateSummary(userId);
    
    // 3. 返回结果
    return CartBatchSelectResponse.builder()
        .affectedCount(affectedCount)
        .summary(summary)
        .build();
}
```

**Mapper SQL:**
```xml
<update id="updateSelectedByUserId">
    UPDATE t_mall_cart
    SET selected = #{selected},
        update_time = NOW()
    WHERE user_id = #{userId}
</update>
```

---

### 3. 批量删除

**Service实现:**
```java
@Transactional
public CartBatchRemoveResponse batchRemove(Long userId, List<Long> cartItemIds) {
    // 1. 验证购物车项属于该用户
    List<CartItem> items = cartMapper.selectBatchIds(cartItemIds);
    boolean allBelongToUser = items.stream()
        .allMatch(item -> item.getUserId().equals(userId));
    
    if (!allBelongToUser) {
        throw new BusinessException("无权删除他人的购物车商品");
    }
    
    // 2. 批量删除
    int deletedCount = cartMapper.deleteBatchIds(cartItemIds);
    
    // 3. 更新缓存
    updateCartCountCache(userId);
    
    // 4. 计算汇总信息
    CartSummary summary = calculateSummary(userId);
    
    // 5. 返回结果
    return CartBatchRemoveResponse.builder()
        .deletedCount(deletedCount)
        .summary(summary)
        .build();
}
```

---

### 4. 清空购物车

**Service实现:**
```java
@Transactional
public void clearCart(Long userId) {
    // 1. 删除所有购物车商品
    cartMapper.deleteByUserId(userId);
    
    // 2. 清空缓存
    cartCacheService.deleteCartCount(userId);
}
```

**Mapper SQL:**
```xml
<delete id="deleteByUserId">
    DELETE FROM t_mall_cart
    WHERE user_id = #{userId}
</delete>
```

---

### 5. 购物车汇总计算

**汇总信息模型:**
```java
public class CartSummary {
    private Integer totalQuantity;      // 总数量
    private Integer selectedQuantity;   // 选中数量
    private BigDecimal totalAmount;     // 总金额
    private BigDecimal selectedAmount;  // 选中金额
    private Integer totalItems;         // 总商品种类数
    private Integer selectedItems;      // 选中商品种类数
    private BigDecimal discountAmount;  // 优惠金额
    private BigDecimal shippingFee;     // 运费
}
```

**计算逻辑:**
```java
public CartSummary calculateSummary(Long userId) {
    // 1. 查询购物车列表
    List<CartItem> cartItems = cartMapper.selectByUserId(userId);
    
    // 2. 查询药品详情
    List<Long> drugIds = cartItems.stream()
        .map(CartItem::getDrugId)
        .collect(Collectors.toList());
    List<Drug> drugs = drugMapper.selectBatchIds(drugIds);
    Map<Long, Drug> drugMap = drugs.stream()
        .collect(Collectors.toMap(Drug::getId, Function.identity()));
    
    // 3. 计算汇总
    CartSummary summary = new CartSummary();
    
    // 总数量和总金额
    int totalQuantity = 0;
    BigDecimal totalAmount = BigDecimal.ZERO;
    
    // 选中数量和选中金额
    int selectedQuantity = 0;
    BigDecimal selectedAmount = BigDecimal.ZERO;
    
    for (CartItem item : cartItems) {
        Drug drug = drugMap.get(item.getDrugId());
        BigDecimal itemAmount = drug.getPrice()
            .multiply(new BigDecimal(item.getQuantity()));
        
        totalQuantity += item.getQuantity();
        totalAmount = totalAmount.add(itemAmount);
        
        if (item.getSelected()) {
            selectedQuantity += item.getQuantity();
            selectedAmount = selectedAmount.add(itemAmount);
        }
    }
    
    summary.setTotalQuantity(totalQuantity);
    summary.setTotalAmount(totalAmount);
    summary.setSelectedQuantity(selectedQuantity);
    summary.setSelectedAmount(selectedAmount);
    summary.setTotalItems(cartItems.size());
    summary.setSelectedItems((int) cartItems.stream()
        .filter(CartItem::getSelected).count());
    
    // 4. 计算优惠和运费
    summary.setDiscountAmount(BigDecimal.ZERO);  // 暂无优惠
    summary.setShippingFee(calculateShippingFee(cartItems, drugMap));
    
    return summary;
}

/**
 * 计算运费
 */
private BigDecimal calculateShippingFee(List<CartItem> cartItems, 
                                        Map<Long, Drug> drugMap) {
    // 检查是否全部包邮
    boolean allFreeShipping = cartItems.stream()
        .filter(CartItem::getSelected)
        .allMatch(item -> {
            Drug drug = drugMap.get(item.getDrugId());
            return drug.getIsFreeShipping();
        });
    
    return allFreeShipping ? BigDecimal.ZERO : new BigDecimal("10.00");
}
```

---

## 性能优化

### 1. 批量操作优化
- 使用批量SQL减少数据库交互
- 使用事务保证数据一致性
- 批量操作限制最大数量（如100个）

### 2. 汇总计算优化
- 使用SQL聚合函数计算汇总
- 避免N+1查询问题
- 考虑缓存汇总结果（短期缓存）

### 3. 并发控制
- 使用乐观锁避免并发冲突
- 批量操作使用数据库事务
- 选中状态更新使用CAS操作

---

## 错误处理

### 错误码定义

| 错误码 | 错误信息 | HTTP状态码 |
|--------|---------|-----------|
| CART_ADV_001 | 购物车项不存在 | 404 |
| CART_ADV_002 | 无权操作他人购物车 | 403 |
| CART_ADV_003 | 批量操作失败 | 500 |
| CART_ADV_004 | 购物车为空 | 400 |

---

## 测试策略

### 单元测试用例
1. 选中/取消选中单个商品
2. 批量选中所有商品
3. 批量取消选中所有商品
4. 批量删除选中商品
5. 清空购物车
6. 计算购物车汇总
7. 并发选中操作
8. 批量操作事务回滚

### 集成测试场景
1. 完整的选中-结算流程
2. 批量操作性能测试
3. 并发操作一致性测试

---

## 相关文档

- [需求文档](./requirements.md)
- [任务列表](./tasks.md)
- [购物车基础功能设计](../patient-mall-phase3-cart-basic/design.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
