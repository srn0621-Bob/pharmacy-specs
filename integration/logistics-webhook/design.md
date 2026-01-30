# Design Document: Logistics Webhook

## Overview

本设计文档描述物流信息接收接口（Logistics Webhook）的技术实现方案。该接口部署在 `adinnet-admin` 模块中，用于接收外部药房系统推送的物流发货信息，更新订单的快递信息，并记录所有请求日志。

### 设计目标

1. 提供标准的 RESTful Webhook 接口
2. 确保数据更新的原子性和一致性
3. 支持请求幂等性，防止重复处理
4. 完整的请求日志记录，便于审计和排查问题
5. 可配置的签名验证机制

## Architecture

```
┌─────────────────────┐     POST /api/v1/logistics/webhook
│   Pharmacy System   │ ─────────────────────────────────────►
└─────────────────────┘                                       │
                                                              ▼
                                              ┌───────────────────────────────┐
                                              │     LogisticsController       │
                                              │  - Header validation          │
                                              │  - Request parsing            │
                                              └───────────────┬───────────────┘
                                                              │
                                                              ▼
                                              ┌───────────────────────────────┐
                                              │   LogisticsWebhookService     │
                                              │  - Idempotency check          │
                                              │  - Signature verification     │
                                              │  - Business logic             │
                                              └───────────────┬───────────────┘
                                                              │
                                    ┌─────────────────────────┼─────────────────────────┐
                                    ▼                         ▼                         ▼
                      ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
                      │ DrugOrderMapper     │   │ LogisticsLogMapper  │   │ LogisticsLogService │
                      │ (Update express)    │   │ (Insert/Update log) │   │ (Log management)    │
                      └──────────┬──────────┘   └──────────┬──────────┘   └─────────────────────┘
                                 │                         │
                                 ▼                         ▼
                      ┌─────────────────────────────────────────────────┐
                      │              MySQL Database                      │
                      │  t_hos_pre_drug_order  │  t_logistics_webhook_log│
                      └─────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. LogisticsController

REST 控制器，处理 HTTP 请求。

```java
@RestController
@RequestMapping("/api/v1/logistics")
public class LogisticsController {
    
    @PostMapping("/webhook")
    public JsonResult handleWebhook(
        @RequestBody String requestBody,
        @RequestHeader("X-App-Event") String appEvent,
        @RequestHeader("X-App-Timestamp") String appTimestamp,
        @RequestHeader("X-App-Signature") String appSignature,
        HttpServletRequest request
    );
}
```

### 2. LogisticsWebhookService

业务逻辑服务，处理物流信息更新。

```java
public interface LogisticsWebhookService {
    
    /**
     * 处理物流发货事件
     * @param event 发货事件对象
     * @param headers 请求头信息
     * @return 处理结果
     */
    WebhookResult processShippedEvent(OrderShippedEvent event, WebhookHeaders headers);
    
    /**
     * 检查事件是否已处理（幂等性检查）
     * @param eventId 事件ID
     * @return 已处理的日志记录，如果不存在返回null
     */
    LogisticsWebhookLog checkIdempotency(String eventId);
    
    /**
     * 验证签名（可选）
     * @param requestBody 请求体
     * @param signature 签名
     * @param timestamp 时间戳
     * @return 验证结果
     */
    boolean verifySignature(String requestBody, String signature, String timestamp);
}
```

### 3. LogisticsWebhookLogService

日志记录服务。

```java
public interface LogisticsWebhookLogService {
    
    /**
     * 创建请求日志
     */
    Long createLog(LogisticsWebhookLog log);
    
    /**
     * 更新日志（处理完成后）
     */
    void updateLog(Long logId, String responsePayload, String status, String errorMessage);
    
    /**
     * 根据事件ID查询日志
     */
    LogisticsWebhookLog findByEventId(String eventId);
}
```

### 4. DrugOrderMapper

数据访问层，更新订单物流信息。

```java
@Mapper
public interface DrugOrderMapper {
    
    /**
     * 根据订单号更新物流信息
     * @param orderNum 订单号
     * @param expressCode 快递单号
     * @param expressName 快递公司名称
     * @return 更新行数
     */
    int updateLogisticsInfo(@Param("orderNum") String orderNum,
                           @Param("expressCode") String expressCode,
                           @Param("expressName") String expressName);
    
    /**
     * 根据订单号查询订单是否存在
     */
    Integer countByOrderNum(@Param("orderNum") String orderNum);
}
```

## Data Models

### 1. 请求模型

#### OrderShippedEvent（发货事件）

```java
public class OrderShippedEvent {
    private String id;              // 事件唯一ID: evt_order_{order_id}_{timestamp}
    private String type;            // 事件类型: order.shipped
    private Long timestamp;         // Unix时间戳（秒）
    private EventData data;         // 事件数据
}

public class EventData {
    private String orderId;         // 订单号
    private String logisticsCode;   // 物流单号
    private String logisticsCompany;// 物流公司名称
    private List<EventItem> items;  // 商品列表
}

public class EventItem {
    private String goodsId;         // 商品ID
    private Integer num;            // 商品数量
}
```

#### WebhookHeaders（请求头）

```java
public class WebhookHeaders {
    private String appEvent;        // X-App-Event
    private String appTimestamp;    // X-App-Timestamp
    private String appSignature;    // X-App-Signature
}
```

### 2. 响应模型

#### WebhookResponse

```java
public class WebhookResponse {
    private Integer code;           // 响应码: 0=成功, 400=参数错误, 404=订单不存在, 500=内部错误
    private String msg;             // 响应消息
    private WebhookResponseData data; // 响应数据
}

public class WebhookResponseData {
    private String orderId;         // 订单号
    private Boolean updated;        // 是否更新成功
}
```

### 3. 日志表模型

#### t_logistics_webhook_log 表结构

```sql
CREATE TABLE IF NOT EXISTS `t_logistics_webhook_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `event_id` VARCHAR(100) NOT NULL COMMENT '事件唯一ID',
  `event_type` VARCHAR(50) DEFAULT NULL COMMENT '事件类型',
  `order_id` VARCHAR(64) DEFAULT NULL COMMENT '订单号',
  `logistics_code` VARCHAR(64) DEFAULT NULL COMMENT '物流单号',
  `logistics_company` VARCHAR(100) DEFAULT NULL COMMENT '物流公司',
  `request_payload` TEXT COMMENT '请求体 (JSON格式)',
  `request_headers` TEXT COMMENT '请求头 (JSON格式)',
  `response_payload` TEXT COMMENT '响应体 (JSON格式)',
  `request_time` DATETIME DEFAULT NULL COMMENT '请求时间',
  `response_time` DATETIME DEFAULT NULL COMMENT '响应时间',
  `duration` BIGINT DEFAULT NULL COMMENT '处理耗时 (毫秒)',
  `http_status_code` INT DEFAULT NULL COMMENT 'HTTP状态码',
  `process_status` VARCHAR(20) DEFAULT NULL COMMENT '处理状态: SUCCESS, FAILURE, ERROR',
  `error_message` VARCHAR(2000) DEFAULT NULL COMMENT '错误信息',
  `exception_type` VARCHAR(200) DEFAULT NULL COMMENT '异常类型',
  `client_ip` VARCHAR(50) DEFAULT NULL COMMENT '客户端IP',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_event_id` (`event_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_request_time` (`request_time`),
  KEY `idx_process_status` (`process_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物流Webhook调用日志表';
```

### 4. 字段映射关系

| 请求字段 | 数据库表 | 数据库字段 |
|---------|---------|-----------|
| data.logistics_code | t_hos_pre_drug_order | express_code |
| data.logistics_company | t_hos_pre_drug_order | express_name |
| data.order_id | t_hos_pre_drug_order | order_num |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Input Validation Completeness

*For any* incoming webhook request, if any required field (id, type, timestamp, data.order_id, data.logistics_code, data.logistics_company) is missing or if required headers (X-App-Event, X-App-Timestamp, X-App-Signature) are missing, the system SHALL return HTTP 400 with appropriate error message.

**Validates: Requirements 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4**

### Property 2: Order Update Completeness

*For any* valid Order_Shipped_Event where the order exists, after processing, the t_hos_pre_drug_order record SHALL have express_code equal to data.logistics_code, express_name equal to data.logistics_company, and update_time updated to current timestamp.

**Validates: Requirements 3.3, 3.4, 3.5**

### Property 3: Request Logging Completeness

*For any* incoming webhook request, a log record SHALL be created in t_logistics_webhook_log containing event_id, event_type, order_id, request_payload, request_headers, request_time, and after processing, the log SHALL be updated with response_payload, response_time, http_status_code, process_status, and duration.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.6**

### Property 4: Idempotency Guarantee

*For any* event_id that has been successfully processed (process_status = SUCCESS), subsequent requests with the same event_id SHALL return HTTP 200 with success response without modifying the database record again.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 5: Response Format Consistency

*For any* webhook request, the response SHALL be JSON with Content-Type `application/json; charset=utf-8`, containing code (integer), msg (string), and data (object or null) fields.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 6: Order Not Found Handling

*For any* valid Order_Shipped_Event where the order_id does not exist in t_hos_pre_drug_order, the system SHALL return HTTP 404 with error message containing the order_id.

**Validates: Requirements 3.2, 5.4**

## Error Handling

### 错误码定义

| HTTP Status | Code | 场景 | 消息示例 |
|-------------|------|------|---------|
| 400 | 400 | Content-Type 不正确 | "Invalid Content-Type, expected application/json" |
| 400 | 400 | 请求体为空或格式错误 | "Invalid request body" |
| 400 | 400 | 必填字段缺失 | "Missing required field: data.order_id" |
| 400 | 400 | X-App-Event 不正确 | "Invalid X-App-Event header" |
| 400 | 400 | 事件类型不正确 | "Invalid event type, expected order.shipped" |
| 401 | 401 | 签名验证失败 | "Signature verification failed" |
| 404 | 404 | 订单不存在 | "Order not found: YL20241111" |
| 500 | 500 | 内部错误 | "Internal server error" |

### 异常处理流程

```java
try {
    // 1. 创建日志记录
    Long logId = logService.createLog(requestLog);
    
    // 2. 验证请求
    validateRequest(event, headers);
    
    // 3. 幂等性检查
    LogisticsWebhookLog existingLog = checkIdempotency(event.getId());
    if (existingLog != null && "SUCCESS".equals(existingLog.getProcessStatus())) {
        return successResponse(event.getData().getOrderId());
    }
    
    // 4. 更新订单
    int updated = updateOrder(event.getData());
    
    // 5. 更新日志为成功
    logService.updateLog(logId, response, "SUCCESS", null);
    
    return successResponse(event.getData().getOrderId());
    
} catch (ValidationException e) {
    logService.updateLog(logId, errorResponse, "FAILURE", e.getMessage());
    return errorResponse(400, e.getMessage());
    
} catch (OrderNotFoundException e) {
    logService.updateLog(logId, errorResponse, "FAILURE", e.getMessage());
    return errorResponse(404, e.getMessage());
    
} catch (Exception e) {
    logService.updateLog(logId, errorResponse, "ERROR", e.getMessage());
    return errorResponse(500, "Internal server error");
}
```

## Testing Strategy

### 单元测试

1. **Controller 层测试**
   - 测试请求头验证逻辑
   - 测试请求体解析
   - 测试响应格式

2. **Service 层测试**
   - 测试幂等性检查逻辑
   - 测试签名验证逻辑
   - 测试业务处理流程

3. **Mapper 层测试**
   - 测试 SQL 更新语句
   - 测试日志插入和更新

### 属性测试

使用 jqwik 框架进行属性测试，每个属性测试至少运行 100 次迭代。

1. **Property 1 测试**: 生成随机的缺失字段组合，验证都返回 400
2. **Property 2 测试**: 生成随机的物流信息，验证数据库更新正确
3. **Property 3 测试**: 生成随机请求，验证日志记录完整
4. **Property 4 测试**: 发送相同 event_id 多次，验证幂等性
5. **Property 5 测试**: 生成各种请求场景，验证响应格式一致
6. **Property 6 测试**: 使用不存在的订单号，验证返回 404

### 集成测试

1. 完整的 Webhook 调用流程测试
2. 数据库事务测试
3. 并发请求测试
