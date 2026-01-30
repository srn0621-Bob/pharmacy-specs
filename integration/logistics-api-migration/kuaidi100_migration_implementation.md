# 快递100物流API迁移实现总结

## 概述

本文档记录了将互联网医院系统的物流查询服务从易药购迁移到快递100的实现过程。

## 实施日期

2026-01-17

## 实现内容

### 1. 配置管理

#### 1.1 开发环境配置
文件: `internet-hospital/adinnet-patient-api/src/main/resources/application-dev.properties`

添加了以下配置项：
```properties
kuaidi100.url=http://poll.kuaidi100.com/poll/query.do
kuaidi100.customer=5727072A955414A4C8AC79D5F33DB7F6
kuaidi100.key=B19DB55FF14E35488D780C172E19DF99
```

**重要说明**: `key`参数用于动态计算`sign`签名，不是直接传递给API的固定值。

#### 1.2 生产环境配置
文件: `internet-hospital/adinnet-patient-api/src/main/resources/application-prod.properties`

添加了以下配置项（使用占位符）：
```properties
kuaidi100.url=http://poll.kuaidi100.com/poll/query.do
kuaidi100.customer=PRODUCTION_CUSTOMER_VALUE
kuaidi100.key=PRODUCTION_KEY_VALUE
```

**注意**: 生产环境的customer和key值需要在部署时替换为实际值。

#### 1.3 配置类
文件: `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/common/config/properties/Kuaidi100Properties.java`

创建了Spring Boot配置类，用于加载快递100配置参数：
```java
@Component
@ConfigurationProperties(prefix = "kuaidi100")
public class Kuaidi100Properties {
    private String url;
    private String customer;
    private String key;  // 用于计算签名的密钥
    // Getters and setters
}
```

### 2. 工具类

#### 2.1 快递100工具类
文件: `internet-hospital/adinnet-common/src/main/java/com/adinnet/common/utils/Kuaidi100Util.java`

实现了以下功能：
- `queryLogistics()`: 调用快递100 API查询物流信息
  - 构建param JSON参数
  - **动态计算sign签名**: 使用MD5算法计算`MD5(param + key + customer)`并转为32位大写
  - 发送HTTP POST请求
  - 解析响应并验证状态码
- `calculateSign()`: 计算MD5签名（私有方法）
  - 签名算法: `MD5(param + key + customer)`
  - 返回32位大写十六进制字符串
  - 三个字符串直接拼接，不添加任何分隔符
- `convertToLogisticsEntity()`: 将快递100响应数据转换为系统格式
- 完整的错误处理和日志记录

**签名计算示例**:
```
param = {"com":"yunda","num":"123456789","resultv2":"1"}
key = B19DB55FF14E35488D780C172E19DF99
customer = 5727072A955414A4C8AC79D5F33DB7F6
signStr = param + key + customer (直接拼接)
sign = MD5(signStr).toUpperCase() (32位大写)
```

#### 2.2 快递公司编码常量类
文件: `internet-hospital/adinnet-common/src/main/java/com/adinnet/common/constants/ExpressCompanyCode.java`

定义了支持的快递公司编码：
- YUNDA (韵达)
- SHUNFENG (顺丰)
- YUANTONG (圆通)
- ZHONGTONG (中通)
- SHENTONG (申通)
- JD (京东)
- DEFAULT (默认使用韵达)

### 3. 数据库变更

#### 3.1 表结构修改
文件: `internet-hospital/sql/alter_t_hos_pre_drug_order_add_express_company.sql`

为`t_hos_pre_drug_order`表添加了`express_company`字段：
```sql
ALTER TABLE t_hos_pre_drug_order 
ADD COLUMN express_company VARCHAR(50) DEFAULT 'yunda' 
COMMENT '快递公司编码（yunda-韵达，shunfeng-顺丰，yuantong-圆通，zhongtong-中通，shentong-申通，jd-京东）';

CREATE INDEX idx_express_company ON t_hos_pre_drug_order(express_company);
```

**注意**: 此SQL脚本需要在数据库中执行。

### 4. Service层修改

#### 4.1 HosPreDrugOrderServiceImpl
文件: `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/service/impl/HosPreDrugOrderServiceImpl.java`

修改了`viewLogistics()`方法：
- 注入了`Kuaidi100Properties`配置类
- 从订单中读取快递单号和快递公司编码
- 调用`Kuaidi100Util.queryLogistics()`方法
- 处理快递公司编码为空的情况（使用默认值）
- 添加了物流单号为空的验证

#### 4.2 HosPreDrugOrder模型类
文件: `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/model/HosPreDrugOrder.java`

添加了`expressCompany`字段：
```java
@ApiModelProperty(value = "快递公司编码（用于快递100查询）")
@TableField("express_company")
private String expressCompany;
```

### 5. API兼容性

#### 5.1 接口路径
保持不变: `POST /api/v1/prescription/drug/viewLogistics`

#### 5.2 请求格式
保持不变: `{"orderNum": "订单号"}`

#### 5.3 响应格式
保持不变: 
```json
{
  "code": 0,
  "data": [
    {
      "processNo": 1,
      "processTime": "2020-11-11 15:30:00",
      "processRemark": "货物已签收"
    }
  ]
}
```

### 6. 数据转换映射

| 快递100字段 | 系统字段 | 说明 |
|------------|---------|------|
| data[i].context | processRemark | 物流描述 |
| data[i].ftime | processTime | 格式化时间 |
| - | processNo | 从1开始递增编号 |

## 部署步骤

### 1. 数据库迁移
执行SQL脚本：
```bash
mysql -u username -p database_name < internet-hospital/sql/alter_t_hos_pre_drug_order_add_express_company.sql
```

### 2. 配置更新
更新生产环境配置文件中的快递100参数：
- 将`PRODUCTION_CUSTOMER_VALUE`替换为实际的customer值
- 将`PRODUCTION_KEY_VALUE`替换为实际的key值（用于计算签名）

### 3. 代码部署
部署以下模块：
- adinnet-common (工具类和常量类)
- adinnet-patient-api (Service层和配置类)

### 4. 验证
- 调用物流查询接口，验证返回数据格式正确
- 检查日志，确认快递100 API调用成功
- 验证Android客户端显示正常

## 回滚方案

如果需要回滚到易药购API：

1. 恢复`HosPreDrugOrderServiceImpl.viewLogistics()`方法到原始版本
2. 重新部署adinnet-patient-api模块
3. 数据库字段`express_company`可以保留，不影响原有功能

## 注意事项

1. **配置安全**: customer和key参数不应提交到版本控制系统
2. **签名计算**: sign参数是动态计算的，使用MD5(param + key + customer)算法，结果转为32位大写
3. **快递公司编码**: 订单创建时需要设置正确的快递公司编码
4. **错误处理**: 所有错误情况都会返回空列表，不会影响系统稳定性
5. **日志监控**: 建议监控快递100 API调用日志，及时发现问题（日志中会记录计算的签名）
6. **测试验证**: 建议在测试环境充分验证后再部署到生产环境

## 已完成的文件清单

### 新增文件
1. `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/common/config/properties/Kuaidi100Properties.java`
2. `internet-hospital/adinnet-common/src/main/java/com/adinnet/common/utils/Kuaidi100Util.java`
3. `internet-hospital/adinnet-common/src/main/java/com/adinnet/common/constants/ExpressCompanyCode.java`
4. `internet-hospital/sql/alter_t_hos_pre_drug_order_add_express_company.sql`

### 修改文件
1. `internet-hospital/adinnet-patient-api/src/main/resources/application-dev.properties`
2. `internet-hospital/adinnet-patient-api/src/main/resources/application-prod.properties`
3. `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/service/impl/HosPreDrugOrderServiceImpl.java`
4. `internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/model/HosPreDrugOrder.java`

## 测试建议

### 单元测试
- 测试Kuaidi100Util.queryLogistics()方法
- 测试calculateSign()签名计算方法（验证MD5算法正确性）
- 测试数据转换逻辑
- 测试错误处理

**签名验证测试**:
```java
// 测试签名计算是否正确
String param = "{\"com\":\"yunda\",\"num\":\"123456789\",\"resultv2\":\"1\"}";
String key = "B19DB55FF14E35488D780C172E19DF99";
String customer = "5727072A955414A4C8AC79D5F33DB7F6";
String sign = calculateSign(param, key, customer);
// 验证sign是32位大写十六进制字符串
assertTrue(sign.matches("[A-F0-9]{32}"));
```

### 集成测试
- 使用Mock服务器模拟快递100 API
- 测试不同快递公司的查询
- 测试无效单号的处理

### 端到端测试
- 从Android客户端调用物流查询接口
- 验证返回数据格式与迁移前一致
- 验证物流信息显示正常

## 联系人

如有问题，请联系开发团队。

---

**文档版本**: 1.1  
**创建日期**: 2026-01-17  
**最后更新**: 2026-01-17  
**更新内容**: 
- v1.1: 更新签名计算方式为MD5动态计算，配置项从sign改为key
- v1.0: 初始版本
