# Spec 11: 物流信息查询功能 - 任务列表

## 文档信息

**Spec编号:** Spec 11  
**功能名称:** 物流信息查询功能  
**所属阶段:** 阶段五 - 物流功能  
**创建日期:** 2026-01-23  
**预计工作量:** 3-4小时

---

## 任务概览

| 任务ID | 任务名称 | 预计工时 | 依赖 | 优先级 |
|--------|---------|---------|------|--------|
| T11.1 | 创建数据模型 | 0.5小时 | 无 | P0 |
| T11.2 | 实现LogisticsService | 1.5小时 | T11.1 | P0 |
| T11.3 | 实现MallOrderService物流查询方法 | 0.5小时 | T11.2 | P0 |
| T11.4 | 实现Controller接口 | 0.5小时 | T11.3 | P0 |
| T11.5 | 编写单元测试 | 0.5小时 | T11.4 | P1 |
| T11.6 | 集成测试和验证 | 0.5小时 | T11.5 | P1 |

**总计:** 3.5-4小时

---

## 任务详情

### T11.1 创建数据模型

**目标:** 创建物流查询相关的DTO类

**实施步骤:**

1. 创建OrderLogisticsDTO类
2. 创建LogisticsTrace类
3. 添加Lombok注解
4. 添加Swagger注解

**代码示例:**

```java
// 文件: com/patient/api/app/mall/model/dto/OrderLogisticsDTO.java
package com.patient.api.app.mall.model.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.util.List;

/**
 * 订单物流信息DTO
 */
@Data
@ApiModel("订单物流信息")
public class OrderLogisticsDTO {
    
    @ApiModelProperty("订单ID")
    private Long orderId;
    
    @ApiModelProperty("订单号")
    private String orderNo;
    
    @ApiModelProperty("快递公司名称")
    private String expressCompany;
    
    @ApiModelProperty("快递公司编码")
    private String expressCode;
    
    @ApiModelProperty("快递单号")
    private String expressNo;
    
    @ApiModelProperty("物流状态")
    private String logisticsStatus;
    
    @ApiModelProperty("物流轨迹列表")
    private List<LogisticsTrace> logisticsTraces;
    
    @ApiModelProperty("收件人姓名（脱敏）")
    private String receiverName;
    
    @ApiModelProperty("收件人电话（脱敏）")
    private String receiverPhone;
    
    @ApiModelProperty("收件地址（脱敏）")
    private String receiverAddress;
    
    @ApiModelProperty("提示信息")
    private String message;
}
```

```java
// 文件: com/patient/api/app/mall/model/dto/LogisticsTrace.java
package com.patient.api.app.mall.model.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 物流轨迹DTO
 */
@Data
@ApiModel("物流轨迹")
public class LogisticsTrace {
    
    @ApiModelProperty("流程序号")
    private Integer processNo;
    
    @ApiModelProperty("处理时间")
    private String processTime;
    
    @ApiModelProperty("处理描述")
    private String processRemark;
}
```

**验收标准:**

- [ ] OrderLogisticsDTO类创建完成
- [ ] LogisticsTrace类创建完成
- [ ] 所有字段都有注释
- [ ] 添加了Swagger注解
- [ ] 代码编译通过

---

### T11.2 实现LogisticsService

**目标:** 实现物流查询核心业务逻辑

**实施步骤:**

1. 创建LogisticsService接口
2. 创建LogisticsServiceImpl实现类
3. 实现queryLogistics方法
4. 实现物流状态识别方法
5. 实现数据脱敏方法
6. 实现Redis缓存逻辑

**代码示例:**

```java
// 文件: com/patient/api/app/mall/service/LogisticsService.java
package com.patient.api.app.mall.service;

import com.patient.api.app.mall.model.MallOrder;
import com.patient.api.app.mall.model.dto.OrderLogisticsDTO;

/**
 * 物流服务接口
 */
public interface LogisticsService {
    
    /**
     * 查询订单物流信息
     * 
     * @param order 订单信息
     * @return 物流信息
     */
    OrderLogisticsDTO queryLogistics(MallOrder order);
}
```

```java
// 文件: com/patient/api/app/mall/service/impl/LogisticsServiceImpl.java
package com.patient.api.app.mall.service.impl;

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
        if ("yunda".equals(expressCode)) {
            return "韵达快递";
        } else if ("yuantong".equals(expressCode)) {
            return "圆通快递";
        } else if ("shentong".equals(expressCode)) {
            return "申通快递";
        } else if ("zhongtong".equals(expressCode)) {
            return "中通快递";
        } else if ("sto".equals(expressCode)) {
            return "申通快递";
        } else if ("ems".equals(expressCode)) {
            return "EMS";
        } else if ("sf".equals(expressCode)) {
            return "顺丰速运";
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

**验收标准:**

- [ ] LogisticsService接口创建完成
- [ ] LogisticsServiceImpl实现完成
- [ ] 物流查询逻辑正确
- [ ] 缓存逻辑正确
- [ ] 数据脱敏逻辑正确
- [ ] 异常处理完善
- [ ] 代码编译通过

---

### T11.3 实现MallOrderService物流查询方法

**目标:** 在MallOrderService中添加物流查询方法

**实施步骤:**

1. 在MallOrderService接口添加getOrderLogistics方法
2. 在MallOrderServiceImpl实现getOrderLogistics方法
3. 实现订单查询和权限验证
4. 调用LogisticsService查询物流

**代码示例:**

```java
// 文件: com/patient/api/app/mall/service/MallOrderService.java
package com.patient.api.app.mall.service;

import com.patient.api.app.mall.model.dto.OrderLogisticsDTO;

/**
 * 药品商城订单服务接口
 */
public interface MallOrderService {
    
    /**
     * 查询订单物流信息
     * 
     * @param orderId 订单ID
     * @param userId 用户ID
     * @return 物流信息
     */
    OrderLogisticsDTO getOrderLogistics(Long orderId, Long userId);
}
```

```java
// 文件: com/patient/api/app/mall/service/impl/MallOrderServiceImpl.java
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

**验收标准:**

- [ ] MallOrderService接口方法添加完成
- [ ] MallOrderServiceImpl实现完成
- [ ] 订单查询逻辑正确
- [ ] 权限验证逻辑正确
- [ ] 状态验证逻辑正确
- [ ] 代码编译通过

---

### T11.4 实现Controller接口

**目标:** 实现物流查询的Controller接口

**实施步骤:**

1. 在MallOrderController添加queryLogistics方法
2. 添加Swagger注解
3. 实现参数验证
4. 调用Service层方法

**代码示例:**

```java
// 文件: com/patient/api/app/mall/controller/MallOrderController.java
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

**验收标准:**

- [ ] Controller方法实现完成
- [ ] Swagger注解添加完成
- [ ] 参数验证正确
- [ ] 返回结果格式正确
- [ ] 代码编译通过

---

### T11.5 编写单元测试

**目标:** 编写单元测试用例

**实施步骤:**

1. 创建LogisticsServiceTest测试类
2. 测试物流查询正常场景
3. 测试未发货场景
4. 测试数据脱敏
5. 测试缓存功能

**代码示例:**

```java
// 文件: test/java/com/patient/api/app/mall/service/LogisticsServiceTest.java
package com.patient.api.app.mall.service;

import com.patient.api.app.mall.model.MallOrder;
import com.patient.api.app.mall.model.dto.OrderLogisticsDTO;
import com.patient.api.app.mall.service.impl.LogisticsServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class LogisticsServiceTest {
    
    @Autowired
    private LogisticsService logisticsService;
    
    @Test
    public void testQueryLogistics_NotShipped() {
        // 测试未发货订单
        MallOrder order = new MallOrder();
        order.setId(1L);
        order.setOrderNo("ORD20260123143000123456");
        order.setExpressNo(null);  // 未发货
        
        OrderLogisticsDTO result = logisticsService.queryLogistics(order);
        
        assertNotNull(result);
        assertEquals("待发货", result.getLogisticsStatus());
        assertEquals("订单暂未发货，暂无物流信息", result.getMessage());
        assertTrue(result.getLogisticsTraces().isEmpty());
    }
    
    @Test
    public void testMaskPhone() {
        // 使用反射测试私有方法
        String masked = invokePrivateMethod("maskPhone", "13812345678");
        assertEquals("138****5678", masked);
    }
    
    @Test
    public void testMaskName() {
        String masked1 = invokePrivateMethod("maskName", "张三");
        assertEquals("张*", masked1);
        
        String masked2 = invokePrivateMethod("maskName", "李四四");
        assertEquals("李**", masked2);
    }
    
    // 辅助方法：调用私有方法
    private String invokePrivateMethod(String methodName, String param) {
        // 实现反射调用
        return null;
    }
}
```

**验收标准:**

- [ ] 测试类创建完成
- [ ] 至少3个测试用例
- [ ] 所有测试用例通过
- [ ] 测试覆盖率 > 80%

---

### T11.6 集成测试和验证

**目标:** 进行集成测试和功能验证

**实施步骤:**

1. 启动应用
2. 使用Postman测试API
3. 验证正常场景
4. 验证异常场景
5. 验证缓存功能
6. 验证数据脱敏

**测试用例:**

#### 用例1: 查询待收货订单物流

**请求:**
```
GET /api/patient/mall/order/logistics/12345
Headers:
  token: {用户token}
```

**预期响应:**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "orderId": 12345,
    "orderNo": "ORD20260123143000123456",
    "expressCompany": "韵达快递",
    "expressCode": "yunda",
    "expressNo": "1234567890123",
    "logisticsStatus": "运输中",
    "logisticsTraces": [...]
  }
}
```

#### 用例2: 查询未发货订单

**请求:**
```
GET /api/patient/mall/order/logistics/12346
Headers:
  token: {用户token}
```

**预期响应:**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "orderId": 12346,
    "orderNo": "ORD20260123143000123457",
    "logisticsStatus": "待发货",
    "message": "订单暂未发货，暂无物流信息",
    "logisticsTraces": []
  }
}
```

#### 用例3: 查询他人订单（无权访问）

**请求:**
```
GET /api/patient/mall/order/logistics/99999
Headers:
  token: {用户A的token}
```

**预期响应:**
```json
{
  "code": 400,
  "message": "订单不存在或无权访问"
}
```

#### 用例4: 验证缓存功能

**步骤:**
1. 第一次查询订单物流（记录响应时间）
2. 5分钟内再次查询同一订单（记录响应时间）
3. 对比两次响应时间

**预期结果:**
- 第一次查询: 响应时间 < 3秒
- 第二次查询: 响应时间 < 500ms
- 两次返回数据一致

#### 用例5: 验证数据脱敏

**验证点:**
- 收件人姓名: "张三" → "张*"
- 收件人电话: "13812345678" → "138****5678"
- 收件地址: "北京市朝阳区三里屯路123号" → "北京市朝阳区三里屯路**号"

**验收标准:**

- [ ] 所有测试用例通过
- [ ] 正常场景功能正常
- [ ] 异常场景处理正确
- [ ] 缓存功能正常
- [ ] 数据脱敏正确
- [ ] 性能满足要求

---

## 注意事项

### 1. 复用现有代码

- 必须复用现有的Kuaidi100Util工具类
- 必须复用现有的Kuaidi100Properties配置类
- 不要重复实现快递100 API调用逻辑

### 2. 错误处理

- 快递100 API调用失败时，不要抛出异常，而是返回降级提示
- 所有异常都要记录日志
- 用户看到的错误信息要友好

### 3. 性能优化

- 必须使用Redis缓存物流信息
- 缓存过期时间设置为5分钟
- 只缓存成功查询到的物流数据

### 4. 安全性

- 必须验证订单归属
- 必须验证订单状态
- 必须对敏感信息脱敏

### 5. 代码规范

- 所有注释使用中文
- 变量名、方法名使用英文
- 遵循阿里巴巴Java开发手册
- 函数长度不超过50行

---

## 验证清单

### 功能验证

- [ ] 能查询待收货订单的物流信息
- [ ] 能查询已完成订单的物流信息
- [ ] 未发货订单显示"暂无物流信息"
- [ ] 物流查询失败显示友好提示
- [ ] 用户只能查询自己的订单
- [ ] 物流轨迹按时间倒序排列

### 性能验证

- [ ] 首次查询响应时间 < 3秒
- [ ] 缓存命中响应时间 < 500ms
- [ ] 支持100个用户并发查询

### 安全验证

- [ ] 用户A无法查询用户B的订单
- [ ] 收件人手机号脱敏显示
- [ ] 收件人姓名脱敏显示
- [ ] 收件地址部分脱敏

### 代码质量验证

- [ ] 代码编译通过
- [ ] 单元测试通过
- [ ] 代码符合规范
- [ ] 没有代码坏味道

---

**文档创建日期:** 2026-01-23  
**创建人员:** Kiro AI Assistant  
**状态:** 待执行
