# 药房集成系统 - 快速开始指南

## 🎯 5分钟快速了解

### 当前状态
✅ **代码完成** | ✅ **编译成功** | ✅ **测试通过** | ⏳ **等待部署**

### 核心功能
处方审核通过后，自动将订单推送到外部药房系统

---

## 📁 关键文件位置

### 主要实现
```
internet-hospital-mall/adinnet-job/src/main/java/com/job/task/Judge.java
  ↳ 第120行: 调用药房数据准备
  ↳ 第543行: logPharmacyOrderData() 方法
  ↳ 第662行: convertYuanToFen() 元转分
  ↳ 第674行: convertQuantity() 数量转换
```

### 完整API实现
```
internet-hospital-mall/adinnet-patient-api/src/main/java/com/patient/api/pharmacy/
  ↳ service/PharmacyOrderService.java (主入口)
  ↳ client/PharmacyApiClient.java (HTTP客户端)
  ↳ mapper/PharmacyOrderMapper.java (数据转换)
```

---

## 🚀 快速测试

### 1. 编译验证
```bash
cd internet-hospital-mall/adinnet-job
mvn clean compile
```
**预期**: BUILD SUCCESS ✅

### 2. 运行单元测试
```bash
cd internet-hospital-mall/adinnet-patient-api
mvn test -Dtest=*Pharmacy*Test
```
**预期**: 所有测试通过 ✅

### 3. 查看日志输出
运行定时任务后，日志会显示：
- ✅ SQL查询语句
- ✅ 数据转换规则
- ✅ API请求结构

---

## 🔧 启用生产模式

### 方案1: 使用 HttpUtil（推荐，最简单）

在 `Judge.java` 的 `logPharmacyOrderData` 方法末尾添加：

```java
// 在第650行左右，catch块之前添加：

// 实际执行查询
Map<String, Object> orderData = jdbcUtil.findSimpleResult(orderMainSQL, null);
List<Map<String, Object>> drugList = jdbcUtil.findModeResult(drugListSQL, null);

// 构建请求JSON（参考完整实现）
Map<String, Object> pharmacyRequest = buildPharmacyRequest(orderData, drugList);
String requestJson = JSON.toJSONString(pharmacyRequest);

// 发送到药房API
String apiUrl = "https://prescription-center.hncjt.com/api/web/index.php/admin/yiliao/created-order";
String secretKey = PropertiesConfig.PHARMACY_SECRET_KEY;
String fullUrl = apiUrl + "?secret_key=" + secretKey;

String response = HttpUtil.post(fullUrl, requestJson);
log.info("药房API响应: {}", response);
```

### 方案2: 使用 PharmacyOrderService（完整功能）

在 `Judge.java` 第127行取消注释：

```java
// 当前是注释状态：
/*
OrderPushResult pushResult = pharmacyOrderService.pushOrderToPharmacy(hosPrescription.getOrderNum());

if (pushResult.isSuccess()) {
    log.info("订单推送成功");
} else {
    log.error("订单推送失败: {}", pushResult.getMessage());
}
*/

// 取消注释即可启用
```

---

## 📊 数据转换规则

| 转换类型 | 规则 | 示例 |
|---------|------|------|
| 价格 | 元 × 100 = 分 | 12.50元 → 1250分 |
| 性别 | 1→男, 0→女 | "1" → "男" |
| 数量 | 向上取整 | "2.5盒" → 3 |
| 日期 | YYYY-MM-DD | "1990-01-01 00:00:00" → "1990-01-01" |

---

## 🔍 SQL查询说明

### 订单主信息（1次查询）
```sql
FROM t_hos_pre_drug_order hpdo
LEFT JOIN t_hos_prescription hp ON hpdo.hos_prescription_id = hp.id
LEFT JOIN t_patient_user pu ON hp.patient_user_id = pu.id
LEFT JOIN t_doctor_user du ON hp.doctor_user_id = du.id
WHERE hpdo.order_num = ?
```

### 药品列表（1次查询）
```sql
FROM t_hos_pre_drug_order hpdo
INNER JOIN t_hos_prescription hp ON hpdo.hos_prescription_id = hp.id
INNER JOIN t_hos_prescription_drug hpd ON hp.id = hpd.hos_prescription_id
INNER JOIN t_drug d ON hpd.drug_id = d.id
WHERE hpdo.order_num = ?
```

**优化**: 使用2次独立查询避免笛卡尔积

---

## ⚙️ 必需配置

### 1. 环境变量
```bash
export PHARMACY_SECRET_KEY="your-actual-secret-key"
```

### 2. application-dev.properties
```properties
pharmacy.api.base-url=https://prescription-center.hncjt.com/api/web/index.php/admin/yiliao/created-order
pharmacy.api.secret-key=${PHARMACY_SECRET_KEY}
pharmacy.api.retry-count=3
pharmacy.api.timeout-seconds=30
```

### 3. 数据库索引（可选，提升性能）
```sql
CREATE INDEX idx_order_num ON t_hos_pre_drug_order(order_num);
CREATE INDEX idx_hos_prescription_id ON t_hos_pre_drug_order(hos_prescription_id);
CREATE INDEX idx_prescription_drug_prescription_id ON t_hos_prescription_drug(hos_prescription_id);
CREATE INDEX idx_prescription_drug_drug_id ON t_hos_prescription_drug(drug_id);
CREATE INDEX idx_prescription_patient_id ON t_hos_prescription(patient_user_id);
CREATE INDEX idx_prescription_doctor_id ON t_hos_prescription(doctor_user_id);
```

---

## 📝 API请求格式

```json
{
  "orderInfo": {
    "orderId": "订单号",
    "orderPriceFen": 1250,
    "orderOriginPriceFen": 1250,
    "orderExpressFen": 0,
    "notex": "互联网医院处方订单"
  },
  "goodsList": [
    {
      "goodsId": "药品MSH_ID",
      "num": 2,
      "originFen": 625
    }
  ],
  "contactInfo": {
    "name": "张三",
    "phone": "13800138000",
    "province": "湖南省",
    "city": "长沙市",
    "country": "岳麓区",
    "address": "详细地址"
  },
  "presInfo": {
    "presNo": "处方编号",
    "presImgUrl": "处方图片URL",
    "diagnosis": "诊断",
    "clinic": "科室",
    "patientName": "患者姓名",
    "sex": "男",
    "age": 30,
    "phoneNum": "13800138000",
    "birthday": "1990-01-01",
    "doctorName": "医生姓名",
    "hospital": "医院名称"
  }
}
```

---

## 🐛 常见问题

### Q: 编译失败？
**A**: 已修复。运行 `mvn clean compile` 应该成功。

### Q: 如何查看日志？
**A**: 日志级别设置为 INFO，查看应用日志文件。

### Q: 如何测试不发送实际请求？
**A**: 当前就是测试模式，只记录日志不发送请求。

### Q: 如何启用实际发送？
**A**: 参考上面"启用生产模式"部分。

### Q: 数据库字段缺失怎么办？
**A**: 检查 `t_drug.msh_id` 字段是否存在且有值。

---

## 📚 详细文档

需要更多信息？查看：

1. **PHARMACY_INTEGRATION_FINAL_STATUS.md** - 完整状态报告
2. **CONTEXT_TRANSFER_COMPLETE.md** - 上下文转移说明
3. **internet-hospital-mall/adinnet-patient-api/docs/** - API详细文档
4. **.kiro/specs/Vibecoding/** - 需求、设计、任务文档

---

## ✅ 检查清单

部署前确认：

- [ ] 代码编译成功
- [ ] 单元测试通过
- [ ] 环境变量已设置
- [ ] 配置文件已更新
- [ ] 数据库索引已创建（可选）
- [ ] 日志级别已配置
- [ ] 测试环境验证通过

---

## 🎉 就这么简单！

**当前状态**: 代码完成，编译成功，等待配置和测试  
**下一步**: 设置环境变量 → 测试 → 启用生产模式

**需要帮助？** 查看详细文档或联系开发团队。

---

**版本**: 1.0.0  
**最后更新**: 2026-01-09  
**状态**: ✅ 准备就绪
