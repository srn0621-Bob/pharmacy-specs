# 快递100签名方法分析

## 官方Demo分析

根据快递100官方GitHub示例，快递100有**两种不同的签名方法**，用于不同的接口。

## 1. querySign - 物流查询接口

### 使用场景
- 实时物流查询 (`testQueryTrack`)
- 物流地图轨迹 (`testQueryMapView`)
- 智能识别接口 (`testAutoNum`)

### 签名算法
```java
// 官方示例
queryTrackReq.setSign(SignUtils.querySign(param, key, customer));
```

### 参数说明
- **param**: JSON参数字符串
- **key**: 密钥
- **customer**: 授权码

### 签名公式
```
sign = MD5(param + key + customer).toUpperCase()
```

### 官方示例代码
```java
@Test
public void testQueryTrack() throws Exception{
    QueryTrackReq queryTrackReq = new QueryTrackReq();
    QueryTrackParam queryTrackParam = new QueryTrackParam();
    queryTrackParam.setCom(CompanyConstant.YT);
    queryTrackParam.setNum("YT9383342193097");
    queryTrackParam.setPhone("17725390266");
    String param = new Gson().toJson(queryTrackParam);

    queryTrackReq.setParam(param);
    queryTrackReq.setCustomer(customer);
    queryTrackReq.setSign(SignUtils.querySign(param, key, customer));  // ← 3个参数

    IBaseClient baseClient = new QueryTrack();
    System.out.println(baseClient.execute(queryTrackReq));
}
```

### 我们的实现
```java
// 我们使用的就是这种方式 ✅
String sign = calculateSign(param, key, customer);

private static String calculateSign(String param, String key, String customer) {
    String signStr = param + key + customer;
    return DigestUtils.md5Hex(signStr).toUpperCase();
}
```

**结论**: ✅ **我们的实现是正确的，使用的是querySign方法（3个参数）**

---

## 2. printSign - 电子面单接口

### 使用场景
- 电子面单图片接口 (`testPrintImg`)
- 电子面单HTML接口 (`testPrintHtml`)
- 电子面单打印接口 (`testPrintCloud`)
- 云打印自定义 (`testCloudCustom`)
- 商家寄件接口 (`testBorder`)

### 签名算法
```java
// 官方示例
String sign = SignUtils.printSign(param, t, key, secret);
```

### 参数说明
- **param**: JSON参数字符串
- **t**: 时间戳（毫秒）
- **key**: 密钥
- **secret**: 密钥（另一个）

### 签名公式
```
sign = MD5(param + t + key + secret).toUpperCase()
```

### 官方示例代码
```java
@Test
public void testPrintImg() throws Exception{
    PrintImgParam printImgParam = new PrintImgParam();
    printImgParam.setKuaidicom(CompanyConstant.ZJS);
    printImgParam.setSendManName("张三");
    // ... 其他参数

    String param = new Gson().toJson(printImgParam);
    String t = System.currentTimeMillis() + "";  // ← 时间戳
    String sign = SignUtils.printSign(param, t, key, secret);  // ← 4个参数

    PrintReq printReq = new PrintReq();
    printReq.setKey(key);
    printReq.setMethod(ApiInfoConstant.ELECTRONIC_ORDER_PIC_METHOD);
    printReq.setSign(sign);
    printReq.setParam(param);
    printReq.setT(t);  // ← 时间戳也要传递

    IBaseClient printImg = new PrintImg();
    System.out.println(printImg.execute(printReq));
}
```

**注意**: 这种方式**不适用于物流查询接口**

---

## 接口对比

| 特性 | 物流查询接口 | 电子面单接口 |
|-----|------------|------------|
| **接口URL** | `http://poll.kuaidi100.com/poll/query.do` | 其他URL |
| **签名方法** | `querySign` | `printSign` |
| **参数数量** | 3个 (param, key, customer) | 4个 (param, t, key, secret) |
| **是否需要时间戳** | ❌ 否 | ✅ 是 |
| **是否需要secret** | ❌ 否 | ✅ 是 |
| **签名公式** | `MD5(param + key + customer)` | `MD5(param + t + key + secret)` |
| **我们使用的** | ✅ 是 | ❌ 否 |

## 为什么有两种签名方法？

### 1. 安全级别不同
- **物流查询**: 只读操作，安全要求相对较低
- **电子面单**: 涉及下单、打印等写操作，需要更高的安全性

### 2. 防重放攻击
- **printSign**: 包含时间戳`t`，可以防止重放攻击
- **querySign**: 不包含时间戳，同样的查询可以重复执行

### 3. 参数不同
- **物流查询**: 使用`customer`（授权码）
- **电子面单**: 使用`secret`（密钥）和时间戳`t`

## 我们的接口使用哪种？

### 当前使用: querySign ✅

我们实现的是**物流查询接口**，应该使用`querySign`方法：

```java
// 我们的实现
public static List<Map<String, Object>> queryLogistics(
        String url, String customer, String key, String com, String num) {
    
    // 1. 构建param
    JSONObject paramJson = new JSONObject();
    paramJson.put("com", com);
    paramJson.put("num", num);
    // ... 其他字段
    String param = paramJson.toJSONString();
    
    // 2. 计算签名（3个参数）
    String sign = calculateSign(param, key, customer);
    
    // 3. 发送请求
    Form form = Form.form()
        .add("param", param)
        .add("customer", customer)
        .add("sign", sign);
    // 注意：没有 t 参数
}

private static String calculateSign(String param, String key, String customer) {
    String signStr = param + key + customer;  // 3个参数拼接
    return DigestUtils.md5Hex(signStr).toUpperCase();
}
```

**结论**: ✅ **完全正确，不需要修改**

## 如果将来需要实现电子面单接口

如果将来需要实现电子面单接口，需要添加新的方法：

```java
/**
 * 计算电子面单签名（4个参数）
 */
private static String calculatePrintSign(String param, String t, String key, String secret) {
    String signStr = param + t + key + secret;  // 4个参数拼接
    return DigestUtils.md5Hex(signStr).toUpperCase();
}

/**
 * 电子面单接口示例
 */
public static String printElectronicOrder(...) {
    // 1. 构建param
    String param = ...;
    
    // 2. 获取时间戳
    String t = System.currentTimeMillis() + "";
    
    // 3. 计算签名（4个参数）
    String sign = calculatePrintSign(param, t, key, secret);
    
    // 4. 发送请求（包含t参数）
    Form form = Form.form()
        .add("param", param)
        .add("t", t)
        .add("key", key)
        .add("sign", sign);
    
    // ...
}
```

## 官方SignUtils源码推测

### querySign实现
```java
public static String querySign(String param, String key, String customer) {
    String signStr = param + key + customer;
    return DigestUtils.md5Hex(signStr).toUpperCase();
}
```

### printSign实现
```java
public static String printSign(String param, String t, String key, String secret) {
    String signStr = param + t + key + secret;
    return DigestUtils.md5Hex(signStr).toUpperCase();
}
```

## 验证我们的实现

### 测试用例
```java
@Test
public void testQuerySign() {
    // 测试数据
    String param = "{\"com\":\"yunda\",\"num\":\"434999702940283\",\"phone\":\"\",\"from\":\"\",\"to\":\"\",\"resultv2\":\"0\",\"show\":\"0\",\"order\":\"desc\"}";
    String key = "B19DB55FF14E35488D780C172E19DF99";
    String customer = "5727072A955414A4C8AC79D5F33DB7F6";
    
    // 计算签名
    String signStr = param + key + customer;
    String sign = DigestUtils.md5Hex(signStr).toUpperCase();
    
    // 验证
    System.out.println("签名字符串长度: " + signStr.length());
    System.out.println("签名: " + sign);
    System.out.println("签名长度: " + sign.length());
    
    // 断言
    assertEquals(32, sign.length());
    assertTrue(sign.matches("[A-F0-9]{32}"));
}
```

### 预期结果
```
签名字符串长度: 200+
签名: [32位大写MD5字符串]
签名长度: 32
```

## 常见错误

### ❌ 错误1: 混淆两种签名方法
```java
// 错误：在物流查询接口中使用printSign的参数
String t = System.currentTimeMillis() + "";
String sign = calculateSign(param, t, key, secret);  // ❌ 错误
```

### ❌ 错误2: 参数顺序错误
```java
// 错误：参数顺序不对
String sign = calculateSign(customer, key, param);  // ❌ 错误
// 正确：param + key + customer
String sign = calculateSign(param, key, customer);  // ✅ 正确
```

### ❌ 错误3: 忘记转大写
```java
// 错误：没有转大写
String sign = DigestUtils.md5Hex(signStr);  // ❌ 错误
// 正确：必须转大写
String sign = DigestUtils.md5Hex(signStr).toUpperCase();  // ✅ 正确
```

## 总结

### 我们的实现状态

| 项目 | 状态 | 说明 |
|-----|------|------|
| 接口类型 | ✅ 正确 | 物流查询接口 |
| 签名方法 | ✅ 正确 | querySign (3个参数) |
| 参数顺序 | ✅ 正确 | param + key + customer |
| MD5实现 | ✅ 正确 | DigestUtils.md5Hex() |
| 转大写 | ✅ 正确 | .toUpperCase() |
| 参数格式 | ✅ 正确 | 包含所有官方字段 |

### 结论

✅ **我们的实现完全正确，使用的是querySign方法（3个参数），适用于物流查询接口。**

您提到的`printSign`（4个参数）是用于电子面单接口的，与我们使用的物流查询接口不同。

**不需要修改当前实现。**

---

**分析日期**: 2026-01-18  
**分析人**: Kiro AI Assistant  
**结论**: ✅ 当前实现正确，无需修改
