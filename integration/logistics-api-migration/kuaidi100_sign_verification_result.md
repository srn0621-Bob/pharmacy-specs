# 快递100签名计算逻辑验证结果

## 验证日期
2026-01-18

## 用户要求
签名，用于验证身份，按 **param + key + customer** 的顺序进行MD5加密（注意加密后字符串一定要转32位大写），不需要加上"+"号。

## 实际实现验证

### 代码位置
`internet-hospital/adinnet-common/src/main/java/com/adinnet/common/utils/Kuaidi100Util.java`

### calculateSign方法实现

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
        // 1. 按 param + key + customer 顺序拼接（不加"+"号）
        String signStr = param + key + customer;
        
        // 2. 进行MD5加密
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(signStr.getBytes("UTF-8"));
        
        // 3. 转换为32位十六进制字符串
        StringBuilder hexString = new StringBuilder();
        for (byte b : digest) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');  // 补零确保每个字节都是2位
            }
            hexString.append(hex);
        }
        
        // 4. 转换为大写
        return hexString.toString().toUpperCase();
        
    } catch (Exception e) {
        log.error("计算签名失败: error={}", e.getMessage(), e);
        throw new RuntimeException("计算签名失败", e);
    }
}
```

## 逐项验证

### ✅ 验证项1: 拼接顺序
**要求**: 按 param + key + customer 的顺序

**实现**:
```java
String signStr = param + key + customer;
```

**结果**: ✅ **完全符合** - 顺序正确：param → key → customer

---

### ✅ 验证项2: 不加"+"号
**要求**: 不需要加上"+"号

**实现**:
```java
String signStr = param + key + customer;  // Java字符串拼接，不会添加"+"字符
```

**说明**: 
- Java中的 `+` 是字符串拼接运算符，不会在结果中添加"+"字符
- 例如: `"abc" + "def" + "ghi"` 结果是 `"abcdefghi"`，而不是 `"abc+def+ghi"`

**结果**: ✅ **完全符合** - 直接拼接，无分隔符

---

### ✅ 验证项3: MD5加密
**要求**: 进行MD5加密

**实现**:
```java
MessageDigest md = MessageDigest.getInstance("MD5");
byte[] digest = md.digest(signStr.getBytes("UTF-8"));
```

**结果**: ✅ **完全符合** - 使用标准MD5算法，UTF-8编码

---

### ✅ 验证项4: 转32位大写
**要求**: 加密后字符串一定要转32位大写

**实现**:
```java
StringBuilder hexString = new StringBuilder();
for (byte b : digest) {
    String hex = Integer.toHexString(0xff & b);
    if (hex.length() == 1) {
        hexString.append('0');  // 补零确保每个字节都是2位
    }
    hexString.append(hex);
}
return hexString.toString().toUpperCase();  // 转大写
```

**说明**:
- MD5产生16字节（128位）
- 每个字节转换为2位十六进制 = 16 × 2 = 32位
- 最后调用 `.toUpperCase()` 转换为大写

**结果**: ✅ **完全符合** - 32位大写十六进制字符串

---

## 完整验证示例

### 输入
```
param    = {"com":"yunda","num":"YT1234567890","resultv2":"1"}
key      = B19DB55FF14E35488D780C172E19DF99
customer = 5727072A955414A4C8AC79D5F33DB7F6
```

### 处理过程

**步骤1: 拼接（不加"+"号）**
```
signStr = {"com":"yunda","num":"YT1234567890","resultv2":"1"}B19DB55FF14E35488D780C172E19DF995727072A955414A4C8AC79D5F33DB7F6
```

**步骤2: MD5加密**
```
MD5(signStr) → 16字节二进制数据
```

**步骤3: 转32位十六进制**
```
16字节 × 2位/字节 = 32位十六进制字符串
```

**步骤4: 转大写**
```
最终结果: 32位大写十六进制字符串
例如: A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
```

### 输出
```
32位大写MD5签名字符串
```

---

## 验证结论

### 总体评估
✅ **完全符合要求**

### 详细对比

| 要求 | 实现 | 状态 |
|-----|------|------|
| 按 param + key + customer 顺序 | `param + key + customer` | ✅ 符合 |
| 不加"+"号 | 直接字符串拼接 | ✅ 符合 |
| MD5加密 | `MessageDigest.getInstance("MD5")` | ✅ 符合 |
| 转32位 | 16字节 × 2 = 32位十六进制 | ✅ 符合 |
| 转大写 | `.toUpperCase()` | ✅ 符合 |

### 代码质量
- ✅ 逻辑清晰
- ✅ 注释完整
- ✅ 错误处理完善
- ✅ 编码规范（UTF-8）
- ✅ 补零处理正确

---

## 实际调用验证

### 调用链路
```
HosPreDrugOrderServiceImpl.viewLogistics()
    ↓
Kuaidi100Util.queryLogistics(url, customer, key, expressCode, shippingNo)
    ↓
calculateSign(param, key, customer)
    ↓
返回32位大写MD5签名
```

### 日志输出示例
```
2026-01-18 10:00:00.123 INFO  - ========== 快递100 API 请求开始 ==========
2026-01-18 10:00:00.123 INFO  - 请求URL: http://poll.kuaidi100.com/poll/query.do
2026-01-18 10:00:00.123 INFO  - 请求方法: POST
2026-01-18 10:00:00.123 INFO  - Content-Type: application/x-www-form-urlencoded
2026-01-18 10:00:00.123 INFO  - 请求参数:
2026-01-18 10:00:00.123 INFO  -   - param: {"com":"yunda","num":"YT1234567890","resultv2":"1"}
2026-01-18 10:00:00.123 INFO  -   - customer: 5727072A955414A4C8AC79D5F33DB7F6
2026-01-18 10:00:00.123 INFO  -   - sign: [32位大写MD5字符串]
2026-01-18 10:00:00.123 INFO  - 快递信息:
2026-01-18 10:00:00.123 INFO  -   - 快递公司编码: yunda
2026-01-18 10:00:00.123 INFO  -   - 快递单号: YT1234567890
2026-01-18 10:00:00.123 INFO  - ==========================================
```

从日志可以看到，签名会被打印出来，可以验证其格式是否为32位大写。

---

## 补充说明

### 关于"不加'+'号"的理解

**正确理解**:
```java
// Java代码
String signStr = param + key + customer;

// 如果 param = "abc", key = "def", customer = "ghi"
// 结果: signStr = "abcdefghi"  ✅ 正确
// 而不是: signStr = "abc+def+ghi"  ❌ 错误
```

**错误理解**:
```java
// 错误示例（如果有人误解为需要添加"+"字符）
String signStr = param + "+" + key + "+" + customer;  // ❌ 这是错误的
// 结果: signStr = "abc+def+ghi"  ❌ 这会导致签名错误
```

**我们的实现**: 使用 `param + key + customer`，这是正确的直接拼接方式。

---

## 最终结论

✅ **当前实现完全符合要求**

签名计算逻辑严格按照以下规则实现：
1. ✅ 拼接顺序: param + key + customer
2. ✅ 直接拼接，不添加任何分隔符（包括"+"号）
3. ✅ 使用MD5算法加密
4. ✅ 转换为32位十六进制字符串
5. ✅ 转换为大写

**代码无需修改，可以直接使用。**

---

**验证人**: Kiro AI Assistant  
**验证日期**: 2026-01-18  
**验证结果**: ✅ 完全符合要求  
**文档版本**: 1.0
