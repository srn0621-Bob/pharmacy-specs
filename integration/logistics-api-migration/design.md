# 设计文档 - 物流API迁移到快递100

## 概述

本设计文档描述了将互联网医院系统的物流查询服务从易药购迁移到快递100的技术实现方案。设计目标是在不影响Android客户端的前提下，完成后端物流API的切换，确保系统能够通过快递100获取实时物流信息。

## 架构

### 系统架构图

```
┌─────────────────┐
│  Android App    │
│  (Patient)      │
└────────┬────────┘
         │ POST /prescription/drug/viewLogistics
         │ { "orderNum": "P20201111132349005" }
         ↓
┌─────────────────────────────────────┐
│  HosPrescriptionController          │
│  (不变)                              │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  HosPreDrugOrderServiceImpl         │
│  (修改: 调用新的工具类)               │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Kuaidi100Util (新增)               │
│  - 构建请求参数                       │
│  - 调用快递100 API                   │
│  - 转换响应数据                       │
└────────┬────────────────────────────┘
         │ POST http://poll.kuaidi100.com/poll/query.do
         │ Content-Type: application/x-www-form-urlencoded
         │ param={"com":"yunda","num":"123456789","resultv2":"1"}
         │ customer=12333
         │ sign=B19DB55FF14E35488D780C172E19DF99
         ↓
┌─────────────────────────────────────┐
│  快递100物流查询服务                  │
│  (poll.kuaidi100.com)               │
└─────────────────────────────────────┘
```

### 分层设计

1. **Controller层**: 保持不变，继续使用HosPrescriptionController
2. **Service层**: 修改HosPreDrugOrderServiceImpl，调用新的快递100工具类
3. **Util层**: 新增Kuaidi100Util工具类，封装快递100 API调用逻辑
4. **Config层**: 新增Kuaidi100Properties配置类，管理快递100认证参数

## 组件和接口

### 1. 配置组件

#### Kuaidi100Properties (新增)

```java
package com.patient.api.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "kuaidi100")
public class Kuaidi100Properties {
    private String url;        // API地址
    private String customer;   // 授权码
    private String sign;       // 签名
    
    // Getters and Setters
}
```

#### application-dev.properties (修改)

```properties
# 快递100配置
kuaidi100.url=http://poll.kuaidi100.com/poll/query.do
kuaidi100.customer=12333
kuaidi100.sign=B19DB55FF14E35488D780C172E19DF99
```

### 2. 工具类组件

#### Kuaidi100Util (新增)

```java
package com.adinnet.common.utils;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.JSONArray;
import org.apache.http.client.fluent.Request;
import org.apache.http.entity.ContentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Kuaidi100Util {
    private static final Logger logger = LoggerFactory.getLogger(Kuaidi100Util.class);
    
    /**
     * 查询物流信息
     * @param url 快递100 API地址
     * @param customer 授权码
     * @param sign 签名
     * @param com 快递公司编码
     * @param num 快递单号
     * @return 物流信息列表
     */
    public static List<Map<String, Object>> queryLogistics(
            String url, String customer, String sign, String com, String num) {
        // 实现逻辑见下文
    }
    
    /**
     * 转换快递100响应数据为系统格式
     * @param kuaidi100Data 快递100返回的data数组
     * @return LogisticsEntity格式的列表
     */
    private static List<Map<String, Object>> convertToLogisticsEntity(JSONArray kuaidi100Data) {
        // 实现逻辑见下文
    }
}
```

### 3. Service层修改

#### HosPreDrugOrderServiceImpl (修改)

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
    
    // 2. 获取快递单号和快递公司编码
    String logisticsNumber = preDrugOrder.getLogisticsNumber();
    String expressCompany = preDrugOrder.getExpressCompany(); // 新增字段
    
    if (StringUtils.isEmpty(logisticsNumber)) {
        throw new BizException("该订单暂无物流信息!");
    }
    
    // 默认使用韵达
    if (StringUtils.isEmpty(expressCompany)) {
        expressCompany = "yunda";
    }
    
    // 3. 调用快递100 API
    List<Map<String, Object>> logistics = Kuaidi100Util.queryLogistics(
        kuaidi100Properties.getUrl(),
        kuaidi100Properties.getCustomer(),
        kuaidi100Properties.getSign(),
        expressCompany,
        logisticsNumber
    );
    
    return logistics;
}
```

### 4. 数据库修改

#### t_hos_pre_drug_order表 (新增字段)

```sql
ALTER TABLE t_hos_pre_drug_order 
ADD COLUMN express_company VARCHAR(50) DEFAULT 'yunda' COMMENT '快递公司编码';
```

## 数据模型

### 快递100 API请求格式

```
POST http://poll.kuaidi100.com/poll/query.do
Content-Type: application/x-www-form-urlencoded

param={"com":"yunda","num":"123456789","resultv2":"1"}
&customer=12333
&sign=B19DB55FF14E35488D780C172E19DF99
```

**参数说明**:
- `param`: JSON字符串，包含快递公司编码、快递单号、返回版本
- `customer`: 授权码，从配置文件读取
- `sign`: 签名，从配置文件读取

### 快递100 API响应格式

```json
{
  "message": "ok",
  "state": "3",
  "status": "200",
  "condition": "F00",
  "ischeck": "1",
  "com": "yunda",
  "nu": "123456789",
  "data": [
    {
      "context": "货物已完成配送，感谢您选择京东配送",
      "time": "2016-08-25 21:13:27",
      "ftime": "2016-08-25 21:13:27",
      "status": "签收",
      "areaCode": "110000",
      "areaName": "北京市"
    },
    {
      "context": "快递员正在派送中",
      "time": "2016-08-25 18:30:00",
      "ftime": "2016-08-25 18:30:00",
      "status": "派件",
      "areaCode": "110000",
      "areaName": "北京市"
    }
  ]
}
```

**关键字段**:
- `message`: 响应消息
- `state`: 物流状态（0在途，1揽收，2疑难，3签收，4退签，5派件，8清关，14拒签）
- `status`: HTTP状态码
- `data`: 物流轨迹数组（倒序，最新的在前）
  - `context`: 物流描述 → 映射到processRemark
  - `ftime`: 格式化时间 → 映射到processTime
  - `status`: 物流状态名称
  - `areaName`: 地区名称

### 系统内部数据格式 (LogisticsEntity)

```json
[
  {
    "processNo": 1,
    "processTime": "2016-08-25 21:13:27",
    "processRemark": "货物已完成配送，感谢您选择京东配送"
  },
  {
    "processNo": 2,
    "processTime": "2016-08-25 18:30:00",
    "processRemark": "快递员正在派送中"
  }
]
```

### 数据转换映射

| 快递100字段 | LogisticsEntity字段 | 转换规则 |
|------------|-------------------|---------|
| data[i].context | processRemark | 直接映射 |
| data[i].ftime | processTime | 直接映射 |
| - | processNo | 从1开始递增编号 |

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: HTTP请求参数完整性

*对于任何*物流查询请求（给定任意快递公司编码和快递单号），发送到快递100的HTTP请求应该包含param、customer和sign三个参数，且param参数应该是有效的JSON字符串，包含com、num和resultv2字段

**验证: 需求 2.3, 2.4, 2.5**

### 属性 2: 数据转换完整性和正确性

*对于任何*快递100返回的data数组，转换后的LogisticsEntity列表应该满足：
- 列表长度等于data数组长度
- 每个元素包含processNo、processTime和processRemark三个字段
- processNo从1开始递增
- processTime映射自ftime字段
- processRemark映射自context字段
- 保持原有的倒序排列（最新的在前）

**验证: 需求 3.1, 3.2, 3.3, 3.4, 3.6**

### 属性 3: 错误处理的健壮性

*对于任何*错误情况（API调用失败、返回非200状态码、数据解析异常、空数据），系统应该：
- 返回空列表（非null）
- 不抛出未捕获的异常
- 记录相应的错误日志

**验证: 需求 2.7, 3.5, 6.1, 6.2, 6.3, 6.5**

### 属性 4: API响应格式兼容性

*对于任何*成功的物流查询，响应应该包含code字段和data字段，data字段中的每个元素都包含processNo、processTime和processRemark字段，且字段类型与迁移前一致

**验证: 需求 5.3, 5.4**

### 属性 5: 快递公司编码处理逻辑

*对于任何*订单的物流查询，系统应该：
- 如果订单包含非空的快递公司编码，则使用该编码
- 如果订单的快递公司编码为空或null，则使用默认编码"yunda"

**验证: 需求 7.2, 7.3**

## 错误处理

### 1. 网络错误

**场景**: 调用快递100 API时网络超时或连接失败

**处理策略**:
```java
try {
    String response = Request.Post(url)
        .connectTimeout(5000)
        .socketTimeout(10000)
        .bodyForm(form)
        .execute().returnContent().asString();
} catch (IOException e) {
    logger.error("调用快递100 API失败: {}", e.getMessage());
    return Collections.emptyList();
}
```

### 2. API返回错误

**场景**: 快递100返回非200状态码或错误消息

**处理策略**:
```java
JSONObject json = JSONObject.parseObject(response);
String status = json.getString("status");
if (!"200".equals(status)) {
    logger.error("快递100返回错误: message={}, status={}", 
        json.getString("message"), status);
    return Collections.emptyList();
}
```

### 3. 数据解析错误

**场景**: 快递100返回的JSON格式异常

**处理策略**:
```java
try {
    JSONArray dataArray = json.getJSONArray("data");
    // 处理数据
} catch (Exception e) {
    logger.error("解析快递100响应数据失败: {}", e.getMessage(), e);
    return Collections.emptyList();
}
```

### 4. 订单不存在

**场景**: 查询的订单号在数据库中不存在

**处理策略**:
```java
if (null == preDrugOrder) {
    throw new BizException("该订单不存在!");
}
```

### 5. 物流单号为空

**场景**: 订单存在但未配置物流单号

**处理策略**:
```java
if (StringUtils.isEmpty(logisticsNumber)) {
    throw new BizException("该订单暂无物流信息!");
}
```

## 测试策略

### 双重测试方法

本项目采用单元测试和属性测试相结合的方式，确保全面的代码覆盖：

- **单元测试**: 验证特定示例、边界情况和错误条件
- **属性测试**: 通过随机化验证所有输入的通用属性
- 两者互补，共同提供全面覆盖（单元测试捕获具体错误，属性测试验证通用正确性）

### 单元测试

单元测试专注于特定示例和边界情况：

1. **配置加载测试**
   - 测试Kuaidi100Properties能否正确加载url、customer、sign配置
   - 测试配置参数为空时的处理
   - 测试配置注入到Service层

2. **快递公司编码测试**
   - 测试支持的快递公司编码：yunda、shunfeng、yuantong、zhongtong、shentong、jd
   - 测试未识别快递公司时使用默认编码
   - 测试订单未配置快递公司时使用默认编码

3. **边界情况测试**
   - 测试空data数组的处理
   - 测试订单不存在的错误提示
   - 测试物流单号为空的错误提示
   - 测试网络超时的处理

4. **API接口兼容性测试**
   - 测试POST /api/v1/prescription/drug/viewLogistics接口路径
   - 测试请求参数格式{"orderNum": "订单号"}
   - 测试响应格式{"code": 0, "data": [...]}

### 属性测试

属性测试使用随机生成的输入验证通用属性，每个测试至少运行100次迭代：

1. **属性1: HTTP请求参数完整性**
   - 生成随机的快递公司编码和快递单号
   - 验证每次请求都包含param、customer、sign参数
   - 验证param是有效的JSON字符串
   - 标签: **Feature: logistics-api-migration, Property 1: HTTP请求参数完整性**

2. **属性2: 数据转换完整性和正确性**
   - 生成随机的快递100响应数据（不同长度的data数组）
   - 验证转换后列表长度等于原数组长度
   - 验证每个元素包含processNo、processTime、processRemark字段
   - 验证processNo从1开始递增
   - 验证字段映射正确
   - 验证保持倒序排列
   - 标签: **Feature: logistics-api-migration, Property 2: 数据转换完整性和正确性**

3. **属性3: 错误处理的健壮性**
   - 生成各种错误场景（网络错误、非200状态码、解析异常、空数据）
   - 验证所有错误情况都返回空列表（非null）
   - 验证不抛出未捕获的异常
   - 验证记录了错误日志
   - 标签: **Feature: logistics-api-migration, Property 3: 错误处理的健壮性**

4. **属性4: API响应格式兼容性**
   - 生成随机的物流查询请求
   - 验证响应包含code和data字段
   - 验证data中每个元素包含processNo、processTime、processRemark字段
   - 验证字段类型正确
   - 标签: **Feature: logistics-api-migration, Property 4: API响应格式兼容性**

5. **属性5: 快递公司编码处理逻辑**
   - 生成随机订单（有些有快递公司编码，有些没有）
   - 验证有编码时使用订单编码
   - 验证无编码时使用默认编码"yunda"
   - 标签: **Feature: logistics-api-migration, Property 5: 快递公司编码处理逻辑**

### 集成测试

1. **API调用测试**
   - 使用Mock服务器模拟快递100 API
   - 测试不同快递公司的查询
   - 测试无效单号的处理
   - 测试网络超时场景

2. **端到端测试**
   - 从Controller到快递100 API的完整流程测试
   - 验证返回数据格式与Android客户端的兼容性
   - 使用真实的快递100测试环境进行验证

### 测试配置

```java
// 属性测试配置
@Property(tries = 100)  // 每个属性测试运行100次

// 测试数据生成器
@Provide
Arbitrary<String> trackingNumbers() {
    return Arbitraries.strings()
        .numeric()
        .ofLength(10, 20);
}

@Provide
Arbitrary<String> expressCompanies() {
    return Arbitraries.of("yunda", "shunfeng", "yuantong", 
                          "zhongtong", "shentong", "jd");
}

// 测试用配置
String testUrl = "http://poll.kuaidi100.com/poll/query.do";
String testCustomer = "12333";
String testSign = "B19DB55FF14E35488D780C172E19DF99";
```

## 实现细节

### Kuaidi100Util.queryLogistics 实现

```java
public static List<Map<String, Object>> queryLogistics(
        String url, String customer, String sign, String com, String num) {
    
    try {
        // 1. 构建param参数
        JSONObject paramJson = new JSONObject();
        paramJson.put("com", com);
        paramJson.put("num", num);
        paramJson.put("resultv2", "1");
        String param = paramJson.toJSONString();
        
        // 2. 构建表单参数
        Form form = Form.form()
            .add("param", param)
            .add("customer", customer)
            .add("sign", sign);
        
        // 3. 发送HTTP请求
        logger.info("调用快递100 API: url={}, com={}, num={}", url, com, num);
        String response = Request.Post(url)
            .connectTimeout(5000)
            .socketTimeout(10000)
            .bodyForm(form)
            .execute().returnContent().asString();
        
        logger.info("快递100 API响应: {}", response);
        
        // 4. 解析响应
        JSONObject json = JSONObject.parseObject(response);
        String status = json.getString("status");
        
        if (!"200".equals(status)) {
            logger.error("快递100返回错误: message={}, status={}", 
                json.getString("message"), status);
            return Collections.emptyList();
        }
        
        // 5. 提取并转换数据
        JSONArray dataArray = json.getJSONArray("data");
        if (dataArray == null || dataArray.isEmpty()) {
            logger.warn("快递100返回空数据: com={}, num={}", com, num);
            return Collections.emptyList();
        }
        
        return convertToLogisticsEntity(dataArray);
        
    } catch (Exception e) {
        logger.error("查询物流信息失败: com={}, num={}, error={}", 
            com, num, e.getMessage(), e);
        return Collections.emptyList();
    }
}
```

### Kuaidi100Util.convertToLogisticsEntity 实现

```java
private static List<Map<String, Object>> convertToLogisticsEntity(JSONArray kuaidi100Data) {
    List<Map<String, Object>> result = new ArrayList<>();
    
    for (int i = 0; i < kuaidi100Data.size(); i++) {
        JSONObject item = kuaidi100Data.getJSONObject(i);
        
        Map<String, Object> entity = new HashMap<>();
        entity.put("processNo", i + 1);  // 从1开始编号
        entity.put("processTime", item.getString("ftime"));
        entity.put("processRemark", item.getString("context"));
        
        result.add(entity);
    }
    
    return result;
}
```

### 快递公司编码映射

```java
public class ExpressCompanyCode {
    public static final String YUNDA = "yunda";      // 韵达
    public static final String SHUNFENG = "shunfeng"; // 顺丰
    public static final String YUANTONG = "yuantong"; // 圆通
    public static final String ZHONGTONG = "zhongtong"; // 中通
    public static final String SHENTONG = "shentong"; // 申通
    public static final String JD = "jd";            // 京东
    
    public static final String DEFAULT = YUNDA;      // 默认使用韵达
}
```

## 部署注意事项

1. **配置文件更新**: 需要在application-dev.properties和application-prod.properties中添加快递100配置
2. **数据库迁移**: 需要执行SQL脚本添加express_company字段
3. **依赖检查**: 确保项目已包含Apache HttpClient和FastJSON依赖
4. **日志配置**: 确保日志级别配置正确，便于排查问题
5. **回滚方案**: 保留原有的易药购调用代码，必要时可快速回滚

## 性能考虑

1. **超时设置**: 连接超时5秒，读取超时10秒
2. **缓存策略**: 可考虑对物流信息进行短时间缓存（如5分钟），减少API调用
3. **并发控制**: 如果查询量大，可考虑使用连接池
4. **异步处理**: 对于批量查询场景，可考虑异步处理

## 安全考虑

1. **配置加密**: customer和sign参数应该加密存储
2. **参数验证**: 对输入的订单号进行格式验证
3. **日志脱敏**: 日志中不应该输出完整的customer和sign
4. **HTTPS**: 生产环境应该使用HTTPS协议（如果快递100支持）
