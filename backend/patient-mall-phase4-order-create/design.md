# Spec 8: 订单创建功能 - 设计文档

## 文档信息

**Spec编号:** patient-mall-phase4-order-create  
**功能名称:** 订单创建功能  
**所属阶段:** 阶段四 - 订单功能  
**创建日期:** 2026-01-23

---

## 系统架构

### 架构层次

```
┌─────────────────────────────────────────┐
│         Controller Layer                │
│    OrderController.createOrder()        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Service Layer                  │
│    OrderService.createOrder()           │
│    ├─ CartService.getCartItems()       │
│    ├─ InventoryService.checkStock()    │
│    ├─ InventoryService.reserveStock()  │
│    └─ CartService.clearItems()         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Mapper Layer                   │
│    OrderMapper                          │
│    OrderItemMapper                      │
│    CartMapper                           │
│    DrugMapper                           │
└─────────────────────────────────────────┘
```

### 模块职责

**OrderController**
- 接收订单创建请求
- 参数验证
- 调用Service层创建订单
- 返回订单信息

**OrderService**
- 订单创建业务逻辑
- 事务管理
- 库存验证和扣减
- 订单号生成
- 金额计算

**CartService**
- 获取购物车商品信息
- 清空购物车

**InventoryService**
- 库存验证
- 库存预留/扣减

---

## 数据模型设计

### 订单表 (t_hos_pre_drug_order)

```sql
CREATE TABLE t_hos_pre_drug_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_num VARCHAR(32) NOT NULL UNIQUE COMMENT '订单编号',
    patient_user_id BIGINT NOT NULL COMMENT '患者用户ID',
    
    -- 金额信息
    total_amount DECIMAL(10,2) NOT NULL COMMENT '商品总金额',
    shipping_fee DECIMAL(10,2) DEFAULT 0.00 COMMENT '运费',
    actual_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    
    -- 收货信息
    receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    receiver_phone VARCHAR(20) NOT NULL COMMENT '收货人电话',
    receiver_province VARCHAR(50) COMMENT '省份',
    receiver_city VARCHAR(50) COMMENT '城市',
    receiver_district VARCHAR(50) COMMENT '区县',
    receiver_address VARCHAR(200) NOT NULL COMMENT '详细地址',
    
    -- 状态信息
    status TINYINT NOT NULL DEFAULT 1 COMMENT '订单状态: 1-待支付 2-待发货 3-待收货 4-已完成 5-已取消',
    pay_status TINYINT DEFAULT 0 COMMENT '支付状态: 0-未支付 1-已支付',
    pay_time DATETIME COMMENT '支付时间',
    
    -- 其他信息
    remark VARCHAR(500) COMMENT '订单备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_order_num (order_num),
    INDEX idx_patient_user_id (patient_user_id),
    INDEX idx_status (status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='药品订单表';
```

### 订单商品表 (t_hos_pre_drug_order_item)

```sql
CREATE TABLE t_hos_pre_drug_order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单商品ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    drug_id BIGINT NOT NULL COMMENT '药品ID',
    drug_name VARCHAR(100) NOT NULL COMMENT '药品名称',
    drug_spec VARCHAR(100) COMMENT '药品规格',
    drug_manufacturer VARCHAR(200) COMMENT '生产厂家',
    drug_image VARCHAR(500) COMMENT '药品图片',
    
    quantity INT NOT NULL COMMENT '购买数量',
    price DECIMAL(10,2) NOT NULL COMMENT '单价',
    subtotal DECIMAL(10,2) NOT NULL COMMENT '小计',
    
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_order_id (order_id),
    INDEX idx_drug_id (drug_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品明细表';
```

---

## 核心流程设计

### 订单创建流程

```
开始
  ↓
1. 参数验证
  ├─ 验证用户ID
  ├─ 验证购物车商品ID列表
  └─ 验证收货地址ID
  ↓
2. 获取购物车商品
  ├─ 查询购物车商品信息
  ├─ 验证商品是否属于当前用户
  └─ 验证商品是否存在
  ↓
3. 验证库存
  ├─ 遍历每个商品
  ├─ 查询当前库存
  └─ 判断库存是否充足
  ↓
4. 计算订单金额
  ├─ 计算商品总金额
  ├─ 计算运费
  └─ 计算实付金额
  ↓
5. 生成订单号
  └─ ORD + yyyyMMddHHmmss + 6位随机数
  ↓
6. 创建订单记录
  ├─ 插入订单主表
  └─ 获取订单ID
  ↓
7. 创建订单商品记录
  ├─ 遍历购物车商品
  └─ 插入订单商品表
  ↓
8. 扣减库存
  ├─ 遍历订单商品
  └─ 更新药品库存
  ↓
9. 清空购物车
  └─ 删除已下单的购物车商品
  ↓
10. 返回订单信息
  └─ 构建订单DTO
  ↓
结束
```

### 库存扣减策略

采用**悲观锁**策略，防止超卖：

```sql
-- 使用FOR UPDATE锁定行
SELECT stock FROM t_drug WHERE id = ? FOR UPDATE;

-- 验证库存充足
IF stock >= quantity THEN
    -- 扣减库存
    UPDATE t_drug 
    SET stock = stock - quantity,
        update_time = NOW()
    WHERE id = ? AND stock >= quantity;
END IF;
```

---

## API详细设计

### OrderController.createOrder()

```java
/**
 * 创建订单
 */
@PostMapping("/create")
@ResponseBody
public Result<DrugOrderDTO> createOrder(@RequestBody @Valid OrderCreateDTO orderCreateDTO) {
    // 获取当前登录用户ID
    Long patientUserId = getCurrentUserId();
    orderCreateDTO.setPatientUserId(patientUserId);
    
    // 创建订单
    DrugOrderDTO order = orderService.createOrder(orderCreateDTO);
    
    return Result.success(order);
}
```

### OrderService.createOrder()

```java
@Override
@Transactional(rollbackFor = Exception.class)
public DrugOrderDTO createOrder(OrderCreateDTO orderCreateDTO) {
    // 1. 参数验证
    validateOrderCreateRequest(orderCreateDTO);
    
    // 2. 获取购物车商品信息
    List<CartItem> cartItems = getCartItemsForOrder(
        orderCreateDTO.getCartItemIds(), 
        orderCreateDTO.getPatientUserId()
    );
    
    // 3. 验证库存
    validateInventoryForOrder(cartItems);
    
    // 4. 计算订单总金额
    BigDecimal totalAmount = calculateOrderTotal(cartItems);
    BigDecimal shippingFee = calculateShippingFee(cartItems, totalAmount);
    BigDecimal actualAmount = totalAmount.add(shippingFee);
    
    // 5. 生成订单号
    String orderNum = generateOrderNumber();
    
    // 6. 创建订单记录
    HosPreDrugOrder order = new HosPreDrugOrder();
    order.setOrderNum(orderNum);
    order.setPatientUserId(orderCreateDTO.getPatientUserId());
    order.setTotalAmount(totalAmount);
    order.setShippingFee(shippingFee);
    order.setActualAmount(actualAmount);
    order.setStatus(OrderStatus.PENDING_PAYMENT.getCode());
    order.setPayStatus(PayStatus.UNPAID.getCode());
    order.setRemark(orderCreateDTO.getRemark());
    
    // 设置收货地址
    setOrderAddress(order, orderCreateDTO.getAddressId());
    
    // 插入订单
    orderMapper.insert(order);
    
    // 7. 创建订单商品记录
    List<OrderItemDTO> orderItems = createOrderItems(order.getId(), cartItems);
    
    // 8. 扣减库存
    reserveInventoryForOrder(order.getId(), cartItems);
    
    // 9. 清空购物车
    clearCartItems(orderCreateDTO.getCartItemIds());
    
    // 10. 构建返回结果
    return buildOrderResult(order, orderItems);
}
```

### 订单号生成算法

```java
/**
 * 生成订单号
 * 格式: ORD + yyyyMMddHHmmss + 6位随机数
 */
private String generateOrderNumber() {
    String timestamp = LocalDateTime.now()
        .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    String random = String.format("%06d", 
        ThreadLocalRandom.current().nextInt(1000000));
    return "ORD" + timestamp + random;
}
```

### 金额计算逻辑

```java
/**
 * 计算订单商品总金额
 */
private BigDecimal calculateOrderTotal(List<CartItem> cartItems) {
    return cartItems.stream()
        .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
        .reduce(BigDecimal.ZERO, BigDecimal::add);
}

/**
 * 计算运费
 */
private BigDecimal calculateShippingFee(List<CartItem> cartItems, BigDecimal totalAmount) {
    // 检查是否有包邮商品
    boolean hasFreeShipping = cartItems.stream()
        .anyMatch(item -> item.getIsFreeShipping() == 1);
    
    if (hasFreeShipping) {
        return BigDecimal.ZERO;
    }
    
    // 检查是否满足包邮条件（例如满99包邮）
    BigDecimal freeShippingThreshold = new BigDecimal("99.00");
    if (totalAmount.compareTo(freeShippingThreshold) >= 0) {
        return BigDecimal.ZERO;
    }
    
    // 返回默认运费
    return new BigDecimal("8.00");
}
```

---

## 错误处理策略

### 异常类型

| 异常类型 | HTTP状态码 | 错误码 | 说明 |
|---------|-----------|--------|------|
| InvalidParameterException | 400 | 40001 | 参数验证失败 |
| InsufficientStockException | 400 | 40002 | 库存不足 |
| CartItemNotFoundException | 404 | 40401 | 购物车商品不存在 |
| AddressNotFoundException | 404 | 40402 | 收货地址不存在 |
| OrderCreationException | 500 | 50001 | 订单创建失败 |

### 异常处理示例

```java
/**
 * 验证库存
 */
private void validateInventoryForOrder(List<CartItem> cartItems) {
    List<InsufficientStockItem> insufficientItems = new ArrayList<>();
    
    for (CartItem item : cartItems) {
        Drug drug = drugMapper.selectById(item.getDrugId());
        if (drug == null) {
            throw new BusinessException("药品不存在: " + item.getDrugId());
        }
        
        if (drug.getStock() < item.getQuantity()) {
            InsufficientStockItem insufficientItem = new InsufficientStockItem();
            insufficientItem.setDrugId(drug.getId());
            insufficientItem.setDrugName(drug.getName());
            insufficientItem.setRequestQuantity(item.getQuantity());
            insufficientItem.setAvailableQuantity(drug.getStock());
            insufficientItems.add(insufficientItem);
        }
    }
    
    if (!insufficientItems.isEmpty()) {
        throw new InsufficientStockException("库存不足", insufficientItems);
    }
}
```

---

## 正确性属性 (Property-Based Testing)

### Property 1: 订单号唯一性
```
∀ order1, order2 ∈ Orders:
  order1.orderNum ≠ order2.orderNum
```

### Property 2: 金额计算正确性
```
∀ order ∈ Orders:
  order.actualAmount = order.totalAmount + order.shippingFee
  
∀ order ∈ Orders:
  order.totalAmount = Σ(item.price × item.quantity) for item in order.items
```

### Property 3: 库存一致性
```
∀ drug ∈ Drugs, order ∈ Orders:
  drug.stock_after = drug.stock_before - Σ(item.quantity) 
    where item.drugId = drug.id and item.orderId = order.id
```

### Property 4: 事务原子性
```
IF createOrder() fails THEN
  - 订单记录未创建
  - 订单商品记录未创建
  - 库存未扣减
  - 购物车未清空
```

---

## 性能优化方案

### 1. 批量查询优化
```java
// 一次性查询所有购物车商品
List<CartItem> cartItems = cartMapper.selectByIds(cartItemIds);

// 一次性查询所有药品信息
List<Long> drugIds = cartItems.stream()
    .map(CartItem::getDrugId)
    .collect(Collectors.toList());
List<Drug> drugs = drugMapper.selectByIds(drugIds);
```

### 2. 库存锁定优化
```sql
-- 使用批量更新减少数据库交互
UPDATE t_drug 
SET stock = CASE id
    WHEN ? THEN stock - ?
    WHEN ? THEN stock - ?
    ...
END
WHERE id IN (?, ?, ...)
AND stock >= CASE id
    WHEN ? THEN ?
    WHEN ? THEN ?
    ...
END;
```

### 3. Redis缓存
```java
// 缓存药品信息，减少数据库查询
String cacheKey = "drug:" + drugId;
Drug drug = redisTemplate.opsForValue().get(cacheKey);
if (drug == null) {
    drug = drugMapper.selectById(drugId);
    redisTemplate.opsForValue().set(cacheKey, drug, 10, TimeUnit.MINUTES);
}
```

---

## 测试策略

### 单元测试

**测试用例1: 正常创建订单**
```java
@Test
public void testCreateOrder_Success() {
    // Given
    OrderCreateDTO request = new OrderCreateDTO();
    request.setPatientUserId(1L);
    request.setCartItemIds(Arrays.asList(1L, 2L));
    request.setAddressId(1L);
    
    // When
    DrugOrderDTO result = orderService.createOrder(request);
    
    // Then
    assertNotNull(result);
    assertNotNull(result.getOrderNum());
    assertTrue(result.getOrderNum().startsWith("ORD"));
    assertEquals(OrderStatus.PENDING_PAYMENT.getCode(), result.getStatus());
}
```

**测试用例2: 库存不足**
```java
@Test(expected = InsufficientStockException.class)
public void testCreateOrder_InsufficientStock() {
    // Given
    OrderCreateDTO request = new OrderCreateDTO();
    request.setPatientUserId(1L);
    request.setCartItemIds(Arrays.asList(1L)); // 商品库存不足
    request.setAddressId(1L);
    
    // When
    orderService.createOrder(request);
    
    // Then - 期望抛出异常
}
```

### 集成测试

**测试用例3: 端到端订单创建**
```java
@Test
@Transactional
public void testCreateOrder_EndToEnd() {
    // 1. 添加商品到购物车
    // 2. 创建订单
    // 3. 验证订单记录
    // 4. 验证订单商品记录
    // 5. 验证库存扣减
    // 6. 验证购物车清空
}
```

### 性能测试

**测试用例4: 并发创建订单**
```java
@Test
public void testCreateOrder_Concurrent() {
    // 模拟100个并发请求
    // 验证无超卖
    // 验证响应时间 < 2秒
}
```

---

## 相关文档

- [需求文档](./requirements.md)
- [任务列表](./tasks.md)
- [购物车基础功能设计](../patient-mall-phase3-cart-basic/design.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
