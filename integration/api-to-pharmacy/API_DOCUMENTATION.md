# Webhook API 文档

## 概述

本文档描述了使用 AppSecret 认证机制的 Webhook 接口，包括：
- **物流 Webhook**：接收外部物流系统推送的发货信息
- **处方审核 Webhook**：接收外部药房系统推送的处方审核结果

这些接口使用 AppSecret 认证机制，无需用户登录即可调用。

## 认证机制

### AppSecret 认证

AppSecret 是一种简单的固定密钥认证方式，适用于服务端到服务端的 API 调用。

**认证流程**：
1. 在请求头中携带 `appSecret` 参数
2. 服务端验证密钥是否匹配
3. 验证通过后允许访问

**优点**：
- 极简设计，易于集成
- 高性能，只需字符串比对
- 无需复杂的签名计算

**安全要求**：
- 必须使用 HTTPS 传输
- 密钥长度至少 32 字符
- 定期轮换密钥

## API 接口

### 1. 接收物流发货事件

**接口地址**：`POST /api/v1/logistics/webhook`

**请求头**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| appSecret | String | 是 | AppSecret 密钥 |
| X-App-Event | String | 是 | 事件类型，固定值：order.shipped |
| X-App-Timestamp | String | 是 | 时间戳（毫秒） |
| Content-Type | String | 是 | 固定值：application/json |

**请求体**：

```json
{
  "orderId": "12345",
  "expressCode": "SF",
  "expressNo": "SF1234567890"
}
```

**请求体字段说明**：

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| orderId | String | 是 | 订单ID |
| expressCode | String | 是 | 快递公司代码 |
| expressNo | String | 是 | 快递单号 |


**成功响应**：

```json
{
  "code": 0,
  "message": "success"
}
```

**错误响应**：

```json
{
  "code": 401,
  "message": "AppSecret认证失败"
}
```

---

### 2. 接收处方审核结果事件

**接口地址**：`POST /api/v1/prescription/audit/webhook`

**请求头**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| appSecret | String | 是 | AppSecret 密钥 |
| X-App-Event | String | 是 | 事件类型，固定值：pres.audit |
| X-App-Timestamp | String | 是 | 时间戳（毫秒） |
| X-App-Signature | String | 是 | 签名（用于验证请求完整性） |
| Content-Type | String | 是 | 固定值：application/json |

**请求体**：

```json
{
  "prescriptionId": "PRES123456",
  "auditStatus": "APPROVED",
  "auditTime": "2026-01-19T10:00:00Z",
  "auditReason": "审核通过",
  "auditorName": "张医师"
}
```

**请求体字段说明**：

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| prescriptionId | String | 是 | 处方ID |
| auditStatus | String | 是 | 审核状态：APPROVED（通过）、REJECTED（拒绝）、PENDING（待审核） |
| auditTime | String | 是 | 审核时间（ISO 8601 格式） |
| auditReason | String | 否 | 审核原因或备注 |
| auditorName | String | 否 | 审核人姓名 |

**成功响应**：

```json
{
  "code": 0,
  "message": "success"
}
```

**错误响应**：

```json
{
  "code": 401,
  "message": "AppSecret认证失败"
}
```

或

```json
{
  "code": 400,
  "message": "Missing X-App-Event header"
}
```

---

### 3. 药品更新接口

**接口地址**：`POST /api/v1/drug/update`

**请求头**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| appSecret | String | 是 | AppSecret 密钥 |
| Content-Type | String | 是 | 固定值：application/json |

**请求体**：

```json
{
  "id": "DRUG001",
  "quantity": 100,
  "price": 25.50,
  "status": 1
}
```

**请求体字段说明**：

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | String | 是 | 药品ID |
| quantity | Integer | 否 | 药品数量 |
| price | Double | 否 | 药品价格 |
| status | Integer | 否 | 药品状态（0-禁用，1-启用） |

**成功响应**：

```json
{
  "code": 0,
  "msg": "更新成功"
}
```

**错误响应**：

```json
{
  "code": 401,
  "message": "AppSecret认证失败"
}
```

或业务错误：

```json
{
  "code": 401,
  "msg": "修改药品出错"
}
```

---

## 错误码

| 错误码 | HTTP 状态码 | 错误消息 | 说明 |
|--------|------------|---------|------|
| 0 | 200 OK | success | 请求成功 |
| 400 | 400 Bad Request | Missing X-App-Event header | 缺少必需的请求头 |
| 400 | 400 Bad Request | Invalid X-App-Event header | 请求头值不正确 |
| 400 | 400 Bad Request | Empty request body | 请求体为空 |
| 401 | 401 Unauthorized | AppSecret认证失败 | appSecret 不匹配 |
| 404 | 404 Not Found | Prescription not found | 处方不存在 |
| 500 | 500 Internal Server Error | 系统内部错误 | 服务器内部错误 |

## 调用示例

### 物流 Webhook 调用示例

#### cURL 示例

```bash
curl -X POST "https://api.hospital.com/api/v1/logistics/webhook" \
  -H "Content-Type: application/json" \
  -H "appSecret: q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6" \
  -H "X-App-Event: order.shipped" \
  -H "X-App-Timestamp: 1705651200000" \
  -d '{
    "orderId": "12345",
    "expressCode": "SF",
    "expressNo": "SF1234567890"
  }'
```

#### Java 示例

```java
HttpHeaders headers = new HttpHeaders();
headers.set("appSecret", "q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6");
headers.set("X-App-Event", "order.shipped");
headers.set("X-App-Timestamp", String.valueOf(System.currentTimeMillis()));
headers.setContentType(MediaType.APPLICATION_JSON);

String requestBody = "{\"orderId\":\"12345\",\"expressCode\":\"SF\",\"expressNo\":\"SF1234567890\"}";
HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

RestTemplate restTemplate = new RestTemplate();
ResponseEntity<String> response = restTemplate.postForEntity(
    "https://api.hospital.com/api/v1/logistics/webhook", 
    entity, 
    String.class
);
```

#### Python 示例

```python
import requests
import json
import time

headers = {
    'appSecret': 'q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6',
    'X-App-Event': 'order.shipped',
    'X-App-Timestamp': str(int(time.time() * 1000)),
    'Content-Type': 'application/json'
}

data = {
    "orderId": "12345",
    "expressCode": "SF",
    "expressNo": "SF1234567890"
}

response = requests.post(
    'https://api.hospital.com/api/v1/logistics/webhook',
    headers=headers,
    data=json.dumps(data)
)

print(response.json())
```

---

### 处方审核 Webhook 调用示例

#### cURL 示例

```bash
curl -X POST "https://api.hospital.com/api/v1/prescription/audit/webhook" \
  -H "Content-Type: application/json" \
  -H "appSecret: q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6" \
  -H "X-App-Event: pres.audit" \
  -H "X-App-Timestamp: 1705651200000" \
  -H "X-App-Signature: your_signature_here" \
  -d '{
    "prescriptionId": "PRES123456",
    "auditStatus": "APPROVED",
    "auditTime": "2026-01-19T10:00:00Z",
    "auditReason": "审核通过",
    "auditorName": "张医师"
  }'
```

#### Java 示例

```java
HttpHeaders headers = new HttpHeaders();
headers.set("appSecret", "q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6");
headers.set("X-App-Event", "pres.audit");
headers.set("X-App-Timestamp", String.valueOf(System.currentTimeMillis()));
headers.set("X-App-Signature", "your_signature_here");
headers.setContentType(MediaType.APPLICATION_JSON);

String requestBody = "{\"prescriptionId\":\"PRES123456\",\"auditStatus\":\"APPROVED\",\"auditTime\":\"2026-01-19T10:00:00Z\"}";
HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

RestTemplate restTemplate = new RestTemplate();
ResponseEntity<String> response = restTemplate.postForEntity(
    "https://api.hospital.com/api/v1/prescription/audit/webhook", 
    entity, 
    String.class
);
```

#### Python 示例

```python
import requests
import json
import time

headers = {
    'appSecret': 'q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6',
    'X-App-Event': 'pres.audit',
    'X-App-Timestamp': str(int(time.time() * 1000)),
    'X-App-Signature': 'your_signature_here',
    'Content-Type': 'application/json'
}

data = {
    "prescriptionId": "PRES123456",
    "auditStatus": "APPROVED",
    "auditTime": "2026-01-19T10:00:00Z",
    "auditReason": "审核通过",
    "auditorName": "张医师"
}

response = requests.post(
    'https://api.hospital.com/api/v1/prescription/audit/webhook',
    headers=headers,
    data=json.dumps(data)
)

print(response.json())
```

## 常见问题

### Q: 如何获取 appSecret？

A: 请联系系统管理员获取 appSecret 密钥。

### Q: appSecret 认证失败怎么办？

A: 请检查以下几点：
1. 确认 appSecret 是否正确
2. 确认请求头名称是否为 `appSecret`（区分大小写）
3. 确认密钥中没有多余的空格或换行符
4. 确认使用的是 HTTPS 协议

### Q: 是否需要 Token 认证？

A: 不需要。使用 appSecret 认证后会自动跳过 Token 认证。

### Q: 可以在哪些接口使用 appSecret 认证？

A: 目前支持以下接口：
- `/api/v1/logistics/**` - 物流 Webhook 接口
- `/api/v1/prescription/audit/**` - 处方审核 Webhook 接口
- `/api/v1/drug/update` - 药品更新接口

### Q: appSecret 会过期吗？

A: appSecret 不会自动过期，但建议定期轮换密钥以提高安全性。

## 安全建议

1. **使用 HTTPS**：生产环境必须使用 HTTPS 协议，防止密钥在传输过程中被截获
2. **密钥保护**：不要将 appSecret 硬编码在代码中，使用环境变量或配置中心
3. **密钥强度**：使用至少 32 字符的强随机密钥
4. **定期轮换**：建议每 3-6 个月轮换一次密钥
5. **访问控制**：限制只有授权的 IP 地址可以访问（如需要，请联系管理员配置）

## 联系方式

如有问题，请联系技术支持团队。
