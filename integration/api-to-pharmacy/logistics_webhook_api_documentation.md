# 物流发货信息接收接口（供药房系统调用）

## 接口说明

药房系统通过该接口推送订单发货信息，包括物流单号、物流公司等信息。系统接收后会更新订单的物流状态。

## 请求地址

```
POST /api/v1/logistics/webhook
```

## 请求Header

### 必填Header

| Header名称 | 类型 | 必填 | 说明 |
|-----------|------|------|------|
| Content-Type | string | 是 | 固定值：application/json |
| X-App-Event | string | 是 | 事件类型，固定值：order.shipped |
| X-App-Timestamp | string | 是 | Unix时间戳（秒） |
| X-App-Signature | string | 是 | 请求签名（用于验证请求来源） |

### 可选认证Header

| Header名称 | 类型 | 必填 | 说明 |
|-----------|------|------|------|
| appSecret | string | 否 | AppSecret密钥（推荐使用） |

> **认证说明**：
> - 该接口支持AppSecret认证
> - 使用AppSecret认证时，在请求头中添加 `appSecret` 字段
> - AppSecret认证通过后会跳过后续的Token认证
> - 如果不使用AppSecret，则需要通过Shiro的Token认证

## 请求参数

### 请求Body（JSON格式）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 事件唯一ID，格式：evt_order_{order_id}_{timestamp} |
| type | string | 是 | 事件类型，固定值：order.shipped |
| timestamp | long | 是 | Unix时间戳（秒） |
| data | object | 是 | 事件数据对象 |

### 事件数据对象（data）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| data.order_id | string | 是 | 订单号 |
| data.logistics_code | string | 是 | 物流单号（快递单号） |
| data.logistics_company | string | 是 | 物流公司名称 |
| data.items | array | 否 | 商品列表 |

### 商品列表项（items[]）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| items[].product_id | string | 否 | 商品ID |
| items[].product_name | string | 否 | 商品名称 |
| items[].quantity | integer | 否 | 发货数量 |

## 请求示例

```json
{
  "id": "evt_order_ORD20260114001_1736841600",
  "type": "order.shipped",
  "timestamp": 1736841600,
  "data": {
    "order_id": "ORD20260114001",
    "logistics_code": "SF1234567890",
    "logistics_company": "顺丰速运",
    "items": [
      {
        "product_id": "PROD001",
        "product_name": "阿莫西林胶囊",
        "quantity": 2
      },
      {
        "product_id": "PROD002",
        "product_name": "感冒灵颗粒",
        "quantity": 1
      }
    ]
  }
}
```

### 完整请求示例（包含Header）

```bash
curl -X POST https://your-domain.com/api/v1/logistics/webhook \
  -H "Content-Type: application/json" \
  -H "X-App-Event: order.shipped" \
  -H "X-App-Timestamp: 1736841600" \
  -H "X-App-Signature: your_signature_here" \
  -H "appSecret: your_app_secret" \
  -d '{
    "id": "evt_order_ORD20260114001_1736841600",
    "type": "order.shipped",
    "timestamp": 1736841600,
    "data": {
      "order_id": "ORD20260114001",
      "logistics_code": "SF1234567890",
      "logistics_company": "顺丰速运",
      "items": [
        {
          "product_id": "PROD001",
          "product_name": "阿莫西林胶囊",
          "quantity": 2
        }
      ]
    }
  }'
```

## 返回参数

### 返回值结构说明

接口返回的是一个 `WebhookResponse` 对象，包含以下字段：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| code | integer | 响应码，0表示成功，其他值表示失败 |
| msg | string | 响应消息 |
| data | object | 响应数据对象（可选） |

### 响应数据对象（data）

| 参数名 | 类型 | 说明 |
|--------|------|------|
| data.order_id | string | 订单号 |
| data.updated | boolean | 是否更新成功 |

### 响应码说明

| 响应码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 0 | 200 | 处理成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 签名验证失败或认证失败 |
| 404 | 404 | 订单不存在 |
| 500 | 500 | 服务器内部错误 |

## 成功响应示例

### 示例1：首次处理成功

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "order_id": "ORD20260114001",
    "updated": true
  }
}
```

### 示例2：幂等响应（事件已处理）

```json
{
  "code": 0,
  "msg": "Event already processed (idempotent)",
  "data": {
    "order_id": "ORD20260114001",
    "updated": true
  }
}
```

## 错误响应示例

### 示例1：缺少必填Header

```json
{
  "code": 400,
  "msg": "Missing X-App-Event header",
  "data": null
}
```

### 示例2：事件类型错误

```json
{
  "code": 400,
  "msg": "Invalid X-App-Event header, expected: order.shipped",
  "data": null
}
```

### 示例3：请求体为空

```json
{
  "code": 400,
  "msg": "Empty request body",
  "data": null
}
```

### 示例4：请求体格式错误

```json
{
  "code": 400,
  "msg": "Invalid request body: Unexpected character...",
  "data": null
}
```

### 示例5：缺少必填字段

```json
{
  "code": 400,
  "msg": "Missing required field: order_id",
  "data": null
}
```

### 示例6：订单不存在

```json
{
  "code": 404,
  "msg": "Order not found: ORD20260114001",
  "data": null
}
```

### 示例7：签名验证失败

```json
{
  "code": 401,
  "msg": "Signature verification failed",
  "data": null
}
```

### 示例8：AppSecret认证失败

```json
{
  "code": 401,
  "message": "AppSecret认证失败"
}
```

### 示例9：服务器内部错误

```json
{
  "code": 500,
  "msg": "Internal server error",
  "data": null
}
```

## 常见错误码说明

| 错误码 | HTTP状态码 | 错误信息 | 说明 |
|--------|-----------|----------|------|
| 0 | 200 | success | 处理成功 |
| 0 | 200 | Event already processed (idempotent) | 事件已处理（幂等响应） |
| 400 | 400 | Missing X-App-Event header | 缺少X-App-Event请求头 |
| 400 | 400 | Invalid X-App-Event header | X-App-Event值不正确 |
| 400 | 400 | Missing X-App-Timestamp header | 缺少X-App-Timestamp请求头 |
| 400 | 400 | Missing X-App-Signature header | 缺少X-App-Signature请求头 |
| 400 | 400 | Empty request body | 请求体为空 |
| 400 | 400 | Invalid request body | 请求体格式错误 |
| 400 | 400 | Missing required field: xxx | 缺少必填字段 |
| 401 | 401 | Signature verification failed | 签名验证失败 |
| 401 | 401 | AppSecret认证失败 | AppSecret密钥验证失败 |
| 404 | 404 | Order not found: xxx | 订单不存在 |
| 500 | 500 | Internal server error | 服务器内部错误 |

## 接口实现说明

### Controller层处理流程

```java
@PostMapping(value = "/webhook", 
             consumes = MediaType.APPLICATION_JSON_VALUE,
             produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<WebhookResponse> handleWebhook(
        @RequestBody String requestBody,
        @RequestHeader(value = "X-App-Event", required = false) String appEvent,
        @RequestHeader(value = "X-App-Timestamp", required = false) String appTimestamp,
        @RequestHeader(value = "X-App-Signature", required = false) String appSignature,
        HttpServletRequest request) {
    
    // 1. 验证请求头
    // 2. 验证请求体
    // 3. 解析请求体
    // 4. 构建请求头对象
    // 5. 处理事件
    // 6. 返回响应
}
```

### 处理流程说明

1. **请求头验证**：
   - 验证 `X-App-Event` 是否存在且值为 `order.shipped`
   - 验证 `X-App-Timestamp` 是否存在
   - 验证 `X-App-Signature` 是否存在

2. **请求体验证**：
   - 验证请求体是否为空
   - 解析JSON格式
   - 验证必填字段

3. **事件处理**：
   - 幂等性检查（根据事件ID判断是否已处理）
   - 签名验证（可选）
   - 订单存在性检查
   - 更新订单物流信息
   - 记录处理日志

4. **响应返回**：
   - 根据处理结果返回相应的HTTP状态码和响应体

### HTTP状态码映射

| 响应码 | HTTP状态码 |
|--------|-----------|
| 0 | 200 OK |
| 400 | 400 Bad Request |
| 401 | 401 Unauthorized |
| 404 | 404 Not Found |
| 500 | 500 Internal Server Error |

## 业务规则

1. **幂等性保证**：
   - 系统根据事件ID（`id`字段）进行幂等性检查
   - 相同的事件ID只会处理一次
   - 重复推送相同事件会返回成功响应，但不会重复更新数据
   - 响应消息会标注为"Event already processed (idempotent)"

2. **事件ID格式**：
   - 建议格式：`evt_order_{order_id}_{timestamp}`
   - 必须全局唯一
   - 用于幂等性检查

3. **签名验证**：
   - 系统会验证 `X-App-Signature` 签名
   - 签名算法和密钥需要提前约定
   - 签名验证失败会返回401错误

4. **订单状态更新**：
   - 只有存在的订单才能更新物流信息
   - 订单不存在会返回404错误
   - 更新成功后会记录操作日志

5. **请求日志记录**：
   - 所有webhook请求都会记录到数据库
   - 包括请求头、请求体、处理结果等信息
   - 用于问题排查和审计

## 注意事项

1. **认证方式**：
   - 该接口支持AppSecret认证和Token认证两种方式
   - 推荐使用AppSecret认证，在请求头中添加 `appSecret` 字段
   - AppSecret认证通过后会跳过后续的Token认证

2. **请求头要求**：
   - 所有自定义请求头（X-App-*）都是必填的
   - `X-App-Event` 必须为 `order.shipped`
   - `X-App-Timestamp` 用于防重放攻击
   - `X-App-Signature` 用于验证请求来源

3. **幂等性**：
   - 相同的事件ID只会处理一次
   - 重复推送不会导致数据重复更新
   - 建议在事件ID中包含订单号和时间戳

4. **错误处理**：
   - 所有错误都会返回标准的错误响应格式
   - HTTP状态码与响应体中的code字段对应
   - 错误消息会提供详细的错误原因

5. **数据一致性**：
   - 更新操作会触发事务，确保数据一致性
   - 更新失败会回滚事务

6. **安全建议**：
   - 建议在生产环境中使用 HTTPS 协议
   - AppSecret密钥应妥善保管，不要泄露
   - 定期更换签名密钥

## 测试建议

1. **正常场景测试**：
   - 测试首次推送发货信息
   - 测试重复推送相同事件（幂等性）
   - 测试不同订单的发货信息

2. **请求头验证测试**：
   - 测试缺少 X-App-Event
   - 测试错误的 X-App-Event 值
   - 测试缺少 X-App-Timestamp
   - 测试缺少 X-App-Signature

3. **请求体验证测试**：
   - 测试空请求体
   - 测试格式错误的JSON
   - 测试缺少必填字段
   - 测试字段类型错误

4. **业务逻辑测试**：
   - 测试不存在的订单号
   - 测试签名验证失败
   - 测试AppSecret认证

5. **边界情况测试**：
   - 测试超长字段值
   - 测试特殊字符
   - 测试并发请求

## 相关接口

- `/api/v1/drug/update` - 药品库存更新接口
- `/api/v1/prescription/audit/webhook` - 处方审核结果回调接口

## 附录：签名生成示例

### Python示例

```python
import hashlib
import hmac
import time

def generate_signature(request_body, timestamp, secret_key):
    """
    生成请求签名
    :param request_body: 请求体（JSON字符串）
    :param timestamp: 时间戳
    :param secret_key: 密钥
    :return: 签名字符串
    """
    # 构建待签名字符串
    sign_string = f"{timestamp}.{request_body}"
    
    # 使用HMAC-SHA256生成签名
    signature = hmac.new(
        secret_key.encode('utf-8'),
        sign_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return signature

# 使用示例
request_body = '{"id":"evt_order_ORD001_1736841600","type":"order.shipped",...}'
timestamp = str(int(time.time()))
secret_key = "your_secret_key"

signature = generate_signature(request_body, timestamp, secret_key)
print(f"X-App-Signature: {signature}")
```

### Java示例

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

public class SignatureGenerator {
    
    public static String generateSignature(String requestBody, String timestamp, String secretKey) 
            throws NoSuchAlgorithmException, InvalidKeyException {
        // 构建待签名字符串
        String signString = timestamp + "." + requestBody;
        
        // 使用HMAC-SHA256生成签名
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(
            secretKey.getBytes(StandardCharsets.UTF_8), 
            "HmacSHA256"
        );
        mac.init(secretKeySpec);
        
        byte[] signatureBytes = mac.doFinal(signString.getBytes(StandardCharsets.UTF_8));
        
        // 转换为十六进制字符串
        StringBuilder hexString = new StringBuilder();
        for (byte b : signatureBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        
        return hexString.toString();
    }
}
```
