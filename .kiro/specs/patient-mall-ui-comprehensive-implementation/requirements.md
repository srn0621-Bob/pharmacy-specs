# 患者端药品商城UI实现需求分析

## 引言

本文档基于药品商城APP的UI设计图，分析所需的后端API接口，并检查现有后端实现是否满足对接要求。

## 术语表

- **患者端系统 (Patient System)**: 面向患者用户的移动应用系统
- **药品商城 (Drug Mall)**: 在线药品购买平台
- **购物车 (Shopping Cart)**: 用户临时存放待购药品的容器
- **订单系统 (Order System)**: 处理药品订单创建、支付、物流的系统
- **搜索引擎 (Search Engine)**: 药品搜索和筛选功能模块
- **分类系统 (Category System)**: 药品分类管理模块

## 需求分析

### 需求 1: 首页展示

**用户故事**: 作为患者用户，我想要在首页看到药品分类、热门药品和推荐内容，以便快速找到需要的药品。

#### 验收标准

1. WHEN 用户打开药品商城首页 THEN 患者端系统 SHALL 显示顶部搜索栏
2. WHEN 用户查看首页 THEN 患者端系统 SHALL 显示快捷分类入口（至少8-10个常用分类）
3. WHEN 用户查看首页 THEN 患者端系统 SHALL 显示热门药品列表（包含药品图片、名称、规格、价格）
4. WHEN 用户查看首页 THEN 患者端系统 SHALL 显示推荐药品网格布局（2列展示）
5. WHEN 用户滚动首页 THEN 患者端系统 SHALL 支持分页加载更多药品

### 需求 2: 药品搜索

**用户故事**: 作为患者用户，我想要搜索药品，以便快速找到我需要的特定药品。

#### 验收标准

1. WHEN 用户点击搜索框 THEN 患者端系统 SHALL 显示搜索历史记录
2. WHEN 用户点击搜索框 THEN 患者端系统 SHALL 显示热门搜索关键词
3. WHEN 用户输入搜索关键词 THEN 患者端系统 SHALL 实时返回匹配的药品列表
4. WHEN 用户提交搜索 THEN 患者端系统 SHALL 保存搜索历史
5. WHEN 用户查看搜索结果 THEN 患者端系统 SHALL 支持按价格、销量排序
6. WHEN 用户清空搜索历史 THEN 患者端系统 SHALL 删除该用户的所有搜索记录

### 需求 3: 药品分类浏览

**用户故事**: 作为患者用户，我想要按分类浏览药品，以便在特定类别中查找药品。

#### 验收标准

1. WHEN 用户点击分类入口 THEN 患者端系统 SHALL 显示完整的药品分类列表
2. WHEN 用户选择某个分类 THEN 患者端系统 SHALL 显示该分类下的所有药品
3. WHEN 用户查看分类药品 THEN 患者端系统 SHALL 支持按销量、价格、时间排序
4. WHEN 用户查看分类药品 THEN 患者端系统 SHALL 支持分页加载
5. WHERE 首页快捷分类 THEN 患者端系统 SHALL 返回前10个热门分类

### 需求 4: 药品详情查看

**用户故事**: 作为患者用户，我想要查看药品的详细信息，以便了解药品的功效、用法和注意事项。

#### 验收标准

1. WHEN 用户点击药品 THEN 患者端系统 SHALL 显示药品详情页面
2. WHEN 用户查看药品详情 THEN 患者端系统 SHALL 显示药品图片、名称、规格、价格、库存
3. WHEN 用户查看药品详情 THEN 患者端系统 SHALL 显示药品说明（功效、用法、注意事项）
4. WHEN 用户查看药品详情 THEN 患者端系统 SHALL 显示相关推荐药品（至少6个）
5. WHEN 用户在详情页 THEN 患者端系统 SHALL 提供加入购物车和立即购买按钮

### 需求 5: 购物车管理

**用户故事**: 作为患者用户，我想要管理购物车中的药品，以便批量购买或调整购买数量。

#### 验收标准

1. WHEN 用户添加药品到购物车 THEN 患者端系统 SHALL 保存药品信息和数量
2. WHEN 用户打开购物车 THEN 患者端系统 SHALL 显示所有已添加的药品列表
3. WHEN 用户查看购物车 THEN 患者端系统 SHALL 显示每个药品的图片、名称、规格、单价、数量、小计
4. WHEN 用户修改数量 THEN 患者端系统 SHALL 更新购物车并重新计算总价
5. WHEN 用户删除药品 THEN 患者端系统 SHALL 从购物车中移除该药品
6. WHEN 用户选中/取消选中药品 THEN 患者端系统 SHALL 更新选中状态并重新计算总价
7. WHEN 用户全选/取消全选 THEN 患者端系统 SHALL 更新所有药品的选中状态
8. WHEN 用户查看购物车底部 THEN 患者端系统 SHALL 显示已选商品数量和总价
9. WHEN 用户点击结算 THEN 患者端系统 SHALL 验证选中药品并跳转到订单确认页面
10. WHEN 购物车为空 THEN 患者端系统 SHALL 显示空状态提示

### 需求 6: 订单创建

**用户故事**: 作为患者用户，我想要创建订单，以便购买选中的药品。

#### 验收标准

1. WHEN 用户点击结算 THEN 患者端系统 SHALL 显示订单确认页面
2. WHEN 用户查看订单确认页 THEN 患者端系统 SHALL 显示收货地址信息
3. WHEN 用户查看订单确认页 THEN 患者端系统 SHALL 显示药品清单和价格明细
4. WHEN 用户提交订单 THEN 患者端系统 SHALL 创建订单并返回订单号
5. WHEN 订单创建成功 THEN 患者端系统 SHALL 清空购物车中已购买的药品
6. IF 用户未设置收货地址 THEN 患者端系统 SHALL 提示用户添加收货地址

### 需求 7: 订单查询

**用户故事**: 作为患者用户，我想要查看我的订单列表和订单详情，以便跟踪订单状态。

#### 验收标准

1. WHEN 用户打开订单列表 THEN 患者端系统 SHALL 显示该用户的所有订单
2. WHEN 用户查看订单列表 THEN 患者端系统 SHALL 显示订单号、状态、药品信息、总价、创建时间
3. WHEN 用户点击订单 THEN 患者端系统 SHALL 显示订单详情页面
4. WHEN 用户查看订单详情 THEN 患者端系统 SHALL 显示完整的订单信息和物流信息
5. WHERE 订单状态筛选 THEN 患者端系统 SHALL 支持按状态筛选订单（全部、待支付、待发货、待收货、已完成）

### 需求 8: 药品列表展示

**用户故事**: 作为患者用户，我想要看到统一格式的药品列表，以便快速浏览和比较药品。

#### 验收标准

1. WHEN 患者端系统显示药品列表 THEN 每个药品项 SHALL 包含药品图片
2. WHEN 患者端系统显示药品列表 THEN 每个药品项 SHALL 包含药品名称
3. WHEN 患者端系统显示药品列表 THEN 每个药品项 SHALL 包含药品规格
4. WHEN 患者端系统显示药品列表 THEN 每个药品项 SHALL 包含药品价格（显著标识）
5. WHEN 患者端系统显示药品列表 THEN 每个药品项 SHALL 包含销量或评价信息
6. WHERE 药品列表布局 THEN 患者端系统 SHALL 支持网格布局（2列）和列表布局切换

### 需求 9: 购物车数量徽章

**用户故事**: 作为患者用户，我想要在购物车图标上看到商品数量，以便知道购物车中有多少商品。

#### 验收标准

1. WHEN 用户添加药品到购物车 THEN 患者端系统 SHALL 更新购物车图标上的数量徽章
2. WHEN 用户删除购物车中的药品 THEN 患者端系统 SHALL 更新购物车图标上的数量徽章
3. WHEN 购物车为空 THEN 患者端系统 SHALL 隐藏数量徽章
4. WHEN 用户打开任意页面 THEN 患者端系统 SHALL 显示当前购物车的商品数量

### 需求 10: 图片加载优化

**用户故事**: 作为患者用户，我想要快速看到药品图片，以便流畅地浏览药品。

#### 验收标准

1. WHEN 患者端系统加载药品图片 THEN 系统 SHALL 使用缩略图优先加载
2. WHEN 药品图片加载失败 THEN 患者端系统 SHALL 显示默认占位图
3. WHEN 用户滚动列表 THEN 患者端系统 SHALL 使用懒加载技术加载可见区域的图片
4. WHEN 用户查看药品详情 THEN 患者端系统 SHALL 加载高清大图
5. WHERE 图片缓存 THEN 患者端系统 SHALL 缓存已加载的图片以提高性能

## API需求映射

### 首页相关API

| API端点 | 方法 | 功能 | 对应需求 | 实现状态 |
|---------|------|------|----------|----------|
| `/api/patient/drug/category/quick` | GET | 获取快捷分类 | 需求1.2 | ✅ 已实现 |
| `/api/patient/drug/search/hot` | GET | 获取热门搜索 | 需求1, 需求2.2 | ✅ 已实现 |
| `/api/patient/drug/list` | GET | 获取药品列表（首页推荐） | 需求1.4 | ⚠️ 需确认 |

### 搜索相关API

| API端点 | 方法 | 功能 | 对应需求 | 实现状态 |
|---------|------|------|----------|----------|
| `/api/patient/drug/search/list` | GET | 搜索药品 | 需求2.3 | ✅ 已实现 |
| `/api/patient/drug/search/history` | GET | 获取搜索历史 | 需求2.1 | ✅ 已实现 |
| `/api/patient/drug/search/history` | DELETE | 清空搜索历史 | 需求2.6 | ✅ 已实现 |
| `/api/patient/drug/search/hot` | GET | 获取热门搜索 | 需求2.2 | ✅ 已实现 |

### 分类相关API

| API端点 | 方法 | 功能 | 对应需求 | 实现状态 |
|---------|------|------|----------|----------|
| `/api/patient/drug/category/list` | GET | 获取分类列表 | 需求3.1 | ✅ 已实现 |
| `/api/patient/drug/category/drugs` | GET | 按分类查询药品 | 需求3.2 | ✅ 已实现 |
| `/api/patient/drug/category/quick` | GET | 获取快捷分类 | 需求3.5 | ✅ 已实现 |

### 药品详情相关API

| API端点 | 方法 | 功能 | 对应需求 | 实现状态 |
|---------|------|------|----------|----------|
| `/api/patient/drug/detail/{id}` | GET | 获取药品详情 | 需求4.1-4.3 | ✅ 已实现 |
| `/api/patient/drug/detail/{id}/related` | GET | 获取相关推荐 | 需求4.4 | ✅ 已实现 |

### 购物车相关API

| API端点 | 方法 | 功能 | 对应需求 | 实现状态 |
|---------|------|------|----------|----------|
| `/api/patient/cart/add` | POST | 添加到购物车 | 需求5.1 | ✅ 已实现 |
| `/api/patient/cart/list` | GET | 获取购物车列表 | 需求5.2 | ✅ 已实现 |
| `/api/patient/cart/quantity` | PUT | 更新数量 | 需求5.4 | ✅ 已实现 |
| `/api/patient/cart/remove` | DELETE | 删除商品 | 需求5.5 | ✅ 已实现 |
| `/api/patient/cart/select` | PUT | 选中/取消选中 | 需求5.6 | ✅ 已实现 |
| `/api/patient/cart/selectAll` | PUT | 全选/取消全选 | 需求5.7 | ✅ 已实现 |
| `/api/patient/cart/summary` | GET | 获取汇总信息 | 需求5.8 | ✅ 已实现 |
| `/api/patient/cart/count` | GET | 获取购物车数量 | 需求9 | ✅ 已实现 |
| `/api/patient/cart/batchRemove` | DELETE | 批量删除 | 需求5.5 | ✅ 已实现 |
| `/api/patient/cart/clear` | DELETE | 清空购物车 | 需求5.10 | ✅ 已实现 |

### 订单相关API

| API端点 | 方法 | 功能 | 对应需求 | 实现状态 |
|---------|------|------|----------|----------|
| `/api/patient/order/create` | POST | 创建订单 | 需求6.4 | ✅ 已实现 |
| `/api/patient/order/list` | GET | 获取订单列表 | 需求7.1 | ⚠️ 需确认 |
| `/api/patient/order/detail/{id}` | GET | 获取订单详情 | 需求7.3 | ⚠️ 需确认 |

## 需要补充的API

基于UI设计分析，以下API可能需要补充或确认：

1. **首页药品列表API** - 需要一个专门的首页推荐药品接口
2. **订单列表API** - 需要确认是否已实现订单列表查询
3. **订单详情API** - 需要确认是否已实现订单详情查询
4. **收货地址API** - 订单创建需要收货地址管理接口
5. **药品图片API** - 需要确认图片URL的返回格式和缩略图支持

## 数据模型要求

### 药品信息模型

```json
{
  "id": "药品ID",
  "name": "药品名称",
  "spec": "规格",
  "price": "价格",
  "originalPrice": "原价（用于显示折扣）",
  "imageUrl": "图片URL",
  "thumbnailUrl": "缩略图URL",
  "stock": "库存",
  "sales": "销量",
  "categoryId": "分类ID",
  "categoryName": "分类名称",
  "description": "药品说明",
  "usage": "用法用量",
  "precautions": "注意事项"
}
```

### 购物车项模型

```json
{
  "id": "购物车项ID",
  "userId": "用户ID",
  "drugId": "药品ID",
  "drugName": "药品名称",
  "drugSpec": "规格",
  "drugImage": "药品图片",
  "price": "单价",
  "quantity": "数量",
  "subtotal": "小计",
  "isSelected": "是否选中 (0-未选中, 1-选中)",
  "stock": "库存",
  "createTime": "添加时间"
}
```

### 订单模型

```json
{
  "orderId": "订单号",
  "userId": "用户ID",
  "status": "订单状态",
  "totalAmount": "总金额",
  "createTime": "创建时间",
  "payTime": "支付时间",
  "deliveryTime": "发货时间",
  "receiveTime": "收货时间",
  "addressInfo": {
    "receiverName": "收货人",
    "receiverPhone": "联系电话",
    "province": "省",
    "city": "市",
    "district": "区",
    "detailAddress": "详细地址"
  },
  "items": [
    {
      "drugId": "药品ID",
      "drugName": "药品名称",
      "drugSpec": "规格",
      "drugImage": "药品图片",
      "price": "单价",
      "quantity": "数量",
      "subtotal": "小计"
    }
  ]
}
```

## 性能要求

1. **响应时间**: 所有API的响应时间应在500ms以内
2. **并发支持**: 系统应支持至少1000个并发用户
3. **图片加载**: 缩略图大小应控制在50KB以内
4. **分页大小**: 列表接口默认每页20条，最大不超过100条
5. **缓存策略**: 分类列表、热门搜索等静态数据应使用缓存

## 安全要求

1. **用户认证**: 所有API需要验证用户登录状态
2. **数据校验**: 所有输入参数需要进行合法性校验
3. **价格保护**: 订单金额需要在服务端重新计算，不能信任客户端传值
4. **库存校验**: 下单时需要校验库存是否充足
5. **处方药管理**: 处方药需要上传处方并经过审核

## 兼容性要求

1. **API版本**: 使用统一的API版本前缀 `/api/patient/`
2. **数据格式**: 统一使用JSON格式
3. **错误码**: 使用统一的错误码体系
4. **时间格式**: 统一使用ISO 8601格式或Unix时间戳
5. **分页参数**: 统一使用 `page` 和 `limit` 参数
