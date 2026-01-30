# Requirements Document

## Introduction

本功能用于接收外部药房系统（楚济堂）推送的处方审核结果（pres.audit事件），并更新本地`t_hos_prescription`表中对应处方记录的审核状态信息。该接口与现有的`logistics/webhook`接口部署在同一IP地址下，采用类似的架构设计。

## Glossary

- **Prescription_Audit_Webhook**: 处方审核结果Webhook接收服务，用于接收外部系统推送的审方结果
- **pres_no**: 外部系统的处方单号，对应本地`t_hos_prescription`表的`prescription_num`字段
- **recipe_url**: 处方图片地址，需更新到`img`字段
- **check_status**: 审核状态，PASS表示通过，REJECT表示驳回
- **check_time**: 审核时间，接收到推送时更新为当前时间
- **check_content**: 审核内容，存储接收到的msg字段内容
- **check_pharmaceutist**: 审核药师，固定为"楚济堂"
- **Event_ID**: 事件唯一标识符，用于幂等性检查

## Requirements

### Requirement 1: 接收处方审核结果推送

**User Story:** 作为系统管理员，我希望系统能够接收外部药房推送的处方审核结果，以便及时更新处方审核状态。

#### Acceptance Criteria

1. THE Prescription_Audit_Webhook SHALL expose a POST endpoint at `/api/v1/prescription/audit/webhook`
2. WHEN a valid pres.audit event is received, THE Prescription_Audit_Webhook SHALL accept requests with Content-Type `application/json; charset=utf-8`
3. WHEN a request is received, THE Prescription_Audit_Webhook SHALL validate the X-App-Event header equals "pres.audit"
4. WHEN a request is received, THE Prescription_Audit_Webhook SHALL validate the X-App-Timestamp header is present
5. WHEN a request is received, THE Prescription_Audit_Webhook SHALL validate the X-App-Signature header is present

### Requirement 2: 处方记录查找与验证

**User Story:** 作为系统管理员，我希望系统能够根据推送的处方单号找到对应的本地记录，以便进行状态更新。

#### Acceptance Criteria

1. WHEN a pres.audit event is received, THE Prescription_Audit_Webhook SHALL locate the prescription record by matching `pres_no` to `prescription_num` in `t_hos_prescription` table
2. IF the prescription record is not found, THEN THE Prescription_Audit_Webhook SHALL return error code 1001 with message "处方单不存在"
3. WHEN the prescription record is found, THE Prescription_Audit_Webhook SHALL proceed with the update operation

### Requirement 3: 处方审核状态更新

**User Story:** 作为系统管理员，我希望系统能够根据审核结果更新处方记录的相关字段，以便保持数据同步。

#### Acceptance Criteria

1. WHEN a pres.audit event is processed, THE Prescription_Audit_Webhook SHALL update the `img` field with the received `recipe_url` value
2. WHEN a pres.audit event is processed, THE Prescription_Audit_Webhook SHALL update the `check_time` field to the current timestamp
3. WHEN the received status is 1 (通过), THE Prescription_Audit_Webhook SHALL update the `check_status` field to "PASS"
4. WHEN the received status is 2 (驳回), THE Prescription_Audit_Webhook SHALL update the `check_status` field to "REJECT"
5. WHEN a pres.audit event is processed, THE Prescription_Audit_Webhook SHALL update the `check_pharmaceutist` field to "楚济堂"
6. WHEN a pres.audit event is processed, THE Prescription_Audit_Webhook SHALL update the `check_content` field with the received `msg` value

### Requirement 4: 请求体存储

**User Story:** 作为系统管理员，我希望系统能够保存完整的请求体内容，以便后续审计和问题排查。

#### Acceptance Criteria

1. WHEN a pres.audit event is processed, THE Prescription_Audit_Webhook SHALL store the complete request body JSON in the `check_return` field

### Requirement 5: 幂等性处理

**User Story:** 作为系统管理员，我希望系统能够处理重复推送的事件，以确保数据一致性。

#### Acceptance Criteria

1. WHEN a duplicate event is received (same event ID), THE Prescription_Audit_Webhook SHALL return success without re-processing
2. THE Prescription_Audit_Webhook SHALL use the event `id` field for idempotency checking

### Requirement 6: 响应格式

**User Story:** 作为外部系统集成方，我希望收到标准格式的响应，以便确认推送是否成功。

#### Acceptance Criteria

1. WHEN processing succeeds, THE Prescription_Audit_Webhook SHALL return HTTP 200 with JSON body `{"code": 0, "message": "success"}`
2. WHEN the prescription is not found, THE Prescription_Audit_Webhook SHALL return HTTP 404 with JSON body containing error code 1001
3. WHEN request validation fails, THE Prescription_Audit_Webhook SHALL return HTTP 400 with appropriate error message
4. WHEN an internal error occurs, THE Prescription_Audit_Webhook SHALL return HTTP 500 with error details

### Requirement 7: 请求日志持久化

**User Story:** 作为系统管理员，我希望系统能够将所有Webhook请求记录保存到数据库表中，以便监控、审计和问题排查。

#### Acceptance Criteria

1. WHEN a pres.audit event is received, THE Prescription_Audit_Webhook SHALL create a log record in `t_prescription_audit_webhook_log` table
2. THE Prescription_Audit_Webhook SHALL store the event_id, event_type, pres_no, order_id in the log record
3. THE Prescription_Audit_Webhook SHALL store the complete request payload (JSON) in the log record
4. THE Prescription_Audit_Webhook SHALL store the request headers (JSON) in the log record
5. THE Prescription_Audit_Webhook SHALL store the response payload (JSON) in the log record
6. THE Prescription_Audit_Webhook SHALL record the request_time and response_time for each request
7. THE Prescription_Audit_Webhook SHALL record the processing duration (milliseconds) for each request
8. THE Prescription_Audit_Webhook SHALL record the HTTP status code for each request
9. THE Prescription_Audit_Webhook SHALL record the process_status (SUCCESS/FAILURE/ERROR) for each request
10. THE Prescription_Audit_Webhook SHALL record the client IP address for each request
11. IF an error occurs, THEN THE Prescription_Audit_Webhook SHALL record the error_message and exception_type
12. THE Prescription_Audit_Webhook SHALL store audit_status (1-通过/2-驳回) and audit_msg in the log record

### Requirement 8: 日志表结构

**User Story:** 作为数据库管理员，我希望有一个专门的表来存储处方审核Webhook日志，以便进行数据管理和查询。

#### Acceptance Criteria

1. THE Database SHALL have a table named `t_prescription_audit_webhook_log`
2. THE Log_Table SHALL have a unique index on `event_id` field for idempotency checking
3. THE Log_Table SHALL have an index on `pres_no` field for prescription lookup
4. THE Log_Table SHALL have an index on `request_time` field for time-based queries
5. THE Log_Table SHALL have an index on `process_status` field for status filtering
