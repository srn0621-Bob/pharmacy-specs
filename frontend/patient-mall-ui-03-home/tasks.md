# 实施计划: 患者端药房商城UI - 商城首页

## 概述

实现患者端药房商城的首页功能,包括轮播图、分类导航、热销药品、推荐药品的展示,以及下拉刷新和搜索入口等交互功能。

**预计工作量:** 6-8 小时

## 任务列表

- [ ] 1. 创建首页布局文件
  - 在 `res/layout/` 目录下创建 `fragment_mall_home.xml`
  - 使用 SwipeRefreshLayout 包裹 NestedScrollView
  - 添加搜索栏(使用 include 引入)
  - 添加轮播图(Banner 组件)
  - 添加分类 RecyclerView
  - 添加热销药品区域(标题 + RecyclerView)
  - 添加推荐药品区域(标题 + RecyclerView)
  - 添加加载状态和空状态布局(使用 include 引入)
  - 使用定义好的颜色、尺寸和样式
  - _需求: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. 创建列表项布局文件
  - [ ] 2.1 创建分类项布局
    - 创建 `item_category.xml`
    - 包含分类图标和名称
    - 使用卡片样式
    - _需求: 4.2, 4.4_
  
  - [ ] 2.2 创建药品项布局(横向)
    - 创建 `item_drug_horizontal.xml`
    - 包含药品图片、名称、价格、标签、销量
    - 使用 CardView
    - 宽度固定为 140dp
    - _需求: 5.5_
  
  - [ ] 2.3 创建药品项布局(纵向)
    - 创建 `item_drug_vertical.xml`
    - 布局与横向类似,但宽度为 match_parent
    - _需求: 6.5_

- [ ] 3. 创建数据模型类
  - 在 `model` 包下创建 `MallHomeData.java`
  - 定义字段: banners, categories, hotDrugs, recommendDrugs
  - 实现 Getter 和 Setter 方法
  - 添加完整的中文注释
  - _需求: 7.2_

- [ ] 4. 创建适配器类
  - [ ] 4.1 创建分类适配器
    - 在 `adapter` 包下创建 `CategoryAdapter.java`
    - 继承 BaseQuickAdapter
    - 实现 convert() 方法显示分类图标和名称
    - 使用 ImageLoader 加载图片
    - 处理点击事件
    - _需求: 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 4.2 创建药品列表适配器
    - 创建 `DrugListAdapter.java`
    - 继承 BaseQuickAdapter
    - 实现 convert() 方法显示药品信息
    - 支持横向和纵向两种布局
    - 使用 ImageLoader 加载图片
    - 处理点击事件
    - _需求: 5.4, 5.5, 6.4, 6.5_

- [ ] 5. 实现 Presenter 层
  - [ ] 5.1 创建 MallHomePresenter 接口
    - 在 `presenter` 包下创建接口
    - 定义方法: loadHomeData(), refreshHomeData(), onDrugClick(), onCategoryClick(), onBannerClick(), onDestroy()
    - 添加完整的中文注释
    - _需求: 8.2, 8.3_
  
  - [ ] 5.2 实现 MallHomePresenterImpl 类
    - 在 `presenter/impl` 包下创建实现类
    - 实现 loadHomeData() 方法,调用 API 获取首页数据
    - 实现 refreshHomeData() 方法,重新加载数据
    - 实现点击事件处理方法
    - 使用 RxJava 处理异步请求
    - 实现错误处理
    - 实现 onDestroy() 方法释放资源
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.4, 8.5_

- [ ] 6. 实现 View 层
  - [ ] 6.1 创建 MallHomeView 接口
    - 在 `view` 包下创建接口
    - 定义方法: showLoading(), hideLoading(), showHomeData(), showError(), navigateToDrugDetail(), navigateToCategoryList()
    - 添加完整的中文注释
    - _需求: 8.1, 8.3_
  
  - [ ] 6.2 实现 MallHomeFragment 类
    - 在 `fragment` 包下创建 `MallHomeFragment.java`
    - 继承 BaseFragment 并实现 MallHomeView 接口
    - 使用 ButterKnife 绑定视图
    - 实现 initView() 方法初始化所有视图组件
    - 实现 initBanner() 方法配置轮播图
    - 实现 initCategoryList() 方法配置分类列表
    - 实现 initHotDrugsList() 方法配置热销药品列表
    - 实现 initRecommendList() 方法配置推荐药品列表
    - 实现 initPresenter() 方法初始化 Presenter
    - 实现 loadData() 方法加载数据
    - 实现 onRefresh() 方法处理下拉刷新
    - 实现 MallHomeView 接口的所有方法
    - 实现页面跳转逻辑
    - _需求: 1.1, 2.1, 2.2, 2.3, 3.1-3.6, 4.1-4.6, 5.1-5.6, 6.1-6.6, 7.1-7.6, 8.1, 8.6_

- [ ] 7. 配置轮播图
  - 创建 BannerImageLoader 类实现图片加载
  - 配置轮播图自动播放
  - 配置轮播图指示器
  - 处理轮播图点击事件
  - _需求: 3.1, 3.2, 3.3, 3.4, 3.6_

- [ ] 8. 实现搜索入口
  - 在首页布局中引入搜索栏
  - 设置搜索栏点击事件
  - 实现跳转到搜索页面(占位实现)
  - _需求: 2.1, 2.2, 2.3, 2.4_

- [ ]* 9. 编写单元测试
  - 测试 MallHomePresenter 的数据加载逻辑
  - 测试成功和失败场景
  - 测试下拉刷新功能
  - 测试点击事件处理
  - _需求: 测试策略, Property 1, Property 2, Property 3_

- [ ]* 10. 编写 UI 测试
  - 测试首页布局显示
  - 测试药品项点击跳转
  - 测试分类项点击跳转
  - 测试下拉刷新交互
  - _需求: 测试策略, Property 2_

- [ ] 11. 性能优化
  - 配置 RecyclerView 优化参数
  - 配置 Glide 图片加载缓存
  - 优化列表滚动性能
  - _需求: 非功能性需求 - 性能_

- [ ] 12. 验证和检查
  - 在模拟器和真机上测试
  - 检查不同屏幕尺寸的适配
  - 验证下拉刷新功能
  - 验证页面跳转功能
  - 验证错误处理
  - 确保代码注释完整且使用中文
  - 询问用户是否有问题或需要调整

## 注意事项

### 开发规范
1. 所有代码注释使用中文
2. 类名使用大驼峰,方法名和变量名使用小驼峰
3. 遵循 MVP 架构模式
4. 使用 ButterKnife 进行视图绑定

### 技术要点
1. 使用 SwipeRefreshLayout 实现下拉刷新
2. 使用 NestedScrollView 支持嵌套滚动
3. 使用 Banner 组件实现轮播图
4. 分类使用 GridLayoutManager (4列)
5. 热销药品使用 LinearLayoutManager (横向)
6. 推荐药品使用 StaggeredGridLayoutManager (2列瀑布流)
7. 使用 RxJava 处理异步请求
8. 使用 Glide 加载图片并配置缓存

### 设计要点
1. 搜索栏使用 include 引入公共布局
2. 章节标题使用 include 引入公共布局
3. 加载状态和空状态使用 include 引入公共布局
4. 药品卡片使用 CardView 实现阴影效果
5. 价格使用红色显示,原价使用灰色并添加删除线
6. 标签使用橙色背景和文字
7. 图片加载失败显示占位图

### 依赖关系
- 本 spec 依赖 Spec 1 (基础架构、数据模型、API 接口)
- 本 spec 依赖 Spec 2 (UI 资源和样式)
- 后续 Spec 4 (药品详情) 将依赖本 spec 的跳转功能

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
