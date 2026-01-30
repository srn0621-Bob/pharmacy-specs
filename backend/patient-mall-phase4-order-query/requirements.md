# Spec 9: 订单查询功能 - 需求文档

## 文档信息

**Spec编号:** patient-mall-phase4-order-query  
**功能名称:** 订单查询功能  
**所属阶段:** 阶段四 - 订单功能  
**创建日期:** 2026-01-23  
**依赖关系:** 依赖Spec 8订单创建功能

---

## 简介

实现患者端药品商城的订单查询功能，支持订单列表查询、订单详情查询、按状态筛选和分页查询。

## 术语表

| 术语 | 定义 |
|------|------|
| 订单列表 | 用户的所有订单记录列表 |
| 订单详情 | 单个订单的完整信息 |
| 订单状态 | 订单当前所处的状态（待支付、待发货等） |
| 分页查询 | 按页码和每页数量查询订单 |

---

## 功能需求 (EARS格式)

### FR-1: 订单列表查询
**WHEN** 用户进入"我的订单"页面  
**THE SYSTEM SHALL** 返回用户的订单列表  
**WHERE** 按创建时间倒序排列

### FR-2: 订单状态筛选
**WHEN** 用户选择订单状态筛选  
**THE SYSTEM SHALL** 返回指定状态的订单列表  
**WHERE** 状态包括：全部、待支付、待发货、待收货、已完成、已取消

### FR-3: 订单详情查询
**WHEN** 用户点击订单  
**THE SYSTEM SHALL** 返回订单的完整信息  
**WHERE** 包含订单商品、收货地址、物流信息等

### FR-4: 分页查询
**WHEN** 用户滚动订单列表  
**THE SYSTEM SHALL** 支持分页加载订单  
**WHERE** 默认每页10条记录

### FR-5: 订单搜索
**WHEN** 用户输入订单号或商品名称搜索  
**THE SYSTEM SHALL** 返回匹配的订单列表

---

## 非功能性需求

### NFR-1: 性能要求
- 订单列表查询响应时间 < 1秒
- 订单详情查询响应时间 < 500ms

### NFR-2: 数据安全
- 用户只能查询自己的订单
- 订单详情包含敏感信息需脱敏

---

## API接口定义

### 订单列表查询接口

**接口路径:** `GET /api/patient/mall/order/list`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| patientUserId | Long | 是 | 患者用户ID |
| status | Integer | 否 | 订单状态（0-全部） |
| pageNum | Integer | 否 | 页码（默认1） |
| pageSize | Integer | 否 | 每页数量（默认10） |

**响应示例:**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 25,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 3,
    "list": [
      {
        "id": 789,
        "orderNum": "ORD20260123193000123456",
        "totalAmount": 158.50,
        "actualAmount": 166.50,
        "status": 2,
        "statusName": "待发货",
        "createTime": "2026-01-23 19:30:00",
        "orderItems": [
          {
            "drugName": "阿莫西林胶囊",
            "quantity": 2,
            "price": 25.00
          }
        ]
      }
    ]
  }
}
```

### 订单详情查询接口

**接口路径:** `GET /api/patient/mall/order/detail/{orderId}`

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | Long | 是 | 订单ID |

**响应示例:**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 789,
    "orderNum": "ORD20260123193000123456",
    "totalAmount": 158.50,
    "shippingFee": 8.00,
    "actualAmount": 166.50,
    "status": 2,
    "statusName": "待发货",
    "payStatus": 1,
    "payTime": "2026-01-23 19:35:00",
    "createTime": "2026-01-23 19:30:00",
    "orderItems": [
      {
        "drugId": 101,
        "drugName": "阿莫西林胶囊",
        "drugSpec": "0.25g*24粒",
        "drugImage": "http://...",
        "quantity": 2,
        "price": 25.00,
        "subtotal": 50.00
      }
    ],
    "address": {
      "receiverName": "张三",
      "receiverPhone": "138****8000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detailAddress": "科技园南区XX路XX号"
    }
  }
}
```

---

## 验收标准清单

### 功能验收
- [ ] 能查询订单列表
- [ ] 能按状态筛选订单
- [ ] 能查询订单详情
- [ ] 分页功能正常
- [ ] 订单搜索功能正常

### 性能验收
- [ ] 列表查询响应时间 < 1秒
- [ ] 详情查询响应时间 < 500ms

### 安全验收
- [ ] 用户只能查询自己的订单
- [ ] 手机号脱敏显示

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
