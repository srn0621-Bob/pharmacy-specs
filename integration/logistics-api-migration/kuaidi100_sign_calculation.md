# 快递100 签名计算详解

## 签名算法

快递100 API 使用 MD5 签名算法来验证请求的合法性。

### 算法公式

```
sign = MD5(param + key + customer).toUpperCase()
```

**说明**:
1. 将 `param`、`key`、`customer` 三个字符串按顺序拼接
2. 对拼接后的字符串进行 MD5 哈希计算
3. 将 MD5 结果转换为 32 位大写十六进制字符串

## 参数说明

| 参数 | 说明 | 示例 | 来源 |
|-----|------|------|------|
| `param` | JSON格式的查询参数 | `{"com":"yunda","num":"YT1234567890","resultv2":"1"}` | 动态生成 |
| `key` | 快递100分配的密钥 | `B19DB55FF14E35488D780C172E19DF99` | 配置文件 |
| `customer` | 快递100分配的授权码 | `5727072A955414A4C8AC79D5F33DB7F6` | 配置文件 |

## 计算步骤

### 步骤1: 构建 param 参数

```java
JSONObject paramJson = new JSONObject();
paramJson.put("com", "yunda");              // 快递公司编码
paramJson.put("num", "YT1234567890");       // 快递单号
paramJson.put("resultv2", "1");             // 返回版本
String param = paramJson.toJSONString();
```

**结果**:
```
{"com":"yunda","num":"YT1234567890","resultv2":"1"}
```

### 步骤2: 拼接签名字符串

```java
String signStr = param + key + customer;
```

**示例**:
```
{"com":"yunda","num":"YT1234567890","resultv2":"1"}B19DB55FF14E35488D780C172E19DF995727072A955414A4C8AC79D5F33DB7F6
```

### 步骤3: 计算 MD5

```java
MessageDigest md = MessageDigest.getInstance("MD5");
byte[] digest = md.digest(signStr.getBytes("UTF-8"));
```

### 步骤4: 转换为十六进制字符串

```java
StringBuilder hexString = new StringBuilder();
for (byte b : digest) {
    String hex = Integer.toHexString(0xff & b);
    if (hex.length() == 1) {
        hexString.append('0');  // 补零
    }
    hexString.append(hex);
}
```

### 步骤5: 转换为大写

```java
String sign = hexString.toString().toUpperCase();
```

**最终结果** (示例):
```
A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
```

## 完整代码实现

```java
/**
 * 计算签名
 * 签名算法: MD5(param + key + customer) 转32位大写
 * 
 * @param param JSON参数字符串
 * @param key 密钥
 * @param customer 授权码
 * @return 32位大写MD5签名
 */
private static String calculateSign(String param, String key, String customer) {
    try {
        // 1. 拼接签名字符串
        String signStr = param + key + customer;
        
        // 2. 获取MD5实例
        MessageDigest md = MessageDigest.getInstance("MD5");
        
        // 3. 计算MD5哈希值
        byte[] digest = md.digest(signStr.getBytes("UTF-8"));
        
        // 4. 转换为32位十六进制字符串
        StringBuilder hexString = new StringBuilder();
        for (byte b : digest) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        
        // 5. 转换为大写
        return hexString.toString().toUpperCase();
        
    } catch (Exception e) {
        log.error("计算签名失败: error={}", e.getMessage(), e);
        throw new RuntimeException("计算签名失败", e);
    }
}
```

## 实际示例

### 示例1: 查询韵达快递

**输入参数**:
```
param    = {"com":"yunda","num":"YT1234567890","resultv2":"1"}
key      = B19DB55FF14E35488D780C172E19DF99
customer = 5727072A955414A4C8AC79D5F33DB7F6
```

**计算过程**:
```
1. 拼接字符串:
   {"com":"yunda","num":"YT1234567890","resultv2":"1"}B19DB55FF14E35488D780C172E19DF995727072A955414A4C8AC79D5F33DB7F6

2. MD5计算:
   (二进制结果)

3. 转十六进制:
   a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

4. 转大写:
   A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
```

**最终签名**:
```
A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
```

### 示例2: 查询顺丰快递

**输入参数**:
```
param    = {"com":"shunfeng","num":"SF1234567890","resultv2":"1"}
key      = B19DB55FF14E35488D780C172E19DF99
customer = 5727072A955414A4C8AC79D5F33DB7F6
```

**拼接字符串**:
```
{"com":"shunfeng","num":"SF1234567890","resultv2":"1"}B19DB55FF14E35488D780C172E19DF995727072A955414A4C8AC79D5F33DB7F6
```

**最终签名** (示例):
```
B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7
```

## 在线验证工具

### 使用 Java 命令行验证

```java
import java.security.MessageDigest;

public class SignCalculator {
    public static void main(String[] args) throws Exception {
        String param = "{\"com\":\"yunda\",\"num\":\"YT1234567890\",\"resultv2\":\"1\"}";
        String key = "B19DB55FF14E35488D780C172E19DF99";
        String customer = "5727072A955414A4C8AC79D5F33DB7F6";
        
        String signStr = param + key + customer;
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(signStr.getBytes("UTF-8"));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : digest) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        
        System.out.println("签名: " + hexString.toString().toUpperCase());
    }
}
```

### 使用在线 MD5 工具

1. 访问 MD5 在线计算工具（如 https://www.md5hashgenerator.com/）
2. 输入拼接后的字符串
3. 选择 UTF-8 编码
4. 计算 MD5
5. 将结果转换为大写

## 常见问题

### Q1: 签名验证失败怎么办？

**检查清单**:
1. ✅ 确认 `param` 的 JSON 格式正确（无多余空格）
2. ✅ 确认 `key` 配置正确
3. ✅ 确认 `customer` 配置正确
4. ✅ 确认拼接顺序：param + key + customer
5. ✅ 确认最终结果转换为大写

### Q2: param 的 JSON 格式有要求吗？

**是的，有以下要求**:
- 使用双引号，不能使用单引号
- 键值对之间用逗号分隔
- 不能有多余的空格
- 必须包含 `com`、`num`、`resultv2` 三个字段

**正确格式**:
```json
{"com":"yunda","num":"YT1234567890","resultv2":"1"}
```

**错误格式**:
```json
// 错误1: 使用单引号
{'com':'yunda','num':'YT1234567890','resultv2':'1'}

// 错误2: 有多余空格
{"com": "yunda", "num": "YT1234567890", "resultv2": "1"}

// 错误3: 缺少字段
{"com":"yunda","num":"YT1234567890"}
```

### Q3: 为什么要转换为大写？

快递100 API 要求签名必须是 32 位大写十六进制字符串。如果不转换为大写，签名验证会失败。

### Q4: key 和 customer 从哪里获取？

这两个参数由快递100官方分配，需要：
1. 在快递100官网注册账号
2. 申请 API 接口权限
3. 获取分配的 `customer`（授权码）和 `key`（密钥）
4. 配置到 `application-dev.properties` 文件中

## 配置文件

### application-dev.properties

```properties
# 快递100配置
kuaidi100.url=http://poll.kuaidi100.com/poll/query.do
kuaidi100.customer=5727072A955414A4C8AC79D5F33DB7F6
kuaidi100.key=B19DB55FF14E35488D780C172E19DF99
```

**注意**:
- `customer` 和 `key` 是敏感信息，不要提交到版本控制系统
- 生产环境应该使用环境变量或加密配置

## 日志示例

在实际运行时，日志会打印签名计算的详细信息：

```
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 请求开始 ==========
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求URL: http://poll.kuaidi100.com/poll/query.do
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求方法: POST
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - Content-Type: application/x-www-form-urlencoded
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求参数:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - param: {"com":"yunda","num":"YT1234567890","resultv2":"1"}
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - customer: 5727072A955414A4C8AC79D5F33DB7F6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - sign: A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 快递信息:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递公司编码: yunda
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递单号: YT1234567890
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
```

## 安全建议

1. **保护密钥**: `key` 和 `customer` 是敏感信息，应该：
   - 不要硬编码在代码中
   - 不要提交到版本控制系统
   - 使用环境变量或加密配置存储

2. **定期更换**: 建议定期更换 `key`，提高安全性

3. **日志脱敏**: 在生产环境日志中，应该对 `customer` 和 `key` 进行脱敏处理

4. **HTTPS**: 如果快递100支持 HTTPS，建议使用 HTTPS 协议

## 相关文档

- [快递100集成文档](kuaidi100_logistics_integration_complete.md)
- [API日志示例](kuaidi100_api_logging_example.md)
- [快速开始指南](kuaidi100_quick_start.md)
- [快递100官方文档](https://www.kuaidi100.com/openapi/api_post.shtml)
