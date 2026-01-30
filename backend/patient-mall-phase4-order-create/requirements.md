# Spec 8: 订单创建功能 - 需求文档

## 文档信息

**Spec编号:** patient-mall-phase4-order-create  
**功能名称:** 订单创建功能  
**所属阶段:** 阶段四 - 订单功能  
**创建日期:** 2026-01-23  
**依赖关系:** 依赖阶段三购物车功能

---

## 简介

实现患者端药品商城的订单创建功能，支持从购物车创建订单、库存扣减、订单金额计算和订单号生成。

## 术语表

| 术语 | 定义 |
|------|------|
| 订单 | 患者购买药品的交易记录 |
| 订单号 | 唯一标识订单的编号 |
| 订单商品 | 订单中包含的药品明细 |
| 库存预留 | 创建订单时临时锁定库存 |
| 订单金额 | 订单的总价格，包含商品金额和运费 |

---

## 功能需求 (EARS格式)

### FR-1: 订单创建
**WHEN** 用户从购物车选中商品并点击"去结算"  
**THE SYSTEM SHALL** 创建订单记录并生成唯一订单号  
**WHERE** 订单号格式为 `ORD{yyyyMMddHHmmss}{6位随机数}`

### FR-2: 库存验证
**WHEN** 系统创建订单前  
**THE SYSTEM SHALL** 验证所有商品的库存是否充足  
**IF** 任何商品库存不足  
**THEN** 拒绝创建订单并返回库存不足的商品信息

### FR-3: 库存扣减
**WHEN** 订单创建成功后  
**THE SYSTEM SHALL** 扣减对应商品的库存数量  
**WHERE** 扣减数量等于订单中的商品数量

### FR-4: 订单金额计算
**WHEN** 系统创建订单时  
**THE SYSTEM SHALL** 计算订单总金额  
**WHERE** 总金额 = Σ(商品单价 × 数量) + 运费

### FR-5: 运费计算
**WHEN** 系统计算订单金额时  
**IF** 订单中包含包邮商品或订单金额满足包邮条件  
**THEN** 运费为0  
**ELSE** 运费为配置的默认运费

### FR-6: 收货地址
**WHEN** 用户创建订单时  
**THE SYSTEM SHALL** 保存用户选择的收货地址信息  
**WHERE** 包含收货人、电话、详细地址

### FR-7: 购物车清空
**WHEN** 订单创建成功后  
**THE SYSTEM SHALL** 从购物车中删除已下单的商品

### FR-8: 订单状态初始化
**WHEN** 订单创建成功后  
**THE SYSTEM SHALL** 设置订单状态为"待支付"  
**WHERE** 订单状态码为 1

---

## 非功能性需求

### NFR-1: 性能要求
- 订单创建响应时间 < 2秒
- 支持并发创建订单，TPS ≥ 100

### NFR-2: 可靠性要求
- 订单创建成功率 ≥ 99.9%
- 库存扣减必须原子性操作，避免超卖

### NFR-3: 安全性要求
- 订单只能由订单所属用户创建
- 订单金额必须在服务端计算，不能信任客户端传值

### NFR-4: 数据完整性
- 订单号必须全局唯一
- 订单创建失败时必须回滚所有操作

---

## 约束条件

### 业务约束
1. 每个订单至少包含1个商品
2. 每个订单最多包含20个商品
3. 单个商品数量不能超过库存
4. 订单金额不能为负数

### 技术约束
1. 使用Spring事务管理确保数据一致性
2. 使用数据库行锁防止库存超卖
3. 订单号生成必须保证唯一性

---

## API接口定义

### 创建订单接口

**接口路径:** `POST /api/patient/mall/order/create`

**请求参数:**
```json
{
  "patientUserId": 123,
  "cartItemIds": [1, 2, 3],
  "addressId": 456,
  "remark": "请尽快发货"
}
```

**请求参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| patientUserId | Long | 是 | 患者用户ID |
| cartItemIds | List<Long> | 是 | 购物车商品ID列表 |
| addressId | Long | 是 | 收货地址ID |
| remark | String | 否 | 订单备注 |

**响应示例:**
```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "id": 789,
    "orderNum": "ORD20260123193000123456",
    "totalAmount": 158.50,
    "shippingFee": 8.00,
    "actualAmount": 166.50,
    "status": 1,
    "statusName": "待支付",
    "createTime": "2026-01-23 19:30:00",
    "orderItems": [
      {
        "drugId": 101,
        "drugName": "阿莫西林胶囊",
        "drugSpec": "0.25g*24粒",
        "quantity": 2,
        "price": 25.00,
        "subtotal": 50.00
      },
      {
        "drugId": 102,
        "drugName": "感冒灵颗粒",
        "drugSpec": "10g*9袋",
        "quantity": 3,
        "price": 36.00,
        "subtotal": 108.00
      }
    ],
    "address": {
      "receiverName": "张三",
      "receiverPhone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detailAddress": "科技园南区XX路XX号"
    }
  }
}
```

**错误响应:**
```json
{
  "code": 400,
  "message": "库存不足",
  "data": {
    "insufficientItems": [
      {
        "drugId": 101,
        "drugName": "阿莫西林胶囊",
        "requestQuantity": 5,
        "availableQuantity": 3
      }
    ]
  }
}
```

---

## 验收标准清单

### 功能验收
- [ ] 能成功从购物车创建订单
- [ ] 订单号格式正确且全局唯一
- [ ] 库存验证功能正常
- [ ] 库存不足时拒绝创建订单
- [ ] 订单金额计算准确
- [ ] 运费计算正确
- [ ] 收货地址信息完整
- [ ] 订单创建后购物车商品被清空
- [ ] 订单状态初始化为"待支付"

### 性能验收
- [ ] 订单创建响应时间 < 2秒
- [ ] 并发创建订单无数据错误

### 安全验收
- [ ] 用户只能创建自己的订单
- [ ] 订单金额由服务端计算

### 异常处理验收
- [ ] 库存不足时返回明确错误信息
- [ ] 地址不存在时返回错误
- [ ] 购物车商品不存在时返回错误
- [ ] 创建失败时正确回滚

---

## 相关文档

- [父级需求文档](../patient-drug-mall/requirements.md)
- [拆分方案](../patient-drug-mall/SPEC_SPLIT_PLAN.md)
- [购物车基础功能](../patient-mall-phase3-cart-basic/requirements.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
