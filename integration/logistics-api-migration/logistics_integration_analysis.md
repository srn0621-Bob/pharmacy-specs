# 物流信息集成分析报告

## 概述

本文档详细分析了互联网医院系统中物流信息的显示逻辑、数据来源以及第三方API集成方案。

---

## 一、Patient App 物流信息显示逻辑

### 1.1 主要界面

#### ExpressActivity - 物流详情页面
- **文件路径**: `mshlwyy_patient/app/src/main/java/com/adinnet/demo/ui/mine/order/ExpressActivity.java`
- **功能**: 专门的物流详情页面，显示物流跟踪信息列表
- **UI特点**:
  - 使用RecyclerView展示物流信息时间线
  - 最新的物流状态用蓝色圆点标识
  - 历史记录用灰色圆点
  - 每条记录显示时间和状态描述

#### OrderDetailActivity - 订单详情页面
- **文件路径**: `mshlwyy_patient/app/src/main/java/com/adinnet/demo/mall/view/OrderDetailActivity.java`
- **功能**: 订单详情页面中显示物流信息摘要
- **显示内容**:
  - 快递单号
  - 物流状态（运输中/已送达）

### 1.2 数据获取接口

**API定义** (`ApiService.java`):
```java
@POST("prescription/drug/viewLogistics")
Observable<BaseResponse<List<LogisticsEntity>>> getLogisticsData(@Body ReqOrderDetail req);
```

- **接口路径**: `POST /prescription/drug/viewLogistics`
- **请求参数**: `ReqOrderDetail`（包含订单号orderNum）
- **返回数据**: `List<LogisticsEntity>`（物流信息列表）

### 1.3 数据模型

#### LogisticsEntity - 物流信息实体
```java
public class LogisticsEntity {
    public int processNo;        // 物流流程编号
    public String processTime;   // 物流时间（如：2016-08-25 21:13:27）
    public String processRemark; // 物流状态描述（如：货物已完成配送）
}
```

#### DrugOrder - 订单模型中的物流字段
```java
private String logisticsNumber;  // 快递单号
private String status;           // 订单状态（已发货/已送达等）
```

### 1.4 数据流程

```
用户操作
  ↓
点击"查看物流"按钮
  ↓
跳转到 ExpressActivity
  ↓
ExpressPresenter.loadData()
  ↓
Api.getLogisticsData(orderNum)
  ↓
后端 /prescription/drug/viewLogistics
  ↓
返回物流信息列表
  ↓
RecyclerView 展示物流时间线
```

---

## 二、后端物流信息获取逻辑

### 2.1 第三方物流服务商

**服务商**: 易药购（yiyaogo.com）

### 2.2 配置信息

#### 配置文件位置
`internet-hospital/adinnet-patient-api/src/main/resources/application-*.properties`

#### 开发环境配置 (application-dev.properties)
```properties
# 测试环境配置
prescription.appId=32411234132020411A3002
prescription.appsecret=d4a87ba5-b747-44d3-9caf-bf63d965af19
prescription.reqUrl=https://www.yiyaogo.com/apitest/prescriptionService/addSingle
prescription.reqsUrl=https://www.yiyaogo.com/apitest/logisticsService/fetchLogisticsProcess
```

#### 生产环境配置 (application-prod.properties)
```properties
# 正式环境配置
prescription.appId=PDY01285431010119A1002
prescription.appsecret=59747aa6-a717-4e14-aa11-01111f5e4b40
prescription.reqUrl=https://www.yiyaogo.com/api/prescriptionService/addSingle
prescription.reqsUrl=https://www.yiyaogo.com/api/logisticsService/fetchLogisticsProcess
```

#### 配置类 (PrescriptionProperties.java)
```java
@Component
@ConfigurationProperties(prefix = "prescription")
public class PrescriptionProperties {
    private String appId;        // 应用ID
    private String appsecret;    // 应用密钥
    private String reqUrl;       // 处方接口URL
    private String reqsUrl;      // 物流接口URL
}
```

### 2.3 接口调用流程

#### 2.3.1 Controller层
**文件**: `HosPrescriptionController.java`

```java
@PostMapping("/drug/viewLogistics")
public JsonResult viewLogistics(@RequestBody Map<String, Object> map) {
    if (null == map.get("orderNum") || "".equals(map.get("orderNum"))) {
        return JsonResult.error("药品单号不能为空");
    }
    List logistics = hosPreDrugOrderService.viewLogistics((String) map.get("orderNum"));
    return JsonResult.ok().put("data", logistics);
}
```

- **接口路径**: `POST /api/v1/prescription/drug/viewLogistics`
- **请求参数**: `{ "orderNum": "订单号" }`
- **返回格式**: `{ "code": 0, "data": [...] }`

#### 2.3.2 Service层
**文件**: `HosPreDrugOrderServiceImpl.java`

```java
@Override
public List viewLogistics(String orderNum) throws Exception {
    List returnArray = Lists.newArrayList();
    
    // 1. 查询订单是否存在
    QueryWrapper<HosPreDrugOrder> wrapper = new QueryWrapper<>();
    wrapper.eq("order_num", orderNum);
    HosPreDrugOrder preDrugOrder = hosPreDrugOrderMapper.selectOne(wrapper);
    
    if (null == preDrugOrder) {
        throw new BizException("该订单不存在!");
    }
    
    // 2. 调用第三方物流接口
    JSONObject jsonObject = hospitalPrescriptionUtil.prescriptionLogistics(
        prescriptionProperties.getReqsUrl(),
        prescriptionProperties.getAppId(),
        prescriptionProperties.getAppsecret(),
        orderNum, 
        null, 
        "上海名士汇互联网医院"
    );
    
    // 3. 解析返回结果
    String code = jsonObject.get("code").toString();
    if ("0".equals(code)) {
        return (List) jsonObject.get("result");
    }
    
    return returnArray;
}
```

### 2.4 第三方API调用实现

#### 2.4.1 工具类
**文件**: `HospitalPrescriptionUtil.java`

#### 2.4.2 请求参数
```json
{
  "prescripNo": "订单号",
  "prescribeDate": "处方日期（可选）",
  "hospitalName": "上海名士汇互联网医院"
}
```

#### 2.4.3 请求头
```
ACCESS_APPID: 应用ID
ACCESS_TIMESTAMP: 时间戳（毫秒）
ACCESS_SIGANATURE: 签名（SHA-512加密）
```

#### 2.4.4 签名算法
**文件**: `AppSiganatureUtils.java`

```java
public static String createSiganature(String data, String appid, String appSecret, long timestamp) {
    // 签名明文格式
    String plain = appid + "@$@" + appSecret + "@$@" + data + "@$@" + timestamp + "@$@" + appSecret + "@$@" + appid;
    
    // 使用SHA-512加密
    String signature = encrypt(plain, "SHA-512");
    
    return signature;
}
```

**签名规则**:
- 分隔符: `@$@`
- 明文格式: `appid@$@appSecret@$@data@$@timestamp@$@appSecret@$@appid`
- 加密算法: SHA-512
- 输出格式: 十六进制字符串

#### 2.4.5 HTTP请求实现
```java
public JSONObject prescriptionLogistics(String REQS_URL, String ACCESS_APPID, 
                                       String APP_SECRET, String prescripNo, 
                                       String prescribeDate, String hospitalName) throws Exception {
    TIMESTAMP = System.currentTimeMillis();
    
    // 构建请求体
    JSONObject jsonObject = new JSONObject();
    jsonObject.put("prescripNo", prescripNo);
    jsonObject.put("prescribeDate", prescribeDate);
    jsonObject.put("hospitalName", hospitalName);
    String data = jsonObject.toString();
    
    // 生成签名
    String signature = AppSiganatureUtils.createSiganature(data, ACCESS_APPID, APP_SECRET, TIMESTAMP);
    
    // 发送HTTP POST请求
    String response = Request.Post(REQS_URL)
        .setHeader("ACCESS_APPID", ACCESS_APPID)
        .setHeader("ACCESS_TIMESTAMP", String.valueOf(TIMESTAMP))
        .setHeader("ACCESS_SIGANATURE", signature)
        .bodyString(data, ContentType.APPLICATION_JSON)
        .execute().returnContent().asString();
    
    // 解析响应
    JSONObject json = JSONObject.parseObject(response);
    return json;
}
```

### 2.5 返回数据格式

#### 第三方API响应格式
```json
{
  "code": "0",
  "message": "success",
  "result": [
    {
      "processNo": 1,
      "processTime": "2016-08-25 21:13:27",
      "processRemark": "货物已完成配送，感谢您选择京东配送"
    },
    {
      "processNo": 2,
      "processTime": "2016-08-25 18:30:00",
      "processRemark": "快递员正在派送中"
    },
    {
      "processNo": 3,
      "processTime": "2016-08-25 10:00:00",
      "processRemark": "快件已到达目的地城市"
    }
  ]
}
```

**字段说明**:
- `code`: 状态码，"0"表示成功
- `message`: 响应消息
- `result`: 物流信息数组
  - `processNo`: 物流流程编号
  - `processTime`: 物流时间
  - `processRemark`: 物流状态描述

---

## 三、完整数据流向图

```
┌─────────────────┐
│  Patient App    │
│  (Android)      │
└────────┬────────┘
         │ POST /prescription/drug/viewLogistics
         │ { "orderNum": "P20201111132349005" }
         ↓
┌─────────────────────────────────────┐
│  HosPrescriptionController          │
│  (internet-hospital/patient-api)    │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  HosPreDrugOrderServiceImpl         │
│  - 验证订单是否存在                   │
│  - 调用物流工具类                     │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  HospitalPrescriptionUtil           │
│  - 构建请求参数                       │
│  - 生成签名                          │
│  - 发送HTTP请求                      │
└────────┬────────────────────────────┘
         │ POST https://www.yiyaogo.com/api/logisticsService/fetchLogisticsProcess
         │ Headers:
         │   ACCESS_APPID: PDY01285431010119A1002
         │   ACCESS_TIMESTAMP: 1609459200000
         │   ACCESS_SIGANATURE: abc123...
         │ Body:
         │   { "prescripNo": "P20201111132349005",
         │     "hospitalName": "上海名士汇互联网医院" }
         ↓
┌─────────────────────────────────────┐
│  易药购物流服务                       │
│  (yiyaogo.com)                      │
└────────┬────────────────────────────┘
         │ Response:
         │ { "code": "0",
         │   "result": [
         │     { "processNo": 1,
         │       "processTime": "2020-11-11 15:30:00",
         │       "processRemark": "货物已签收" }
         │   ]
         │ }
         ↓
┌─────────────────────────────────────┐
│  返回到 Patient App                  │
│  - ExpressActivity 展示物流时间线     │
└─────────────────────────────────────┘
```

---

## 四、安全机制

### 4.1 身份认证
- 使用 `appId` + `appSecret` 进行身份认证
- 不同环境使用不同的认证凭据（测试/生产）

### 4.2 签名机制
- **算法**: SHA-512
- **目的**: 防止数据篡改
- **签名内容**: 包含appId、appSecret、请求数据、时间戳

### 4.3 防重放攻击
- 签名中包含时间戳
- 服务端可验证请求时效性

### 4.4 HTTPS传输
- 所有API调用使用HTTPS协议
- 保证传输过程中的数据安全

---

## 五、关键文件清单

### 5.1 Android端
| 文件路径 | 说明 |
|---------|------|
| `mshlwyy_patient/app/src/main/java/com/adinnet/demo/ui/mine/order/ExpressActivity.java` | 物流详情页面 |
| `mshlwyy_patient/app/src/main/java/com/adinnet/demo/ui/mine/order/ExpressPresenter.java` | 物流数据加载逻辑 |
| `mshlwyy_patient/app/src/main/java/com/adinnet/demo/bean/LogisticsEntity.java` | 物流数据模型 |
| `mshlwyy_patient/app/src/main/java/com/adinnet/demo/api/ApiService.java` | API接口定义 |
| `mshlwyy_patient/app/src/main/res/layout/activity_express.xml` | 物流页面布局 |
| `mshlwyy_patient/app/src/main/res/layout/item_logistics.xml` | 物流项布局 |

### 5.2 后端
| 文件路径 | 说明 |
|---------|------|
| `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/controller/HosPrescriptionController.java` | 物流接口Controller |
| `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/service/impl/HosPreDrugOrderServiceImpl.java` | 物流业务逻辑Service |
| `internet-hospital/adinnet-common/src/main/java/com/adinnet/common/utils/HospitalPrescriptionUtil.java` | 第三方API调用工具类 |
| `internet-hospital/adinnet-common/src/main/java/com/adinnet/common/utils/AppSiganatureUtils.java` | 签名工具类 |
| `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/common/config/properties/PrescriptionProperties.java` | 配置类 |
| `internet-hospital/adinnet-patient-api/src/main/resources/application-dev.properties` | 开发环境配置 |
| `internet-hospital/adinnet-patient-api/src/main/resources/application-prod.properties` | 生产环境配置 |

---

## 六、API接口文档

### 6.1 内部API

#### 查看物流信息
- **接口**: `POST /api/v1/prescription/drug/viewLogistics`
- **请求参数**:
```json
{
  "orderNum": "订单号"
}
```
- **响应示例**:
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "processNo": 1,
      "processTime": "2020-11-11 15:30:00",
      "processRemark": "货物已签收"
    }
  ]
}
```

### 6.2 第三方API

#### 易药购物流查询接口
- **测试环境**: `https://www.yiyaogo.com/apitest/logisticsService/fetchLogisticsProcess`
- **生产环境**: `https://www.yiyaogo.com/api/logisticsService/fetchLogisticsProcess`
- **请求方式**: POST
- **Content-Type**: application/json
- **请求头**:
  - `ACCESS_APPID`: 应用ID
  - `ACCESS_TIMESTAMP`: 时间戳（毫秒）
  - `ACCESS_SIGANATURE`: 签名
- **请求体**:
```json
{
  "prescripNo": "处方单号",
  "prescribeDate": "处方日期（可选）",
  "hospitalName": "医院名称"
}
```
- **响应格式**:
```json
{
  "code": "0",
  "message": "success",
  "result": [
    {
      "processNo": 1,
      "processTime": "2020-11-11 15:30:00",
      "processRemark": "物流状态描述"
    }
  ]
}
```

---

## 七、总结

### 7.1 技术架构特点
1. **前后端分离**: Android客户端通过RESTful API获取数据
2. **第三方集成**: 使用易药购提供的物流查询服务
3. **配置化管理**: 通过配置文件管理不同环境的接口地址和认证信息
4. **安全机制**: 采用签名机制保证API调用安全

### 7.2 优点
- 架构清晰，职责分明
- 配置灵活，支持多环境部署
- 安全性高，使用签名防篡改
- 易于维护和扩展

### 7.3 改进建议
1. 考虑添加物流信息缓存机制，减少第三方API调用
2. 增加物流查询失败的重试机制
3. 添加物流信息变更的推送通知功能
4. 考虑记录第三方API调用日志，便于问题排查

---

**文档版本**: 1.0  
**创建日期**: 2026-01-17  
**最后更新**: 2026-01-17
