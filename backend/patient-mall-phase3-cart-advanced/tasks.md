# Spec 7: 购物车高级功能 - 任务列表

## 文档信息

**Spec ID:** patient-mall-phase3-cart-advanced  
**创建日期:** 2026-01-23  
**预计工作量:** 2-3小时

---

## 任务概览

| 任务ID | 任务名称 | 预计时间 | 依赖 | 状态 |
|--------|---------|---------|------|------|
| TASK-CA-01 | 验证选中状态字段 | 20分钟 | 无 | 待开始 |
| TASK-CA-02 | 实现选中/取消选中功能 | 30分钟 | TASK-CA-01 | 待开始 |
| TASK-CA-03 | 实现批量操作功能 | 40分钟 | TASK-CA-02 | 待开始 |
| TASK-CA-04 | 实现汇总计算功能 | 30分钟 | TASK-CA-03 | 待开始 |
| TASK-CA-05 | 编写单元测试 | 30分钟 | TASK-CA-04 | 待开始 |
| TASK-CA-06 | 集成测试和验证 | 30分钟 | TASK-CA-05 | 待开始 |

**总计:** 3小时

---

## TASK-CA-01: 验证选中状态字段

### 任务描述
验证 `t_mall_cart` 表是否有 `selected` 字段，如果没有则添加。

### 实施步骤

#### 1. 检查表结构

```sql
-- 查看购物车表结构
DESC t_mall_cart;

-- 检查selected字段
SHOW COLUMNS FROM t_mall_cart LIKE 'selected';
```

#### 2. 添加selected字段（如果不存在）

```sql
ALTER TABLE t_mall_cart 
ADD COLUMN selected TINYINT(1) DEFAULT 1 COMMENT '是否选中 0-未选中 1-选中'
AFTER quantity;
```

#### 3. 更新现有数据

```sql
-- 将现有数据的selected字段设置为1（选中）
UPDATE t_mall_cart SET selected = 1 WHERE selected IS NULL;
```

### 验收标准
- [ ] selected字段存在
- [ ] 字段类型为TINYINT(1)
- [ ] 默认值为1
- [ ] 现有数据已更新

---

## TASK-CA-02: 实现选中/取消选中功能

### 任务描述
实现单个商品的选中/取消选中功能。

### 实施步骤

#### 1. 更新CartService

在 `CartServiceImpl.java` 中添加方法：

```java
/**
 * 选中/取消选中商品
 */
public CartSelectResponse selectCartItem(Long itemId, Boolean selected) {
    // 1. 查询购物车项
    CartItem cartItem = cartMapper.selectById(itemId);
    if (cartItem == null) {
        throw new BusinessException("购物车项不存在");
    }
    
    // 2. 更新选中状态
    cartItem.setSelected(selected);
    cartMapper.updateById(cartItem);
    
    // 3. 计算汇总信息
    CartSummary summary = calculateSummary(cartItem.getUserId());
    
    // 4. 返回结果
    return CartSelectResponse.builder()
        .cartItemId(itemId)
        .selected(selected)
        .summary(summary)
        .build();
}
```

#### 2. 更新CartController

在 `CartController.java` 中添加接口：

```java
/**
 * 选中/取消选中商品
 */
@PutMapping("/{itemId}/select")
public Result<CartSelectResponse> selectCartItem(
        @PathVariable Long itemId,
        @RequestBody CartSelectRequest request) {
    CartSelectResponse response = cartService.selectCartItem(
        itemId, request.getSelected()
    );
    return Result.success(response);
}
```

#### 3. 创建DTO类

```java
// CartSelectRequest.java
@Data
public class CartSelectRequest {
    private Boolean selected;
}

// CartSelectResponse.java
@Data
@Builder
public class CartSelectResponse {
    private Long cartItemId;
    private Boolean selected;
    private CartSummary summary;
}
```

### 验收标准
- [ ] 能成功更新选中状态
- [ ] 返回更新后的汇总信息
- [ ] 异常处理完善

---

## TASK-CA-03: 实现批量操作功能

### 任务描述
实现批量选中、批量删除和清空购物车功能。

### 实施步骤

#### 1. 实现批量选中

```java
/**
 * 批量选中/取消选中
 */
@Transactional
public CartBatchSelectResponse batchSelect(Long userId, Boolean selected) {
    // 1. 批量更新
    int affectedCount = cartMapper.updateSelectedByUserId(userId, selected);
    
    // 2. 计算汇总
    CartSummary summary = calculateSummary(userId);
    
    // 3. 返回结果
    return CartBatchSelectResponse.builder()
        .affectedCount(affectedCount)
        .summary(summary)
        .build();
}
```

#### 2. 实现批量删除

```java
/**
 * 批量删除
 */
@Transactional
public CartBatchRemoveResponse batchRemove(Long userId, List<Long> cartItemIds) {
    // 1. 验证权限
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
    
    // 4. 计算汇总
    CartSummary summary = calculateSummary(userId);
    
    // 5. 返回结果
    return CartBatchRemoveResponse.builder()
        .deletedCount(deletedCount)
        .summary(summary)
        .build();
}
```

#### 3. 实现清空购物车

```java
/**
 * 清空购物车
 */
@Transactional
public void clearCart(Long userId) {
    // 1. 删除所有商品
    cartMapper.deleteByUserId(userId);
    
    // 2. 清空缓存
    cartCacheService.deleteCartCount(userId);
}
```

#### 4. 添加Mapper方法

在 `CartMapper.xml` 中添加SQL：

```xml
<!-- 批量更新选中状态 -->
<update id="updateSelectedByUserId">
    UPDATE t_mall_cart
    SET selected = #{selected},
        update_time = NOW()
    WHERE user_id = #{userId}
</update>

<!-- 删除用户所有购物车商品 -->
<delete id="deleteByUserId">
    DELETE FROM t_mall_cart
    WHERE user_id = #{userId}
</delete>
```

### 验收标准
- [ ] 批量选中功能正常
- [ ] 批量删除功能正常
- [ ] 清空购物车功能正常
- [ ] 事务回滚正常

---

## TASK-CA-04: 实现汇总计算功能

### 任务描述
实现购物车汇总信息的计算功能。

### 实施步骤

#### 1. 创建汇总模型

```java
@Data
@Builder
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

#### 2. 实现计算逻辑

```java
/**
 * 计算购物车汇总
 */
public CartSummary calculateSummary(Long userId) {
    // 1. 查询购物车列表
    List<CartItem> cartItems = cartMapper.selectByUserId(userId);
    
    if (cartItems.isEmpty()) {
        return CartSummary.builder()
            .totalQuantity(0)
            .selectedQuantity(0)
            .totalAmount(BigDecimal.ZERO)
            .selectedAmount(BigDecimal.ZERO)
            .totalItems(0)
            .selectedItems(0)
            .discountAmount(BigDecimal.ZERO)
            .shippingFee(BigDecimal.ZERO)
            .build();
    }
    
    // 2. 查询药品详情
    List<Long> drugIds = cartItems.stream()
        .map(CartItem::getDrugId)
        .collect(Collectors.toList());
    List<Drug> drugs = drugMapper.selectBatchIds(drugIds);
    Map<Long, Drug> drugMap = drugs.stream()
        .collect(Collectors.toMap(Drug::getId, Function.identity()));
    
    // 3. 计算汇总
    int totalQuantity = 0;
    BigDecimal totalAmount = BigDecimal.ZERO;
    int selectedQuantity = 0;
    BigDecimal selectedAmount = BigDecimal.ZERO;
    int selectedItems = 0;
    
    for (CartItem item : cartItems) {
        Drug drug = drugMap.get(item.getDrugId());
        BigDecimal itemAmount = drug.getPrice()
            .multiply(new BigDecimal(item.getQuantity()));
        
        totalQuantity += item.getQuantity();
        totalAmount = totalAmount.add(itemAmount);
        
        if (item.getSelected()) {
            selectedQuantity += item.getQuantity();
            selectedAmount = selectedAmount.add(itemAmount);
            selectedItems++;
        }
    }
    
    // 4. 计算运费
    BigDecimal shippingFee = calculateShippingFee(cartItems, drugMap);
    
    // 5. 返回结果
    return CartSummary.builder()
        .totalQuantity(totalQuantity)
        .selectedQuantity(selectedQuantity)
        .totalAmount(totalAmount)
        .selectedAmount(selectedAmount)
        .totalItems(cartItems.size())
        .selectedItems(selectedItems)
        .discountAmount(BigDecimal.ZERO)
        .shippingFee(shippingFee)
        .build();
}

/**
 * 计算运费
 */
private BigDecimal calculateShippingFee(List<CartItem> cartItems, 
                                        Map<Long, Drug> drugMap) {
    // 检查选中商品是否全部包邮
    boolean allFreeShipping = cartItems.stream()
        .filter(CartItem::getSelected)
        .allMatch(item -> {
            Drug drug = drugMap.get(item.getDrugId());
            return drug.getIsFreeShipping();
        });
    
    return allFreeShipping ? BigDecimal.ZERO : new BigDecimal("10.00");
}
```

#### 3. 添加汇总查询接口

```java
/**
 * 获取购物车汇总
 */
@GetMapping("/{userId}/summary")
public Result<CartSummary> getCartSummary(@PathVariable Long userId) {
    CartSummary summary = cartService.calculateSummary(userId);
    return Result.success(summary);
}
```

### 验收标准
- [ ] 汇总信息计算准确
- [ ] 包含所有必要字段
- [ ] 运费计算正确
- [ ] 空购物车处理正确

---

## TASK-CA-05: 编写单元测试

### 任务描述
为购物车高级功能编写单元测试。

### 实施步骤

#### 1. 创建测试类

```java
@SpringBootTest
@Transactional
public class CartAdvancedServiceTest {
    
    @Autowired
    private CartService cartService;
    
    /**
     * 测试选中商品
     */
    @Test
    public void testSelectCartItem() {
        // 准备数据
        Long itemId = 10001L;
        
        // 执行选中
        CartSelectResponse response = cartService.selectCartItem(itemId, true);
        
        // 验证结果
        assertNotNull(response);
        assertTrue(response.getSelected());
        assertNotNull(response.getSummary());
    }
    
    /**
     * 测试批量选中
     */
    @Test
    public void testBatchSelect() {
        Long userId = 1001L;
        
        // 执行批量选中
        CartBatchSelectResponse response = cartService.batchSelect(userId, true);
        
        // 验证结果
        assertNotNull(response);
        assertTrue(response.getAffectedCount() > 0);
        assertEquals(response.getSummary().getTotalQuantity(), 
                     response.getSummary().getSelectedQuantity());
    }
    
    /**
     * 测试批量删除
     */
    @Test
    public void testBatchRemove() {
        Long userId = 1001L;
        List<Long> itemIds = Arrays.asList(10001L, 10002L);
        
        // 执行批量删除
        CartBatchRemoveResponse response = cartService.batchRemove(userId, itemIds);
        
        // 验证结果
        assertNotNull(response);
        assertEquals(2, response.getDeletedCount());
    }
    
    /**
     * 测试清空购物车
     */
    @Test
    public void testClearCart() {
        Long userId = 1001L;
        
        // 执行清空
        cartService.clearCart(userId);
        
        // 验证结果
        CartListResponse listResponse = cartService.getCartList(userId);
        assertTrue(listResponse.getItems().isEmpty());
    }
    
    /**
     * 测试汇总计算
     */
    @Test
    public void testCalculateSummary() {
        Long userId = 1001L;
        
        // 计算汇总
        CartSummary summary = cartService.calculateSummary(userId);
        
        // 验证结果
        assertNotNull(summary);
        assertTrue(summary.getTotalQuantity() >= 0);
        assertTrue(summary.getTotalAmount().compareTo(BigDecimal.ZERO) >= 0);
    }
}
```

#### 2. 运行测试

```bash
cd internet-hospital/adinnet-patient-api
mvn test -Dtest=CartAdvancedServiceTest
```

### 验收标准
- [ ] 所有测试用例通过
- [ ] 测试覆盖率 > 80%

---

## TASK-CA-06: 集成测试和验证

### 任务描述
进行端到端的集成测试。

### 实施步骤

#### 1. 测试选中商品

```bash
curl -X PUT http://localhost:8092/api/v1/mall/cart/10001/select \
  -H "Content-Type: application/json" \
  -d '{"selected": true}'
```

#### 2. 测试批量选中

```bash
curl -X PUT http://localhost:8092/api/v1/mall/cart/batch-select \
  -H "Content-Type: application/json" \
  -d '{"userId": 1001, "selected": true}'
```

#### 3. 测试批量删除

```bash
curl -X POST http://localhost:8092/api/v1/mall/cart/batch-remove \
  -H "Content-Type: application/json" \
  -d '{"userId": 1001, "cartItemIds": [10001, 10002]}'
```

#### 4. 测试清空购物车

```bash
curl -X DELETE http://localhost:8092/api/v1/mall/cart/1001/clear
```

#### 5. 测试获取汇总

```bash
curl http://localhost:8092/api/v1/mall/cart/1001/summary
```

### 验收标准
- [ ] 所有API接口响应正常
- [ ] 数据一致性正确
- [ ] 响应时间符合要求

---

## 总结

### 完成标准
- [ ] 所有任务完成
- [ ] 所有测试通过
- [ ] 文档更新完整
- [ ] 代码提交到Git

---

## 相关文档

- [需求文档](./requirements.md)
- [设计文档](./design.md)
- [购物车基础功能任务](../patient-mall-phase3-cart-basic/tasks.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
