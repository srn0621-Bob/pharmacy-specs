# 快递100物流查询 - 快速开始指南

## 1. 数据库准备

执行SQL脚本更新快递公司编码字段：

```bash
mysql -u root -p internet_hospital < sql/alter_t_hos_pre_drug_order_update_express_code.sql
```

或手动执行：

```sql
-- 更新express_code字段的默认值为'yunda'（韵达）
ALTER TABLE t_hos_pre_drug_order 
MODIFY COLUMN express_code VARCHAR(50) DEFAULT 'yunda' 
COMMENT '快递公司编码（yunda-韵达，shunfeng-顺丰，yuantong-圆通，zhongtong-中通，shentong-申通，jd-京东）';

-- 为express_code字段添加索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_express_code ON t_hos_pre_drug_order(express_code);
```

## 2. 配置文件

确认 `application-dev.properties` 中已添加快递100配置：

```properties
# 快递100物流查询配置
kuaidi100.url=http://poll.kuaidi100.com/poll/query.do
kuaidi100.customer=5727072A955414A4C8AC79D5F33DB7F6
kuaidi100.key=B19DB55FF14E35488D780C172E19DF99
```

**生产环境配置** (`application-prod.properties`):

```properties
# 快递100物流查询配置（生产环境）
kuaidi100.url=http://poll.kuaidi100.com/poll/query.do
kuaidi100.customer=${KUAIDI100_CUSTOMER}
kuaidi100.key=${KUAIDI100_KEY}
```

## 3. 编译部署

```bash
cd internet-hospital
mvn clean package -DskipTests
```

## 4. 测试验证

### 4.1 使用Postman测试

**请求**:
```
POST http://localhost:8092/api/v1/prescription/drug/viewLogistics
Content-Type: application/json

{
  "orderNum": "P20201111132349005"
}
```

**预期响应**:
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

### 4.2 错误场景测试

**订单不存在**:
```json
{
  "code": 500,
  "message": "该订单不存在!"
}
```

**物流单号为空**:
```json
{
  "code": 500,
  "message": "该订单暂无物流信息!"
}
```

## 5. 订单数据准备

### 5.1 更新现有订单的快递公司编码

```sql
-- 更新韵达快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'yunda' 
WHERE express_name LIKE '%韵达%' AND (express_code IS NULL OR express_code = '');

-- 更新顺丰快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'shunfeng' 
WHERE express_name LIKE '%顺丰%' AND (express_code IS NULL OR express_code = '');

-- 更新圆通快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'yuantong' 
WHERE express_name LIKE '%圆通%' AND (express_code IS NULL OR express_code = '');

-- 更新中通快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'zhongtong' 
WHERE express_name LIKE '%中通%' AND (express_code IS NULL OR express_code = '');

-- 更新申通快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'shentong' 
WHERE express_name LIKE '%申通%' AND (express_code IS NULL OR express_code = '');

-- 更新京东快递订单
UPDATE t_hos_pre_drug_order 
SET express_code = 'jd' 
WHERE express_name LIKE '%京东%' AND (express_code IS NULL OR express_code = '');
```

### 5.2 创建测试订单

```sql
INSERT INTO t_hos_pre_drug_order (
  order_num, 
  shipping_no, 
  express_code, 
  express_name,
  status,
  patient_user_id,
  create_time
) VALUES (
  'P20260117000001',
  '1234567890',
  'yunda',
  '韵达快递',
  'PAY',
  'test_user_001',
  NOW()
);
```

## 6. 支持的快递公司

| 快递公司 | 编码 | 常量 |
|---------|------|------|
| 韵达快递 | yunda | ExpressCompanyCode.YUNDA |
| 顺丰快递 | shunfeng | ExpressCompanyCode.SHUNFENG |
| 圆通快递 | yuantong | ExpressCompanyCode.YUANTONG |
| 中通快递 | zhongtong | ExpressCompanyCode.ZHONGTONG |
| 申通快递 | shentong | ExpressCompanyCode.SHENTONG |
| 京东快递 | jd | ExpressCompanyCode.JD |

## 7. 常见问题

### Q1: 如何添加新的快递公司？

1. 在 `ExpressCompanyCode` 类中添加新的常量
2. 查询快递100支持的快递公司编码
3. 更新数据库订单的 `express_code` 字段

### Q2: 如果订单没有配置快递公司编码会怎样？

系统会自动使用默认值 `yunda`（韵达快递）。

### Q3: 快递100 API调用失败怎么办？

系统会记录详细的错误日志，并返回空列表。可以查看日志文件排查问题：
- 检查网络连接
- 验证customer和key是否正确
- 确认快递单号是否有效

### Q4: 如何查看API调用日志？

日志文件位置：`logs/patient-api.log`

搜索关键字：
- `调用快递100 API`
- `快递100 API响应`
- `快递100返回错误`

### Q5: 签名计算失败怎么办？

签名算法：`MD5(param + key + customer)` 转32位大写

检查：
1. key配置是否正确
2. customer配置是否正确
3. param JSON格式是否正确

### Q6: express_code字段已存在，为什么还要执行SQL脚本？

SQL脚本的作用是：
1. 更新字段的默认值为 'yunda'
2. 更新字段注释，说明支持的快递公司
3. 添加索引（如果不存在），提高查询性能

如果字段已经有合适的默认值和索引，可以跳过此步骤。

## 8. 监控和告警

建议添加以下监控指标：

1. **API调用成功率**: 监控快递100 API调用的成功率
2. **响应时间**: 监控API响应时间，设置告警阈值
3. **错误日志**: 监控错误日志数量，异常增长时告警
4. **空数据返回**: 监控返回空数据的频率

## 9. 性能优化建议

1. **缓存机制**: 对物流信息缓存5分钟，减少API调用
2. **批量查询**: 如需批量查询，考虑异步处理
3. **连接池**: 高并发场景下使用HTTP连接池
4. **超时设置**: 根据实际情况调整超时时间

## 10. 安全建议

1. **配置加密**: 对customer和key进行加密存储
2. **访问控制**: 限制物流查询接口的访问频率
3. **日志脱敏**: 日志中不输出完整的customer和key
4. **HTTPS**: 如果快递100支持，使用HTTPS协议

## 相关文档

- [完整实现文档](kuaidi100_logistics_integration_complete.md)
- [快递100 API文档](https://www.kuaidi100.com/openapi/api_post.shtml)
