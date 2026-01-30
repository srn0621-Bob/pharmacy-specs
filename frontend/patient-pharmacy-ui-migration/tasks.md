# 实施计划: 患者端药房商城UI迁移

## 概述

将 dingdang-pharmacy React Web 应用迁移到 mshlwyy_patient Android 应用,实现原生 Android 药品商城功能。采用 MVP 架构,使用 Java 语言,与现有应用保持技术栈和 UI 风格一致。

**预计总工作量:** 40-50 小时

## 任务列表

### 阶段一: 基础架构搭建 (8-10小时)

- [ ] 1. 创建项目基础结构
  - 在 `app/src/main/java/com/adinnet/demo/` 下创建 `mall` 包
  - 创建子包: `activity`, `fragment`, `adapter`, `presenter`, `view`, `model`, `api`, `util`
  - 创建对应的资源目录: `layout`, `drawable`, `values`
  - _需求: 技术约束_

- [ ] 2. 定义数据模型类
  - [ ] 2.1 创建 Drug 实体类
    - 定义所有字段(id, name, brand, price, images, tags, sales, category, specification等)
    - 实现 Getter/Setter 方法
    - 添加中文注释
    - _需求: 1.2, 2.2_
  
  - [ ] 2.2 创建 CartItem 实体类
    - 定义字段(id, userId, drug, quantity, selected等)
    - 实现 getSubtotal() 计算方法
    - _需求: 3.2, 3.3_
  
  - [ ] 2.3 创建 Category 实体类
    - 定义字段(id, name, icon, color, sort, drugCount)
    - _需求: 6.1, 6.2_
  
  - [ ] 2.4 创建 Order 和 Address 实体类
    - Order: 订单信息和订单项列表
    - Address: 收货地址信息
    - _需求: 4.1, 4.2_

- [ ] 3. 创建 API 接口定义
  - [ ] 3.1 创建 MallApiService 接口
    - 定义所有 API 方法(首页数据、分类、搜索、详情、购物车、订单等)
    - 使用 Retrofit 注解(@GET, @POST, @PUT, @DELETE)
    - 使用 RxJava Observable 返回类型
    - _需求: 所有功能需求_
  
  - [ ] 3.2 配置 Retrofit 客户端
    - 复用现有的 RetrofitClient
    - 添加 MallApiService 实例获取方法
    - _需求: 技术约束_

- [ ] 4. 定义 MVP 接口
  - [ ] 4.1 创建 View 接口
    - MallHomeView, DrugDetailView, CartView, CheckoutView
    - 定义显示数据、显示加载、显示错误等方法
    - _需求: 所有功能需求_
  
  - [ ] 4.2 创建 Presenter 接口
    - MallHomePresenter, DrugDetailPresenter, CartPresenter, CheckoutPresenter
    - 定义业务逻辑方法
    - _需求: 所有功能需求_

- [ ] 5. 创建工具类
  - [ ] 5.1 创建 CartManager 购物车管理类
    - 使用 SharedPreferences 本地存储购物车数据
    - 提供添加、删除、更新、查询方法
    - _需求: 3.1, 3.2, 3.5, 3.6_
  
  - [ ] 5.2 创建 PriceCalculator 价格计算类
    - 实现总价计算方法
    - 实现运费计算方法(满99包邮)
    - _需求: 3.3, 4.2_
  
  - [ ] 5.3 创建 ImageLoader 图片加载类
    - 封装 Glide 图片加载
    - 配置占位图和错误图
    - 配置缓存策略
    - _需求: 非功能性需求 - 性能_

### 阶段二: UI 资源准备 (4-6小时)

- [ ] 6. 创建颜色和尺寸资源
  - 在 `values/colors.xml` 中定义颜色(主色调、背景色、文字色、功能色)
  - 在 `values/dimens.xml` 中定义尺寸(间距、圆角、文字大小、图片尺寸)
  - 在 `values/styles.xml` 中定义样式(卡片、按钮、标签、标题)
  - _需求: 非功能性需求 - UI/UX_

- [ ] 7. 创建可绘制资源
  - 创建卡片背景 `bg_card.xml`
  - 创建按钮背景 `bg_button_primary.xml`, `bg_button_secondary.xml`
  - 创建标签背景 `bg_tag.xml`
  - 创建占位图和错误图
  - _需求: 非功能性需求 - UI/UX_

- [ ] 8. 创建公共布局组件
  - 创建搜索栏布局 `include_search_bar.xml`
  - 创建章节标题布局 `include_section_title.xml`
  - 创建空状态布局 `include_empty_state.xml`
  - 创建加载状态布局 `include_loading_state.xml`
  - _需求: 1.1, 3.8, 5.5_


### 阶段三: 商城首页实现 (8-10小时)

- [ ] 9. 实现商城首页 Fragment
  - [ ] 9.1 创建 MallHomeFragment 布局
    - 创建 `fragment_mall_home.xml`
    - 添加 SwipeRefreshLayout 支持下拉刷新
    - 添加 NestedScrollView 支持滚动
    - 添加搜索栏、轮播图、分类网格、药品列表
    - _需求: 1.1, 1.2_
  
  - [ ] 9.2 实现 MallHomePresenter
    - 创建 MallHomePresenterImpl 类
    - 实现 loadHomeData() 方法,调用 API 获取首页数据
    - 实现 refreshHomeData() 方法,支持下拉刷新
    - 使用 RxJava 处理异步请求
    - 实现错误处理
    - _需求: 1.2, 1.6, 1.7_
  
  - [ ] 9.3 实现 MallHomeFragment 类
    - 继承 BaseFragment 并实现 MallHomeView
    - 使用 ButterKnife 绑定视图
    - 初始化 Presenter
    - 实现 View 接口方法(showHomeData, showLoading, showError等)
    - 配置轮播图(使用 Banner 组件)
    - 配置分类网格(使用 RecyclerView + GridLayoutManager)
    - 配置药品列表(使用 RecyclerView + StaggeredGridLayoutManager)
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [ ] 9.4 创建分类适配器 CategoryAdapter
    - 继承 BaseQuickAdapter
    - 实现 convert() 方法显示分类图标和名称
    - 处理点击事件
    - _需求: 1.4_
  
  - [ ] 9.5 创建药品列表适配器 DrugListAdapter
    - 继承 BaseQuickAdapter
    - 实现 convert() 方法显示药品信息(图片、名称、价格、标签、销量)
    - 使用 ImageLoader 加载图片
    - 处理点击事件
    - _需求: 1.5_

- [ ]* 9.6 编写首页单元测试
  - 测试 MallHomePresenter 的数据加载逻辑
  - 测试成功和失败场景
  - _需求: 测试策略_

### 阶段四: 药品详情页实现 (6-8小时)

- [ ] 10. 实现药品详情页 Activity
  - [ ] 10.1 创建 DrugDetailActivity 布局
    - 创建 `activity_drug_detail.xml`
    - 添加 ScrollView 支持滚动
    - 添加图片轮播、药品信息、规格说明、相关推荐
    - 添加底部操作栏(加入购物车、立即购买)
    - _需求: 2.1, 2.2_
  
  - [ ] 10.2 实现 DrugDetailPresenter
    - 创建 DrugDetailPresenterImpl 类
    - 实现 loadDrugDetail() 方法
    - 实现 addToCart() 方法
    - 实现 buyNow() 方法
    - 实现 loadRecommendDrugs() 方法
    - _需求: 2.2, 2.4, 2.5, 2.7_
  
  - [ ] 10.3 实现 DrugDetailActivity 类
    - 继承 BaseActivity 并实现 DrugDetailView
    - 使用 ButterKnife 绑定视图
    - 初始化 Presenter
    - 配置图片轮播(使用 Banner 组件)
    - 显示药品详细信息
    - 显示相关推荐列表
    - 处理加入购物车和立即购买事件
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 10.4 创建推荐药品适配器 RecommendAdapter
    - 继承 BaseQuickAdapter
    - 实现 convert() 方法显示推荐药品
    - 处理点击事件
    - _需求: 2.7_
  
  - [ ] 10.5 实现加入购物车成功弹窗
    - 创建自定义 Dialog 或 BottomSheetDialog
    - 显示成功提示和推荐商品
    - 提供"返回商品"和"去清单结算"按钮
    - _需求: 2.4_

- [ ]* 10.6 编写详情页单元测试
  - 测试 DrugDetailPresenter 的业务逻辑
  - 测试加入购物车和立即购买功能
  - _需求: 测试策略_

### 阶段五: 购物车页面实现 (6-8小时)

- [ ] 11. 实现购物车 Fragment
  - [ ] 11.1 创建 CartFragment 布局
    - 创建 `fragment_cart.xml`
    - 添加购物车列表 RecyclerView
    - 添加常买常逛推荐列表
    - 添加底部汇总栏(全选、总价、结算按钮)
    - 添加空状态布局
    - _需求: 3.1, 3.2, 3.8_
  
  - [ ] 11.2 实现 CartPresenter
    - 创建 CartPresenterImpl 类
    - 实现 loadCartList() 方法
    - 实现 selectItem() 和 selectAll() 方法
    - 实现 updateQuantity() 方法
    - 实现 deleteItem() 方法
    - 实现 checkout() 方法
    - _需求: 3.2, 3.3, 3.4, 3.5, 3.7_
  
  - [ ] 11.3 实现 CartFragment 类
    - 继承 BaseFragment 并实现 CartView
    - 使用 ButterKnife 绑定视图
    - 初始化 Presenter
    - 配置购物车列表
    - 配置推荐列表
    - 处理选中、数量修改、删除事件
    - 实时更新总价
    - 处理结算事件
    - _需求: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [ ] 11.4 创建购物车项适配器 CartItemAdapter
    - 继承 BaseQuickAdapter
    - 实现 convert() 方法显示购物车项
    - 添加选中框、商品信息、数量选择器
    - 处理选中、数量修改、删除事件
    - _需求: 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 11.5 实现数量选择器自定义控件
    - 创建 QuantitySelector 自定义 View
    - 包含减号、数量显示、加号按钮
    - 实现数量增减逻辑
    - 限制最小值1,最大值999
    - _需求: 3.4_

- [ ]* 11.6 编写购物车单元测试
  - 测试 CartPresenter 的业务逻辑
  - 测试价格计算的正确性
  - 测试选中状态管理
  - _需求: 测试策略, Property 1, Property 2_

### 阶段六: 结算页面实现 (4-6小时)

- [ ] 12. 实现结算页 Activity
  - [ ] 12.1 创建 CheckoutActivity 布局
    - 创建 `activity_checkout.xml`
    - 添加收货地址选择区域
    - 添加商品列表
    - 添加价格明细(商品总价、运费、总计)
    - 添加支付方式选择
    - 添加提交订单按钮
    - _需求: 4.1, 4.2, 4.3, 4.5_
  
  - [ ] 12.2 实现 CheckoutPresenter
    - 创建 CheckoutPresenterImpl 类
    - 实现 loadCheckoutData() 方法
    - 实现 selectAddress() 方法
    - 实现 selectPaymentMethod() 方法
    - 实现 submitOrder() 方法
    - _需求: 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [ ] 12.3 实现 CheckoutActivity 类
    - 继承 BaseActivity 并实现 CheckoutView
    - 使用 ButterKnife 绑定视图
    - 初始化 Presenter
    - 显示收货地址信息
    - 显示商品列表
    - 显示价格明细
    - 处理地址选择事件
    - 处理支付方式选择事件
    - 处理提交订单事件
    - _需求: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ]* 12.4 编写结算页单元测试
  - 测试 CheckoutPresenter 的业务逻辑
  - 测试订单金额计算
  - _需求: 测试策略, Property 8_

### 阶段七: 搜索功能实现 (4-6小时)

- [ ] 13. 实现搜索页 Activity
  - [ ] 13.1 创建 SearchActivity 布局
    - 创建 `activity_search.xml`
    - 添加搜索输入框
    - 添加搜索历史列表
    - 添加热门搜索标签
    - 添加搜索结果列表
    - 添加空结果提示
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ] 13.2 实现 SearchPresenter
    - 创建 SearchPresenterImpl 类
    - 实现 loadSearchHistory() 方法
    - 实现 loadHotSearch() 方法
    - 实现 search() 方法
    - 实现 clearHistory() 方法
    - _需求: 5.2, 5.3, 5.4, 5.6, 5.7_
  
  - [ ] 13.3 实现 SearchActivity 类
    - 继承 BaseActivity 并实现 SearchView
    - 使用 ButterKnife 绑定视图
    - 初始化 Presenter
    - 实现实时搜索建议
    - 显示搜索历史和热门搜索
    - 显示搜索结果列表
    - 处理搜索历史点击和清空
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ]* 13.4 编写搜索功能单元测试
  - 测试 SearchPresenter 的搜索逻辑
  - 测试搜索历史管理
  - _需求: 测试策略, Property 4_

### 阶段八: 分类功能实现 (3-4小时)

- [ ] 14. 实现分类页 Fragment
  - [ ] 14.1 创建 MallCategoryFragment 布局
    - 创建 `fragment_mall_category.xml`
    - 添加左侧分类列表
    - 添加右侧药品列表
    - _需求: 6.1, 6.2, 6.3_
  
  - [ ] 14.2 实现 CategoryPresenter
    - 创建 CategoryPresenterImpl 类
    - 实现 loadCategories() 方法
    - 实现 loadDrugsByCategory() 方法
    - _需求: 6.1, 6.2, 6.3_
  
  - [ ] 14.3 实现 MallCategoryFragment 类
    - 继承 BaseFragment 并实现 CategoryView
    - 使用 ButterKnife 绑定视图
    - 初始化 Presenter
    - 配置左侧分类列表
    - 配置右侧药品列表
    - 实现分页加载
    - _需求: 6.1, 6.2, 6.3, 6.4, 6.5_

### 阶段九: 底部导航和主容器 (3-4小时)

- [ ] 15. 实现商城主容器 Activity
  - [ ] 15.1 创建 MallMainActivity 布局
    - 创建 `activity_mall_main.xml`
    - 添加 ViewPager 或 FragmentContainerView
    - 添加 BottomNavigationView
    - _需求: 7.1, 7.2_
  
  - [ ] 15.2 实现 MallMainActivity 类
    - 继承 BaseActivity
    - 使用 ButterKnife 绑定视图
    - 配置 ViewPager 和 Fragment 适配器
    - 配置 BottomNavigationView
    - 处理标签切换事件
    - 实现购物车数量角标
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 15.3 创建"我的"页面占位 Fragment
    - 创建 MallMineFragment
    - 显示基本的个人信息和订单入口
    - _需求: 7.2_

### 阶段十: 集成和优化 (4-6小时)

- [ ] 16. 集成到主应用
  - 在主应用的导航菜单中添加"药品商城"入口
  - 配置路由跳转到 MallMainActivity
  - 测试从主应用进入商城的流程
  - _需求: 业务约束_

- [ ] 17. 性能优化
  - [ ] 17.1 优化图片加载
    - 配置 Glide 缓存策略
    - 实现图片懒加载
    - 压缩大图
    - _需求: 非功能性需求 - 性能_
  
  - [ ] 17.2 优化列表滚动
    - 配置 RecyclerView 优化参数
    - 使用 ViewHolder 复用
    - 减少布局层级
    - _需求: 非功能性需求 - 性能_
  
  - [ ] 17.3 优化网络请求
    - 配置 OkHttp 缓存
    - 实现请求去重
    - 实现离线缓存
    - _需求: 非功能性需求 - 性能_

- [ ] 18. 错误处理和日志
  - 实现统一的错误处理机制
  - 添加关键操作日志
  - 配置 Bugly 崩溃收集
  - _需求: 非功能性需求 - 安全_

- [ ] 19. 安全加固
  - 实现 Token 管理
  - 实现敏感数据加密
  - 配置网络安全策略
  - _需求: 非功能性需求 - 安全_

### 阶段十一: 测试和验收 (4-6小时)

- [ ] 20. 功能测试
  - 测试所有页面的基本功能
  - 测试页面跳转和数据传递
  - 测试网络异常场景
  - 测试边界条件
  - _需求: 验收标准 - 功能完整性_

- [ ] 21. UI/UX 测试
  - 检查 UI 风格是否与现有应用一致
  - 检查布局在不同屏幕尺寸的适配
  - 检查交互反馈和动画效果
  - 检查无障碍功能
  - _需求: 验收标准 - UI/UX 质量_

- [ ] 22. 性能测试
  - 测试页面加载时间
  - 测试列表滚动流畅度
  - 测试内存占用
  - 测试网络请求耗时
  - _需求: 验收标准 - 性能, 非功能性需求 - 性能_

- [ ]* 23. 编写集成测试
  - 测试完整的购物流程(浏览→详情→加购→结算)
  - 测试搜索和分类流程
  - _需求: 测试策略_

- [ ] 24. 代码审查和文档
  - 代码审查,确保符合规范
  - 补充代码注释
  - 编写使用文档
  - _需求: 验收标准 - 代码质量_

## 检查点

### 检查点 1: 基础架构完成 (阶段一、二完成后)
- 确保所有基础类和接口创建完成
- 确保 UI 资源准备完成
- 确保可以成功编译
- 询问用户是否有问题或需要调整

### 检查点 2: 核心页面完成 (阶段三、四、五完成后)
- 确保首页、详情页、购物车页面功能正常
- 确保页面跳转流畅
- 确保数据加载和显示正确
- 询问用户是否有问题或需要调整

### 检查点 3: 全部功能完成 (阶段十完成后)
- 确保所有功能实现完成
- 确保性能优化完成
- 确保错误处理和安全加固完成
- 询问用户是否有问题或需要调整

### 检查点 4: 测试验收完成 (阶段十一完成后)
- 确保所有测试通过
- 确保满足验收标准
- 准备上线部署

## 注意事项

### 开发规范
1. 所有代码注释使用中文
2. 类名使用大驼峰,方法名和变量名使用小驼峰
3. 常量名使用全大写下划线分隔
4. 遵循现有代码的命名和组织规范

### 技术要点
1. 使用 MVP 架构模式,保持代码结构清晰
2. 使用 RxJava 处理异步操作,避免回调地狱
3. 使用 ButterKnife 简化视图绑定
4. 使用 Glide 加载图片,配置合理的缓存策略
5. 使用 BaseRecyclerViewAdapterHelper 简化适配器开发

### 性能优化
1. RecyclerView 使用 ViewHolder 复用
2. 图片加载使用缩略图和懒加载
3. 网络请求使用缓存和去重
4. 避免在主线程执行耗时操作

### 测试要求
1. 核心业务逻辑必须有单元测试
2. 关键页面必须有 UI 测试
3. 测试覆盖率目标: Presenter 层 > 80%
4. 所有测试必须通过才能合并代码

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
