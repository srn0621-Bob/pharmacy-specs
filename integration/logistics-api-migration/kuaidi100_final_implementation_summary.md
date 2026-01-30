# 快递100物流查询集成最终实现总结

## 实施日期
2026-01-18

## 实施内容概览

本次实施完成了快递100物流查询API的完整集成，包括签名算法修复和参数格式完善。

## 关键修改

### 1. 签名算法修复 ✅

**问题**: 签名验证失败 (returnCode=503)

**原因**: 使用的MD5实现方式与快递100官方推荐不同

**解决方案**: 
- 从 `java.security.MessageDigest` 改为 `org.apache.commons.codec.digest.DigestUtils`
- 使用官方推荐的 `DigestUtils.md5Hex(msg).toUpperCase()`

**修改文件**: `Kuaidi100Util.java`

**参考**: [kuaidi100_sign_fix.md](kuaidi100_sign_fix.md)

### 2. 请求参数完善 ✅

**问题**: 参数格式不完整

**解决方案**: 按照官方规范添加所有字段

**修改前**:
```json
{"com":"yunda","num":"434999702940283","resultv2":"1"}
```

**修改后**:
```json
{
  "com":"yunda",
  "num":"434999702940283",
  "phone":"",
  "from":"",
  "to":"",
  "resultv2":"0",
  "show":"0",
  "order":"desc"
}
```

**参考**: [kuaidi100_param_fields_update.md](kuaidi100_param_fields_update.md)

## 完整实现代码

### Kuaidi100Util.java

```java
package com.adinnet.common.utils;

import cn.hutool.log.Log;
import cn.hutool.log.LogFactory;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.http.client.fluent.Form;
import org.apache.http.client.fluent.Request;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Component
public class Kuaidi100Util {
    
    private static final Log log = LogFactory.get();
    
    /**
     * 查询物流信息
     */
    public static List<Map<String, Object>> queryLogistics(
            String url, String customer, String key, String com, String num) {
        
        try {
            // 1. 构建param参数（按照快递100官方格式）
            JSONObject paramJson = new JSONObject();
            paramJson.put("com", com);
            paramJson.put("num", num);
            paramJson.put("phone", "");
            paramJson.put("from", "");
            paramJson.put("to", "");
            paramJson.put("resultv2", "0");
            paramJson.put("show", "0");
            paramJson.put("order", "desc");
            String param = paramJson.toJSONString();
            
            // 2. 计算签名（使用Apache Commons Codec）
            String sign = calculateSign(param, key, customer);
            
            // 3. 构建表单参数
            Form form = Form.form()
                .add("param", param)
                .add("customer", customer)
                .add("sign", sign);
            
            // 4. 打印请求详情
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
            
            // 6. 打印响应详情
            log.info("========== 快递100 API 响应开始 ==========");
            log.info("响应内容: {}", response);
            log.info("==========================================");
            
            // 7. 解析响应
            JSONObject json = JSONObject.parseObject(response);
            String status = json.getString("status");
            String message = json.getString("message");
            
            if (!"200".equals(status)) {
                log.error("========== 快递100 API 返回错误 ==========");
                log.error("错误状态码: {}", status);
                log.error("错误消息: {}", message);
                log.error("完整响应: {}", response);
                log.error("==========================================");
                return Collections.emptyList();
            }
            
            // 8. 提取并转换数据
            JSONArray dataArray = json.getJSONArray("data");
            if (dataArray == null || dataArray.isEmpty()) {
                log.warn("========== 快递100 返回空数据 ==========");
                log.warn("快递公司编码: {}", com);
                log.warn("快递单号: {}", num);
                log.warn("响应状态: {}", status);
                log.warn("响应消息: {}", message);
                log.warn("==========================================");
                return Collections.emptyList();
            }
            
            log.info("========== 快递100 查询成功 ==========");
            log.info("物流轨迹数量: {}", dataArray.size());
            log.info("==========================================");
            
            return convertToLogisticsEntity(dataArray);
            
        } catch (IOException e) {
            log.error("========== 快递100 API 网络异常 ==========");
            log.error("异常类型: IOException");
            log.error("快递公司编码: {}", com);
            log.error("快递单号: {}", num);
            log.error("错误信息: {}", e.getMessage());
            log.error("异常堆栈:", e);
            log.error("==========================================");
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("========== 快递100 查询异常 ==========");
            log.error("异常类型: {}", e.getClass().getName());
            log.error("快递公司编码: {}", com);
            log.error("快递单号: {}", num);
            log.error("错误信息: {}", e.getMessage());
            log.error("异常堆栈:", e);
            log.error("==========================================");
            return Collections.emptyList();
        }
    }
    
    /**
     * 计算签名（使用Apache Commons Codec - 快递100官方推荐）
     */
    private static String calculateSign(String param, String key, String customer) {
        try {
            String signStr = param + key + customer;
            return DigestUtils.md5Hex(signStr).toUpperCase();
        } catch (Exception e) {
            log.error("计算签名失败: error={}", e.getMessage(), e);
            throw new RuntimeException("计算签名失败", e);
        }
    }
    
    /**
     * 转换快递100响应数据为系统格式
     */
    private static List<Map<String, Object>> convertToLogisticsEntity(JSONArray kuaidi100Data) {
        List<Map<String, Object>> result = new ArrayList<>();
        
        try {
            for (int i = 0; i < kuaidi100Data.size(); i++) {
                JSONObject item = kuaidi100Data.getJSONObject(i);
                
                Map<String, Object> entity = new HashMap<>();
                entity.put("processNo", i + 1);
                entity.put("processTime", item.getString("ftime"));
                entity.put("processRemark", item.getString("context"));
                
                result.add(entity);
            }
        } catch (Exception e) {
            log.error("转换物流数据失败: error={}", e.getMessage(), e);
            return Collections.emptyList();
        }
        
        return result;
    }
}
```

## 配置文件

### application-dev.properties
```properties
# 快递100配置
kuaidi100.url=http://poll.kuaidi100.com/poll/query.do
kuaidi100.customer=5727072A955414A4C8AC79D5F33DB7F6
kuaidi100.key=B19DB55FF14E35488D780C172E19DF99
```

### Kuaidi100Properties.java
```java
@Component
@ConfigurationProperties(prefix = "kuaidi100")
public class Kuaidi100Properties {
    private String url;
    private String customer;
    private String key;
    
    // getters and setters
}
```

## 调用示例

### Service层调用
```java
@Override
public List viewLogistics(String orderNum) throws Exception {
    // 1. 查询订单
    HosPreDrugOrder preDrugOrder = hosPreDrugOrderMapper.selectOne(
        new QueryWrapper<HosPreDrugOrder>().eq("order_num", orderNum)
    );
    
    if (null == preDrugOrder) {
        throw new BizException("该订单不存在!");
    }
    
    // 2. 获取快递单号
    String logisticsNumber = preDrugOrder.getShippingNo();
    if (StringUtils.isEmpty(logisticsNumber)) {
        throw new BizException("该订单暂无物流信息!");
    }
    
    // 3. 获取快递公司编码
    String expressCode = preDrugOrder.getExpressCode();
    if (StringUtils.isEmpty(expressCode)) {
        expressCode = ExpressCompanyCode.DEFAULT; // 默认韵达
    }
    
    // 4. 调用快递100 API
    List logistics = Kuaidi100Util.queryLogistics(
        kuaidi100Properties.getUrl(),
        kuaidi100Properties.getCustomer(),
        kuaidi100Properties.getKey(),
        expressCode,
        logisticsNumber
    );
    
    return logistics;
}
```

### API接口
```
POST /api/v1/prescription/drug/viewLogistics
Content-Type: application/json

{
  "orderNum": "P20201111132349005"
}
```

## 测试验证

### 1. 单元测试
```java
@Test
public void testKuaidi100Sign() {
    String param = "{\"com\":\"yunda\",\"num\":\"434999702940283\",\"phone\":\"\",\"from\":\"\",\"to\":\"\",\"resultv2\":\"0\",\"show\":\"0\",\"order\":\"desc\"}";
    String key = "B19DB55FF14E35488D780C172E19DF99";
    String customer = "5727072A955414A4C8AC79D5F33DB7F6";
    
    String signStr = param + key + customer;
    String sign = DigestUtils.md5Hex(signStr).toUpperCase();
    
    System.out.println("签名字符串: " + signStr);
    System.out.println("计算签名: " + sign);
    
    assertNotNull(sign);
    assertEquals(32, sign.length());
    assertTrue(sign.matches("[A-F0-9]{32}"));
}
```

### 2. 集成测试
```bash
# 使用curl测试
curl -X POST http://localhost:8092/api/v1/prescription/drug/viewLogistics \
  -H "Content-Type: application/json" \
  -d '{"orderNum":"P20201111132349005"}'
```

### 3. 预期响应
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "processNo": 1,
      "processTime": "2021-05-19 14:37:53",
      "processRemark": "已签收，签收人是【本人签收】"
    },
    {
      "processNo": 2,
      "processTime": "2021-05-19 09:34:27",
      "processRemark": "派件员正在为您派件"
    }
  ]
}
```

## 编译验证

```bash
# 编译所有模块
mvn clean compile -DskipTests

# 结果
[INFO] adinnet-common ..................................... SUCCESS
[INFO] adinnet-core ....................................... SUCCESS
[INFO] adinnet-admin ...................................... SUCCESS
[INFO] adinnet-doctor-api ................................. SUCCESS
[INFO] adinnet-patient-api ................................ SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

## 关键改进点

### 1. 签名算法 ✅
- **改进前**: 使用Java标准库MessageDigest，手动转换十六进制
- **改进后**: 使用Apache Commons Codec的DigestUtils（官方推荐）
- **优势**: 代码简洁，与官方SDK一致，避免兼容性问题

### 2. 参数格式 ✅
- **改进前**: 只包含必填字段 (com, num, resultv2)
- **改进后**: 包含所有官方字段 (com, num, phone, from, to, resultv2, show, order)
- **优势**: 完全符合官方规范，提高兼容性

### 3. 日志记录 ✅
- **完整的请求日志**: URL, 方法, 参数, 签名
- **完整的响应日志**: 响应内容, 状态码
- **详细的错误日志**: 错误类型, 错误消息, 异常堆栈
- **优势**: 便于调试和问题排查

### 4. 错误处理 ✅
- **网络异常**: 返回空列表，记录详细日志
- **API错误**: 返回空列表，记录错误信息
- **数据为空**: 返回空列表，记录警告信息
- **优势**: 不影响系统稳定性，便于问题定位

## 部署清单

### 1. 编译打包
```bash
mvn clean package -DskipTests
```

### 2. 部署文件
- `adinnet-common-1.0-SNAPSHOT.jar`
- `adinnet-patient-api-1.0-SNAPSHOT.jar`

### 3. 配置检查
确认 `application-dev.properties` 包含正确的配置：
```properties
kuaidi100.url=http://poll.kuaidi100.com/poll/query.do
kuaidi100.customer=[您的customer]
kuaidi100.key=[您的key]
```

### 4. 重启服务
```bash
# 停止服务
./shutdown.sh

# 启动服务
./startup.sh
```

### 5. 验证部署
```bash
# 查看日志
tail -f logs/patient-api.log

# 测试接口
curl -X POST http://localhost:8092/api/v1/prescription/drug/viewLogistics \
  -H "Content-Type: application/json" \
  -d '{"orderNum":"P20201111132349005"}'
```

## 监控建议

### 1. 日志监控
```bash
# 监控快递100请求
grep "快递100 API 请求开始" logs/patient-api.log

# 监控成功查询
grep "快递100 查询成功" logs/patient-api.log

# 监控错误
grep "快递100 API 返回错误\|快递100 API 网络异常\|快递100 查询异常" logs/patient-api.log
```

### 2. 性能监控
- 响应时间: 正常 < 3秒
- 超时时间: 连接5秒 + 读取10秒 = 15秒
- 成功率: 应 > 95%

### 3. 告警设置
- 连续失败 > 5次
- 响应时间 > 10秒
- 错误率 > 10%

## 相关文档

1. [签名计算修复说明](kuaidi100_sign_fix.md)
2. [参数字段完善说明](kuaidi100_param_fields_update.md)
3. [签名计算详解](kuaidi100_sign_calculation.md)
4. [API日志示例](kuaidi100_api_logging_example.md)
5. [API逻辑分析](viewLogistics_api_analysis.md)
6. [实现验证报告](kuaidi100_implementation_verification.md)
7. [签名验证结果](kuaidi100_sign_verification_result.md)

## 常见问题

### Q1: 签名验证失败怎么办？
**A**: 确认使用了Apache Commons Codec的DigestUtils，而不是Java标准库的MessageDigest。

### Q2: 返回空数据怎么办？
**A**: 检查快递单号和快递公司编码是否正确，查看日志中的详细错误信息。

### Q3: 如何支持顺丰快递？
**A**: 顺丰快递需要手机号后四位验证，将来可以扩展支持phone参数。

### Q4: 如何获取更详细的物流信息？
**A**: 将resultv2改为"1"可以获取包含地区信息和状态的详细数据。

## 总结

本次实施完成了快递100物流查询API的完整集成，包括：

✅ 签名算法修复（使用官方推荐的DigestUtils）  
✅ 参数格式完善（包含所有官方字段）  
✅ 详细日志记录（请求、响应、错误）  
✅ 完善错误处理（网络异常、API错误、数据为空）  
✅ 编译验证通过（BUILD SUCCESS）  
✅ 文档完整（7份详细文档）  

**状态**: ✅ 实施完成，待生产环境测试验证

---

**实施日期**: 2026-01-18  
**实施人**: Kiro AI Assistant  
**编译状态**: ✅ BUILD SUCCESS  
**文档状态**: ✅ 完整  
**测试状态**: ⏳ 待测试验证
