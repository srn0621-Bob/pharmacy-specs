# Spec 11: 物流信息查询功能 - 设计文档

## 文档信息

**Spec编号:** Spec 11  
**功能名称:** 物流信息查询功能  
**所属阶段:** 阶段五 - 物流功能  
**创建日期:** 2026-01-23

---

## 1. 系统架构

### 1.1 架构图

```
┌─────────────┐
│  患者端APP  │
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────────────────────────────┐
│     患者端API (adinnet-patient-api)  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  MallOrderController         │  │
│  │  - queryLogistics()          │  │
│  └────────────┬─────────────────┘  │
│               ↓                     │
│  ┌──────────────────────────────┐  │
│  │  MallOrderService            │  │
│  │  - getOrderLogistics()       │  │
│  └────────────┬─────────────────┘  │
│               ↓                     │
│  ┌──────────────────────────────┐  │
│  │  LogisticsService            │  │
│  │  - queryLogistics()          │  │
│  │  - parseLogisticsStatus()    │  │
│  └────────────┬─────────────────┘  │
└───────────────┼─────────────────────┘
                ↓
       ┌────────┴────────┐
       │                 │
       ↓                 ↓
┌─────────────┐   ┌─────────────┐
│    Redis    │   │ Kuaidi100   │
│   (缓存)     │   │     API     │
└─────────────┘   └─────────────┘
```

### 1.2 模块职责

| 模块 | 职责 |
|------|------|
| MallOrderController | 接收物流查询请求，参数验证，权限校验 |
| MallOrderService | 订单业务逻辑，获取订单信息 |
| LogisticsService | 物流查询业务逻辑，缓存管理，状态识别 |
| Kuaidi100Util | 快递100 API调用封装 |
| Redis | 物流信息缓存 |

---

## 2. 数据模型设计

### 2.1 核心实体

#### OrderLogisticsDTO（订单物流信息）

```java
package com.patient.api.app.mall.model.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderLogisticsDTO {
    /**
     * 订单ID
     */
    private Long orderId;
    
    /**
     * 订单号
     */
    private String orderNo;
    
    /**
     * 快递公司名称
     */
    private String expressCompany;
    
    /**
     * 快递公司编码
     */
    private String expressCode;
    
    /**
     * 快递单号
     */
    private String expressNo;
    
    /**
     * 物流状态（待发货/运输中/派送中/已签收）
     */
    private String logisticsStatus;
    
    /**
     * 物流轨迹列表
     */
    private List<LogisticsTrace> logisticsTraces;
    
    /**
     * 收件人姓名（脱敏）
     */
    private String receiverName;
    
    /**
     * 收件人电话（脱敏）
     */
    private String receiverPhone;
    
    /**
     * 收件地址（部分脱敏）
     */
    private String receiverAddress;
    
    /**
     * 提示信息
     */
    private String message;
}
```

#### LogisticsTrace（物流轨迹）

```java
package com.patient.api.app.mall.model.dto;

import lombok.Data;

@Data
public class LogisticsTrace {
    /**
     * 流程序号
     */
    private Integer processNo;
    
    /**
     * 处理时间
     */
    private String processTime;
    
    /**
     * 处理描述
     */
    private String processRemark;
}
```

### 2.2 Redis缓存Key设计

```
物流信息缓存Key: mall:logistics:{orderId}
过期时间: 5分钟
数据格式: JSON字符串（OrderLogisticsDTO）
```

---

## 3. 核心流程设计

### 3.1 物流查询主流程

```
开始
  ↓
验证用户登录状态
  ↓
查询订单信息
  ↓
验证订单归属（是否为当前用户的订单）
  ↓
验证订单状态（是否支持查询物流）
  ↓
检查Redis缓存
  ↓
缓存命中？
  ├─ 是 → 返回缓存数据 → 结束
  └─ 否 ↓
检查订单是否已发货
  ↓
已发货？
  ├─ 否 → 返回"暂无物流信息" → 结束
  └─ 是 ↓
调用快递100 API查询物流
  ↓
查询成功？
  ├─ 否 → 返回"物流信息更新中" → 结束
  └─ 是 ↓
解析物流轨迹
  ↓
识别物流状态
  ↓
数据脱敏处理
  ↓
存入Redis缓存
  ↓
返回物流信息
  ↓
结束
```

### 3.2 物流状态识别逻辑

```java
/**
 * 根据物流轨迹识别当前物流状态
 */
private String parseLogisticsStatus(List<LogisticsTrace> traces) {
    if (traces == null || traces.isEmpty()) {
        return "运输中";
    }
    
    // 取最新一条轨迹（第一条）
    String latestRemark = traces.get(0).getProcessRemark();
    
    if (latestRemark.contains("已签收") || latestRemark.contains("签收")) {
        return "已签收";
    } else if (latestRemark.contains("派送") || latestRemark.contains("派件")) {
        return "派送中";
    } else if (latestRemark.contains("到达") || latestRemark.contains("到件")) {
        return "运输中";
    } else {
        return "运输中";
    }
}
```

### 3.3 数据脱敏逻辑

```java
/**
 * 脱敏收件人姓名
 * 张三 → 张*
 * 李四四 → 李**
 */
private String maskName(String name) {
    if (StringUtils.isEmpty(name) || name.length() <= 1) {
        return name;
    }
    return name.charAt(0) + "*".repeat(name.length() - 1);
}

/**
 * 脱敏手机号
 * 13812345678 → 138****5678
 */
private String maskPhone(String phone) {
    if (StringUtils.isEmpty(phone) || phone.length() != 11) {
        return phone;
    }
    return phone.substring(0, 3) + "****" + phone.substring(7);
}

/**
 * 脱敏地址（隐藏门牌号）
 * 北京市朝阳区三里屯路123号 → 北京市朝阳区三里屯路**号
 */
private String maskAddress(String address) {
    if (StringUtils.isEmpty(address)) {
        return address;
    }
    // 简单处理：隐藏最后的门牌号部分
    int lastNumIndex = address.lastIndexOf("号");
    if (lastNumIndex > 0) {
        // 找到"号"前面的数字部分并替换为**
        return address.replaceAll("\\d+号", "**号");
    }
    return address;
}
```

---

## 4. API详细设计

### 4.1 Controller层

```java
package com.patient.api.app.mall.controller;

import com.adinnet.core.base.BaseController;
import com.adinnet.core.base.Result;
import com.patient.api.app.mall.model.dto.OrderLogisticsDTO;
import com.patient.api.app.mall.service.MallOrderService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 药品商城订单控制器
 */
@Api(tags = "药品商城-订单管理")
@RestController
@RequestMapping("/api/patient/mall/order")
public class MallOrderController extends BaseController {
    
    @Autowired
    private MallOrderService mallOrderService;
    
    /**
     * 查询订单物流信息
     */
    @ApiOperation("查询订单物流信息")
    @GetMapping("/logistics/{orderId}")
    public Result<OrderLogisticsDTO> queryLogistics(
            @ApiParam("订单ID") @PathVariable Long orderId) {
        
        // 获取当前登录用户ID
        Long userId = getCurrentUserId();
        
        // 查询物流信息
        OrderLogisticsDTO logistics = mallOrderService.getOrderLogistics(orderId, userId);
        
        return Result.success(logistics);
    }
}
```

### 4.2 Service层

```java
package com.patient.api.app.mall.service.impl;

import com.adinnet.core.exception.BizException;
import com.patient.api.app.mall.mapper.MallOrderMapper;
import com.patient.api.app.mall.model.MallOrder;
import com.patient.api.app.mall.model.dto.OrderLogisticsDTO;
import com.patient.api.app.mall.service.LogisticsService;
import com.patient.api.app.mall.service.MallOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 药品商城订单服务实现
 */
@Service
public class MallOrderServiceImpl implements MallOrderService {
    
    @Autowired
    private MallOrderMapper mallOrderMapper;
    
    @Autowired
    private LogisticsService logisticsService;
    
    @Override
    public OrderLogisticsDTO getOrderLogistics(Long orderId, Long userId) {
        // 1. 查询订单信息
        MallOrder order = mallOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BizException("订单不存在");
        }
        
        // 2. 验证订单归属
        if (!order.getUserId().equals(userId)) {
            throw new BizException("订单不存在或无权访问");
        }
        
        // 3. 验证订单状态（只有待收货和已完成可以查询物流）
        Integer status = order.getStatus();
        if (status != 3 && status != 4) {  // 3-待收货, 4-已完成
            throw new BizException("该订单状态不支持查询物流");
        }
        
        // 4. 调用物流服务查询物流信息
        return logisticsService.queryLogistics(order);
    }
}
```

### 4.3 LogisticsService（物流服务）

```java
package com.patient.api.app.mall.service.impl;

import com.adinnet.common.constants.ExpressCompanyCode;
import com.adinnet.common.utils.Kuaidi100Util;
import com.alibaba.fastjson.JSON;
import com.patient.api.app.mall.model.MallOrder;
import com.patient.api.app.mall.model.dto.LogisticsTrace;
import com.patient.api.app.mall.model.dto.OrderLogisticsDTO;
import com.patient.api.app.mall.service.LogisticsService;
import com.patient.api.common.config.properties.Kuaidi100Properties;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 物流服务实现
 */
@Slf4j
@Service
public class LogisticsServiceImpl implements LogisticsService {
    
    private static final String LOGISTICS_CACHE_KEY_PREFIX = "mall:logistics:";
    private static final long CACHE_EXPIRE_MINUTES = 5;
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Autowired
    private Kuaidi100Properties kuaidi100Properties;
    
    @Override
    public OrderLogisticsDTO queryLogistics(MallOrder order) {
        // 1. 检查Redis缓存
        String cacheKey = LOGISTICS_CACHE_KEY_PREFIX + order.getId();
        String cachedData = redisTemplate.opsForValue().get(cacheKey);
        if (StringUtils.isNotEmpty(cachedData)) {
            log.info("物流信息缓存命中: orderId={}", order.getId());
            return JSON.parseObject(cachedData, OrderLogisticsDTO.class);
        }
        
        // 2. 构建基础响应对象
        OrderLogisticsDTO dto = new OrderLogisticsDTO();
        dto.setOrderId(order.getId());
        dto.setOrderNo(order.getOrderNo());
        
        // 3. 检查是否已发货
        if (StringUtils.isEmpty(order.getExpressNo())) {
            dto.setLogisticsStatus("待发货");
            dto.setMessage("订单暂未发货，暂无物流信息");
            dto.setLogisticsTraces(new ArrayList<>());
            return dto;
        }
        
        // 4. 设置快递信息
        dto.setExpressNo(order.getExpressNo());
        dto.setExpressCode(order.getExpressCode());
        dto.setExpressCompany(getExpressCompanyName(order.getExpressCode()));
        
        // 5. 调用快递100 API查询物流
        try {
            List<Map<String, Object>> kuaidi100Data = Kuaidi100Util.queryLogistics(
                kuaidi100Properties.getUrl(),
                kuaidi100Properties.getCustomer(),
                kuaidi100Properties.getKey(),
                order.getExpressCode(),
                order.getExpressNo()
            );
            
            if (kuaidi100Data == null || kuaidi100Data.isEmpty()) {
                dto.setLogisticsStatus("运输中");
                dto.setMessage("物流信息更新中，请稍后再试");
                dto.setLogisticsTraces(new ArrayList<>());
            } else {
                // 转换物流轨迹
                List<LogisticsTrace> traces = convertToLogisticsTraces(kuaidi100Data);
                dto.setLogisticsTraces(traces);
                
                // 识别物流状态
                dto.setLogisticsStatus(parseLogisticsStatus(traces));
            }
            
        } catch (Exception e) {
            log.error("查询物流信息失败: orderId={}, error={}", order.getId(), e.getMessage(), e);
            dto.setLogisticsStatus("运输中");
            dto.setMessage("物流信息更新中，请稍后再试");
            dto.setLogisticsTraces(new ArrayList<>());
        }
        
        // 6. 数据脱敏
        dto.setReceiverName(maskName(order.getReceiverName()));
        dto.setReceiverPhone(maskPhone(order.getReceiverPhone()));
        dto.setReceiverAddress(maskAddress(order.getReceiverAddress()));
        
        // 7. 存入Redis缓存（只缓存成功查询到物流的数据）
        if (dto.getLogisticsTraces() != null && !dto.getLogisticsTraces().isEmpty()) {
            redisTemplate.opsForValue().set(
                cacheKey, 
                JSON.toJSONString(dto), 
                CACHE_EXPIRE_MINUTES, 
                TimeUnit.MINUTES
            );
        }
        
        return dto;
    }
    
    /**
     * 转换物流轨迹数据
     */
    private List<LogisticsTrace> convertToLogisticsTraces(List<Map<String, Object>> kuaidi100Data) {
        List<LogisticsTrace> traces = new ArrayList<>();
        for (Map<String, Object> item : kuaidi100Data) {
            LogisticsTrace trace = new LogisticsTrace();
            trace.setProcessNo((Integer) item.get("processNo"));
            trace.setProcessTime((String) item.get("processTime"));
            trace.setProcessRemark((String) item.get("processRemark"));
            traces.add(trace);
        }
        return traces;
    }
    
    /**
     * 识别物流状态
     */
    private String parseLogisticsStatus(List<LogisticsTrace> traces) {
        if (traces == null || traces.isEmpty()) {
            return "运输中";
        }
        
        String latestRemark = traces.get(0).getProcessRemark();
        
        if (latestRemark.contains("已签收") || latestRemark.contains("签收")) {
            return "已签收";
        } else if (latestRemark.contains("派送") || latestRemark.contains("派件")) {
            return "派送中";
        } else {
            return "运输中";
        }
    }
    
    /**
     * 获取快递公司名称
     */
    private String getExpressCompanyName(String expressCode) {
        // 可以从配置或数据字典获取
        // 这里简化处理
        if ("yunda".equals(expressCode)) {
            return "韵达快递";
        } else if ("yuantong".equals(expressCode)) {
            return "圆通快递";
        } else if ("shentong".equals(expressCode)) {
            return "申通快递";
        }
        return "快递";
    }
    
    /**
     * 脱敏姓名
     */
    private String maskName(String name) {
        if (StringUtils.isEmpty(name) || name.length() <= 1) {
            return name;
        }
        return name.charAt(0) + "*".repeat(name.length() - 1);
    }
    
    /**
     * 脱敏手机号
     */
    private String maskPhone(String phone) {
        if (StringUtils.isEmpty(phone) || phone.length() != 11) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }
    
    /**
     * 脱敏地址
     */
    private String maskAddress(String address) {
        if (StringUtils.isEmpty(address)) {
            return address;
        }
        return address.replaceAll("\\d+号", "**号");
    }
}
```

---

## 5. 正确性属性（Property-Based Testing）

### 5.1 核心不变量

1. **权限不变量**: 用户只能查询自己的订单物流
2. **状态不变量**: 只有"待收货"和"已完成"状态的订单可以查询物流
3. **缓存一致性**: 缓存数据与实时查询数据应保持一致
4. **脱敏不变量**: 所有返回的敏感信息必须脱敏

### 5.2 测试属性

```java
// Property 1: 权限验证
∀ order, user1, user2: 
  user1 ≠ user2 ∧ order.userId = user1 
  ⇒ queryLogistics(order.id, user2) throws BizException

// Property 2: 状态验证
∀ order: 
  order.status ∉ {3, 4} 
  ⇒ queryLogistics(order.id, order.userId) throws BizException

// Property 3: 缓存一致性
∀ order: 
  result1 = queryLogistics(order.id, order.userId)
  result2 = queryLogistics(order.id, order.userId) (within 5 minutes)
  ⇒ result1 = result2

// Property 4: 脱敏验证
∀ order: 
  result = queryLogistics(order.id, order.userId)
  ⇒ result.receiverPhone.contains("****") 
  ∧ result.receiverName.contains("*")
```

---

## 6. 错误处理策略

### 6.1 异常分类

| 异常类型 | 处理策略 | 用户提示 |
|---------|---------|---------|
| 订单不存在 | 抛出BizException | "订单不存在" |
| 无权访问 | 抛出BizException | "订单不存在或无权访问" |
| 订单状态不支持 | 抛出BizException | "该订单状态不支持查询物流" |
| 快递100 API失败 | 降级处理，返回提示 | "物流信息更新中，请稍后再试" |
| 快递100 API超时 | 降级处理，返回提示 | "物流信息更新中，请稍后再试" |
| Redis异常 | 跳过缓存，直接查询 | 正常返回物流信息 |

### 6.2 降级策略

```java
/**
 * 物流查询降级处理
 */
private OrderLogisticsDTO fallbackLogistics(MallOrder order) {
    OrderLogisticsDTO dto = new OrderLogisticsDTO();
    dto.setOrderId(order.getId());
    dto.setOrderNo(order.getOrderNo());
    dto.setExpressNo(order.getExpressNo());
    dto.setExpressCode(order.getExpressCode());
    dto.setExpressCompany(getExpressCompanyName(order.getExpressCode()));
    dto.setLogisticsStatus("运输中");
    dto.setMessage("物流信息更新中，请稍后再试");
    dto.setLogisticsTraces(new ArrayList<>());
    return dto;
}
```

---

## 7. 性能优化方案

### 7.1 缓存策略

- Redis缓存物流信息，5分钟过期
- 只缓存成功查询到的物流数据
- 缓存Key: `mall:logistics:{orderId}`

### 7.2 超时控制

- 快递100 API连接超时: 5秒
- 快递100 API读取超时: 10秒
- 总超时时间: 15秒

### 7.3 并发控制

- 使用Redis分布式锁防止同一订单并发查询
- 锁超时时间: 10秒

---

## 8. 测试策略

### 8.1 单元测试

```java
@Test
public void testQueryLogistics_Success() {
    // 测试正常查询物流
}

@Test
public void testQueryLogistics_NotShipped() {
    // 测试未发货订单
}

@Test
public void testQueryLogistics_Unauthorized() {
    // 测试无权访问
}

@Test
public void testQueryLogistics_CacheHit() {
    // 测试缓存命中
}

@Test
public void testMaskPhone() {
    // 测试手机号脱敏
    assertEquals("138****5678", maskPhone("13812345678"));
}

@Test
public void testMaskName() {
    // 测试姓名脱敏
    assertEquals("张*", maskName("张三"));
    assertEquals("李**", maskName("李四四"));
}
```

### 8.2 集成测试

- 测试完整的物流查询流程
- 测试快递100 API集成
- 测试Redis缓存功能

### 8.3 性能测试

- 测试100个用户并发查询物流
- 测试缓存命中率
- 测试响应时间

---

**文档创建日期:** 2026-01-23  
**创建人员:** Kiro AI Assistant  
**状态:** 待评审
