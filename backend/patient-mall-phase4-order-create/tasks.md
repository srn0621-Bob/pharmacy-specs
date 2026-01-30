# Spec 8: 订单创建功能 - 任务列表

## 文档信息

**Spec编号:** patient-mall-phase4-order-create  
**功能名称:** 订单创建功能  
**所属阶段:** 阶段四 - 订单功能  
**创建日期:** 2026-01-23  
**预计工作量:** 3-4小时

---

## 任务概览

| 任务ID | 任务名称 | 预计时间 | 依赖 | 状态 |
|--------|---------|---------|------|------|
| T8.1 | 验证现有订单表结构 | 0.5小时 | 无 | 待开始 |
| T8.2 | 创建订单DTO类 | 0.5小时 | T8.1 | 待开始 |
| T8.3 | 实现订单号生成器 | 0.5小时 | 无 | 待开始 |
| T8.4 | 实现金额计算逻辑 | 0.5小时 | 无 | 待开始 |
| T8.5 | 实现库存验证和扣减 | 1小时 | T8.1 | 待开始 |
| T8.6 | 实现订单创建Service | 1小时 | T8.2-T8.5 | 待开始 |
| T8.7 | 实现订单创建Controller | 0.5小时 | T8.6 | 待开始 |
| T8.8 | 编写单元测试 | 0.5小时 | T8.6 | 待开始 |
| T8.9 | 集成测试和验证 | 0.5小时 | T8.7-T8.8 | 待开始 |

---

## 任务详情

### T8.1 验证现有订单表结构

**目标:** 确认订单表和订单商品表结构是否满足需求

**步骤:**
1. 查看 `t_hos_pre_drug_order` 表结构
2. 查看 `t_hos_pre_drug_order_item` 表结构
3. 确认字段是否完整
4. 确认索引是否合理

**验证SQL:**
```sql
-- 查看订单表结构
SHOW CREATE TABLE t_hos_pre_drug_order;

-- 查看订单商品表结构
SHOW CREATE TABLE t_hos_pre_drug_order_item;

-- 查看索引
SHOW INDEX FROM t_hos_pre_drug_order;
SHOW INDEX FROM t_hos_pre_drug_order_item;
```

**验收标准:**
- [ ] 订单表包含所有必需字段
- [ ] 订单商品表包含所有必需字段
- [ ] 索引设置合理
- [ ] 字段类型和长度合适

**注意事项:**
- 如果表结构不满足需求，需要创建ALTER脚本
- 确认订单号字段有唯一索引

---

### T8.2 创建订单DTO类

**目标:** 创建订单相关的DTO类

**需要创建的类:**

**1. OrderCreateDTO.java** - 订单创建请求
```java
package com.patient.api.app.mall.model;

import lombok.Data;
import javax.validation.constraints.*;
import java.util.List;

/**
 * 订单创建请求DTO
 */
@Data
public class OrderCreateDTO {
    
    /**
     * 患者用户ID
     */
    @NotNull(message = "用户ID不能为空")
    private Long patientUserId;
    
    /**
     * 购物车商品ID列表
     */
    @NotEmpty(message = "购物车商品不能为空")
    @Size(min = 1, max = 20, message = "订单商品数量必须在1-20之间")
    private List<Long> cartItemIds;
    
    /**
     * 收货地址ID
     */
    @NotNull(message = "收货地址不能为空")
    private Long addressId;
    
    /**
     * 订单备注
     */
    @Size(max = 500, message = "订单备注不能超过500字")
    private String remark;
}
```

**2. DrugOrderDTO.java** - 订单信息响应
```java
package com.patient.api.app.mall.model;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单信息DTO
 */
@Data
public class DrugOrderDTO {
    
    /**
     * 订单ID
     */
    private Long id;
    
    /**
     * 订单编号
     */
    private String orderNum;
    
    /**
     * 患者用户ID
     */
    private Long patientUserId;
    
    /**
     * 商品总金额
     */
    private BigDecimal totalAmount;
    
    /**
     * 运费
     */
    private BigDecimal shippingFee;
    
    /**
     * 实付金额
     */
    private BigDecimal actualAmount;
    
    /**
     * 订单状态
     */
    private Integer status;
    
    /**
     * 订单状态名称
     */
    private String statusName;
    
    /**
     * 支付状态
     */
    private Integer payStatus;
    
    /**
     * 支付时间
     */
    private LocalDateTime payTime;
    
    /**
     * 订单备注
     */
    private String remark;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
    
    /**
     * 订单商品列表
     */
    private List<OrderItemDTO> orderItems;
    
    /**
     * 收货地址信息
     */
    private OrderAddressDTO address;
}
```

**3. OrderItemDTO.java** - 订单商品DTO
```java
package com.patient.api.app.mall.model;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 订单商品DTO
 */
@Data
public class OrderItemDTO {
    
    /**
     * 订单商品ID
     */
    private Long id;
    
    /**
     * 订单ID
     */
    private Long orderId;
    
    /**
     * 药品ID
     */
    private Long drugId;
    
    /**
     * 药品名称
     */
    private String drugName;
    
    /**
     * 药品规格
     */
    private String drugSpec;
    
    /**
     * 生产厂家
     */
    private String drugManufacturer;
    
    /**
     * 药品图片
     */
    private String drugImage;
    
    /**
     * 购买数量
     */
    private Integer quantity;
    
    /**
     * 单价
     */
    private BigDecimal price;
    
    /**
     * 小计
     */
    private BigDecimal subtotal;
}
```

**4. OrderAddressDTO.java** - 订单收货地址DTO
```java
package com.patient.api.app.mall.model;

import lombok.Data;

/**
 * 订单收货地址DTO
 */
@Data
public class OrderAddressDTO {
    
    /**
     * 收货人姓名
     */
    private String receiverName;
    
    /**
     * 收货人电话
     */
    private String receiverPhone;
    
    /**
     * 省份
     */
    private String province;
    
    /**
     * 城市
     */
    private String city;
    
    /**
     * 区县
     */
    private String district;
    
    /**
     * 详细地址
     */
    private String detailAddress;
}
```

**验收标准:**
- [ ] 所有DTO类创建完成
- [ ] 字段注释完整
- [ ] 使用Lombok简化代码
- [ ] 添加必要的验证注解

---

### T8.3 实现订单号生成器

**目标:** 实现订单号生成逻辑，确保全局唯一

**实现代码:**
```java
package com.patient.api.app.mall.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 订单号生成器
 */
public class OrderNumberGenerator {
    
    private static final String PREFIX = "ORD";
    private static final DateTimeFormatter FORMATTER = 
        DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    
    /**
     * 生成订单号
     * 格式: ORD + yyyyMMddHHmmss + 6位随机数
     * 
     * @return 订单号
     */
    public static String generate() {
        // 时间戳部分
        String timestamp = LocalDateTime.now().format(FORMATTER);
        
        // 随机数部分（6位）
        int random = ThreadLocalRandom.current().nextInt(1000000);
        String randomStr = String.format("%06d", random);
        
        return PREFIX + timestamp + randomStr;
    }
    
    /**
     * 验证订单号格式
     * 
     * @param orderNum 订单号
     * @return 是否有效
     */
    public static boolean isValid(String orderNum) {
        if (orderNum == null || orderNum.length() != 23) {
            return false;
        }
        
        if (!orderNum.startsWith(PREFIX)) {
            return false;
        }
        
        // 验证时间戳部分是否为数字
        String timestamp = orderNum.substring(3, 17);
        if (!timestamp.matches("\\d{14}")) {
            return false;
        }
        
        // 验证随机数部分是否为数字
        String random = orderNum.substring(17);
        return random.matches("\\d{6}");
    }
}
```

**单元测试:**
```java
package com.patient.api.app.mall.util;

import org.junit.Test;
import static org.junit.Assert.*;

public class OrderNumberGeneratorTest {
    
    @Test
    public void testGenerate() {
        String orderNum = OrderNumberGenerator.generate();
        
        assertNotNull(orderNum);
        assertEquals(23, orderNum.length());
        assertTrue(orderNum.startsWith("ORD"));
        assertTrue(OrderNumberGenerator.isValid(orderNum));
    }
    
    @Test
    public void testGenerateUnique() {
        String orderNum1 = OrderNumberGenerator.generate();
        String orderNum2 = OrderNumberGenerator.generate();
        
        assertNotEquals(orderNum1, orderNum2);
    }
    
    @Test
    public void testIsValid() {
        assertTrue(OrderNumberGenerator.isValid("ORD20260123193000123456"));
        assertFalse(OrderNumberGenerator.isValid("ORD2026012319300012345")); // 长度不对
        assertFalse(OrderNumberGenerator.isValid("ABC20260123193000123456")); // 前缀不对
        assertFalse(OrderNumberGenerator.isValid(null));
    }
}
```

**验收标准:**
- [ ] 订单号格式正确
- [ ] 订单号长度为23位
- [ ] 订单号以"ORD"开头
- [ ] 连续生成的订单号不重复
- [ ] 单元测试通过

---

### T8.4 实现金额计算逻辑

**目标:** 实现订单金额和运费计算逻辑

**实现代码:**
```java
package com.patient.api.app.mall.util;

import com.patient.api.app.mall.model.CartItem;
import java.math.BigDecimal;
import java.util.List;

/**
 * 订单金额计算器
 */
public class OrderAmountCalculator {
    
    /**
     * 包邮门槛金额
     */
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("99.00");
    
    /**
     * 默认运费
     */
    private static final BigDecimal DEFAULT_SHIPPING_FEE = new BigDecimal("8.00");
    
    /**
     * 计算商品总金额
     * 
     * @param cartItems 购物车商品列表
     * @return 商品总金额
     */
    public static BigDecimal calculateTotalAmount(List<CartItem> cartItems) {
        return cartItems.stream()
            .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * 计算运费
     * 
     * @param cartItems 购物车商品列表
     * @param totalAmount 商品总金额
     * @return 运费
     */
    public static BigDecimal calculateShippingFee(List<CartItem> cartItems, BigDecimal totalAmount) {
        // 检查是否有包邮商品
        boolean hasFreeShipping = cartItems.stream()
            .anyMatch(item -> item.getIsFreeShipping() != null && item.getIsFreeShipping() == 1);
        
        if (hasFreeShipping) {
            return BigDecimal.ZERO;
        }
        
        // 检查是否满足包邮条件
        if (totalAmount.compareTo(FREE_SHIPPING_THRESHOLD) >= 0) {
            return BigDecimal.ZERO;
        }
        
        // 返回默认运费
        return DEFAULT_SHIPPING_FEE;
    }
    
    /**
     * 计算实付金额
     * 
     * @param totalAmount 商品总金额
     * @param shippingFee 运费
     * @return 实付金额
     */
    public static BigDecimal calculateActualAmount(BigDecimal totalAmount, BigDecimal shippingFee) {
        return totalAmount.add(shippingFee);
    }
}
```

**单元测试:**
```java
package com.patient.api.app.mall.util;

import com.patient.api.app.mall.model.CartItem;
import org.junit.Test;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import static org.junit.Assert.*;

public class OrderAmountCalculatorTest {
    
    @Test
    public void testCalculateTotalAmount() {
        CartItem item1 = new CartItem();
        item1.setPrice(new BigDecimal("25.00"));
        item1.setQuantity(2);
        
        CartItem item2 = new CartItem();
        item2.setPrice(new BigDecimal("36.00"));
        item2.setQuantity(3);
        
        List<CartItem> items = Arrays.asList(item1, item2);
        BigDecimal total = OrderAmountCalculator.calculateTotalAmount(items);
        
        assertEquals(new BigDecimal("158.00"), total);
    }
    
    @Test
    public void testCalculateShippingFee_WithFreeShippingItem() {
        CartItem item = new CartItem();
        item.setPrice(new BigDecimal("50.00"));
        item.setQuantity(1);
        item.setIsFreeShipping(1);
        
        List<CartItem> items = Arrays.asList(item);
        BigDecimal fee = OrderAmountCalculator.calculateShippingFee(items, new BigDecimal("50.00"));
        
        assertEquals(BigDecimal.ZERO, fee);
    }
    
    @Test
    public void testCalculateShippingFee_AboveThreshold() {
        CartItem item = new CartItem();
        item.setPrice(new BigDecimal("100.00"));
        item.setQuantity(1);
        item.setIsFreeShipping(0);
        
        List<CartItem> items = Arrays.asList(item);
        BigDecimal fee = OrderAmountCalculator.calculateShippingFee(items, new BigDecimal("100.00"));
        
        assertEquals(BigDecimal.ZERO, fee);
    }
    
    @Test
    public void testCalculateShippingFee_BelowThreshold() {
        CartItem item = new CartItem();
        item.setPrice(new BigDecimal("50.00"));
        item.setQuantity(1);
        item.setIsFreeShipping(0);
        
        List<CartItem> items = Arrays.asList(item);
        BigDecimal fee = OrderAmountCalculator.calculateShippingFee(items, new BigDecimal("50.00"));
        
        assertEquals(new BigDecimal("8.00"), fee);
    }
}
```

**验收标准:**
- [ ] 商品总金额计算正确
- [ ] 包邮商品运费为0
- [ ] 满99元包邮逻辑正确
- [ ] 不满足包邮条件时运费为8元
- [ ] 单元测试通过

---

### T8.5 实现库存验证和扣减

**目标:** 实现库存验证和扣减逻辑，防止超卖

**Mapper接口:**
```java
package com.patient.api.app.mall.mapper;

import org.apache.ibatis.annotations.Param;

/**
 * 库存Mapper
 */
public interface InventoryMapper {
    
    /**
     * 锁定库存并查询
     * 
     * @param drugId 药品ID
     * @return 当前库存数量
     */
    Integer selectStockForUpdate(@Param("drugId") Long drugId);
    
    /**
     * 扣减库存
     * 
     * @param drugId 药品ID
     * @param quantity 扣减数量
     * @return 影响行数
     */
    int decreaseStock(@Param("drugId") Long drugId, @Param("quantity") Integer quantity);
}
```

**Mapper XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.patient.api.app.mall.mapper.InventoryMapper">
    
    <!-- 锁定库存并查询 -->
    <select id="selectStockForUpdate" resultType="java.lang.Integer">
        SELECT stock
        FROM t_drug
        WHERE id = #{drugId}
        FOR UPDATE
    </select>
    
    <!-- 扣减库存 -->
    <update id="decreaseStock">
        UPDATE t_drug
        SET stock = stock - #{quantity},
            update_time = NOW()
        WHERE id = #{drugId}
        AND stock >= #{quantity}
    </update>
    
</mapper>
```

**Service实现:**
```java
package com.patient.api.app.mall.service.impl;

import com.patient.api.app.mall.exception.InsufficientStockException;
import com.patient.api.app.mall.mapper.InventoryMapper;
import com.patient.api.app.mall.model.CartItem;
import com.patient.api.app.mall.model.InsufficientStockItem;
import com.patient.api.app.mall.service.InventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 库存服务实现
 */
@Service
public class InventoryServiceImpl implements InventoryService {
    
    private static final Logger logger = LoggerFactory.getLogger(InventoryServiceImpl.class);
    
    @Autowired
    private InventoryMapper inventoryMapper;
    
    @Override
    public void validateAndReserveStock(List<CartItem> cartItems) {
        logger.info("开始验证和预留库存，商品数量: {}", cartItems.size());
        
        List<InsufficientStockItem> insufficientItems = new ArrayList<>();
        
        for (CartItem item : cartItems) {
            // 锁定行并查询库存
            Integer currentStock = inventoryMapper.selectStockForUpdate(item.getDrugId());
            
            if (currentStock == null || currentStock < item.getQuantity()) {
                InsufficientStockItem insufficientItem = new InsufficientStockItem();
                insufficientItem.setDrugId(item.getDrugId());
                insufficientItem.setDrugName(item.getDrugName());
                insufficientItem.setRequestQuantity(item.getQuantity());
                insufficientItem.setAvailableQuantity(currentStock != null ? currentStock : 0);
                insufficientItems.add(insufficientItem);
                
                logger.warn("库存不足 - 药品ID: {}, 需要: {}, 可用: {}", 
                    item.getDrugId(), item.getQuantity(), currentStock);
            }
        }
        
        // 如果有库存不足的商品，抛出异常
        if (!insufficientItems.isEmpty()) {
            throw new InsufficientStockException("库存不足", insufficientItems);
        }
        
        // 扣减库存
        for (CartItem item : cartItems) {
            int rows = inventoryMapper.decreaseStock(item.getDrugId(), item.getQuantity());
            if (rows == 0) {
                logger.error("库存扣减失败 - 药品ID: {}, 数量: {}", item.getDrugId(), item.getQuantity());
                throw new RuntimeException("库存扣减失败");
            }
            logger.info("库存扣减成功 - 药品ID: {}, 扣减数量: {}", item.getDrugId(), item.getQuantity());
        }
        
        logger.info("库存验证和预留完成");
    }
}
```

**验收标准:**
- [ ] 库存验证逻辑正确
- [ ] 使用FOR UPDATE锁定行
- [ ] 库存不足时抛出异常
- [ ] 库存扣减原子性操作
- [ ] 防止超卖

---

### T8.6 实现订单创建Service

**目标:** 实现完整的订单创建业务逻辑

**实现代码:**（参考design.md中的OrderService.createOrder()实现）

**验收标准:**
- [ ] 订单创建流程完整
- [ ] 事务管理正确
- [ ] 异常处理完善
- [ ] 日志记录完整

---

### T8.7 实现订单创建Controller

**目标:** 实现订单创建API接口

**实现代码:**
```java
package com.patient.api.app.mall.controller;

import com.patient.api.app.mall.model.DrugOrderDTO;
import com.patient.api.app.mall.model.OrderCreateDTO;
import com.patient.api.app.mall.service.OrderService;
import com.patient.api.common.result.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 订单Controller
 */
@RestController
@RequestMapping("/api/patient/mall/order")
public class OrderController {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    
    @Autowired
    private OrderService orderService;
    
    /**
     * 创建订单
     */
    @PostMapping("/create")
    public Result<DrugOrderDTO> createOrder(@RequestBody @Valid OrderCreateDTO orderCreateDTO) {
        logger.info("接收创建订单请求 - 用户ID: {}, 购物车商品数: {}", 
            orderCreateDTO.getPatientUserId(), orderCreateDTO.getCartItemIds().size());
        
        try {
            DrugOrderDTO order = orderService.createOrder(orderCreateDTO);
            logger.info("订单创建成功 - 订单号: {}", order.getOrderNum());
            return Result.success(order);
        } catch (Exception e) {
            logger.error("订单创建失败", e);
            return Result.error(e.getMessage());
        }
    }
}
```

**验收标准:**
- [ ] API接口路径正确
- [ ] 参数验证正常
- [ ] 返回结果格式正确
- [ ] 异常处理完善

---

### T8.8 编写单元测试

**目标:** 编写完整的单元测试

**测试用例:**
1. 正常创建订单
2. 库存不足
3. 购物车商品不存在
4. 收货地址不存在
5. 并发创建订单

**验收标准:**
- [ ] 测试覆盖率 > 80%
- [ ] 所有测试用例通过

---

### T8.9 集成测试和验证

**目标:** 进行端到端测试

**测试步骤:**
1. 添加商品到购物车
2. 调用创建订单API
3. 验证订单记录
4. 验证订单商品记录
5. 验证库存扣减
6. 验证购物车清空

**验收标准:**
- [ ] 端到端流程正常
- [ ] 数据一致性正确
- [ ] 性能满足要求

---

## 注意事项

1. **事务管理**: 订单创建必须使用事务，确保数据一致性
2. **库存锁定**: 使用FOR UPDATE防止超卖
3. **订单号唯一性**: 确保订单号生成算法的唯一性
4. **金额计算**: 金额计算必须在服务端进行
5. **异常处理**: 完善的异常处理和回滚机制

---

## 相关文档

- [需求文档](./requirements.md)
- [设计文档](./design.md)
- [购物车基础功能任务](../patient-mall-phase3-cart-basic/tasks.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
