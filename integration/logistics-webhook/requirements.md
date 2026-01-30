# Requirements Document

## Introduction

本文档定义了物流信息接收接口的需求规格。该接口用于接收外部药房系统推送的物流发货信息，根据订单号更新 `t_hos_pre_drug_order` 表中的快递信息，并记录所有请求到日志表中以便追踪和审计。

## Glossary

- **Logistics_Webhook**: 物流信息接收接口，用于接收外部系统推送的物流发货事件
- **Order_Shipped_Event**: 订单发货事件，包含物流单号、物流公司等信息
- **Drug_Order**: 药品配送订单，存储在 `t_hos_pre_drug_order` 表中
- **Logistics_Webhook_Log**: 物流接口调用日志表，记录所有接收到的请求
- **Event_ID**: 事件唯一标识，格式为 `evt_order_{order_id}_{timestamp}`
- **Signature**: 请求签名，用于验证请求来源的合法性

## Requirements

### Requirement 1: 接收物流发货事件

**User Story:** As a pharmacy system, I want to push logistics information to the hospital system, so that the hospital can track drug delivery status.

#### Acceptance Criteria

1. THE Logistics_Webhook SHALL expose an endpoint at `/api/v1/logistics/webhook` accepting POST requests
2. WHEN a valid Order_Shipped_Event is received, THE Logistics_Webhook SHALL parse the JSON request body
3. WHEN the request Content-Type header is not `application/json`, THE Logistics_Webhook SHALL return HTTP 400 with error message
4. WHEN the request body is empty or malformed JSON, THE Logistics_Webhook SHALL return HTTP 400 with error message
5. THE Logistics_Webhook SHALL validate that all required fields (id, type, timestamp, data.order_id, data.logistics_code, data.logistics_company) are present

### Requirement 2: 验证请求头信息

**User Story:** As a system administrator, I want to validate incoming webhook requests, so that only authorized requests are processed.

#### Acceptance Criteria

1. WHEN the X-App-Event header is missing or not equal to `order.shipped`, THE Logistics_Webhook SHALL return HTTP 400 with error message
2. WHEN the X-App-Timestamp header is missing, THE Logistics_Webhook SHALL return HTTP 400 with error message
3. WHEN the X-App-Signature header is missing, THE Logistics_Webhook SHALL return HTTP 400 with error message
4. WHEN the event type field is not `order.shipped`, THE Logistics_Webhook SHALL return HTTP 400 with error message

### Requirement 3: 更新订单物流信息

**User Story:** As a hospital system, I want to update drug order logistics information, so that patients can track their medication delivery.

#### Acceptance Criteria

1. WHEN a valid Order_Shipped_Event is received, THE Logistics_Webhook SHALL query Drug_Order by order_id from data.order_id field
2. IF the Drug_Order with specified order_id does not exist, THEN THE Logistics_Webhook SHALL return HTTP 404 with error message
3. WHEN the Drug_Order is found, THE Logistics_Webhook SHALL update express_code field with data.logistics_code value
4. WHEN the Drug_Order is found, THE Logistics_Webhook SHALL update express_name field with data.logistics_company value
5. WHEN the Drug_Order is found, THE Logistics_Webhook SHALL update update_time field with current timestamp
6. WHEN the update is successful, THE Logistics_Webhook SHALL return HTTP 200 with success response

### Requirement 4: 记录请求日志

**User Story:** As a system administrator, I want to log all webhook requests, so that I can audit and troubleshoot integration issues.

#### Acceptance Criteria

1. THE Logistics_Webhook SHALL log every incoming request to Logistics_Webhook_Log table before processing
2. THE Logistics_Webhook_Log SHALL record event_id, event_type, order_id, request_payload, request_headers
3. THE Logistics_Webhook_Log SHALL record request_time with the timestamp when request is received
4. WHEN processing completes, THE Logistics_Webhook SHALL update the log record with response_payload, response_time, http_status_code, and process_status
5. IF an exception occurs during processing, THEN THE Logistics_Webhook SHALL update the log record with error_message and exception_type
6. THE Logistics_Webhook_Log SHALL record duration in milliseconds (response_time - request_time)

### Requirement 5: 响应格式规范

**User Story:** As a pharmacy system developer, I want consistent response format, so that I can handle responses programmatically.

#### Acceptance Criteria

1. THE Logistics_Webhook SHALL return JSON response with Content-Type `application/json; charset=utf-8`
2. WHEN processing is successful, THE Logistics_Webhook SHALL return `{"code": 0, "msg": "success", "data": {"order_id": "{order_id}", "updated": true}}`
3. WHEN validation fails, THE Logistics_Webhook SHALL return `{"code": 400, "msg": "{error_description}", "data": null}`
4. WHEN order is not found, THE Logistics_Webhook SHALL return `{"code": 404, "msg": "Order not found: {order_id}", "data": null}`
5. WHEN internal error occurs, THE Logistics_Webhook SHALL return `{"code": 500, "msg": "Internal server error", "data": null}`

### Requirement 6: 幂等性处理

**User Story:** As a pharmacy system, I want the webhook to handle duplicate requests gracefully, so that retries don't cause data inconsistency.

#### Acceptance Criteria

1. WHEN the same event_id is received multiple times, THE Logistics_Webhook SHALL process it idempotently
2. THE Logistics_Webhook SHALL check if event_id already exists in Logistics_Webhook_Log
3. IF event_id already exists with SUCCESS status, THEN THE Logistics_Webhook SHALL return HTTP 200 with success response without re-processing
4. IF event_id already exists with FAILURE status, THEN THE Logistics_Webhook SHALL re-process the request

### Requirement 7: 签名验证（可选）

**User Story:** As a security administrator, I want to verify request signatures, so that only authentic requests are processed.

#### Acceptance Criteria

1. WHERE signature verification is enabled, THE Logistics_Webhook SHALL validate X-App-Signature header
2. WHERE signature verification is enabled, THE Logistics_Webhook SHALL compute expected signature using shared secret and request body
3. IF signature verification fails, THEN THE Logistics_Webhook SHALL return HTTP 401 with error message
4. WHERE signature verification is disabled, THE Logistics_Webhook SHALL skip signature validation
