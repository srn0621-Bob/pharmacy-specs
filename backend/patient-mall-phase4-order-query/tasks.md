# Spec 9: 订单查询功能 - 任务列表

## 文档信息

**Spec编号:** patient-mall-phase4-order-query  
**功能名称:** 订单查询功能  
**所属阶段:** 阶段四 - 订单功能  
**创建日期:** 2026-01-23  
**预计工作量:** 2-3小时

---

## 任务概览

| 任务ID | 任务名称 | 预计时间 | 依赖 | 状态 |
|--------|---------|---------|------|------|
| T9.1 | 验证现有查询接口 | 0.5小时 | 无 | 待开始 |
| T9.2 | 实现订单列表查询 | 1小时 | T9.1 | 待开始 |
| T9.3 | 实现订单详情查询 | 0.5小时 | T9.1 | 待开始 |
| T9.4 | 实现数据脱敏 | 0.5小时 | T9.3 | 待开始 |
| T9.5 | 添加缓存优化 | 0.5小时 | T9.2-T9.3 | 待开始 |
| T9.6 | 编写单元测试 | 0.5小时 | T9.2-T9.4 | 待开始 |
| T9.7 | 性能测试和优化 | 0.5小时 | T9.6 | 待开始 |

---

## 任务详情

### T9.1 验证现有查询接口

**目标:** 确认现有订单查询接口是否满足需求

**验证内容:**
1. 检查OrderMapper中的查询方法
2. 验证SQL语句是否包含必要字段
3. 确认索引是否优化

**验收标准:**
- [ ] 查询方法完整
- [ ] SQL语句正确
- [ ] 索引设置合理

---

### T9.2 实现订单列表查询

**目标:** 实现订单列表查询功能

**核心代码:**
```java
@Override
public OrderListResponse getOrderList(OrderQueryDTO queryDTO) {
    // 验证和标准化分页参数
    PageRequest pageRequest = PageUtil.validateAndNormalize(
        queryDTO.getPageNum(), 
        queryDTO.getPageSize()
    );
    
    // 查询订单列表
    List<DrugOrderDTO> orders = orderMapper.selectOrderList(queryDTO);
    
    // 查询总数
    Long total = orderMapper.selectOrderCount(queryDTO);
    
    // 为每个订单加载商品信息
    for (DrugOrderDTO order : orders) {
        List<OrderItemDTO> items = orderMapper.selectOrderItems(order.getId());
        order.setOrderItems(items);
    }
    
    // 构建响应
    return OrderListResponse.builder()
        .total(total)
        .pageNum(pageRequest.getPageNum())
        .pageSize(pageRequest.getPageSize())
        .pages((int) Math.ceil((double) total / pageRequest.getPageSize()))
        .list(orders)
        .build();
}
```

**验收标准:**
- [ ] 列表查询功能正常
- [ ] 分页功能正确
- [ ] 状态筛选正常
- [ ] 性能满足要求

---

### T9.3 实现订单详情查询

**目标:** 实现订单详情查询功能

**核心代码:**
```java
@Override
public DrugOrderDTO getOrderDetail(Long orderId, Long patientUserId) {
    // 查询订单基本信息
    DrugOrderDTO order = orderMapper.selectOrderById(orderId, patientUserId);
    
    if (order == null) {
        throw new BusinessException("订单不存在");
    }
    
    // 查询订单商品
    List<OrderItemDTO> items = orderMapper.selectOrderItems(orderId);
    order.setOrderItems(items);
    
    // 构建收货地址信息
    OrderAddressDTO address = buildAddressDTO(order);
    order.setAddress(address);
    
    return order;
}
```

**验收标准:**
- [ ] 详情查询功能正常
- [ ] 数据完整准确
- [ ] 权限验证正确

---

### T9.4 实现数据脱敏

**目标:** 对敏感信息进行脱敏处理

**脱敏工具类:**
```java
package com.patient.api.app.mall.util;

/**
 * 数据脱敏工具类
 */
public class DataMaskUtil {
    
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
    
    /**
     * 姓名脱敏
     * 张三 -> 张*
     * 欧阳锋 -> 欧**
     */
    public static String maskName(String name) {
        if (name == null || name.length() == 0) {
            return name;
        }
        if (name.length() == 1) {
            return name;
        }
        return name.charAt(0) + "*".repeat(name.length() - 1);
    }
}
```

**验收标准:**
- [ ] 手机号脱敏正确
- [ ] 姓名脱敏正确
- [ ] 不影响业务逻辑

---

### T9.5 添加缓存优化

**目标:** 使用Redis缓存提升查询性能

**缓存实现:**
```java
@Override
public DrugOrderDTO getOrderDetail(Long orderId, Long patientUserId) {
    // 尝试从缓存获取
    String cacheKey = "order:detail:" + orderId;
    DrugOrderDTO order = redisTemplate.opsForValue().get(cacheKey);
    
    if (order != null) {
        logger.info("从缓存获取订单详情 - 订单ID: {}", orderId);
        return order;
    }
    
    // 从数据库查询
    order = orderMapper.selectOrderById(orderId, patientUserId);
    
    if (order != null) {
        // 查询订单商品
        List<OrderItemDTO> items = orderMapper.selectOrderItems(orderId);
        order.setOrderItems(items);
        
        // 写入缓存
        redisTemplate.opsForValue().set(cacheKey, order, 5, TimeUnit.MINUTES);
    }
    
    return order;
}
```

**验收标准:**
- [ ] 缓存功能正常
- [ ] 缓存命中率合理
- [ ] 缓存失效策略正确

---

### T9.6 编写单元测试

**测试用例:**
1. 正常查询订单列表
2. 按状态筛选订单
3. 分页查询
4. 查询订单详情
5. 查询不存在的订单
6. 查询其他用户的订单（权限测试）

**验收标准:**
- [ ] 测试覆盖率 > 80%
- [ ] 所有测试用例通过

---

### T9.7 性能测试和优化

**测试内容:**
1. 列表查询响应时间
2. 详情查询响应时间
3. 并发查询性能
4. 缓存命中率

**验收标准:**
- [ ] 列表查询 < 1秒
- [ ] 详情查询 < 500ms
- [ ] 缓存命中率 > 70%

---

## 相关文档

- [需求文档](./requirements.md)
- [设计文档](./design.md)
- [订单创建任务](../patient-mall-phase4-order-create/tasks.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
