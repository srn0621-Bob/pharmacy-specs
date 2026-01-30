# Spec 6: 购物车基础功能 - 需求文档

## 文档信息

**Spec ID:** patient-mall-phase3-cart-basic  
**Spec名称:** 购物车基础功能  
**创建日期:** 2026-01-23  
**所属阶段:** 阶段三 - 购物车功能  
**依赖:** Spec 1, Spec 2, Spec 5 (数据库扩展、图片解析、药品详情)

---

## 简介

实现药品商城购物车的基础CRUD功能，包括添加商品、更新数量、删除商品和查询购物车列表。

### 术语表

| 术语 | 定义 |
|------|------|
| 购物车 | Shopping Cart，用户临时存放待购买药品的容器 |
| 购物车项 | Cart Item，购物车中的单个商品记录 |
| 商品数量 | Quantity，购物车中某个商品的数量 |
| 购物车汇总 | Cart Summary，购物车的统计信息（总数量、总金额等） |

---

## 功能需求 (EARS格式)

### FR-CB-001: 添加商品到购物车
**WHEN** 用户在药品详情页点击"加入购物车"按钮  
**THE SYSTEM SHALL** 将选中的药品添加到用户购物车  
**AND** 如果该药品已存在，则增加数量  
**AND** 返回购物车总数量

**验收标准:**
- 能成功添加新商品到购物车
- 重复添加同一商品时数量累加
- 返回更新后的购物车总数量
- 添加失败时返回明确的错误信息

---

### FR-CB-002: 获取购物车列表
**WHEN** 用户打开购物车页面  
**THE SYSTEM SHALL** 返回该用户的所有购物车商品  
**AND** 包含商品详情（名称、图片、价格、规格等）  
**AND** 包含每个商品的数量和选中状态

**验收标准:**
- 能正确查询用户的购物车列表
- 商品信息完整（包含图片、价格、库存等）
- 显示每个商品的数量和选中状态
- 空购物车返回空列表

---

### FR-CB-003: 更新商品数量
**WHEN** 用户在购物车中修改商品数量  
**THE SYSTEM SHALL** 更新该商品的数量  
**AND** 验证数量不超过库存  
**AND** 验证数量大于0

**验收标准:**
- 能成功更新商品数量
- 数量不能超过库存限制
- 数量不能小于1
- 更新后返回最新的购物车信息

---

### FR-CB-004: 删除购物车商品
**WHEN** 用户在购物车中删除某个商品  
**THE SYSTEM SHALL** 从购物车中移除该商品  
**AND** 返回删除成功的提示

**验收标准:**
- 能成功删除指定商品
- 删除后该商品不再出现在购物车列表中
- 删除不存在的商品返回友好提示

---

### FR-CB-005: 获取购物车数量
**WHEN** 用户浏览商城任意页面  
**THE SYSTEM SHALL** 在购物车图标上显示商品总数量  
**AND** 实时更新数量

**验收标准:**
- 能快速查询购物车商品总数量
- 数量统计准确
- 响应时间 < 100ms

---

## 非功能性需求

### NFR-CB-001: 性能要求
- 购物车列表查询响应时间 < 500ms
- 添加/更新/删除操作响应时间 < 300ms
- 购物车数量查询响应时间 < 100ms
- 支持并发操作，避免数量不一致

### NFR-CB-002: 可用性要求
- 操作失败时提供明确的错误提示
- 库存不足时给出友好提示
- 支持离线添加，联网后同步

### NFR-CB-003: 数据一致性
- 购物车数据与库存数据保持一致
- 并发操作时使用乐观锁或悲观锁
- 定期清理过期购物车数据

---

## 约束条件

### 技术约束
- 使用现有的 `CartController` 和 `CartService`
- 购物车数据存储在 `t_mall_cart` 表
- 使用Redis缓存购物车数量

### 业务约束
- 每个用户最多100个购物车商品
- 单个商品数量不超过库存
- 购物车数据保留30天

---

## API接口定义

### 1. 添加商品到购物车

**接口:** `POST /api/v1/mall/cart/add`

**请求体:**
```json
{
  "userId": 1001,
  "drugId": 5001,
  "quantity": 2
}
```

**响应:**
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "cartItemId": 10001,
    "totalQuantity": 5,
    "totalAmount": 365.90
  }
}
```

---

### 2. 获取购物车列表

**接口:** `GET /api/v1/mall/cart/{userId}`

**路径参数:**
- `userId`: 用户ID

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "cartItemId": 10001,
        "drugId": 5001,
        "drugName": "感冒灵颗粒",
        "drugImages": ["https://...", "https://..."],
        "spec": "10g*12袋",
        "price": 29.90,
        "quantity": 2,
        "selected": true,
        "stock": 100,
        "isFreeShipping": true
      }
    ],
    "summary": {
      "totalQuantity": 5,
      "selectedQuantity": 3,
      "totalAmount": 365.90,
      "selectedAmount": 189.70
    }
  }
}
```

---

### 3. 更新商品数量

**接口:** `PUT /api/v1/mall/cart/update`

**请求体:**
```json
{
  "cartItemId": 10001,
  "quantity": 3
}
```

**响应:**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "cartItemId": 10001,
    "quantity": 3,
    "totalAmount": 89.70
  }
}
```

---

### 4. 删除购物车商品

**接口:** `DELETE /api/v1/mall/cart/{itemId}`

**路径参数:**
- `itemId`: 购物车项ID

**响应:**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 5. 获取购物车数量

**接口:** `GET /api/v1/mall/cart/{userId}/count`

**路径参数:**
- `userId`: 用户ID

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": 5
}
```

---

## 验收标准清单

### 功能验收
- [ ] 能添加商品到购物车
- [ ] 重复添加同一商品时数量累加
- [ ] 能查询购物车列表
- [ ] 购物车列表包含完整的商品信息
- [ ] 能更新商品数量
- [ ] 数量更新时验证库存限制
- [ ] 能删除购物车商品
- [ ] 能快速查询购物车数量

### 性能验收
- [ ] 购物车列表查询 < 500ms
- [ ] 添加/更新/删除操作 < 300ms
- [ ] 购物车数量查询 < 100ms

### 异常处理验收
- [ ] 库存不足时给出友好提示
- [ ] 商品不存在时返回错误信息
- [ ] 并发操作时数据一致

---

## 相关文档

- [设计文档](./design.md)
- [任务列表](./tasks.md)
- [药品详情Spec](../patient-mall-phase2-drug-detail/requirements.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
- [父级需求文档](../patient-drug-mall/requirements.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
