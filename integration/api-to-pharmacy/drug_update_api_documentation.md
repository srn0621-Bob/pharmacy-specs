# 药品库存更新接口（供药房系统调用）

## 接口说明

药房系统通过该接口快速更新药品库存数量。该接口专为药房系统设计，通过 `mshId` 和 `supplier` 定位药品，只更新库存数量，避免传递大量不需要更新的字段。

## 请求地址

```
POST /api/v1/drug/update
```

## 请求Header

```
Content-Type: application/json
```

### 可选认证方式

该接口支持两种认证方式：

1. **AppSecret认证**（推荐用于第三方系统集成）
   ```
   appSecret: {your_app_secret}
   ```
   - 当请求头包含 `appSecret` 字段时，系统会验证密钥
   - 验证通过后跳过后续的Token认证
   - 适用于药房系统等第三方系统调用

2. **Token认证**（用于后台管理系统）
   - 通过Shiro框架进行会话认证
   - 适用于后台管理界面的操作

## 请求参数

### 必填字段

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| mshId 或 msh_id | string | 是 | 名士汇药品ID |
| supplier | string | 是 | 供应商名称 |
| quantity | integer | 是 | 库存数量（0-32767，可为null清空库存） |

> **重要说明**：
> - 请求中**不能包含** `id` 字段
> - **只能包含** `mshId`（或 `msh_id`）、`supplier` 和 `quantity` 三个字段
> - 系统会根据 `mshId` 和 `supplier` 查询唯一的药品记录
> - 如果找不到匹配记录，返回404错误
> - 只更新 `quantity` 字段，其他字段保持不变
> - Service层返回空的JSONObject表示成功，非空JSONObject包含错误信息

## 请求示例

### 示例1：更新库存数量

```json
{
  "mshId": "MSH123456",
  "supplier": "北京医药公司",
  "quantity": 500
}
```

### 示例2：使用 msh_id 字段名

```json
{
  "msh_id": "MSH123456",
  "supplier": "北京医药公司",
  "quantity": 1000
}
```

### 示例3：清空库存

```json
{
  "mshId": "MSH123456",
  "supplier": "北京医药公司",
  "quantity": null
}
```

## 返回参数

### 返回值结构说明

接口返回的是一个 `JsonResult` 对象，包含以下字段：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| code | integer | 状态码，200表示成功，其他值表示失败 |
| msg | string | 返回消息 |

### 状态码说明

- **200**：操作成功
- **400**：请求参数错误
- **401**：认证失败（AppSecret错误）
- **404**：资源不存在
- **500**：服务器内部错误

## 成功响应示例

```json
{
  "code": 200,
  "msg": "更新成功"
}
```

## 错误响应示例

### 示例1：AppSecret认证失败

```json
{
  "code": 401,
  "message": "AppSecret认证失败"
}
```

### 示例2：缺少mshId字段

```json
{
  "code": 400,
  "msg": "mshId不能为空"
}
```

### 示例3：缺少supplier字段

```json
{
  "code": 400,
  "msg": "supplier不能为空"
}
```

### 示例4：未找到匹配的药品

```json
{
  "code": 404,
  "msg": "未找到匹配的药品记录，mshId: MSH123456, supplier: 北京医药公司"
}
```

### 示例5：库存数量超出范围

```json
{
  "code": 400,
  "msg": "库存数量必须在0到32767之间"
}
```

### 示例6：库存数量格式错误

```json
{
  "code": 400,
  "msg": "库存数量格式错误"
}
```

### 示例7：数据库更新失败

```json
{
  "code": 500,
  "msg": "更新药品库存数量失败"
}
```

### 示例8：服务器内部错误

```json
{
  "code": 500,
  "msg": "修改药品出错"
}
```

## 常见错误码说明

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 200 | 更新成功 | 操作成功 |
| 401 | AppSecret认证失败 | appSecret密钥验证失败（仅在使用AppSecret认证时） |
| 400 | mshId不能为空 | 缺少mshId字段 |
| 400 | supplier不能为空 | 缺少supplier字段 |
| 400 | 库存数量必须在0到32767之间 | quantity字段超出有效范围 |
| 400 | 库存数量格式错误 | quantity字段不是有效的整数 |
| 404 | 未找到匹配的药品记录 | 根据mshId和supplier未找到对应药品 |
| 500 | 更新药品库存数量失败 | 数据库更新失败 |
| 500 | 修改药品出错 | 服务器内部错误 |

## 接口实现说明

### Controller层处理逻辑

```java
@PostMapping("/update")
public JsonResult update(@RequestBody Map<String, Object> map, HttpServletRequest request) {
    try {
        JSONObject res = this.drugService.updateDurg(map, request);
        if (res.isEmpty()) {
            // Service返回空JSONObject表示成功
            return ok("更新成功");  // code=200, msg="更新成功"
        } else {
            // Service返回非空JSONObject表示失败
            if (res.containsKey("code")) {
                // 如果包含code字段，使用该code
                int code = res.getIntValue("code");
                String msg = res.getString("msg");
                return error(code, msg);
            } else {
                // 否则使用默认错误码500
                return error(res.get("msg").toString());  // code=500
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
        return error("修改药品出错");  // code=500, msg="修改药品出错"
    }
}
```

### Service层返回值说明

Service层的 `updateDurg` 方法返回一个 `JSONObject`：

1. **成功情况**：
   - 返回空的 `JSONObject`（`res.isEmpty() == true`）
   - Controller层将其转换为 `{code: 200, msg: "更新成功"}`

2. **失败情况**：
   - 返回包含错误信息的 `JSONObject`
   - 如果包含 `code` 字段，使用该 `code` 值
   - 如果不包含 `code` 字段，Controller层使用默认的 500 错误码
   - `msg` 字段包含具体的错误信息

### 错误码映射

| Service返回 | Controller处理 | 最终返回 |
|------------|---------------|---------|
| `{}` (空对象) | `ok("更新成功")` | `{code: 200, msg: "更新成功"}` |
| `{code: 400, msg: "xxx"}` | `error(400, "xxx")` | `{code: 400, msg: "xxx"}` |
| `{code: 404, msg: "xxx"}` | `error(404, "xxx")` | `{code: 404, msg: "xxx"}` |
| `{msg: "xxx"}` (无code) | `error("xxx")` | `{code: 500, msg: "xxx"}` |
| 抛出异常 | `catch` 捕获 | `{code: 500, msg: "修改药品出错"}` |

## 业务规则

1. **请求字段限制**：
   - 不能包含 `id` 字段
   - 只能包含 `mshId`（或 `msh_id`）、`supplier` 和 `quantity` 三个字段
   - 如果包含其他有效字段，将不会触发库存快速更新模式

2. **药品查询规则**：
   - 系统根据 `mshId` 和 `supplier` 查询唯一药品记录
   - 如果找不到匹配记录，返回404错误
   - 只更新 `quantity` 字段，其他字段保持不变

3. **库存数量规则**：
   - 有效范围：0 到 32767
   - 可以设置为 `null` 清空库存
   - 必须是整数

4. **操作日志**：
   - 更新操作会记录操作日志
   - 日志内容为"修改药品库存数量"

5. **错误处理**：
   - Controller层会捕获所有异常
   - 业务异常（BizException）会返回异常消息
   - 其他异常统一返回"修改药品出错"
   - Service层返回的错误信息会通过JSONObject传递给Controller

## 注意事项

1. **认证方式**：
   - 该接口支持AppSecret认证和Token认证两种方式
   - 使用AppSecret认证时，在请求头中添加 `appSecret` 字段
   - AppSecret认证通过后会跳过后续的Token认证
   - 如果不使用AppSecret，则需要通过Shiro的Token认证

2. **字段名称兼容性**：
   - 支持 `mshId` 和 `msh_id` 两种字段名
   - 系统会自动识别并使用

3. **库存快速更新模式**：
   - 专为药房系统设计的便捷接口
   - 避免传递大量不需要更新的字段
   - 只需提供 mshId、supplier 和 quantity 三个字段
   - 系统会根据 mshId 和 supplier 自动查找对应的药品记录

4. **数据一致性**：
   - 更新操作会触发事务，确保数据一致性

5. **安全建议**：
   - 建议在生产环境中使用 HTTPS 协议保证数据传输安全
   - AppSecret密钥应妥善保管，不要泄露

## 测试建议

1. **正常场景测试**：
   - 测试正常更新库存
   - 测试清空库存（quantity 为 null）
   - 测试使用 mshId 和 msh_id 两种字段名

2. **边界值测试**：
   - 测试库存数量边界值（0、32767）
   - 测试库存数量超出范围（负数、超过32767）
   - 测试库存数量格式错误（非整数）

3. **错误场景测试**：
   - 测试缺少 mshId 字段
   - 测试缺少 supplier 字段
   - 测试不存在的 mshId 和 supplier 组合
   - 测试包含额外字段（应该不会触发库存快速更新模式）

4. **认证测试**：
   - 测试不带认证信息的请求（应该通过Shiro认证）
   - 测试带AppSecret的请求
   - 测试错误的AppSecret
   - 测试AppSecret认证成功后是否跳过Token认证

## 相关接口

- `/api/v1/drug/list` - 药品列表查询
- `/api/v1/drug/insert` - 添加药品
- `/api/v1/drug/drugEnableDisable` - 药品启用/禁用
