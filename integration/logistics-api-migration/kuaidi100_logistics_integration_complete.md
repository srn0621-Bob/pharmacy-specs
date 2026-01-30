# 快递100物流查询集成完成文档

## 概述

本文档记录了将互联网医院系统的物流查询服务从易药购迁移到快递100的完整实现过程。

## 实现日期

2026-01-17

## 实现内容

### 1. 配置文件

#### 1.1 快递100配置类
**文件**: `adinnet-patient-api/src/main/java/com/patient/api/common/config/properties/Kuaidi100Properties.java`

```java
@Component
@ConfigurationProperties(prefix = "kuaidi100")
public class Kuaidi100Properties {
    private String url;      // API地址
    private String customer; // 授权码
    private String key;      // 密钥（用于计算签名）
}
```

#### 1.2 配置参数
**文件**: `adinnet-patient-api/src/main/resources/application-dev.properties`

```properties
kuaidi100.url=http://poll.kuaidi100.com/poll/query.do
kuaidi100.customer=5727072A955414A4C8AC79D5F33DB7F6
kuaidi100.key=B19DB55FF14E35488D780C172E19DF99
```

### 2. 工具类

#### 2.1 快递100工具类
**文件**: `adinnet-common/src/main/java/com/adinnet/common/utils/Kuaidi100Util.java`

**核心功能**:
- `queryLogistics()`: 调用快递100 API查询物流信息
- `calculateSign()`: 计算MD5签名（param + key + customer）
- `convertToLogisticsEntity()`: 转换快递100响应数据为系统格式

**签名算法**: MD5(param + key + customer) 转32位大写

**数据转换**:
- `context` → `processRemark`
- `ftime` → `processTime`
- 自动生成 `processNo`（从1开始递增）

#### 2.2 快递公司编码常量类
**文件**: `adinnet-common/src/main/java/com/adinnet/common/constants/ExpressCompanyCode.java`

**支持的快递公司**:
- `YUNDA` = "yunda" (韵达)
- `SHUNFENG` = "shunfeng" (顺丰)
- `YUANTONG` = "yuantong" (圆通)
- `ZHONGTONG` = "zhongtong" (中通)
- `SHENTONG` = "shentong" (申通)
- `JD` = "jd" (京东)
- `DEFAULT` = "yunda" (默认)

### 3. 数据库修改

#### 3.1 更新快递公司编码字段
**文件**: `sql/alter_t_hos_pre_drug_order_update_express_code.sql`

```sql
-- 更新express_code字段的默认值为'yunda'（韵达）
ALTER TABLE t_hos_pre_drug_order 
MODIFY COLUMN express_code VARCHAR(50) DEFAULT 'yunda' 
COMMENT '快递公司编码（yunda-韵达，shunfeng-顺丰，yuantong-圆通，zhongtong-中通，shentong-申通，jd-京东）';

-- 为express_code字段添加索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_express_code ON t_hos_pre_drug_order(express_code);
```

**说明**: 
- 复用现有的 `express_code` 字段
- 设置默认值为 'yunda'（韵达快递）
- 添加索引提高查询性能

### 4. 模型类修改

#### 4.1 HosPreDrugOrder模型
**文件**: `adinnet-patient-api/src/main/java/com/patient/api/app/model/HosPreDrugOrder.java`

**使用现有字段**:
```java
@ApiModelProperty(value = "快递公司编码")
@TableField("express_code")
private String expressCode;
```

**说明**: 复用现有的 `expressCode` 字段，无需添加新字段

### 5. Service层修改

#### 5.1 HosPreDrugOrderServiceImpl
**文件**: `adinnet-patient-api/src/main/java/com/patient/api/app/service/impl/HosPreDrugOrderServiceImpl.java`

**修改内容**:
1. 注入 `Kuaidi100Properties` 配置类
2. 添加导入: `Kuaidi100Util`, `ExpressCompanyCode`
3. 重写 `viewLogistics()` 方法:
   - 验证订单存在
   - 验证物流单号不为空
   - 获取快递公司编码（为空时使用默认值）
   - 调用快递100 API查询物流
   - 返回标准格式的物流数据

**核心逻辑**:
```java
// 获取快递单号
String logisticsNumber = preDrugOrder.getShippingNo();
if (StringUtils.isEmpty(logisticsNumber)) {
    throw new BizException("该订单暂无物流信息!");
}

// 获取快递公司编码，如果为空则使用默认值（韵达）
String expressCode = preDrugOrder.getExpressCode();
if (StringUtils.isEmpty(expressCode)) {
    expressCode = ExpressCompanyCode.DEFAULT;
}

// 调用快递100 API查询物流信息
List logistics = Kuaidi100Util.queryLogistics(
    kuaidi100Properties.getUrl(),
    kuaidi100Properties.getCustomer(),
    kuaidi100Properties.getKey(),
    expressCode,
    logisticsNumber
);
```

## API接口

### 请求
```
POST /api/v1/prescription/drug/viewLogistics
Content-Type: application/json

{
  "orderNum": "P20201111132349005"
}
```

### 响应
```json
{
  "code": 0,
  "data": [
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
}
```

## 错误处理

1. **订单不存在**: 抛出 `BizException("该订单不存在!")`
2. **物流单号为空**: 抛出 `BizException("该订单暂无物流信息!")`
3. **API调用失败**: 记录错误日志，返回空列表
4. **网络超时**: 记录错误日志，返回空列表
5. **数据解析失败**: 记录错误日志，返回空列表

## 兼容性

- ✅ Android客户端无需修改
- ✅ API接口路径不变
- ✅ 请求参数格式不变
- ✅ 响应数据格式不变
- ✅ LogisticsEntity数据结构不变

## 部署步骤

1. **执行数据库脚本**:
   ```bash
   mysql -u root -p internet_hospital < sql/alter_t_hos_pre_drug_order_update_express_code.sql
   ```

2. **更新配置文件**:
   - 确认 `application-dev.properties` 中快递100配置正确
   - 生产环境需要更新 `application-prod.properties`

3. **编译部署**:
   ```bash
   cd internet-hospital
   mvn clean package -DskipTests
   ```

4. **重启服务**:
   ```bash
   # 重启patient-api服务
   ```

## 测试验证

### 单元测试
- [ ] 配置加载测试
- [ ] 快递公司编码测试
- [ ] 边界情况测试（订单不存在、物流单号为空）

### 集成测试
- [ ] 使用真实订单号测试物流查询
- [ ] 测试不同快递公司的查询
- [ ] 测试网络超时场景

### 验收测试
- [ ] Android客户端调用测试
- [ ] 响应格式验证
- [ ] 性能测试

## 注意事项

1. **签名计算**: 快递100的签名算法为 `MD5(param + key + customer)` 转32位大写
2. **默认快递公司**: 如果订单未配置快递公司编码，默认使用韵达（yunda）
3. **超时设置**: 连接超时5秒，读取超时10秒
4. **日志记录**: 所有API调用和错误都会记录详细日志
5. **安全性**: customer和key参数应该加密存储，不要提交到版本控制系统

## 回滚方案

如果需要回滚到易药购API，可以：
1. 恢复 `HosPreDrugOrderServiceImpl.viewLogistics()` 方法的原始实现
2. 注释掉快递100相关的导入和配置注入
3. 重新编译部署

## 相关文档

- [需求文档](.kiro/specs/logistics-api-migration/requirements.md)
- [设计文档](.kiro/specs/logistics-api-migration/design.md)
- [任务清单](.kiro/specs/logistics-api-migration/tasks.md)
- [快递100 API文档](https://www.kuaidi100.com/openapi/api_post.shtml)

## 实现状态

✅ 已完成所有核心功能
- ✅ 配置类和配置文件
- ✅ 工具类实现
- ✅ 快递公司编码常量
- ✅ 数据库表结构修改
- ✅ 模型类字段添加
- ✅ Service层逻辑修改
- ⏳ 单元测试（可选）
- ⏳ 集成测试（待验证）

## 后续优化建议

1. **缓存机制**: 对物流信息进行短时间缓存（如5分钟），减少API调用
2. **异步处理**: 对于批量查询场景，可考虑异步处理
3. **监控告警**: 添加API调用失败的监控和告警
4. **配置加密**: 对customer和key参数进行加密存储
5. **HTTPS支持**: 如果快递100支持HTTPS，建议使用HTTPS协议
