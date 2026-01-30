# 实施计划: 患者端药房商城UI - 基础架构

## 概述

搭建患者端药房商城的基础架构,包括项目目录结构、数据模型类、API 接口定义、MVP 接口和基础工具类。

**预计工作量:** 4-5 小时

## 任务列表

- [x] 1. 创建项目目录结构
  - 在 `app/src/main/java/com/adinnet/demo/` 下创建 `mall` 包
  - 创建子包: `activity`, `fragment`, `adapter`, `presenter`, `view`, `model`, `api`, `util`
  - 验证目录结构创建成功
  - _需求: 1.1, 1.2_

- [ ] 2. 定义数据模型类
  - [x] 2.1 创建 Drug 实体类
    - 在 `model` 包下创建 `Drug.java`
    - 定义所有字段(id, name, brand, price, originalPrice, image, images, tags, sales, category, specification, manufacturer, description, stock, isFreeShipping)
    - 实现所有 Getter 和 Setter 方法
    - 添加完整的中文注释
    - _需求: 2.1, 2.6, 2.7_
  
  - [x] 2.2 创建 CartItem 实体类
    - 在 `model` 包下创建 `CartItem.java`
    - 定义所有字段(id, userId, drug, quantity, selected, createTime, updateTime)
    - 实现 `getSubtotal()` 方法计算小计
    - 实现所有 Getter 和 Setter 方法
    - 添加完整的中文注释
    - _需求: 2.2, 2.6, 2.7_
  
  - [x] 2.3 创建 Category 实体类
    - 在 `model` 包下创建 `Category.java`
    - 定义所有字段(id, name, icon, color, sort, drugCount)
    - 实现所有 Getter 和 Setter 方法
    - 添加完整的中文注释
    - _需求: 2.3, 2.6, 2.7_
  
  - [x] 2.4 创建 Order 和 OrderItem 实体类
    - 在 `model` 包下创建 `Order.java` 和 `OrderItem.java`
    - Order 定义字段(id, orderNo, userId, items, goodsPrice, shippingFee, totalPrice, addressId, address, paymentMethod, status, createTime)
    - OrderItem 定义字段(drugId, drugName, drugImage, price, quantity, subtotal)
    - 实现所有 Getter 和 Setter 方法
    - 添加完整的中文注释
    - _需求: 2.4, 2.6, 2.7_
  
  - [x] 2.5 创建 Address 实体类
    - 在 `model` 包下创建 `Address.java`
    - 定义所有字段(id, userId, receiverName, receiverPhone, province, city, district, detail, isDefault)
    - 实现 `getFullAddress()` 方法
    - 实现所有 Getter 和 Setter 方法
    - 添加完整的中文注释
    - _需求: 2.5, 2.6, 2.7_

- [ ]* 2.6 编写数据模型单元测试
  - 测试 CartItem 的 `getSubtotal()` 方法
  - 测试 Address 的 `getFullAddress()` 方法
  - _需求: 测试策略, Property 1_

- [ ] 3. 定义 API 接口
  - [x] 3.1 创建 MallApiService 接口
    - 在 `api` 包下创建 `MallApiService.java`
    - 定义所有 API 方法:
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
    - 使用 Retrofit 注解(@GET, @POST, @PUT, @DELETE)
    - 返回类型使用 RxJava Observable
    - 添加完整的中文注释
    - _需求: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. 定义 MVP 接口
  - [x] 4.1 创建 View 接口
    - 在 `view` 包下创建 `MallHomeView.java`
    - 在 `view` 包下创建 `DrugDetailView.java`
    - 在 `view` 包下创建 `CartView.java`
    - 在 `view` 包下创建 `CheckoutView.java`
    - 每个接口定义显示数据、显示加载、显示错误等方法
    - 添加完整的中文注释
    - _需求: 4.1, 4.3, 4.5_
  
  - [x] 4.2 创建 Presenter 接口
    - 在 `presenter` 包下创建 `MallHomePresenter.java`
    - 在 `presenter` 包下创建 `DrugDetailPresenter.java`
    - 在 `presenter` 包下创建 `CartPresenter.java`
    - 在 `presenter` 包下创建 `CheckoutPresenter.java`
    - 每个接口定义业务逻辑处理方法
    - 添加完整的中文注释
    - _需求: 4.2, 4.4, 4.5_

- [ ] 5. 实现基础工具类
  - [x] 5.1 实现 CartManager 类
    - 在 `util` 包下创建 `CartManager.java`
    - 实现单例模式
    - 使用 SharedPreferences 存储购物车数据
    - 实现 `addItem()` 方法: 添加商品到购物车
    - 实现 `removeItem()` 方法: 删除购物车项
    - 实现 `updateQuantity()` 方法: 更新数量
    - 实现 `getCartItems()` 方法: 获取购物车列表
    - 实现 `getCartCount()` 方法: 获取商品总数
    - 实现 `clearCart()` 方法: 清空购物车
    - 添加完整的中文注释
    - _需求: 5.1, 5.4_
  
  - [x] 5.2 实现 PriceCalculator 类
    - 在 `util` 包下创建 `PriceCalculator.java`
    - 实现 `calculateTotalPrice()` 方法: 计算购物车总价
    - 实现 `calculateShippingFee()` 方法: 计算运费(满99包邮)
    - 实现 `calculateOrderTotal()` 方法: 计算订单总价
    - 实现 `calculateSelectedCount()` 方法: 计算选中商品数量
    - 添加完整的中文注释
    - _需求: 5.2, 5.5_
  
  - [x] 5.3 实现 ImageLoader 类
    - 在 `util` 包下创建 `ImageLoader.java`
    - 实现 `loadDrugImage()` 方法: 加载药品图片
    - 实现 `loadThumbnail()` 方法: 加载缩略图
    - 实现 `loadCircleImage()` 方法: 加载圆形图片
    - 配置 Glide 占位图、错误图和缓存策略
    - 添加完整的中文注释
    - _需求: 5.3, 5.6_

- [ ]* 5.4 编写工具类单元测试
  - 测试 PriceCalculator 的价格计算逻辑
  - 测试运费计算规则(满99包邮)
  - 测试 CartManager 的购物车管理功能
  - _需求: 测试策略, Property 2, Property 3, Property 4_

- [ ] 6. 验证和检查
  - 确保所有类和接口创建完成
  - 确保代码可以成功编译
  - 确保命名规范符合要求
  - 确保注释完整且使用中文
  - 询问用户是否有问题或需要调整

## 注意事项

### 开发规范
1. 所有代码注释使用中文
2. 类名使用大驼峰,方法名和变量名使用小驼峰
3. 常量名使用全大写下划线分隔
4. 包名使用全小写

### 技术要点
1. 数据模型类使用标准的 JavaBean 规范
2. API 接口使用 Retrofit 注解
3. 返回类型使用 RxJava Observable
4. 工具类使用单例模式(如 CartManager)
5. 价格计算使用 BigDecimal 避免精度问题

### 依赖关系
- 本 spec 是整个项目的基础,没有依赖其他 spec
- 后续所有 spec 都将依赖本 spec 的基础架构

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
