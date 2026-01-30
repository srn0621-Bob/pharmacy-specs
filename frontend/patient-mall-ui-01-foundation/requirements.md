# 需求文档: 患者端药房商城UI - 基础架构

## 简介

搭建患者端药房商城的基础架构,包括项目目录结构、数据模型类、API 接口定义、MVP 接口和基础工具类。这是整个药房商城 UI 迁移项目的基础,后续所有功能都将依赖于此。

## 术语表

- **MVP**: Model-View-Presenter 架构模式
- **数据模型**: 用于表示业务实体的 Java 类
- **API Service**: Retrofit 定义的网络请求接口
- **Presenter**: MVP 架构中的业务逻辑层
- **View**: MVP 架构中的视图接口层

## 需求概述

### 背景

- 需要将 dingdang-pharmacy React Web 应用迁移到 Android 原生实现
- 采用 MVP 架构模式,与现有 mshlwyy_patient 应用保持一致
- 需要先搭建基础架构,为后续功能开发提供支撑

### 目标

1. 创建清晰的项目目录结构
2. 定义完整的数据模型类
3. 定义所有 API 接口
4. 定义 MVP 架构的接口
5. 实现基础工具类

## 功能需求

### 需求 1: 项目目录结构

**用户故事:** 作为开发者,我想要有清晰的项目目录结构,以便组织代码和快速定位文件

#### 验收标准

1. THE 系统 SHALL 在 `com.adinnet.demo` 包下创建 `mall` 子包
2. THE 系统 SHALL 创建以下子包结构:
   - `activity`: 存放所有 Activity 类
   - `fragment`: 存放所有 Fragment 类
   - `adapter`: 存放所有 RecyclerView 适配器
   - `presenter`: 存放所有 Presenter 实现类
   - `view`: 存放所有 View 接口
   - `model`: 存放所有数据模型类
   - `api`: 存放 API 接口定义
   - `util`: 存放工具类
3. THE 系统 SHALL 创建对应的资源目录结构

### 需求 2: 数据模型定义

**用户故事:** 作为开发者,我想要定义完整的数据模型类,以便在应用中表示和传递业务数据

#### 验收标准

1. WHEN 定义 Drug 实体类 THEN 系统 SHALL 包含所有必需字段(id, name, brand, price, images, tags, sales, category, specification, manufacturer, description, stock, isFreeShipping)
2. WHEN 定义 CartItem 实体类 THEN 系统 SHALL 包含购物车项的所有字段(id, userId, drug, quantity, selected, createTime, updateTime)
3. WHEN 定义 Category 实体类 THEN 系统 SHALL 包含分类的所有字段(id, name, icon, color, sort, drugCount)
4. WHEN 定义 Order 实体类 THEN 系统 SHALL 包含订单的所有字段(id, orderNo, userId, items, goodsPrice, shippingFee, totalPrice, addressId, address, paymentMethod, status, createTime)
5. WHEN 定义 Address 实体类 THEN 系统 SHALL 包含地址的所有字段(id, userId, receiverName, receiverPhone, province, city, district, detail, isDefault)
6. THE 所有实体类 SHALL 提供 Getter 和 Setter 方法
7. THE 所有实体类 SHALL 包含完整的中文注释

### 需求 3: API 接口定义

**用户故事:** 作为开发者,我想要定义所有 API 接口,以便与后端服务进行数据交互

#### 验收标准

1. WHEN 定义 MallApiService 接口 THEN 系统 SHALL 包含以下方法:
   - `getHomeData()`: 获取首页数据
   - `getCategories()`: 获取药品分类列表
   - `getDrugsByCategory()`: 按分类查询药品
   - `searchDrugs()`: 搜索药品
   - `getDrugDetail()`: 获取药品详情
   - `getRecommendDrugs()`: 获取相关推荐
   - `addToCart()`: 添加到购物车
   - `getCartList()`: 获取购物车列表
   - `updateCartQuantity()`: 更新购物车项数量
   - `deleteCartItem()`: 删除购物车项
   - `createOrder()`: 创建订单
   - `getOrderDetail()`: 获取订单详情
2. THE 所有 API 方法 SHALL 使用 Retrofit 注解(@GET, @POST, @PUT, @DELETE)
3. THE 所有 API 方法 SHALL 返回 RxJava Observable 类型
4. THE 所有 API 方法 SHALL 包含完整的中文注释

### 需求 4: MVP 接口定义

**用户故事:** 作为开发者,我想要定义 MVP 架构的接口,以便实现清晰的分层架构

#### 验收标准

1. WHEN 定义 View 接口 THEN 系统 SHALL 包含以下接口:
   - `MallHomeView`: 商城首页视图接口
   - `DrugDetailView`: 药品详情视图接口
   - `CartView`: 购物车视图接口
   - `CheckoutView`: 结算视图接口
2. WHEN 定义 Presenter 接口 THEN 系统 SHALL 包含以下接口:
   - `MallHomePresenter`: 商城首页业务逻辑接口
   - `DrugDetailPresenter`: 药品详情业务逻辑接口
   - `CartPresenter`: 购物车业务逻辑接口
   - `CheckoutPresenter`: 结算业务逻辑接口
3. THE 所有 View 接口 SHALL 包含显示数据、显示加载、显示错误等方法
4. THE 所有 Presenter 接口 SHALL 包含业务逻辑处理方法
5. THE 所有接口 SHALL 包含完整的中文注释

### 需求 5: 基础工具类

**用户故事:** 作为开发者,我想要实现基础工具类,以便在应用中复用通用功能

#### 验收标准

1. WHEN 实现 CartManager 类 THEN 系统 SHALL 提供购物车管理功能(添加、删除、更新、查询)
2. WHEN 实现 PriceCalculator 类 THEN 系统 SHALL 提供价格计算功能(总价计算、运费计算)
3. WHEN 实现 ImageLoader 类 THEN 系统 SHALL 封装 Glide 图片加载功能
4. WHEN CartManager 存储数据 THEN 系统 SHALL 使用 SharedPreferences 本地存储
5. WHEN PriceCalculator 计算运费 THEN 系统 SHALL 实现满99包邮规则
6. WHEN ImageLoader 加载图片 THEN 系统 SHALL 配置占位图、错误图和缓存策略
7. THE 所有工具类 SHALL 包含完整的中文注释

## 非功能性需求

### 代码质量需求

1. **命名规范**: 遵循 Java 命名规范(类名大驼峰,方法名小驼峰,常量全大写)
2. **注释规范**: 所有代码注释使用中文
3. **包结构**: 按照功能模块组织包结构
4. **代码复用**: 避免重复代码,提取公共逻辑

### 架构需求

1. **MVP 模式**: 严格遵循 MVP 架构模式
2. **接口隔离**: View 和 Presenter 通过接口通信
3. **单一职责**: 每个类只负责一个功能
4. **依赖倒置**: 依赖抽象而不是具体实现

### 兼容性需求

1. **Android 版本**: 支持 Android 5.0 (API 21) 及以上
2. **技术栈**: 使用 Retrofit 2.2.0 + RxJava 2.1.7 + ButterKnife 8.8.1

## 约束条件

### 技术约束

1. **开发语言**: 使用 Java
2. **架构模式**: 使用 MVP 架构
3. **网络框架**: 使用 Retrofit + OkHttp
4. **响应式编程**: 使用 RxJava
5. **图片加载**: 使用 Glide

### 设计约束

1. **包名**: 在 `com.adinnet.demo.mall` 包下组织代码
2. **命名规范**: 遵循现有代码的命名规范
3. **代码注释**: 所有代码注释使用中文

## 验收标准清单

### 目录结构

- [ ] 创建了 `mall` 主包
- [ ] 创建了所有子包(activity, fragment, adapter, presenter, view, model, api, util)
- [ ] 目录结构清晰,易于导航

### 数据模型

- [ ] 定义了 Drug 实体类,包含所有必需字段
- [ ] 定义了 CartItem 实体类,包含所有必需字段
- [ ] 定义了 Category 实体类,包含所有必需字段
- [ ] 定义了 Order 实体类,包含所有必需字段
- [ ] 定义了 Address 实体类,包含所有必需字段
- [ ] 所有实体类提供了 Getter 和 Setter 方法
- [ ] 所有实体类包含完整的中文注释

### API 接口

- [ ] 定义了 MallApiService 接口
- [ ] 包含所有必需的 API 方法
- [ ] 使用了正确的 Retrofit 注解
- [ ] 返回类型为 RxJava Observable
- [ ] 包含完整的中文注释

### MVP 接口

- [ ] 定义了所有 View 接口
- [ ] 定义了所有 Presenter 接口
- [ ] 接口方法定义清晰,职责明确
- [ ] 包含完整的中文注释

### 工具类

- [ ] 实现了 CartManager 类
- [ ] 实现了 PriceCalculator 类
- [ ] 实现了 ImageLoader 类
- [ ] 工具类功能完整,可正常使用
- [ ] 包含完整的中文注释

### 代码质量

- [ ] 代码结构清晰,职责分明
- [ ] 遵循 MVP 架构模式
- [ ] 命名规范,易于理解
- [ ] 代码可以成功编译

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
