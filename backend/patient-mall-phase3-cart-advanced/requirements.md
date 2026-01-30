# Spec 7: 购物车高级功能 - 需求文档

## 文档信息

**Spec ID:** patient-mall-phase3-cart-advanced  
**Spec名称:** 购物车高级功能  
**创建日期:** 2026-01-23  
**所属阶段:** 阶段三 - 购物车功能  
**依赖:** Spec 6 (购物车基础功能)

---

## 简介

实现购物车的高级功能，包括选中/取消选中、批量操作、清空购物车和购物车汇总信息计算。

### 术语表

| 术语 | 定义 |
|------|------|
| 选中状态 | Selected Status，标识购物车商品是否参与结算 |
| 批量操作 | Batch Operation，对多个购物车商品执行相同操作 |
| 购物车汇总 | Cart Summary，购物车的统计信息（总数量、总金额、选中数量、选中金额） |
| 全选 | Select All，选中购物车中的所有商品 |

---

## 功能需求 (EARS格式)

### FR-CA-001: 选中/取消选中商品
**WHEN** 用户在购物车中点击商品的选择框  
**THE SYSTEM SHALL** 切换该商品的选中状态  
**AND** 更新购物车汇总信息  
**AND** 返回更新后的选中状态

**验收标准:**
- 能成功切换商品的选中状态
- 选中状态持久化到数据库
- 汇总信息实时更新
- 支持单个商品的选中/取消选中

---

### FR-CA-002: 批量选中/取消选中
**WHEN** 用户点击"全选"或"取消全选"按钮  
**THE SYSTEM SHALL** 批量更新所有商品的选中状态  
**AND** 更新购物车汇总信息  
**AND** 返回操作结果

**验收标准:**
- 能批量选中所有商品
- 能批量取消选中所有商品
- 批量操作性能良好
- 汇总信息正确更新

---

### FR-CA-003: 批量删除商品
**WHEN** 用户选中多个商品后点击"删除"按钮  
**THE SYSTEM SHALL** 批量删除选中的商品  
**AND** 更新购物车汇总信息  
**AND** 返回删除成功的提示

**验收标准:**
- 能批量删除多个商品
- 只删除选中的商品
- 删除操作支持事务
- 删除后汇总信息正确

---

### FR-CA-004: 清空购物车
**WHEN** 用户点击"清空购物车"按钮  
**THE SYSTEM SHALL** 删除该用户的所有购物车商品  
**AND** 清空购物车汇总信息  
**AND** 返回清空成功的提示

**验收标准:**
- 能清空用户的所有购物车商品
- 清空操作不可恢复
- 清空后购物车为空
- 需要用户二次确认

---

### FR-CA-005: 获取购物车汇总
**WHEN** 用户查看购物车页面  
**THE SYSTEM SHALL** 计算并返回购物车汇总信息  
**AND** 包含总数量、总金额、选中数量、选中金额  
**AND** 实时更新汇总信息

**验收标准:**
- 汇总信息计算准确
- 包含全部商品和选中商品的统计
- 金额计算考虑优惠和折扣
- 响应时间 < 200ms

---

## 非功能性需求

### NFR-CA-001: 性能要求
- 选中/取消选中操作响应时间 < 200ms
- 批量操作响应时间 < 500ms
- 汇总信息计算响应时间 < 200ms
- 支持并发操作

### NFR-CA-002: 可用性要求
- 批量操作提供进度提示
- 清空购物车需要二次确认
- 操作失败时提供明确的错误提示

### NFR-CA-003: 数据一致性
- 选中状态与汇总信息保持一致
- 批量操作支持事务
- 并发操作时数据不冲突

---

## 约束条件

### 技术约束
- 使用现有的 `CartController` 和 `CartService`
- 批量操作使用数据库事务
- 汇总信息实时计算，不缓存

### 业务约束
- 清空购物车需要用户确认
- 批量删除只删除选中的商品
- 汇总金额保留两位小数

---

## API接口定义

### 1. 选中/取消选中商品

**接口:** `PUT /api/v1/mall/cart/{itemId}/select`

**路径参数:**
- `itemId`: 购物车项ID

**请求体:**
```json
{
  "selected": true
}
```

**响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "cartItemId": 10001,
    "selected": true,
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

### 2. 批量选中/取消选中

**接口:** `PUT /api/v1/mall/cart/batch-select`

**请求体:**
```json
{
  "userId": 1001,
  "selected": true
}
```

**响应:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "affectedCount": 5,
    "summary": {
      "totalQuantity": 5,
      "selectedQuantity": 5,
      "totalAmount": 365.90,
      "selectedAmount": 365.90
    }
  }
}
```

---

### 3. 批量删除商品

**接口:** `POST /api/v1/mall/cart/batch-remove`

**请求体:**
```json
{
  "userId": 1001,
  "cartItemIds": [10001, 10002, 10003]
}
```

**响应:**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "deletedCount": 3,
    "summary": {
      "totalQuantity": 2,
      "selectedQuantity": 2,
      "totalAmount": 176.20,
      "selectedAmount": 176.20
    }
  }
}
```

---

### 4. 清空购物车

**接口:** `DELETE /api/v1/mall/cart/{userId}/clear`

**路径参数:**
- `userId`: 用户ID

**响应:**
```json
{
  "code": 200,
  "message": "购物车已清空",
  "data": null
}
```

---

### 5. 获取购物车汇总

**接口:** `GET /api/v1/mall/cart/{userId}/summary`

**路径参数:**
- `userId`: 用户ID

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalQuantity": 5,
    "selectedQuantity": 3,
    "totalAmount": 365.90,
    "selectedAmount": 189.70,
    "totalItems": 5,
    "selectedItems": 3,
    "discountAmount": 0.00,
    "shippingFee": 0.00
  }
}
```

---

## 验收标准清单

### 功能验收
- [ ] 能选中/取消选中单个商品
- [ ] 能批量选中所有商品
- [ ] 能批量取消选中所有商品
- [ ] 能批量删除选中的商品
- [ ] 能清空购物车
- [ ] 汇总信息计算准确
- [ ] 选中状态持久化

### 性能验收
- [ ] 选中操作 < 200ms
- [ ] 批量操作 < 500ms
- [ ] 汇总计算 < 200ms

### 异常处理验收
- [ ] 清空购物车有二次确认
- [ ] 批量操作失败时回滚
- [ ] 并发操作时数据一致

---

## 相关文档

- [设计文档](./design.md)
- [任务列表](./tasks.md)
- [购物车基础功能Spec](../patient-mall-phase3-cart-basic/requirements.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
- [父级需求文档](../patient-drug-mall/requirements.md)

---

**文档版本:** 1.0  
**最后更新:** 2026-01-23  
**维护人员:** Kiro AI Assistant
