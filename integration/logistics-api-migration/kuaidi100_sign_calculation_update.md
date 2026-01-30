# 快递100签名计算方式更新

## 更新日期
2026-01-17 (初版)  
2026-01-18 (逻辑验证更新)

## 更新原因
根据快递100 API文档要求，`sign`参数不应该是配置文件中的固定值，而应该使用MD5算法动态计算。

## 实现状态
✅ **已完成并验证** - 所有代码已实现，编译通过，逻辑正确

## 签名算法

### 计算公式
```
sign = MD5(param + key + customer).toUpperCase()
```

### 参数说明
- **param**: JSON字符串，例如 `{"com":"yunda","num":"123456789","resultv2":"1"}`
- **key**: 密钥，从配置文件读取 (`kuaidi100.key`)
- **customer**: 授权码，从配置文件读取 (`kuaidi100.customer`)
- **拼接规则**: 三个字符串直接拼接，不添加任何分隔符（不加"+"号）
- **MD5结果**: 必须转换为32位大写十六进制字符串

### 实际配置值（开发环境）
```properties
kuaidi100.url=http://poll.kuaidi100.com/poll/query.do
kuaidi100.customer=5727072A955414A4C8AC79D5F33DB7F6
kuaidi100.key=B19DB55FF14E35488D780C172E19DF99
```

### 计算示例
```java
// 输入
String param = "{\"com\":\"yunda\",\"num\":\"123456789\",\"resultv2\":\"1\"}";
String key = "B19DB55FF14E35488D780C172E19DF99";
String customer = "5727072A955414A4C8AC79D5F33DB7F6";

// 拼接
String signStr = param + key + customer;
// 结果: {"com":"yunda","num":"123456789","resultv2":"1"}B19DB55FF14E35488D780C172E19DF995727072A955414A4C8AC79D5F33DB7F6

// MD5计算并转大写
String sign = MD5(signStr).toUpperCase();
// 结果: 32位大写十六进制字符串
```

## 修改内容

### 1. 配置文件更新

#### application-dev.properties
**修改前**:
```properties
kuaidi100.customer=5727072A955414A4C8AC79D5F33DB7F6
kuaidi100.sign=rXqLHunf9335
```

**修改后**:
```properties
kuaidi100.customer=5727072A955414A4C8AC79D5F33DB7F6
kuaidi100.key=B19DB55FF14E35488D780C172E19DF99
```

#### application-prod.properties
**修改前**:
```properties
kuaidi100.customer=PRODUCTION_CUSTOMER_VALUE
kuaidi100.sign=PRODUCTION_SIGN_VALUE
```

**修改后**:
```properties
kuaidi100.customer=PRODUCTION_CUSTOMER_VALUE
kuaidi100.key=PRODUCTION_KEY_VALUE
```

### 2. Kuaidi100Properties.java
**修改前**:
```java
private String sign;

public String getSign() {
    return sign;
}

public void setSign(String sign) {
    this.sign = sign;
}
```

**修改后**:
```java
private String key;

public String getKey() {
    return key;
}

public void setKey(String key) {
    this.key = key;
}
```

### 3. Kuaidi100Util.java

#### 方法签名修改
**修改前**:
```java
public static List<Map<String, Object>> queryLogistics(
        String url, String customer, String sign, String com, String num)
```

**修改后**:
```java
public static List<Map<String, Object>> queryLogistics(
        String url, String customer, String key, String com, String num)
```

#### 新增签名计算方法
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
        String signStr = param + key + customer;
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(signStr.getBytes("UTF-8"));
        
        // 转换为32位大写十六进制字符串
        StringBuilder hexString = new StringBuilder();
        for (byte b : digest) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        
        return hexString.toString().toUpperCase();
    } catch (Exception e) {
        log.error("计算签名失败: error={}", e.getMessage(), e);
        throw new RuntimeException("计算签名失败", e);
    }
}
```

#### queryLogistics方法更新
在构建表单参数之前，动态计算签名：
```java
// 1. 构建param参数
JSONObject paramJson = new JSONObject();
paramJson.put("com", com);
paramJson.put("num", num);
paramJson.put("resultv2", "1");
String param = paramJson.toJSONString();

// 2. 计算签名: MD5(param + key + customer)转32位大写
String sign = calculateSign(param, key, customer);

// 3. 构建表单参数
Form form = Form.form()
    .add("param", param)
    .add("customer", customer)
    .add("sign", sign);

// 4. 打印请求详情（包含签名）
log.info("========== 快递100 API 请求开始 ==========");
log.info("请求URL: {}", url);
log.info("请求方法: POST");
log.info("Content-Type: application/x-www-form-urlencoded");
log.info("请求参数:");
log.info("  - param: {}", param);
log.info("  - customer: {}", customer);
log.info("  - sign: {}", sign);
log.info("快递信息:");
log.info("  - 快递公司编码: {}", com);
log.info("  - 快递单号: {}", num);
log.info("==========================================");

// 5. 发送HTTP请求
String response = Request.Post(url)
    .connectTimeout(5000)
    .socketTimeout(10000)
    .bodyForm(form.build())
    .execute().returnContent().asString();
```

#### 新增import
```java
import java.security.MessageDigest;
```

**✅ 验证结果**: 
- 代码已实现并编译通过
- 日志打印包含完整的请求参数和计算的签名
- 签名计算逻辑正确

### 4. HosPreDrugOrderServiceImpl.java
**修改前**:
```java
List<Map<String, Object>> logistics = Kuaidi100Util.queryLogistics(
    kuaidi100Properties.getUrl(),
    kuaidi100Properties.getCustomer(),
    kuaidi100Properties.getSign(),
    expressCompany,
    logisticsNumber
);
```

**修改后**:
```java
List<Map<String, Object>> logistics = Kuaidi100Util.queryLogistics(
    kuaidi100Properties.getUrl(),
    kuaidi100Properties.getCustomer(),
    kuaidi100Properties.getKey(),
    expressCompany,
    logisticsNumber
);
```

## 验证方法

### 1. 代码编译验证
✅ **已验证** - 所有修改的文件均已通过编译检查，无语法错误。

### 2. 签名计算验证
✅ **已实现** - 可以通过日志查看计算的签名值：
```
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 请求开始 ==========
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求URL: http://poll.kuaidi100.com/poll/query.do
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求方法: POST
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - Content-Type: application/x-www-form-urlencoded
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求参数:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - param: {"com":"yunda","num":"YT1234567890","resultv2":"1"}
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - customer: 5727072A955414A4C8AC79D5F33DB7F6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - sign: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 快递信息:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递公司编码: yunda
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递单号: YT1234567890
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
```

### 3. API调用验证
待测试项目：
- 调用物流查询接口 `POST /api/v1/prescription/drug/viewLogistics`
- 检查快递100 API返回状态码为200
- 验证物流数据正常返回

### 4. 逻辑验证清单
✅ **配置文件**: `kuaidi100.key` 已正确配置  
✅ **Properties类**: `Kuaidi100Properties.java` 包含 `key` 字段  
✅ **签名计算**: `calculateSign()` 方法实现正确  
✅ **方法调用**: `queryLogistics()` 使用 `key` 参数而非 `sign`  
✅ **Service层**: `HosPreDrugOrderServiceImpl` 传递 `getKey()` 而非 `getSign()`  
✅ **日志打印**: 完整的请求和响应日志已实现  
✅ **错误处理**: 签名计算失败会抛出 RuntimeException

## 影响范围

### 修改的文件
1. `internet-hospital/adinnet-patient-api/src/main/resources/application-dev.properties`
2. `internet-hospital/adinnet-patient-api/src/main/resources/application-prod.properties`
3. `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/common/config/properties/Kuaidi100Properties.java`
4. `internet-hospital/adinnet-common/src/main/java/com/adinnet/common/utils/Kuaidi100Util.java`
5. `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/service/impl/HosPreDrugOrderServiceImpl.java`
6. `internet-hospital/docs/kuaidi100_migration_implementation.md`

### 需要重新部署的模块
- adinnet-common
- adinnet-patient-api

## 部署注意事项

1. **生产环境配置**: 确保`application-prod.properties`中的`kuaidi100.key`值正确
2. **配置安全**: key值是敏感信息，不应提交到版本控制系统
3. **日志监控**: 部署后监控日志，确认签名计算正确且API调用成功
4. **回归测试**: 测试物流查询功能是否正常工作

## 技术细节

### MD5算法实现
使用Java标准库`java.security.MessageDigest`实现MD5计算：
- 输入: UTF-8编码的字符串
- 输出: 32位大写十六进制字符串
- 线程安全: 每次调用创建新的MessageDigest实例

### 错误处理
- 如果MD5计算失败，抛出RuntimeException
- 记录详细错误日志
- 不影响系统其他功能

## 测试建议

### 单元测试
```java
@Test
public void testCalculateSign() {
    String param = "{\"com\":\"yunda\",\"num\":\"123456789\",\"resultv2\":\"1\"}";
    String key = "B19DB55FF14E35488D780C172E19DF99";
    String customer = "5727072A955414A4C8AC79D5F33DB7F6";
    
    String sign = Kuaidi100Util.calculateSign(param, key, customer);
    
    // 验证签名格式
    assertNotNull(sign);
    assertEquals(32, sign.length());
    assertTrue(sign.matches("[A-F0-9]{32}"));
}
```

### 集成测试
1. 使用真实的快递单号调用API
2. 验证返回的物流信息正确
3. 检查日志中的签名值

## 完成状态

✅ **所有代码修改已完成**  
✅ **所有文件编译通过**  
✅ **逻辑验证完成**  
✅ **文档已更新**  
✅ **详细日志已实现**  
⏳ **待生产环境测试**

## 实现验证总结

### 已验证的实现细节

1. **配置正确性**
   - ✅ `application-dev.properties` 包含 `kuaidi100.key=B19DB55FF14E35488D780C172E19DF99`
   - ✅ `Kuaidi100Properties.java` 包含 `key` 字段及 getter/setter

2. **签名计算逻辑**
   - ✅ `calculateSign()` 方法实现正确
   - ✅ 拼接顺序: `param + key + customer`
   - ✅ MD5 计算使用 UTF-8 编码
   - ✅ 结果转换为32位大写十六进制

3. **方法调用链**
   - ✅ `HosPreDrugOrderServiceImpl` → `Kuaidi100Util.queryLogistics()`
   - ✅ 传递参数: `url, customer, key, expressCode, shippingNo`
   - ✅ 参数顺序和类型正确

4. **日志实现**
   - ✅ 请求日志包含: URL, 方法, Content-Type, 参数, 快递信息
   - ✅ 响应日志包含: 完整响应内容
   - ✅ 成功日志包含: 物流轨迹数量
   - ✅ 错误日志包含: 错误类型, 状态码, 错误消息, 异常堆栈

5. **错误处理**
   - ✅ 签名计算失败抛出 RuntimeException
   - ✅ 网络异常返回空列表
   - ✅ API错误返回空列表
   - ✅ 所有异常都有详细日志

### 与文档的一致性

本文档描述的所有实现细节已与实际代码进行对比验证，确认完全一致：
- 签名算法公式正确
- 代码实现与文档描述匹配
- 配置文件内容准确
- 方法调用链路正确

---

**文档版本**: 2.0  
**创建日期**: 2026-01-17  
**更新日期**: 2026-01-18  
**作者**: System  
**验证者**: Kiro AI Assistant
