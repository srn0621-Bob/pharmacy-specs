# Spec 6: 购物车基础功能 - 任务列表

## 文档信息

**Spec ID:** patient-mall-phase3-cart-basic  
**创建日期:** 2026-01-23  
**预计工作量:** 2-3小时

---

## 任务概览

| 任务ID | 任务名称 | 预计时间 | 依赖 | 状态 |
|--------|---------|---------|------|------|
| TASK-CB-01 | 验证现有API实现 | 30分钟 | 无 | 待开始 |
| TASK-CB-02 | 数据库表验证和优化 | 30分钟 | TASK-CB-01 | 待开始 |
| TASK-CB-03 | 实现购物车数量缓存 | 30分钟 | TASK-CB-02 | 待开始 |
| TASK-CB-04 | 编写单元测试 | 30分钟 | TASK-CB-03 | 待开始 |
| TASK-CB-05 | 集成测试和验证 | 30分钟 | TASK-CB-04 | 待开始 |

**总计:** 2.5小时

---

## TASK-CB-01: 验证现有API实现

### 任务描述
验证 `CartController` 和 `CartService` 的现有实现是否满足需求。

### 实施步骤

#### 1. 检查Controller实现

```bash
# 查看CartController源码
cat internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/mall/controller/CartController.java
```

**验证点:**
- [ ] 是否实现了添加商品接口
- [ ] 是否实现了查询列表接口
- [ ] 是否实现了更新数量接口
- [ ] 是否实现了删除商品接口
- [ ] 是否实现了查询数量接口

#### 2. 检查Service实现

```bash
# 查看CartService源码
cat internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/mall/service/CartService.java
cat internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/mall/service/impl/CartServiceImpl.java
```

**验证点:**
- [ ] 业务逻辑是否完整
- [ ] 是否有库存验证
- [ ] 是否有并发控制
- [ ] 是否有异常处理

#### 3. 检查Mapper实现

```bash
# 查看CartMapper源码
cat internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/mall/mapper/CartMapper.java
```

**验证点:**
- [ ] SQL语句是否正确
- [ ] 是否有性能优化
- [ ] 是否有索引支持

### 验收标准
- [ ] 所有接口都已实现
- [ ] 代码逻辑清晰无误
- [ ] 无明显的性能问题

### 注意事项
- 如果发现实现不完整，需要补充实现
- 如果发现性能问题，需要优化

---

## TASK-CB-02: 数据库表验证和优化

### 任务描述
验证 `t_mall_cart` 表结构，并根据需要进行优化。

### 实施步骤

#### 1. 检查表结构

```sql
-- 查看购物车表结构
SHOW CREATE TABLE t_mall_cart;

-- 查看索引
SHOW INDEX FROM t_mall_cart;
```

**验证点:**
- [ ] 表是否存在
- [ ] 字段是否完整
- [ ] 索引是否合理

#### 2. 创建或优化表结构

如果表不存在，执行以下SQL：

```sql
CREATE TABLE IF NOT EXISTS t_mall_cart (
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

#### 3. 添加版本号字段（可选）

如果需要乐观锁控制：

```sql
ALTER TABLE t_mall_cart 
ADD COLUMN version INT DEFAULT 0 COMMENT '版本号';
```

#### 4. 验证数据

```sql
-- 查询购物车数据
SELECT * FROM t_mall_cart LIMIT 10;

-- 统计购物车数量
SELECT user_id, COUNT(*) as cart_count 
FROM t_mall_cart 
GROUP BY user_id;
```

### 验收标准
- [ ] 表结构符合设计要求
- [ ] 索引创建成功
- [ ] 唯一约束生效

### 注意事项
- 在生产环境执行前先在测试环境验证
- 添加索引时注意对性能的影响

---

## TASK-CB-03: 实现购物车数量缓存

### 任务描述
使用Redis缓存购物车商品数量，提升查询性能。

### 实施步骤

#### 1. 添加Redis配置

检查 `application.properties` 中的Redis配置：

```properties
# Redis配置
spring.redis.host=127.0.0.1
spring.redis.port=6379
spring.redis.database=0
spring.redis.timeout=3000
```

#### 2. 实现缓存工具类

创建 `CartCacheService.java`：

```java
package com.patient.api.app.mall.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * 购物车缓存服务
 */
@Service
public class CartCacheService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String CART_COUNT_PREFIX = "cart:count:";
    private static final long CACHE_EXPIRE_DAYS = 30;
    
    /**
     * 获取购物车数量
     */
    public Integer getCartCount(Long userId) {
        String key = CART_COUNT_PREFIX + userId;
        return (Integer) redisTemplate.opsForValue().get(key);
    }
    
    /**
     * 设置购物车数量
     */
    public void setCartCount(Long userId, Integer count) {
        String key = CART_COUNT_PREFIX + userId;
        redisTemplate.opsForValue().set(key, count, CACHE_EXPIRE_DAYS, TimeUnit.DAYS);
    }
    
    /**
     * 删除购物车数量缓存
     */
    public void deleteCartCount(Long userId) {
        String key = CART_COUNT_PREFIX + userId;
        redisTemplate.delete(key);
    }
    
    /**
     * 增加购物车数量
     */
    public void incrementCartCount(Long userId, Integer delta) {
        String key = CART_COUNT_PREFIX + userId;
        redisTemplate.opsForValue().increment(key, delta);
        redisTemplate.expire(key, CACHE_EXPIRE_DAYS, TimeUnit.DAYS);
    }
}
```

#### 3. 在Service中集成缓存

修改 `CartServiceImpl.java`：

```java
@Autowired
private CartCacheService cartCacheService;

/**
 * 获取购物车数量
 */
public Integer getCartCount(Long userId) {
    // 1. 尝试从缓存获取
    Integer count = cartCacheService.getCartCount(userId);
    if (count != null) {
        return count;
    }
    
    // 2. 缓存未命中，查询数据库
    count = cartMapper.selectCountByUserId(userId);
    
    // 3. 写入缓存
    cartCacheService.setCartCount(userId, count);
    
    return count;
}

/**
 * 添加商品后更新缓存
 */
private void updateCartCountCache(Long userId) {
    Integer count = cartMapper.selectCountByUserId(userId);
    cartCacheService.setCartCount(userId, count);
}
```

### 验收标准
- [ ] Redis连接正常
- [ ] 缓存读写功能正常
- [ ] 缓存过期时间设置正确
- [ ] 缓存一致性保证

### 注意事项
- 确保Redis服务已启动
- 注意缓存穿透和缓存雪崩问题
- 缓存更新要保证一致性

---

## TASK-CB-04: 编写单元测试

### 任务描述
为购物车基础功能编写单元测试。

### 实施步骤

#### 1. 创建测试类

创建 `CartServiceTest.java`：

```java
package com.patient.api.app.mall.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 购物车服务测试
 */
@SpringBootTest
@Transactional
public class CartServiceTest {
    
    @Autowired
    private CartService cartService;
    
    /**
     * 测试添加商品到购物车
     */
    @Test
    public void testAddToCart() {
        // 准备测试数据
        CartAddRequest request = new CartAddRequest();
        request.setUserId(1001L);
        request.setDrugId(5001L);
        request.setQuantity(2);
        
        // 执行添加
        CartAddResponse response = cartService.addToCart(request);
        
        // 验证结果
        assertNotNull(response);
        assertNotNull(response.getCartItemId());
        assertTrue(response.getTotalQuantity() >= 2);
    }
    
    /**
     * 测试重复添加同一商品
     */
    @Test
    public void testAddSameDrugTwice() {
        // 第一次添加
        CartAddRequest request = new CartAddRequest();
        request.setUserId(1001L);
        request.setDrugId(5001L);
        request.setQuantity(2);
        cartService.addToCart(request);
        
        // 第二次添加
        request.setQuantity(3);
        CartAddResponse response = cartService.addToCart(request);
        
        // 验证数量累加
        CartListResponse listResponse = cartService.getCartList(1001L);
        CartItemDTO item = listResponse.getItems().stream()
            .filter(i -> i.getDrugId().equals(5001L))
            .findFirst()
            .orElse(null);
        
        assertNotNull(item);
        assertEquals(5, item.getQuantity());
    }
    
    /**
     * 测试库存不足
     */
    @Test
    public void testAddToCartWithInsufficientStock() {
        CartAddRequest request = new CartAddRequest();
        request.setUserId(1001L);
        request.setDrugId(5001L);
        request.setQuantity(10000); // 超大数量
        
        // 验证抛出异常
        assertThrows(BusinessException.class, () -> {
            cartService.addToCart(request);
        });
    }
    
    /**
     * 测试获取购物车列表
     */
    @Test
    public void testGetCartList() {
        // 添加测试数据
        CartAddRequest request = new CartAddRequest();
        request.setUserId(1001L);
        request.setDrugId(5001L);
        request.setQuantity(2);
        cartService.addToCart(request);
        
        // 查询列表
        CartListResponse response = cartService.getCartList(1001L);
        
        // 验证结果
        assertNotNull(response);
        assertNotNull(response.getItems());
        assertTrue(response.getItems().size() > 0);
        assertNotNull(response.getSummary());
    }
    
    /**
     * 测试更新商品数量
     */
    @Test
    public void testUpdateQuantity() {
        // 添加商品
        CartAddRequest addRequest = new CartAddRequest();
        addRequest.setUserId(1001L);
        addRequest.setDrugId(5001L);
        addRequest.setQuantity(2);
        CartAddResponse addResponse = cartService.addToCart(addRequest);
        
        // 更新数量
        CartUpdateRequest updateRequest = new CartUpdateRequest();
        updateRequest.setCartItemId(addResponse.getCartItemId());
        updateRequest.setQuantity(5);
        CartUpdateResponse updateResponse = cartService.updateQuantity(updateRequest);
        
        // 验证结果
        assertNotNull(updateResponse);
        assertEquals(5, updateResponse.getQuantity());
    }
    
    /**
     * 测试删除商品
     */
    @Test
    public void testDeleteCartItem() {
        // 添加商品
        CartAddRequest addRequest = new CartAddRequest();
        addRequest.setUserId(1001L);
        addRequest.setDrugId(5001L);
        addRequest.setQuantity(2);
        CartAddResponse addResponse = cartService.addToCart(addRequest);
        
        // 删除商品
        cartService.deleteCartItem(addResponse.getCartItemId());
        
        // 验证已删除
        CartListResponse listResponse = cartService.getCartList(1001L);
        boolean exists = listResponse.getItems().stream()
            .anyMatch(i -> i.getCartItemId().equals(addResponse.getCartItemId()));
        
        assertFalse(exists);
    }
    
    /**
     * 测试获取购物车数量
     */
    @Test
    public void testGetCartCount() {
        // 添加商品
        CartAddRequest request = new CartAddRequest();
        request.setUserId(1001L);
        request.setDrugId(5001L);
        request.setQuantity(2);
        cartService.addToCart(request);
        
        // 查询数量
        Integer count = cartService.getCartCount(1001L);
        
        // 验证结果
        assertNotNull(count);
        assertTrue(count >= 2);
    }
}
```

#### 2. 运行测试

```bash
# 运行单元测试
cd internet-hospital/adinnet-patient-api
mvn test -Dtest=CartServiceTest
```

### 验收标准
- [ ] 所有测试用例通过
- [ ] 测试覆盖率 > 80%
- [ ] 无测试遗漏

### 注意事项
- 使用 `@Transactional` 保证测试数据回滚
- 测试数据要独立，避免相互影响

---

## TASK-CB-05: 集成测试和验证

### 任务描述
进行端到端的集成测试，验证完整功能。

### 实施步骤

#### 1. 启动服务

```bash
# 启动患者端API
cd internet-hospital/adinnet-patient-api
mvn spring-boot:run
```

#### 2. 测试添加商品

```bash
curl -X POST http://localhost:8092/api/v1/mall/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1001,
    "drugId": 5001,
    "quantity": 2
  }'
```

**预期响应:**
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "cartItemId": 10001,
    "totalQuantity": 2,
    "totalAmount": 59.80
  }
}
```

#### 3. 测试查询列表

```bash
curl http://localhost:8092/api/v1/mall/cart/1001
```

**预期响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "cartItemId": 10001,
        "drugId": 5001,
        "drugName": "感冒灵颗粒",
        "quantity": 2,
        "price": 29.90
      }
    ],
    "summary": {
      "totalQuantity": 2,
      "totalAmount": 59.80
    }
  }
}
```

#### 4. 测试更新数量

```bash
curl -X PUT http://localhost:8092/api/v1/mall/cart/update \
  -H "Content-Type: application/json" \
  -d '{
    "cartItemId": 10001,
    "quantity": 5
  }'
```

#### 5. 测试删除商品

```bash
curl -X DELETE http://localhost:8092/api/v1/mall/cart/10001
```

#### 6. 测试查询数量

```bash
curl http://localhost:8092/api/v1/mall/cart/1001/count
```

### 验收标准
- [ ] 所有API接口响应正常
- [ ] 数据一致性正确
- [ ] 响应时间符合要求
- [ ] 错误处理正确

### 注意事项
- 测试前确保数据库和Redis正常运行
- 测试后清理测试数据

---

## 总结

### 完成标准
- [ ] 所有任务完成
- [ ] 所有测试通过
- [ ] 文档更新完整
- [ ] 代码提交到Git

### 遗留问题
记录实施过程中发现的问题和改进建议。

---

## 相关文档

- [需求文档](./requirements.md)
- [设计文档](./design.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
