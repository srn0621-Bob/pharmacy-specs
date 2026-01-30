# 药品商城API依赖分析文档

> 文档版本: v1.0  
> 创建时间: 2026-01-28  
> 最后更新: 2026-01-28

## 目录

- [一、概述](#一概述)
- [二、MallMainActivity启动所需API](#二mallmainactivity启动所需api)
- [三、API实现状态总览](#三api实现状态总览)
- [四、详细API清单](#四详细api清单)
- [五、缺失API分析](#五缺失api分析)
- [六、实施建议](#六实施建议)

---

## 一、概述

### 1.1 页面结构

MallMainActivity包含4个Tab，每个Tab对应一个Fragment：

```
MallMainActivity
├── MallHomeFragment (商城首页) ✓ 需要API
├── CategoryFragment (分类) TODO
├── CartFragment (购物车) ✓ 需要API
└── MineFragment (我的) TODO
```

### 1.2 API服务端点

**前端API基础路径**: `/api/v1/mall/`  
**后端项目**: `internet-hospital/adinnet-patient-api`  
**Controller包路径**: `com.patient.api.app.mall.controller`

---

## 二、MallMainActivity启动所需API

### 2.1 核心启动流程

```
用户点击商城Tab
    ↓
MallMainActivity.onCreate()
    ↓
初始化4个Fragment
    ↓
MallHomeFragment.onResume()
    ↓
调用 loadHomeData()
    ↓
需要API: GET /api/v1/mall/home
```

### 2.2 最小可用API集

MallMainActivity能够正常启动和显示，**最少需要以下API**：

| 序号 | API端点 | 方法 | 说明 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| 1 | `/api/v1/mall/home` | GET | 获取首页数据（轮播图、分类、推荐药品） | P0 | ❌ 缺失 |
| 2 | `/api/v1/mall/drugs/categories` | GET | 获取药品分类列表 | P0 | ✅ 已实现 |
| 3 | `/api/v1/mall/drugs/recommended` | GET | 获取推荐药品列表 | P0 | ✅ 已实现 |
| 4 | `/api/v1/mall/cart/{userId}` | GET | 获取用户购物车列表 | P1 | ✅ 已实现 |

**说明：**
- **P0**: 必须实现，否则页面无法正常显示
- **P1**: 重要功能，建议实现
- **P2**: 增强功能，可延后实现

---

## 三、API实现状态总览

### 3.1 实现状态统计

| 模块 | 总数 | 已实现 | 缺失 | 完成率 |
|------|------|--------|------|--------|
| 商城首页 | 3 | 2 | 1 | 67% |
| 药品管理 | 8 | 8 | 0 | 100% |
| 购物车 | 11 | 11 | 0 | 100% |
| 订单管理 | 2 | 0 | 2 | 0% |
| **总计** | **24** | **21** | **3** | **88%** |

### 3.2 关键发现

✅ **已完成模块**:
- 药品查询、搜索、详情 - 100%完成
- 购物车CRUD操作 - 100%完成
- 药品分类管理 - 100%完成

❌ **缺失模块**:
- 商城首页聚合API - 需要新增
- 订单创建和查询 - 需要新增

⚠️ **潜在问题**:
- 前端使用模拟数据，未真正调用后端API
- 缺少首页聚合接口，需要多次请求拼装数据

---

## 四、详细API清单

### 4.1 商城首页相关API

#### 4.1.1 获取首页数据 ❌ 缺失

**前端定义**:
```java
@GET("mall/home")
Observable<BaseResponse<MallHomeData>> getHomeData();
```

**后端实现**: ❌ 未实现

**数据结构**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "banners": [
      {
        "imageUrl": "https://...",
        "linkUrl": "...",
        "title": "活动标题"
      }
    ],
    "categories": [
      {
        "id": "1",
        "name": "感冒发烧",
        "icon": "https://..."
      }
    ],
    "hotDrugs": [
      {
        "id": "1",
        "name": "阿莫西林胶囊",
        "price": 15.80,
        "imageUrl": "https://..."
      }
    ],
    "recommendDrugs": [...]
  }
}
```

**实施建议**: 
- 创建 `MallHomeController.getHomeData()` 方法
- 聚合轮播图、分类、热销药品、推荐药品数据
- 使用Redis缓存，提升性能

#### 4.1.2 获取药品分类列表 ✅ 已实现

**前端定义**:
```java
@GET("mall/categories")
Observable<BaseResponse<List<Category>>> getCategories();
```

**后端实现**: ✅ 已实现
```java
// DrugMallController.java
@GetMapping("/categories")
public ApiResponse<List<DrugCategoryDTO>> getDrugCategories()
```

**实际路径**: `/api/v1/mall/drugs/categories`

**状态**: ✅ 可用

#### 4.1.3 获取推荐药品列表 ✅ 已实现

**前端定义**:
```java
@GET("mall/drugs/recommended")
Observable<BaseResponse<List<Drug>>> getRecommendedDrugs(@Query("limit") int limit);
```

**后端实现**: ✅ 已实现
```java
// DrugMallController.java
@GetMapping("/recommended")
public ApiResponse<List<DrugDTO>> getRecommendedDrugs(@RequestParam Integer limit)
```

**实际路径**: `/api/v1/mall/drugs/recommended`

**状态**: ✅ 可用

### 4.2 药品查询相关API

#### 4.2.1 按分类查询药品 ✅ 已实现

**前端定义**:
```java
@GET("mall/drugs/category/{categoryId}")
Observable<DataResponse<List<Drug>>> getDrugsByCategory(
    @Path("categoryId") String categoryId,
    @Query("page") int page,
    @Query("size") int size
);
```

**后端实现**: ✅ 已实现
```java
// DrugMallController.java
@GetMapping("/category/{categoryId}")
public ApiResponse<DrugListResponse> getDrugsByCategory(
    @PathVariable Long categoryId,
    @RequestParam Integer pageNum,
    @RequestParam Integer pageSize
)
```

**实际路径**: `/api/v1/mall/drugs/category/{categoryId}`

**状态**: ✅ 可用

#### 4.2.2 搜索药品 ✅ 已实现

**前端定义**:
```java
@GET("mall/drugs/search")
Observable<DataResponse<List<Drug>>> searchDrugs(
    @Query("keyword") String keyword,
    @Query("page") int page,
    @Query("size") int size
);
```

**后端实现**: ✅ 已实现
```java
// DrugMallController.java
@GetMapping("/search")
public ApiResponse<DrugListResponse> searchDrugs(@Valid DrugSearchFilter filter)
```

**实际路径**: `/api/v1/mall/drugs/search`

**状态**: ✅ 可用

#### 4.2.3 获取药品详情 ✅ 已实现

**前端定义**:
```java
@GET("mall/drugs/{drugId}")
Observable<BaseResponse<Drug>> getDrugDetail(@Path("drugId") String drugId);
```

**后端实现**: ✅ 已实现
```java
// DrugMallController.java
@GetMapping("/{drugId}")
public ApiResponse<DrugDTO> getDrugDetail(@PathVariable Long drugId)
```

**实际路径**: `/api/v1/mall/drugs/{drugId}`

**状态**: ✅ 可用

#### 4.2.4 获取药品库存 ✅ 已实现

**前端定义**: 未定义（前端缺失）

**后端实现**: ✅ 已实现
```java
// DrugMallController.java
@GetMapping("/{drugId}/stock")
public ApiResponse<Integer> getDrugStock(@PathVariable Long drugId)
```

**实际路径**: `/api/v1/mall/drugs/{drugId}/stock`

**状态**: ✅ 可用，但前端未使用

#### 4.2.5 批量获取药品库存 ✅ 已实现

**前端定义**: 未定义（前端缺失）

**后端实现**: ✅ 已实现
```java
// DrugMallController.java
@PostMapping("/stock/batch")
public ApiResponse<List<DrugDTO>> getDrugStockBatch(@RequestBody List<Long> drugIds)
```

**实际路径**: `/api/v1/mall/drugs/stock/batch`

**状态**: ✅ 可用，但前端未使用

### 4.3 购物车相关API

#### 4.3.1 添加到购物车 ✅ 已实现

**前端定义**:
```java
@POST("mall/cart/add")
Observable<BaseResponse<Void>> addToCart(@Body AddCartRequest request);
```

**后端实现**: ✅ 已实现
```java
// CartController.java
@PostMapping("/add")
public ApiResponse<CartSummary> addToCart(@RequestBody CartOperationDTO operation)
```

**实际路径**: `/api/v1/mall/cart/add`

**状态**: ✅ 可用

#### 4.3.2 获取购物车列表 ✅ 已实现

**前端定义**:
```java
@GET("mall/cart")
Observable<BaseResponse<List<CartItem>>> getCartList();
```

**后端实现**: ✅ 已实现
```java
// CartController.java
@GetMapping("/{userId}")
public ApiResponse<List<CartItem>> getCartItems(@PathVariable Long userId)
```

**实际路径**: `/api/v1/mall/cart/{userId}`

**状态**: ✅ 可用

**注意**: 前端定义未包含userId参数，需要调整

#### 4.3.3 更新购物车数量 ✅ 已实现

**前端定义**:
```java
@PUT("mall/cart/{itemId}/quantity")
Observable<BaseResponse<Void>> updateCartQuantity(
    @Path("itemId") String itemId,
    @Body UpdateQuantityRequest request
);
```

**后端实现**: ✅ 已实现
```java
// CartController.java
@PutMapping("/update")
public ApiResponse<CartSummary> updateCartItem(@RequestBody CartOperationDTO operation)
```

**实际路径**: `/api/v1/mall/cart/update`

**状态**: ✅ 可用

**注意**: 路径不完全匹配，前端使用`/{itemId}/quantity`，后端使用`/update`

#### 4.3.4 删除购物车项 ✅ 已实现

**前端定义**:
```java
@DELETE("mall/cart/{itemId}")
Observable<BaseResponse<Void>> deleteCartItem(@Path("itemId") String itemId);
```

**后端实现**: ✅ 已实现
```java
// CartController.java
@DeleteMapping("/{itemId}")
public ApiResponse<Void> removeCartItem(@PathVariable Long itemId)
```

**实际路径**: `/api/v1/mall/cart/{itemId}`

**状态**: ✅ 可用

#### 4.3.5 获取购物车汇总 ✅ 已实现

**前端定义**: 未定义（前端缺失）

**后端实现**: ✅ 已实现
```java
// CartController.java
@GetMapping("/{userId}/summary")
public ApiResponse<CartSummary> getCartSummary(@PathVariable Long userId)
```

**实际路径**: `/api/v1/mall/cart/{userId}/summary`

**状态**: ✅ 可用，但前端未使用

#### 4.3.6 批量删除购物车项 ✅ 已实现

**前端定义**: 未定义（前端缺失）

**后端实现**: ✅ 已实现
```java
// CartController.java
@PostMapping("/batch-remove")
public ApiResponse<Void> batchRemoveCartItems(
    @RequestBody List<Long> itemIds,
    @RequestParam Long userId
)
```

**实际路径**: `/api/v1/mall/cart/batch-remove`

**状态**: ✅ 可用，但前端未使用

#### 4.3.7 清空购物车 ✅ 已实现

**前端定义**: 未定义（前端缺失）

**后端实现**: ✅ 已实现
```java
// CartController.java
@DeleteMapping("/{userId}/clear")
public ApiResponse<Void> clearCart(@PathVariable Long userId)
```

**实际路径**: `/api/v1/mall/cart/{userId}/clear`

**状态**: ✅ 可用，但前端未使用

#### 4.3.8 选中/取消选中购物车项 ✅ 已实现

**前端定义**: 未定义（前端缺失）

**后端实现**: ✅ 已实现
```java
// CartController.java
@PutMapping("/{itemId}/select")
public ApiResponse<CartItem> selectCartItem(
    @PathVariable Long itemId,
    @RequestBody Boolean selected,
    @RequestParam Long userId
)
```

**实际路径**: `/api/v1/mall/cart/{itemId}/select`

**状态**: ✅ 可用，但前端未使用

#### 4.3.9 批量选中购物车项 ✅ 已实现

**前端定义**: 未定义（前端缺失）

**后端实现**: ✅ 已实现
```java
// CartController.java
@PutMapping("/batch-select")
public ApiResponse<Void> batchSelectCartItems(@RequestBody CartOperationDTO operation)
```

**实际路径**: `/api/v1/mall/cart/batch-select`

**状态**: ✅ 可用，但前端未使用

#### 4.3.10 同步本地购物车 ✅ 已实现

**前端定义**: 未定义（前端缺失）

**后端实现**: ✅ 已实现
```java
// CartController.java
@PostMapping("/sync")
public ApiResponse<List<CartItem>> syncCart(
    @RequestBody List<CartItem> localCartItems,
    @RequestParam Long userId
)
```

**实际路径**: `/api/v1/mall/cart/sync`

**状态**: ✅ 可用，但前端未使用

#### 4.3.11 获取购物车商品数量 ✅ 已实现

**前端定义**: 未定义（前端缺失）

**后端实现**: ✅ 已实现
```java
// CartController.java
@GetMapping("/{userId}/count")
public ApiResponse<Integer> getCartItemCount(@PathVariable Long userId)
```

**实际路径**: `/api/v1/mall/cart/{userId}/count`

**状态**: ✅ 可用，但前端未使用

### 4.4 订单相关API

#### 4.4.1 创建订单 ❌ 缺失

**前端定义**:
```java
@POST("mall/orders")
Observable<BaseResponse<Order>> createOrder(@Body CreateOrderRequest request);
```

**后端实现**: ❌ 未实现

**状态**: ❌ 缺失

**实施建议**: 
- 创建 `OrderController.createOrder()` 方法
- 处理订单创建、库存扣减、购物车清理
- 返回订单ID和支付信息

#### 4.4.2 获取订单详情 ❌ 缺失

**前端定义**:
```java
@GET("mall/orders/{orderId}")
Observable<BaseResponse<Order>> getOrderDetail(@Path("orderId") String orderId);
```

**后端实现**: ❌ 未实现

**状态**: ❌ 缺失

**实施建议**: 
- 创建 `OrderController.getOrderDetail()` 方法
- 返回订单详细信息、商品列表、物流信息

---

## 五、缺失API分析

### 5.1 关键缺失API

| API | 影响范围 | 优先级 | 实施难度 | 预计工时 |
|-----|---------|--------|---------|---------|
| GET /mall/home | 商城首页无法加载 | P0 | 中 | 4小时 |
| POST /mall/orders | 无法下单 | P0 | 高 | 8小时 |
| GET /mall/orders/{orderId} | 无法查看订单详情 | P1 | 低 | 2小时 |

### 5.2 前后端不一致问题

| 问题 | 前端 | 后端 | 影响 | 解决方案 |
|------|------|------|------|---------|
| 购物车列表路径 | `GET /mall/cart` | `GET /mall/cart/{userId}` | 前端缺少userId参数 | 前端添加userId参数 |
| 更新购物车路径 | `PUT /mall/cart/{itemId}/quantity` | `PUT /mall/cart/update` | 路径不匹配 | 统一使用后端路径 |

### 5.3 前端未使用的后端API

以下后端API已实现，但前端未定义和使用：

1. **药品库存查询**
   - `GET /mall/drugs/{drugId}/stock`
   - `POST /mall/drugs/stock/batch`
   - 建议：前端添加库存显示功能

2. **购物车高级功能**
   - `GET /mall/cart/{userId}/summary` - 购物车汇总
   - `POST /mall/cart/batch-remove` - 批量删除
   - `DELETE /mall/cart/{userId}/clear` - 清空购物车
   - `PUT /mall/cart/{itemId}/select` - 选中商品
   - `PUT /mall/cart/batch-select` - 批量选中
   - `POST /mall/cart/sync` - 同步购物车
   - `GET /mall/cart/{userId}/count` - 获取商品数量
   - 建议：前端逐步集成这些功能

---

## 六、实施建议

### 6.1 短期目标（1周内）

**目标**: 让MallMainActivity能够正常启动和显示

**任务清单**:

1. ✅ **后端已完成** - 药品查询和购物车API
2. ❌ **需要新增** - 商城首页聚合API
   ```java
   // 新增 MallHomeController.java
   @GetMapping("/home")
   public ApiResponse<MallHomeData> getHomeData() {
       // 聚合轮播图、分类、热销、推荐数据
   }
   ```

3. ❌ **前端调整** - 修复API路径不一致问题
   ```java
   // MallApiService.java
   @GET("mall/cart/{userId}")  // 添加userId参数
   Observable<BaseResponse<List<CartItem>>> getCartList(@Path("userId") String userId);
   ```

4. ❌ **前端集成** - 将模拟数据替换为真实API调用
   ```java
   // MallHomePresenterImpl.java
   @Override
   public void loadHomeData() {
       // 替换 loadMockData() 为真实API调用
       apiService.getHomeData()
           .subscribe(response -> {
               getView().showHomeData(response.getData());
           });
   }
   ```

### 6.2 中期目标（2-3周）

**目标**: 完善订单功能

**任务清单**:

1. 实现订单创建API
2. 实现订单查询API
3. 集成支付功能
4. 实现订单状态流转

### 6.3 长期目标（1个月）

**目标**: 完善商城所有功能

**任务清单**:

1. 实现分类Fragment
2. 实现商城我的Fragment
3. 集成前端未使用的后端API
4. 性能优化和缓存策略
5. 完善错误处理和用户提示

### 6.4 API开发优先级

```
P0 (必须) - 1周内完成
├── GET /mall/home (商城首页数据)
├── 前端API路径调整
└── 前端集成真实API

P1 (重要) - 2周内完成
├── POST /mall/orders (创建订单)
└── GET /mall/orders/{orderId} (订单详情)

P2 (增强) - 1个月内完成
├── 前端集成库存查询API
├── 前端集成购物车高级功能
└── 性能优化
```

### 6.5 风险提示

⚠️ **当前风险**:

1. **商城首页无法加载** - 缺少聚合API，需要多次请求拼装数据
2. **无法下单** - 订单API未实现
3. **前端使用模拟数据** - 未真正调用后端，可能存在数据结构不匹配

⚠️ **建议**:

1. 优先实现商城首页聚合API
2. 前端尽快替换模拟数据为真实API调用
3. 进行端到端测试，验证数据结构一致性

---

## 附录

### A. API路径对照表

| 功能 | 前端路径 | 后端路径 | 状态 |
|------|---------|---------|------|
| 首页数据 | `/mall/home` | ❌ 未实现 | 不匹配 |
| 药品分类 | `/mall/categories` | `/mall/drugs/categories` | 不匹配 |
| 推荐药品 | `/mall/drugs/recommended` | `/mall/drugs/recommended` | ✅ 匹配 |
| 分类药品 | `/mall/drugs/category/{id}` | `/mall/drugs/category/{id}` | ✅ 匹配 |
| 搜索药品 | `/mall/drugs/search` | `/mall/drugs/search` | ✅ 匹配 |
| 药品详情 | `/mall/drugs/{id}` | `/mall/drugs/{id}` | ✅ 匹配 |
| 添加购物车 | `/mall/cart/add` | `/mall/cart/add` | ✅ 匹配 |
| 购物车列表 | `/mall/cart` | `/mall/cart/{userId}` | 不匹配 |
| 更新数量 | `/mall/cart/{itemId}/quantity` | `/mall/cart/update` | 不匹配 |
| 删除购物车 | `/mall/cart/{itemId}` | `/mall/cart/{itemId}` | ✅ 匹配 |
| 创建订单 | `/mall/orders` | ❌ 未实现 | 不匹配 |
| 订单详情 | `/mall/orders/{orderId}` | ❌ 未实现 | 不匹配 |

### B. 数据模型对照

**前端模型**: `com.adinnet.demo.mall.model.*`  
**后端模型**: `com.patient.api.app.mall.model.*`

需要确保以下模型字段一致：
- Drug / DrugDTO
- Category / DrugCategoryDTO
- CartItem / CartItem
- Order / OrderDTO

### C. 相关文档

- [PAGE-FLOW.md](./PAGE-FLOW.md) - 页面流转关系
- [CHANGELOG.md](./CHANGELOG.md) - 变更日志
- [bugs.jsonl](./bugs.jsonl) - 问题记录

---

**文档维护说明：**

1. API实现状态变更时，需更新本文档
2. 新增API时，需添加到相应章节
3. 发现前后端不一致时，需记录到"前后端不一致问题"章节
