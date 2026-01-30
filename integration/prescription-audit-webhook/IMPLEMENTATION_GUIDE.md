# 处方审核Webhook实现指南

## 概述

本文档详细说明处方审核结果Webhook接收端口的实现细节。该接口用于接收外部药房系统（楚济堂）推送的处方审核结果（`pres.audit`事件），并更新本地`t_hos_prescription`表中对应处方记录的审核状态信息。

## 功能说明

### 1. 接口信息

| 项目 | 说明 |
|------|------|
| 请求方式 | POST |
| 接口路径 | `/api/v1/prescription/audit/webhook` |
| Content-Type | application/json; charset=utf-8 |
| 事件类型 | pres.audit |

### 2. 请求头要求

| Header名称 | 必填 | 说明 |
|------------|------|------|
| X-App-Event | 是 | 事件类型，固定值：`pres.audit` |
| X-App-Timestamp | 是 | Unix时间戳（秒） |
| X-App-Signature | 是 | 请求签名 |
| Content-Type | 是 | application/json; charset=utf-8 |

### 3. 请求体格式

```json
{
  "id": "evt_pres_CS20241111_1716000000",
  "type": "pres.audit",
  "timestamp": 1716000000,
  "data": {
    "pres_no": "CS20241111001",
    "order_id": "YL20241111",
    "recipe_url": "https://test.xx/prescription.jpg",
    "status": 1,
    "msg": "审核通过"
  }
}
```

### 4. 字段说明

#### 公共字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 事件唯一ID，格式：`evt_pres_{pres_no}_{timestamp}` |
| type | string | 是 | 事件类型，固定值：`pres.audit` |
| timestamp | integer | 是 | Unix时间戳（秒） |

#### data字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pres_no | string | 是 | 处方单号（对应本地`prescription_num`） |
| order_id | string | 是 | 关联的订单号 |
| recipe_url | string | 是 | 处方图片地址 |
| status | integer | 是 | 审方状态：1-通过，2-驳回 |
| msg | string | 否 | 审方消息（驳回时通常包含驳回原因） |

### 5. 字段映射关系

| 推送字段 | 本地字段 | 映射规则 |
|---------|---------|---------|
| `data.pres_no` | `prescription_num` | 用于查找记录 |
| `data.recipe_url` | `img` | 直接赋值 |
| `data.status` | `check_status` | 1→"PASS", 2→"REJECT" |
| `data.msg` | `check_content` | 直接赋值 |
| 完整请求体JSON | `check_return` | 存储原始JSON |
| 固定值"楚济堂" | `check_pharmaceutist` | 固定赋值 |
| 当前时间 | `check_time` | 系统当前时间 |

---

## 响应格式

### 成功响应 (HTTP 200)

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "orderId": "CS20241111001",
    "updated": true
  }
}
```

### 错误响应

| HTTP状态码 | code | 说明 |
|------------|------|------|
| 400 | 400 | 请求参数错误（缺少必填字段、格式错误等） |
| 404 | 1001 | 处方单不存在 |
| 500 | 500 | 服务器内部错误 |

#### 错误响应示例

```json
{
  "code": 1001,
  "msg": "处方单不存在: CS20241111001",
  "data": null
}
```

---

## 实现的文件清单

### 1. 数据库脚本

| 文件路径 | 说明 |
|---------|------|
| `internet-hospital/sql/t_prescription_audit_webhook_log.sql` | Webhook日志表DDL |

### 2. Controller层

| 文件路径 | 说明 |
|---------|------|
| `com.adinnet.admin.system.controller.PrescriptionAuditController` | 处方审核Webhook控制器 |

### 3. Service层

| 文件路径 | 说明 |
|---------|------|
| `com.adinnet.admin.system.service.PrescriptionAuditWebhookService` | 业务服务接口 |
| `com.adinnet.admin.system.service.impl.PrescriptionAuditWebhookServiceImpl` | 业务服务实现 |
| `com.adinnet.admin.system.service.PrescriptionAuditWebhookLogService` | 日志服务接口 |
| `com.adinnet.admin.system.service.impl.PrescriptionAuditWebhookLogServiceImpl` | 日志服务实现 |

### 4. Mapper层

| 文件路径 | 说明 |
|---------|------|
| `com.adinnet.admin.system.mapper.HosPrescriptionMapper` | 处方Mapper（扩展） |
| `com.adinnet.admin.system.mapper.PrescriptionAuditWebhookLogMapper` | 日志Mapper |
| `resources/xml/HosPrescriptionMapper.xml` | 处方SQL映射（扩展） |
| `resources/xml/PrescriptionAuditWebhookLogMapper.xml` | 日志SQL映射 |

### 5. Model层

| 文件路径 | 说明 |
|---------|------|
| `com.adinnet.admin.system.model.prescription.PrescriptionAuditEvent` | 事件模型 |
| `com.adinnet.admin.system.model.prescription.PrescriptionAuditData` | 事件数据模型 |
| `com.adinnet.admin.system.model.prescription.PrescriptionAuditWebhookLog` | 日志实体 |
| `com.adinnet.admin.system.model.prescription.AuditStatusMapper` | 状态映射工具 |

### 6. Exception层

| 文件路径 | 说明 |
|---------|------|
| `com.adinnet.admin.system.exception.PrescriptionNotFoundException` | 处方不存在异常 |
| `com.adinnet.admin.system.exception.InvalidStatusException` | 无效状态异常 |

---

## 部署步骤

### 步骤1：执行数据库脚本

在MySQL数据库中执行以下脚本创建日志表：

```sql
-- 执行文件: internet-hospital/sql/t_prescription_audit_webhook_log.sql

CREATE TABLE IF NOT EXISTS `t_prescription_audit_webhook_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `event_id` VARCHAR(100) NOT NULL COMMENT '事件唯一ID',
  `event_type` VARCHAR(50) DEFAULT NULL COMMENT '事件类型',
  `pres_no` VARCHAR(64) DEFAULT NULL COMMENT '处方单号',
  `order_id` VARCHAR(64) DEFAULT NULL COMMENT '关联订单号',
  `audit_status` INT DEFAULT NULL COMMENT '审核状态：1-通过，2-驳回',
  `audit_msg` VARCHAR(500) DEFAULT NULL COMMENT '审核消息',
  `recipe_url` VARCHAR(500) DEFAULT NULL COMMENT '处方图片地址',
  `request_payload` TEXT COMMENT '请求体',
  `request_headers` TEXT COMMENT '请求头',
  `response_payload` TEXT COMMENT '响应体',
  `request_time` DATETIME DEFAULT NULL COMMENT '请求时间',
  `response_time` DATETIME DEFAULT NULL COMMENT '响应时间',
  `duration` BIGINT DEFAULT NULL COMMENT '处理耗时(毫秒)',
  `http_status_code` INT DEFAULT NULL COMMENT 'HTTP状态码',
  `process_status` VARCHAR(20) DEFAULT NULL COMMENT '处理状态',
  `error_message` VARCHAR(2000) DEFAULT NULL COMMENT '错误信息',
  `exception_type` VARCHAR(200) DEFAULT NULL COMMENT '异常类型',
  `client_ip` VARCHAR(50) DEFAULT NULL COMMENT '客户端IP',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_event_id` (`event_id`),
  KEY `idx_pres_no` (`pres_no`),
  KEY `idx_request_time` (`request_time`),
  KEY `idx_process_status` (`process_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='处方审核Webhook调用日志表';
```

### 步骤2：编译部署

```bash
cd internet-hospital
mvn clean package -DskipTests
```

### 步骤3：验证接口

部署完成后，可使用以下curl命令测试接口：

```bash
# 测试审核通过
curl -X POST http://your-server:port/api/v1/prescription/audit/webhook \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "X-App-Event: pres.audit" \
  -H "X-App-Timestamp: 1716000000" \
  -H "X-App-Signature: your_signature_here" \
  -d '{
    "id": "evt_pres_CS20241111_1716000000",
    "type": "pres.audit",
    "timestamp": 1716000000,
    "data": {
      "pres_no": "CS20241111001",
      "order_id": "YL20241111",
      "recipe_url": "https://test.xx/prescription.jpg",
      "status": 1,
      "msg": "审核通过"
    }
  }'

# 测试审核驳回
curl -X POST http://your-server:port/api/v1/prescription/audit/webhook \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "X-App-Event: pres.audit" \
  -H "X-App-Timestamp: 1716000001" \
  -H "X-App-Signature: your_signature_here" \
  -d '{
    "id": "evt_pres_CS20241111_1716000001",
    "type": "pres.audit",
    "timestamp": 1716000001,
    "data": {
      "pres_no": "CS20241111001",
      "order_id": "YL20241111",
      "recipe_url": "https://test.xx/prescription.jpg",
      "status": 2,
      "msg": "签字不清晰，请重新上传"
    }
  }'
```

---

## 核心功能说明

### 1. 幂等性处理

系统通过`event_id`实现幂等性控制：
- 每个事件的`id`字段是唯一的（格式：`evt_pres_{pres_no}_{timestamp}`）
- 首次处理时，在日志表中插入记录
- 重复请求时，检查日志表中是否已存在该`event_id`
- 如果已成功处理过，直接返回成功响应，不再重复更新处方记录

### 2. 日志记录

所有Webhook请求都会记录到`t_prescription_audit_webhook_log`表：
- 请求时间、请求头、请求体
- 响应时间、响应体、HTTP状态码
- 处理状态（SUCCESS/FAILURE/ERROR）
- 错误信息和异常类型（如有）
- 处理耗时

### 3. 状态映射

| 推送状态值 | 本地状态值 | 说明 |
|-----------|-----------|------|
| 1 | PASS | 审核通过 |
| 2 | REJECT | 审核驳回 |

### 4. 错误处理

| 场景 | HTTP状态码 | 错误码 | 处理方式 |
|------|-----------|--------|---------|
| 缺少必填请求头 | 400 | 400 | 返回错误信息 |
| 事件类型不匹配 | 400 | 400 | 返回错误信息 |
| 请求体解析失败 | 400 | 400 | 返回错误信息 |
| 状态值无效 | 400 | 400 | 返回错误信息 |
| 处方记录不存在 | 404 | 1001 | 返回错误信息 |
| 内部处理异常 | 500 | 500 | 记录日志，返回错误信息 |

---

## 架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        外部药房系统（楚济堂）                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/v1/prescription/audit/webhook
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PrescriptionAuditController                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. 验证请求头 (X-App-Event, X-App-Timestamp, X-App-Signature)│   │
│  │ 2. 解析请求体                                                 │   │
│  │ 3. 构建WebhookHeaders对象                                     │   │
│  │ 4. 调用Service处理                                            │   │
│  │ 5. 返回响应                                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                PrescriptionAuditWebhookServiceImpl                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. 幂等性检查 (基于event_id查询日志表)                        │   │
│  │ 2. 创建日志记录                                               │   │
│  │ 3. 验证事件数据                                               │   │
│  │ 4. 查找处方记录 (根据pres_no)                                 │   │
│  │ 5. 映射审核状态 (1→PASS, 2→REJECT)                           │   │
│  │ 6. 更新处方审核信息                                           │   │
│  │ 7. 更新日志记录                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│     HosPrescriptionMapper      │   │ PrescriptionAuditWebhookLog   │
│  ┌─────────────────────────┐  │   │         Mapper                │
│  │ selectByPrescriptionNum │  │   │  ┌─────────────────────────┐  │
│  │ updateAuditInfo         │  │   │  │ selectByEventId         │  │
│  └─────────────────────────┘  │   │  │ insertLog               │  │
└───────────────────────────────┘   │  │ updateLog               │  │
              │                      │  └─────────────────────────┘  │
              ▼                      └───────────────────────────────┘
┌───────────────────────────────┐                   │
│      t_hos_prescription        │                   ▼
│  ┌─────────────────────────┐  │   ┌───────────────────────────────┐
│  │ img                     │  │   │ t_prescription_audit_webhook  │
│  │ check_time              │  │   │           _log                │
│  │ check_status            │  │   └───────────────────────────────┘
│  │ check_content           │  │
│  │ check_return            │  │
│  │ check_pharmaceutist     │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

---

## 注意事项

1. **幂等性**：同一条消息可能被推送多次，系统已实现幂等性处理
2. **状态值**：status只能是1或2，其他值会返回400错误
3. **处方关联**：确保`pres_no`与本地`prescription_num`能正确匹配
4. **日志清理**：建议定期清理历史日志数据，避免表过大
5. **签名验证**：当前实现未做签名验证，如需要可在Controller中添加

---

## 相关文档

- [requirements.md](./requirements.md) - 需求文档
- [design.md](./design.md) - 设计文档
- [tasks.md](./tasks.md) - 任务清单

---

## 更新记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-01-16 | 1.0 | 初始版本 |
