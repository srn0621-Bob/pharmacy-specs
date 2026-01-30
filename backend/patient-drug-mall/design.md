# 设计文档 - 患者端药品商城

## 文档信息

**功能名称：** 患者端药品商城  
**项目：** 互联网医院 - 患者端Android应用  
**版本：** v1.0  
**创建日期：** 2026-01-22  

---

## 简介

本文档描述患者端药品商城的系统架构设计、组件设计、数据模型和正确性属性。该设计基于requirements.md中定义的需求,采用前后端分离架构,后端使用Spring Boot + MyBatis Plus,前端使用Android + Retrofit + RxJava。

---

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Android患者端应用                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Presentation Layer (Activity/Fragment)          │   │
│  │  - DrugMallMainActivity                          │   │
│  │  - DrugSearchActivity                            │   │
│  │  - ShoppingCartActivity                          │   │
│  │  - OrderListActivity                             │   │
│  └────────────────┬─────────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼─────────────────────────────────┐   │
│  │  Business Logic Layer (Presenter)                │   │
│  │  - DrugMallPresenter                             │   │
│  │  - CartPresenter                                 │   │
│  │  - OrderPresenter                                │   │
│  └────────────────┬─────────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼─────────────────────────────────┐   │
│  │  Network Layer (Retrofit + RxJava)               │   │
│  │  - MallApiService                                │   │
│  │  - RetrofitClient                                │   │
│  └────────────────┬─────────────────────────────────┘   │
└───────────────────┼──────────────────────────────────────┘
                    │ HTTPS
                    │
┌───────────────────▼──────────────────────────────────────┐
│              Spring Boot后端服务                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Controller Layer                                │   │
│  │  - DrugMallController                            │   │
│  │  - CartController                                │   │
│  │  - OrderController                               │   │
│  └────────────────┬─────────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼─────────────────────────────────┐   │
│  │  Service Layer                                   │   │
│  │  - DrugMallService                               │   │
│  │  - CartService                                   │   │
│  │  - OrderService                                  │   │
│  │  - InventoryService                              │   │
│  └────────────────┬─────────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼─────────────────────────────────┐   │
│  │  Data Access Layer (MyBatis Plus)                │   │
│  │  - DrugMapper                                    │   │
│  │  - CartMapper                                    │   │
│  │  - OrderMapper                                   │   │
│  └────────────────┬─────────────────────────────────┘   │
└───────────────────┼──────────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────────┐
│                  MySQL数据库                              │
│  - d_drug_list (药品表)                                  │
│  - d_drug_category (分类表)                              │
│  - t_mall_cart_item (购物车表)                           │
│  - t_mall_order (订单表)                                 │
│  - t_mall_order_item (订单明细表)                        │
└──────────────────────────────────────────────────────────┘
```

### 技术栈

**后端:**
- Spring Boot 2.1.4.RELEASE
- MyBatis Plus 3.0.7.1
- MySQL 8.0
- Redis (缓存)
- Lombok (代码简化)

**前端:**
- Android SDK 28
- Retrofit 2.2.0 (网络请求)
- RxJava 2.1.7 (异步处理)
- Gson 2.8.5 (JSON解析)
- Glide (图片加载)

---

## 组件设计

### 后端组件

#### 1. Controller层

**DrugMallController**
- 职责: 处理药品相关HTTP请求
- 端点:
  - `GET /api/v1/mall/drugs/categories` - 获取分类列表
  - `GET /api/v1/mall/drugs/quick-categories` - 获取快捷分类
  - `GET /api/v1/mall/drugs/recommended` - 获取推荐药品
  - `GET /api/v1/mall/drugs/search` - 搜索药品
  - `GET /api/v1/mall/drugs/{drugId}` - 获取药品详情
  - `GET /api/v1/mall/drugs/category/{categoryId}` - 按分类获取药品

**CartController**
- 职责: 处理购物车相关HTTP请求
- 端点:
  - `GET /api/v1/mall/cart/{userId}` - 获取购物车列表
  - `GET /api/v1/mall/cart/{userId}/count` - 获取购物车数量
  - `POST /api/v1/mall/cart/add` - 添加商品到购物车
  - `PUT /api/v1/mall/cart/update` - 更新购物车商品数量
  - `DELETE /api/v1/mall/cart/{itemId}` - 删除购物车商品

**OrderController**
- 职责: 处理订单相关HTTP请求
- 端点:
  - `POST /api/v1/mall/orders/create` - 创建订单
  - `GET /api/v1/mall/orders/list` - 获取订单列表
  - `GET /api/v1/mall/orders/{orderId}` - 获取订单详情
  - `POST /api/v1/mall/orders/{orderId}/cancel` - 取消订单
  - `POST /api/v1/mall/orders/{orderId}/confirm` - 确认收货
  - `GET /api/v1/mall/orders/{orderId}/logistics` - 查看物流

#### 2. Service层

**DrugMallService**
- 职责: 药品业务逻辑处理
- 方法:
  - `List<DrugCategory> getCategories()` - 获取分类列表
  - `List<DrugCategory> getQuickCategories()` - 获取快捷分类
  - `PageResult<Drug> getRecommendedDrugs(int pageNum, int pageSize)` - 获取推荐药品
  - `PageResult<Drug> searchDrugs(String keyword, int pageNum, int pageSize)` - 搜索药品
  - `Drug getDrugDetail(Long drugId)` - 获取药品详情
  - `PageResult<Drug> getDrugsByCategory(Long categoryId, int pageNum, int pageSize)` - 按分类获取药品
  - `Integer getDrugStock(Long drugId)` - 获取药品库存

**CartService**
- 职责: 购物车业务逻辑处理
- 方法:
  - `List<CartItem> getCartItems(Long userId)` - 获取购物车列表
  - `Integer getCartItemCount(Long userId)` - 获取购物车数量
  - `CartSummary addToCart(Long userId, Long drugId, Integer quantity)` - 添加到购物车
  - `void updateCartItem(Long cartItemId, Integer quantity)` - 更新购物车商品数量
  - `void removeCartItem(Long cartItemId)` - 删除购物车商品
  - `void clearCart(Long userId)` - 清空购物车
  - `CartSummary getCartSummary(Long userId)` - 获取购物车汇总

**OrderService**
- 职责: 订单业务逻辑处理
- 方法:
  - `Order createOrder(OrderCreateRequest request)` - 创建订单
  - `PageResult<Order> getOrderList(Long userId, String status, int pageNum, int pageSize)` - 获取订单列表
  - `Order getOrderDetail(Long orderId)` - 获取订单详情
  - `void cancelOrder(Long orderId, Long userId)` - 取消订单
  - `void confirmOrder(Long orderId, Long userId)` - 确认收货
  - `LogisticsInfo getLogisticsInfo(Long orderId)` - 获取物流信息

**InventoryService**
- 职责: 库存管理
- 方法:
  - `boolean checkStock(Long drugId, Integer quantity)` - 检查库存
  - `void deductStock(Long drugId, Integer quantity)` - 扣减库存
  - `void restoreStock(Long drugId, Integer quantity)` - 恢复库存

#### 3. Mapper层

**DrugMapper**
- 职责: 药品数据访问
- 方法:
  - `List<Drug> selectRecommended()` - 查询推荐药品
  - `List<Drug> selectByCategory(Long categoryId)` - 按分类查询药品
  - `List<Drug> searchByKeyword(String keyword)` - 搜索药品
  - `Drug selectById(Long drugId)` - 根据ID查询药品
  - `Integer selectStock(Long drugId)` - 查询库存

**CartMapper**
- 职责: 购物车数据访问
- 方法:
  - `List<CartItem> selectByUserId(Long userId)` - 查询用户购物车
  - `Integer countByUserId(Long userId)` - 统计购物车数量
  - `CartItem selectByUserIdAndDrugId(Long userId, Long drugId)` - 查询特定商品
  - `int insert(CartItem cartItem)` - 插入购物车项
  - `int updateQuantity(Long cartItemId, Integer quantity)` - 更新数量
  - `int deleteById(Long cartItemId)` - 删除购物车项
  - `int deleteByUserId(Long userId)` - 清空购物车

**OrderMapper**
- 职责: 订单数据访问
- 方法:
  - `int insert(Order order)` - 插入订单
  - `List<Order> selectByUserId(Long userId, String status)` - 查询用户订单
  - `Order selectById(Long orderId)` - 根据ID查询订单
  - `int updateStatus(Long orderId, String status)` - 更新订单状态
  - `int updatePaymentInfo(Long orderId, Date payTime)` - 更新支付信息

### 前端组件

#### 1. Activity层

**DrugMallMainActivity**
- 职责: 商城首页
- 功能:
  - 显示药品分类(左侧导航 + 顶部快捷分类)
  - 显示推荐药品列表
  - 购物车数量实时更新
  - 分类展开/收起
  - 跳转到搜索、详情、购物车页面

**DrugSearchActivity**
- 职责: 药品搜索
- 功能:
  - 关键词搜索
  - 搜索历史记录
  - 热门搜索推荐
  - 搜索结果展示

**DrugDetailActivity**
- 职责: 药品详情
- 功能:
  - 显示药品详细信息
  - 显示药品说明书
  - 选择购买数量
  - 加入购物车/立即购买

**ShoppingCartActivity**
- 职责: 购物车管理
- 功能:
  - 显示购物车商品列表
  - 修改商品数量
  - 删除商品
  - 全选/取消全选
  - 结算选中商品

**OrderListActivity**
- 职责: 订单列表
- 功能:
  - 显示用户订单列表
  - 按状态筛选订单
  - 订单操作(取消、支付、确认收货)

**OrderDetailActivity**
- 职责: 订单详情
- 功能:
  - 显示订单完整信息
  - 显示订单状态流程
  - 查看物流信息
  - 订单操作

#### 2. Presenter层

**DrugMallPresenter**
- 职责: 商城首页业务逻辑
- 方法:
  - `void loadQuickCategories()` - 加载快捷分类
  - `void loadCategories()` - 加载分类列表
  - `void loadRecommendedDrugs()` - 加载推荐药品
  - `void loadDrugsByCategory(Long categoryId)` - 加载分类药品
  - `void loadCartCount()` - 加载购物车数量
  - `void addToCart(Long drugId, Integer quantity)` - 加入购物车

**CartPresenter**
- 职责: 购物车业务逻辑
- 方法:
  - `void loadCartItems()` - 加载购物车列表
  - `void updateQuantity(Long cartItemId, Integer quantity)` - 更新数量
  - `void removeItem(Long cartItemId)` - 删除商品
  - `void selectItem(Long cartItemId, boolean selected)` - 选中/取消选中
  - `void selectAll(boolean selected)` - 全选/取消全选
  - `void checkout()` - 结算

**OrderPresenter**
- 职责: 订单业务逻辑
- 方法:
  - `void loadOrderList(String status)` - 加载订单列表
  - `void loadOrderDetail(Long orderId)` - 加载订单详情
  - `void createOrder(OrderCreateRequest request)` - 创建订单
  - `void cancelOrder(Long orderId)` - 取消订单
  - `void confirmOrder(Long orderId)` - 确认收货
  - `void loadLogistics(Long orderId)` - 加载物流信息

#### 3. Adapter层

**QuickCategoryAdapter**
- 职责: 快捷分类适配器
- 功能: 横向滚动显示快捷分类

**CategoryAdapter**
- 职责: 左侧分类适配器
- 功能: 垂直列表显示分类,支持选中状态

**DrugListAdapter**
- 职责: 药品列表适配器
- 功能: 显示药品列表,支持加入购物车

**CartItemAdapter**
- 职责: 购物车商品适配器
- 功能: 显示购物车商品,支持数量修改、删除、选中

**OrderListAdapter**
- 职责: 订单列表适配器
- 功能: 显示订单列表,支持订单操作

---

## 数据模型

### 后端数据模型

#### Drug (药品)
```java
public class Drug {
    private Long id;                  // 药品ID (对应t_drug.id)
    private String name;              // 药品名称 (对应t_drug.name)
    private String skuCode;           // 药品编码 (对应t_drug.sku_code)
    private List<String> drugImages;  // 药品图片列表 (解析t_drug.pic_position)
    private String size;              // 规格 (对应t_drug.size)
    private BigDecimal price;         // 价格 (对应t_drug.price)
    private BigDecimal originalPrice; // 原价 (新增字段)
    private Integer quantity;         // 库存 (对应t_drug.quantity)
    private String manufacturers;     // 生产厂家 (对应t_drug.manufacturers)
    private String approvalNumber;    // 批准文号 (对应t_drug.approval_number)
    private String expiryDate;        // 有效期 (可从说明书解析)
    private String description;       // 描述 (可从说明书提取)
    private String content;           // 说明书(HTML) (对应t_drug.content)
    private Long categoryId;          // 分类ID (新增字段)
    private String categoryName;      // 分类名称
    private Integer sales;            // 销量 (新增字段)
    private Integer addToCartCount;   // 加购数量 (新增字段)
    private Boolean isFreeShipping;   // 是否包邮 (新增字段)
    private Boolean hasPriceGuarantee;// 是否价保 (新增字段)
    private Integer priceGuaranteeDays;// 价保天数 (新增字段)
    private Boolean isRecommended;    // 是否推荐 (新增字段)
    private Date createTime;          // 创建时间 (对应t_drug.create_time)
    private Date updateTime;          // 更新时间 (对应t_drug.update_time)
}
```

#### DrugCategory (药品分类)
```java
public class DrugCategory {
    private Long categoryId;          // 分类ID
    private String categoryName;      // 分类名称
    private String categoryIcon;      // 分类图标URL
    private Integer iconResId;        // 本地图标资源ID
    private Integer sortOrder;        // 排序
    private Long parentId;            // 父分类ID
    private Boolean isQuickCategory;  // 是否快捷分类
    private Boolean isHot;            // 是否热门
    private Date createTime;          // 创建时间
}
```

#### CartItem (购物车项)
```java
public class CartItem {
    private Long cartItemId;          // 购物车项ID
    private Long userId;              // 用户ID
    private Long drugId;              // 药品ID
    private String drugName;          // 药品名称
    private String drugImage;         // 药品图片
    private String specification;     // 规格
    private BigDecimal price;         // 单价
    private Integer quantity;         // 数量
    private Integer stock;            // 库存
    private BigDecimal subtotal;      // 小计
    private Boolean selected;         // 是否选中
    private Date createTime;          // 创建时间
    private Date updateTime;          // 更新时间
}
```

#### Order (订单)
```java
public class Order {
    private Long orderId;             // 订单ID
    private String orderNum;          // 订单号
    private Long userId;              // 用户ID
    private String status;            // 订单状态(WAIT,PAID,SHIPPED,COMPLETED,CANCEL)
    private BigDecimal totalPrice;    // 总金额
    private BigDecimal shippingFee;   // 运费
    private String receiverName;      // 收货人姓名
    private String receiverMobile;    // 收货人手机
    private String province;          // 省
    private String city;              // 市
    private String district;          // 区
    private String address;           // 详细地址
    private String expressCode;       // 快递公司编码
    private String expressName;       // 快递公司名称
    private String shippingNo;        // 快递单号
    private Date createTime;          // 创建时间
    private Date payTime;             // 支付时间
    private Date shipTime;            // 发货时间
    private Date completeTime;        // 完成时间
    private List<OrderItem> orderItems; // 订单明细
}
```

#### OrderItem (订单明细)
```java
public class OrderItem {
    private Long orderItemId;         // 订单明细ID
    private Long orderId;             // 订单ID
    private Long drugId;              // 药品ID
    private String drugName;          // 药品名称
    private String drugImage;         // 药品图片
    private String specification;     // 规格
    private BigDecimal price;         // 单价
    private Integer quantity;         // 数量
    private BigDecimal subtotal;      // 小计
}
```

### 数据库表设计

#### t_drug (药品表 - 现有表)
```sql
-- 使用现有的t_drug表,需要添加商城相关字段
ALTER TABLE t_drug ADD COLUMN sales INT DEFAULT 0 COMMENT '销量';
ALTER TABLE t_drug ADD COLUMN add_to_cart_count INT DEFAULT 0 COMMENT '加购数量';
ALTER TABLE t_drug ADD COLUMN is_free_shipping TINYINT(1) DEFAULT 1 COMMENT '是否包邮';
ALTER TABLE t_drug ADD COLUMN has_price_guarantee TINYINT(1) DEFAULT 1 COMMENT '是否价保';
ALTER TABLE t_drug ADD COLUMN price_guarantee_days INT DEFAULT 7 COMMENT '价保天数';
ALTER TABLE t_drug ADD COLUMN is_recommended TINYINT(1) DEFAULT 0 COMMENT '是否推荐';
ALTER TABLE t_drug ADD COLUMN original_price DECIMAL(16,2) COMMENT '原价';
ALTER TABLE t_drug ADD COLUMN category_id BIGINT COMMENT '商城分类ID';

-- 现有t_drug表结构(关键字段):
-- id: 主键ID
-- name: 药品名称
-- sku_code: 药品编号
-- pic_position: 图片位置(JSON格式)
-- size: 药品规格
-- price: 药品单价
-- quantity: 库存数量
-- manufacturers: 厂家
-- approval_number: 批准文号
-- content: 药品说明书(HTML)
-- status: 状态(1:启用 0:停用)
```

#### d_drug_category (药品分类表)
```sql
CREATE TABLE d_drug_category (
  category_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  category_icon VARCHAR(255),
  icon_res_id VARCHAR(50),
  sort_order INT DEFAULT 0,
  parent_id BIGINT DEFAULT 0,
  is_quick_category TINYINT(1) DEFAULT 0,
  is_hot TINYINT(1) DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parent_id (parent_id),
  INDEX idx_is_quick_category (is_quick_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='药品分类表';
```

#### t_mall_cart_item (购物车表)
```sql
CREATE TABLE t_mall_cart_item (
  cart_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  drug_id BIGINT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  selected TINYINT(1) DEFAULT 1,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_drug_id (drug_id),
  UNIQUE KEY uk_user_drug (user_id, drug_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商城购物车表';
```

#### t_mall_order (订单表)
```sql
CREATE TABLE t_mall_order (
  order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_num VARCHAR(50) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  receiver_name VARCHAR(50) NOT NULL,
  receiver_mobile VARCHAR(20) NOT NULL,
  province VARCHAR(50),
  city VARCHAR(50),
  district VARCHAR(50),
  address VARCHAR(200) NOT NULL,
  express_code VARCHAR(20),
  express_name VARCHAR(50),
  shipping_no VARCHAR(50),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  pay_time DATETIME,
  ship_time DATETIME,
  complete_time DATETIME,
  INDEX idx_user_id (user_id),
  INDEX idx_order_num (order_num),
  INDEX idx_status (status),
  INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商城订单表';
```

#### t_mall_order_item (订单明细表)
```sql
CREATE TABLE t_mall_order_item (
  order_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  drug_id BIGINT NOT NULL,
  drug_name VARCHAR(200) NOT NULL,
  drug_image VARCHAR(255),
  specification VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商城订单明细表';
```

---

## 接口设计

### 实现状态说明

✅ **已实现** - 现有代码中已有完整实现  
⚠️ **需补充** - 需要添加或修改  
📝 **需验证** - 需要验证实现是否符合需求

---

### API响应格式

所有API统一使用以下响应格式:

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

**状态码说明:**
- 200: 成功
- 400: 请求参数错误
- 401: 未授权
- 404: 资源不存在
- 500: 服务器内部错误

### 核心API接口

#### 1. 获取药品分类列表 ✅
```
GET /api/v1/mall/drugs/categories

Response:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "categoryId": 1,
      "categoryName": "为你推荐",
      "categoryIcon": "http://...",
      "sortOrder": 1
    }
  ]
}
```

**实现状态:** ✅ 已实现  
**文件位置:** `DrugMallController.getDrugCategories()`  
**备注:** 使用硬编码分类(处方药、非处方药、抗生素、注射类、基本药物)

---

#### 2. 获取快捷分类列表 ⚠️
```
GET /api/v1/mall/drugs/quick-categories

Response:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "categoryId": 1,
      "categoryName": "隐形美瞳",
      "categoryIcon": "http://...",
      "iconResId": "ic_category_lenses",
      "sortOrder": 1,
      "isHot": true
    }
  ]
}
```

**实现状态:** ⚠️ 需补充  
**建议:** 在 `DrugMallController` 中添加该接口,或通过 `categories` 接口过滤返回

---

#### 3. 获取推荐药品 ✅
```
GET /api/v1/mall/drugs/recommended?pageNum=1&pageSize=20

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "drugId": 1001,
        "drugName": "葡萄前列3盒护肝液",
        "drugImage": "http://...",
        "specification": "10g*12袋",
        "price": 276.00,
        "stock": 100,
        "sales": 5123,
        "addToCartCount": 1234,
        "isFreeShipping": true,
        "hasPriceGuarantee": true,
        "priceGuaranteeDays": 7
      }
    ],
    "total": 50,
    "pageNum": 1,
    "pageSize": 20
  }
}
```

**实现状态:** ✅ 已实现  
**文件位置:** `DrugMallController.getRecommendedDrugs()`  
**备注:** 
- 当前使用 `limit` 参数而非分页
- 商城扩展字段需要数据库迁移后才能返回

---

#### 4. 获取购物车数量 ✅
```
GET /api/v1/mall/cart/{userId}/count

Response:
{
  "code": 200,
  "message": "success",
  "data": 3
}
```

**实现状态:** ✅ 已实现  
**文件位置:** `CartController.getCartItemCount()`

---

#### 5. 添加到购物车 ✅
```
POST /api/v1/mall/cart/add

Request Body:
{
  "userId": 10001,
  "drugId": 1001,
  "quantity": 1
}

Response:
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "cartItemId": 5001,
    "totalQuantity": 4,
    "totalAmount": 365.90
  }
}
```

**实现状态:** ✅ 已实现  
**文件位置:** `CartController.addToCart()`

---

#### 6. 创建订单 ✅
```
POST /api/v1/mall/orders/create

Request Body:
{
  "userId": 10001,
  "cartItemIds": [5001, 5002],
  "receiverName": "张三",
  "receiverMobile": "13812341234",
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "address": "XX街道XX号"
}

Response:
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "orderId": 3001,
    "orderNum": "ORD202601220001",
    "totalPrice": 78.30,
    "status": "WAIT",
    "createTime": "2026-01-22 10:30:00"
  }
}
```

**实现状态:** ✅ 已实现  
**文件位置:** `OrderController.createOrder()`

---

#### 7. 查看物流信息 ⚠️
```
GET /api/v1/mall/orders/{orderId}/logistics

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "expressCode": "SF",
    "expressName": "顺丰速运",
    "shippingNo": "SF1234567890",
    "traces": [
      {
        "time": "2026-01-22 10:00:00",
        "status": "已签收",
        "context": "您的快递已签收"
      }
    ]
  }
}
```

**实现状态:** ⚠️ 需补充  
**建议:** 
- 在 `OrderController` 中添加 `getLogistics` 接口
- 集成快递100物流查询API (项目中已有 `Kuaidi100Util`)

---

#### 8. 确认收货 ⚠️
```
POST /api/v1/mall/orders/{orderId}/confirm

Response:
{
  "code": 200,
  "message": "确认收货成功",
  "data": true
}
```

**实现状态:** ⚠️ 需补充  
**临时方案:** 可通过 `PUT /api/v1/mall/orders/{orderId}/status?status=COMPLETED` 实现  
**建议:** 在 `OrderController` 中添加专门的 `confirmOrder` 接口

---

## 正确性属性 (Correctness Properties)

基于requirements.md中的验收标准,以下是可测试的正确性属性:

### Property 1: 购物车数量一致性
**描述:** 购物车数量角标必须始终反映实际购物车商品总数量

**形式化表达:**
```
FOR ALL user_id, cart_operations:
  LET initial_count = getCartCount(user_id)
  WHEN performCartOperation(user_id, cart_operations)
  THEN getCartCount(user_id) == calculateExpectedCount(initial_count, cart_operations)
```

**测试策略:** 属性测试(Property-Based Testing)
- 生成随机的购物车操作序列(添加、删除、修改数量)
- 验证每次操作后购物车数量的正确性
- 最少100次迭代

### Property 2: 库存扣减正确性
**描述:** 订单创建时必须正确扣减库存,且不能超卖

**形式化表达:**
```
FOR ALL drug_id, order_quantity:
  LET initial_stock = getDrugStock(drug_id)
  WHEN createOrder(drug_id, order_quantity)
  THEN IF order_quantity <= initial_stock
       THEN getDrugStock(drug_id) == initial_stock - order_quantity
       ELSE orderCreationFails()
```

**测试策略:** 属性测试 + 并发测试
- 验证单个订单的库存扣减
- 验证并发订单不会导致超卖
- 最少100次迭代

### Property 3: 订单金额计算正确性
**描述:** 订单总金额必须等于所有商品小计之和加运费

**形式化表达:**
```
FOR ALL order_items, shipping_fee:
  LET order = createOrder(order_items, shipping_fee)
  LET expected_total = sum(item.price * item.quantity for item in order_items) + shipping_fee
  THEN order.totalPrice == expected_total
```

**测试策略:** 属性测试
- 生成随机的订单商品组合
- 验证订单总金额计算的正确性
- 最少100次迭代

### Property 4: 购物车商品唯一性
**描述:** 同一用户的购物车中,同一药品只能有一条记录

**形式化表达:**
```
FOR ALL user_id, drug_id:
  WHEN addToCart(user_id, drug_id, quantity1)
  AND addToCart(user_id, drug_id, quantity2)
  THEN countCartItems(user_id, drug_id) == 1
  AND getCartItemQuantity(user_id, drug_id) == quantity1 + quantity2
```

**测试策略:** 属性测试
- 多次添加同一药品到购物车
- 验证购物车中只有一条记录且数量累加
- 最少100次迭代

### Property 5: 订单状态流转正确性
**描述:** 订单状态必须按照规定的流程流转,不能跳跃或回退

**形式化表达:**
```
FOR ALL order:
  LET valid_transitions = {
    "WAIT" -> ["PAID", "CANCEL"],
    "PAID" -> ["SHIPPED", "CANCEL"],
    "SHIPPED" -> ["COMPLETED"],
    "COMPLETED" -> [],
    "CANCEL" -> []
  }
  WHEN updateOrderStatus(order, new_status)
  THEN new_status IN valid_transitions[order.status]
```

**测试策略:** 状态机测试
- 验证所有合法的状态转换
- 验证非法状态转换被拒绝
- 最少100次迭代

### Property 6: 搜索结果相关性
**描述:** 搜索结果必须包含搜索关键词

**形式化表达:**
```
FOR ALL keyword:
  WHEN search_results = searchDrugs(keyword)
  THEN FOR ALL drug IN search_results:
    keyword.toLowerCase() IN drug.drugName.toLowerCase()
```

**测试策略:** 属性测试
- 生成随机搜索关键词
- 验证所有搜索结果都包含关键词
- 最少100次迭代

### Property 7: 分页数据完整性
**描述:** 分页查询的总记录数必须等于所有页面记录数之和

**形式化表达:**
```
FOR ALL query_params:
  LET page_results = getAllPages(query_params)
  LET total_from_api = page_results[0].total
  LET actual_count = sum(len(page.list) for page in page_results)
  THEN actual_count == total_from_api
```

**测试策略:** 属性测试
- 查询所有分页数据
- 验证总数与实际记录数一致
- 最少50次迭代

### Property 8: 购物车清空幂等性
**描述:** 清空购物车操作是幂等的,多次执行结果相同

**形式化表达:**
```
FOR ALL user_id:
  WHEN clearCart(user_id)
  AND clearCart(user_id)
  THEN getCartCount(user_id) == 0
```

**测试策略:** 幂等性测试
- 多次执行清空操作
- 验证结果始终一致
- 最少100次迭代

### Property 9: 订单超时自动取消
**描述:** 未支付订单超过30分钟必须自动取消

**形式化表达:**
```
FOR ALL order WHERE order.status == "WAIT":
  LET elapsed_time = currentTime() - order.createTime
  WHEN elapsed_time > 30 minutes
  THEN order.status == "CANCEL"
```

**测试策略:** 时间相关测试
- 创建订单并模拟时间流逝
- 验证超时订单被自动取消
- 最少50次迭代

### Property 10: 数据同步一致性
**描述:** 购物车数据在不同设备间必须保持同步

**形式化表达:**
```
FOR ALL user_id, device1, device2:
  WHEN addToCart(user_id, drug_id, quantity) ON device1
  THEN getCartItems(user_id) ON device2 CONTAINS (drug_id, quantity)
```

**测试策略:** 分布式一致性测试
- 模拟多设备操作
- 验证数据同步的正确性
- 最少100次迭代

---

## Property Reflection (属性反思)

### 冗余属性识别

经过分析,以下属性可能存在冗余:

1. **Property 3 (订单金额计算)** 与 **Property 2 (库存扣减)** 部分重叠
   - 两者都涉及订单创建过程
   - 可以合并为一个综合的"订单创建正确性"属性

2. **Property 8 (购物车清空幂等性)** 是 **Property 1 (购物车数量一致性)** 的特例
   - 可以将幂等性作为Property 1的一个测试用例

### 优化后的核心属性

保留以下8个核心属性:

1. ✅ Property 1: 购物车数量一致性 (包含幂等性测试)
2. ✅ Property 2: 库存扣减正确性
3. ✅ Property 3: 订单金额计算正确性
4. ✅ Property 4: 购物车商品唯一性
5. ✅ Property 5: 订单状态流转正确性
6. ✅ Property 6: 搜索结果相关性
7. ✅ Property 7: 分页数据完整性
8. ✅ Property 9: 订单超时自动取消

---

## 错误处理策略

### 异常分类

**业务异常 (BusinessException)**
- 库存不足
- 订单不存在
- 订单状态不允许操作
- 购物车为空

**系统异常 (SystemException)**
- 数据库连接失败
- 网络超时
- 第三方服务不可用

**参数异常 (ValidationException)**
- 必填参数缺失
- 参数格式错误
- 参数值超出范围

### 错误响应格式

```json
{
  "code": 400,
  "message": "库存不足",
  "data": null,
  "errorDetails": {
    "drugId": 1001,
    "requestedQuantity": 10,
    "availableStock": 5
  }
}
```

### 重试策略

**网络请求重试:**
- 最多重试3次
- 指数退避: 1s, 2s, 4s
- 仅对幂等操作重试(GET, PUT, DELETE)

**库存扣减重试:**
- 使用乐观锁
- 最多重试5次
- 失败后返回库存不足错误

---

## 测试策略

### 单元测试

**覆盖范围:**
- Service层业务逻辑
- Mapper层数据访问
- 工具类方法

**测试框架:**
- JUnit 5
- Mockito (Mock依赖)
- AssertJ (断言)

**目标覆盖率:** 80%以上

### 属性测试

**测试框架:**
- jqwik (Java属性测试框架)

**测试配置:**
- 每个属性最少100次迭代
- 使用随机数据生成器
- 记录失败的测试用例

**示例代码:**
```java
@Property
void cartCountConsistency(@ForAll @IntRange(min = 1, max = 100) int operations) {
    // 测试购物车数量一致性
}
```

### 集成测试

**测试范围:**
- Controller层API接口
- 完整业务流程
- 数据库事务

**测试工具:**
- Spring Boot Test
- MockMvc (API测试)
- H2 Database (内存数据库)

### 性能测试

**测试指标:**
- 响应时间: 95%请求 < 1s
- 吞吐量: > 1000 TPS
- 并发用户: 支持1000并发

**测试工具:**
- JMeter
- Gatling

---

## 安全设计

### 认证授权

**认证方式:**
- JWT Token认证
- Token有效期: 7天
- 刷新Token机制

**授权检查:**
- 所有购物车和订单操作需验证用户身份
- 用户只能访问自己的数据

### 数据安全

**敏感信息脱敏:**
- 手机号: 138****1234
- 地址: 显示省市区,详细地址部分隐藏

**SQL注入防护:**
- 使用MyBatis参数化查询
- 禁止拼接SQL

**XSS防护:**
- 前端输入验证
- 后端HTML转义

---

## 性能优化

### 缓存策略

**Redis缓存:**
- 药品分类列表 (TTL: 1小时)
- 热门药品列表 (TTL: 30分钟)
- 购物车数据 (TTL: 1天)

**本地缓存:**
- 药品详情 (Caffeine, TTL: 10分钟)

### 数据库优化

**索引设计:**
- 购物车: (user_id, drug_id) 联合唯一索引
- 订单: order_num, user_id, status, create_time 索引
- 药品: category_id, is_recommended 索引

**分页优化:**
- 使用游标分页避免深分页问题
- 限制最大页码

### 并发控制

**库存扣减:**
- 使用乐观锁(version字段)
- 失败重试机制

**订单创建:**
- 分布式锁(Redis)
- 防止重复提交

---

## 部署架构

### 环境配置

**开发环境 (dev):**
- 数据库: MySQL 8.0 (本地)
- Redis: 单机模式
- 日志级别: DEBUG

**测试环境 (test):**
- 数据库: MySQL 8.0 (测试服务器)
- Redis: 单机模式
- 日志级别: INFO

**生产环境 (prod):**
- 数据库: MySQL 8.0 (主从复制)
- Redis: 集群模式
- 日志级别: WARN

### 监控告警

**监控指标:**
- API响应时间
- 错误率
- 数据库连接池
- Redis命中率

**告警规则:**
- API错误率 > 5%
- 响应时间 > 3s
- 数据库连接池 > 80%

---

## 参考文档

- [需求文档](./requirements.md)
- [API需求补充说明](./API需求补充说明.md)
- [商城首页布局设计方案](./商城首页布局设计方案.md)
- [药品商城功能详细修改文档](./药品商城功能详细修改文档.md)
