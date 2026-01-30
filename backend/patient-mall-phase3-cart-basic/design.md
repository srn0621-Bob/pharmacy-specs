# Spec 6: 购物车基础功能 - 设计文档

## 文档信息

**Spec ID:** patient-mall-phase3-cart-basic  
**创建日期:** 2026-01-23  
**所属阶段:** 阶段三 - 购物车功能

---

## 系统架构

### 架构层次

```
┌─────────────────────────────────────────┐
│         Android患者端                    │
│  ShoppingCartActivity                   │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────────┐
│      adinnet-patient-api                │
│  ┌────────────────────────────────────┐ │
│  │  CartController (已实现)            │ │
│  └──────────┬─────────────────────────┘ │
│  ┌──────────▼─────────────────────────┐ │
│  │  CartService (已实现)               │ │
│  └──────────┬─────────────────────────┘ │
│  ┌──────────▼─────────────────────────┐ │
│  │  CartMapper (已实现)                │ │
│  └──────────┬─────────────────────────┘ │
└─────────────┼───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         MySQL数据库                      │
│  t_mall_cart (购物车表)                  │
│  t_drug (药品表)                         │
└─────────────────────────────────────────┘
```

---

## 数据模型设计

### 购物车表 (t_mall_cart)

```sql
CREATE TABLE t_mall_cart (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '购物车项ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    drug_id BIGINT NOT NULL COMMENT '药品ID',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    selected TINYINT(1) DEFAULT 1 COMMENT '是否选中 0-未选中 1-选中',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_drug_id (drug_id),
    UNIQUE KEY uk_user_drug (user_id, drug_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';
```

### 核心字段说明

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | BIGINT | 购物车项ID | 主键，自增 |
| user_id | BIGINT | 用户ID | 非空，索引 |
| drug_id | BIGINT | 药品ID | 非空，索引 |
| quantity | INT | 商品数量 | 非空，默认1 |
| selected | TINYINT(1) | 是否选中 | 默认1 |
| create_time | DATETIME | 创建时间 | 自动填充 |
| update_time | DATETIME | 更新时间 | 自动更新 |

### 唯一约束
- `uk_user_drug (user_id, drug_id)`: 同一用户不能重复添加同一药品

---

## API详细设计

### 1. 添加商品到购物车

**Controller方法:**
```java
@PostMapping("/add")
public Result<CartAddResponse> addToCart(@RequestBody CartAddRequest request) {
    // 参数验证
    // 调用Service
    // 返回结果
}
```

**Service逻辑:**
```java
public CartAddResponse addToCart(CartAddRequest request) {
    // 1. 验证药品是否存在
    Drug drug = drugMapper.selectById(request.getDrugId());
    if (drug == null) {
        throw new BusinessException("药品不存在");
    }
    
    // 2. 验证库存
    if (drug.getStock() < request.getQuantity()) {
        throw new BusinessException("库存不足");
    }
    
    // 3. 查询购物车是否已有该商品
    CartItem existingItem = cartMapper.selectByUserIdAndDrugId(
        request.getUserId(), request.getDrugId()
    );
    
    if (existingItem != null) {
        // 4a. 已存在，增加数量
        int newQuantity = existingItem.getQuantity() + request.getQuantity();
        if (newQuantity > drug.getStock()) {
            throw new BusinessException("超过库存限制");
        }
        existingItem.setQuantity(newQuantity);
        cartMapper.updateById(existingItem);
    } else {
        // 4b. 不存在，新增记录
        CartItem newItem = new CartItem();
        newItem.setUserId(request.getUserId());
        newItem.setDrugId(request.getDrugId());
        newItem.setQuantity(request.getQuantity());
        newItem.setSelected(true);
        cartMapper.insert(newItem);
    }
    
    // 5. 查询购物车汇总信息
    CartSummary summary = cartMapper.selectSummaryByUserId(request.getUserId());
    
    // 6. 更新Redis缓存
    redisTemplate.opsForValue().set(
        "cart:count:" + request.getUserId(),
        summary.getTotalQuantity(),
        30, TimeUnit.DAYS
    );
    
    // 7. 返回结果
    return CartAddResponse.builder()
        .cartItemId(existingItem != null ? existingItem.getId() : newItem.getId())
        .totalQuantity(summary.getTotalQuantity())
        .totalAmount(summary.getTotalAmount())
        .build();
}
```

---

### 2. 获取购物车列表

**Controller方法:**
```java
@GetMapping("/{userId}")
public Result<CartListResponse> getCartList(@PathVariable Long userId) {
    // 调用Service
    // 返回结果
}
```

**Service逻辑:**
```java
public CartListResponse getCartList(Long userId) {
    // 1. 查询购物车列表
    List<CartItem> cartItems = cartMapper.selectByUserId(userId);
    
    // 2. 查询药品详情
    List<Long> drugIds = cartItems.stream()
        .map(CartItem::getDrugId)
        .collect(Collectors.toList());
    
    List<Drug> drugs = drugMapper.selectBatchIds(drugIds);
    Map<Long, Drug> drugMap = drugs.stream()
        .collect(Collectors.toMap(Drug::getId, Function.identity()));
    
    // 3. 组装购物车项DTO
    List<CartItemDTO> itemDTOs = cartItems.stream()
        .map(item -> {
            Drug drug = drugMap.get(item.getDrugId());
            return CartItemDTO.builder()
                .cartItemId(item.getId())
                .drugId(drug.getId())
                .drugName(drug.getName())
                .drugImages(parseDrugImages(drug.getPicPosition()))
                .spec(drug.getSpec())
                .price(drug.getPrice())
                .quantity(item.getQuantity())
                .selected(item.getSelected())
                .stock(drug.getStock())
                .isFreeShipping(drug.getIsFreeShipping())
                .build();
        })
        .collect(Collectors.toList());
    
    // 4. 计算汇总信息
    CartSummary summary = calculateSummary(itemDTOs);
    
    // 5. 返回结果
    return CartListResponse.builder()
        .items(itemDTOs)
        .summary(summary)
        .build();
}
```

---

### 3. 更新商品数量

**Controller方法:**
```java
@PutMapping("/update")
public Result<CartUpdateResponse> updateQuantity(@RequestBody CartUpdateRequest request) {
    // 参数验证
    // 调用Service
    // 返回结果
}
```

**Service逻辑:**
```java
public CartUpdateResponse updateQuantity(CartUpdateRequest request) {
    // 1. 查询购物车项
    CartItem cartItem = cartMapper.selectById(request.getCartItemId());
    if (cartItem == null) {
        throw new BusinessException("购物车项不存在");
    }
    
    // 2. 验证数量
    if (request.getQuantity() < 1) {
        throw new BusinessException("数量不能小于1");
    }
    
    // 3. 验证库存
    Drug drug = drugMapper.selectById(cartItem.getDrugId());
    if (request.getQuantity() > drug.getStock()) {
        throw new BusinessException("超过库存限制");
    }
    
    // 4. 更新数量
    cartItem.setQuantity(request.getQuantity());
    cartMapper.updateById(cartItem);
    
    // 5. 计算小计
    BigDecimal subtotal = drug.getPrice().multiply(
        new BigDecimal(request.getQuantity())
    );
    
    // 6. 更新Redis缓存
    updateCartCountCache(cartItem.getUserId());
    
    // 7. 返回结果
    return CartUpdateResponse.builder()
        .cartItemId(cartItem.getId())
        .quantity(request.getQuantity())
        .subtotal(subtotal)
        .build();
}
```

---

### 4. 删除购物车商品

**Controller方法:**
```java
@DeleteMapping("/{itemId}")
public Result<Void> deleteCartItem(@PathVariable Long itemId) {
    // 调用Service
    // 返回结果
}
```

**Service逻辑:**
```java
public void deleteCartItem(Long itemId) {
    // 1. 查询购物车项
    CartItem cartItem = cartMapper.selectById(itemId);
    if (cartItem == null) {
        throw new BusinessException("购物车项不存在");
    }
    
    // 2. 删除记录
    cartMapper.deleteById(itemId);
    
    // 3. 更新Redis缓存
    updateCartCountCache(cartItem.getUserId());
}
```

---

### 5. 获取购物车数量

**Controller方法:**
```java
@GetMapping("/{userId}/count")
public Result<Integer> getCartCount(@PathVariable Long userId) {
    // 先查Redis缓存
    // 缓存未命中则查数据库
    // 返回结果
}
```

**Service逻辑:**
```java
public Integer getCartCount(Long userId) {
    // 1. 尝试从Redis获取
    String cacheKey = "cart:count:" + userId;
    Integer count = (Integer) redisTemplate.opsForValue().get(cacheKey);
    
    if (count != null) {
        return count;
    }
    
    // 2. 缓存未命中，查询数据库
    count = cartMapper.selectCountByUserId(userId);
    
    // 3. 写入缓存
    redisTemplate.opsForValue().set(cacheKey, count, 30, TimeUnit.DAYS);
    
    return count;
}
```

---

## 缓存策略

### Redis缓存设计

**缓存Key设计:**
```
cart:count:{userId}  - 购物车商品总数量
```

**缓存更新策略:**
- 添加商品时更新缓存
- 更新数量时更新缓存
- 删除商品时更新缓存
- 缓存过期时间: 30天

**缓存一致性:**
- 采用Cache Aside模式
- 先更新数据库，再删除缓存
- 下次查询时重建缓存

---

## 并发控制

### 乐观锁方案

在 `t_mall_cart` 表添加 `version` 字段：

```sql
ALTER TABLE t_mall_cart ADD COLUMN version INT DEFAULT 0 COMMENT '版本号';
```

更新时使用版本号控制：

```java
@Update("UPDATE t_mall_cart SET quantity = #{quantity}, version = version + 1 " +
        "WHERE id = #{id} AND version = #{version}")
int updateWithVersion(@Param("id") Long id, 
                      @Param("quantity") Integer quantity,
                      @Param("version") Integer version);
```

---

## 错误处理策略

### 错误码定义

| 错误码 | 错误信息 | HTTP状态码 |
|--------|---------|-----------|
| CART_001 | 药品不存在 | 400 |
| CART_002 | 库存不足 | 400 |
| CART_003 | 超过库存限制 | 400 |
| CART_004 | 购物车项不存在 | 404 |
| CART_005 | 数量不能小于1 | 400 |
| CART_006 | 购物车已满 | 400 |

### 异常处理

```java
@ExceptionHandler(BusinessException.class)
public Result<Void> handleBusinessException(BusinessException e) {
    log.error("业务异常: {}", e.getMessage());
    return Result.error(e.getCode(), e.getMessage());
}
```

---

## 性能优化方案

### 1. 数据库优化
- 在 `user_id` 和 `drug_id` 上创建索引
- 使用唯一索引避免重复添加
- 定期清理过期购物车数据

### 2. 缓存优化
- 购物车数量使用Redis缓存
- 缓存预热：登录时加载购物车数量
- 缓存穿透保护：空结果也缓存

### 3. 查询优化
- 批量查询药品详情，避免N+1问题
- 使用JOIN查询减少数据库交互
- 分页查询大量购物车数据

---

## 测试策略

### 单元测试

**测试用例:**
1. 添加新商品到购物车
2. 重复添加同一商品
3. 添加商品时库存不足
4. 更新商品数量
5. 更新数量超过库存
6. 删除购物车商品
7. 查询购物车列表
8. 查询购物车数量

**测试覆盖率目标:** > 80%

---

### 集成测试

**测试场景:**
1. 完整的添加-查询-更新-删除流程
2. 并发添加同一商品
3. 缓存一致性测试
4. 库存扣减一致性测试

---

### 性能测试

**测试指标:**
- 购物车列表查询 < 500ms
- 添加/更新/删除操作 < 300ms
- 购物车数量查询 < 100ms
- 并发100用户时响应时间 < 1s

---

## 相关文档

- [需求文档](./requirements.md)
- [任务列表](./tasks.md)
- [药品详情设计](../patient-mall-phase2-drug-detail/design.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
