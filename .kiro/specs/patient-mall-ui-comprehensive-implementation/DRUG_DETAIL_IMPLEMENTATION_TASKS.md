# 药品详情页重新设计 - 实施任务清单

> **版本**: v1.0  
> **创建时间**: 2026-02-04  
> **预计工期**: 3-4天

## 任务概览

- [ ] 阶段1: 数据模型和API接口 (0.5天)
- [ ] 阶段2: 布局文件创建 (1天)
- [ ] 阶段3: Adapter和Fragment创建 (1天)
- [ ] 阶段4: Activity逻辑实现 (1天)
- [ ] 阶段5: 测试和优化 (0.5-1天)

---

## 阶段1: 数据模型和API接口

### 1.1 创建数据模型类

- [ ] 创建 `DrugDetail.java` - 药品详细信息模型
  - 包含: 通用名称、商品名称、规格、生产企业、批准文号等
  - 位置: `com.adinnet.demo.mall.model.DrugDetail`

- [ ] 创建 `Review.java` - 用户评价模型
  - 包含: 用户信息、评分、评价内容、时间
  - 位置: `com.adinnet.demo.mall.model.Review`

- [ ] 创建 `Promotion.java` - 促销活动模型
  - 包含: 活动ID、标题、描述、图标
  - 位置: `com.adinnet.demo.mall.model.Promotion`

- [ ] 创建 `ShopInfo.java` - 店铺信息模型
  - 包含: 店铺ID、名称、Logo、服务标签
  - 位置: `com.adinnet.demo.mall.model.ShopInfo`

### 1.2 扩展Drug模型

- [ ] 在 `Drug.java` 中添加新字段
  - `DrugDetail detail` - 详细信息
  - `List<Promotion> promotions` - 促销活动列表
  - `List<String> services` - 服务保障列表
  - `ShopInfo shop` - 店铺信息
  - `List<String> images` - 图片列表
  - `List<String> tags` - 标签列表

### 1.3 创建API接口

- [ ] 在 `MallApiService.java` 中添加接口
  - `getDrugDetail(String drugId)` - 获取药品详情
  - `getRecommendDrugs(String drugId)` - 获取推荐商品
  - `getDrugReviews(String drugId, int page, int pageSize)` - 获取用户评价

---

## 阶段2: 布局文件创建

### 2.1 主布局文件

- [ ] 创建 `activity_drug_detail_v2.xml`
  - CoordinatorLayout根布局
  - NestedScrollView可滚动内容
  - 底部操作栏固定布局

### 2.2 模块布局文件

- [ ] 创建 `mall_include_drug_price.xml` - 价格区域
  - 大号价格显示
  - 分享赚和收藏按钮

- [ ] 创建 `mall_include_drug_basic_info.xml` - 基本信息
  - 标签组
  - 药品名称
  - 规格、单位、生产企业

- [ ] 创建 `mall_include_promotions.xml` - 促销活动
  - 多个促销项列表
  - 每项带图标和右箭头

- [ ] 创建 `mall_include_services.xml` - 服务保障
  - 服务项列表
  - 每项带图标

- [ ] 创建 `mall_include_recommend_drugs.xml` - 推荐商品
  - 标题栏
  - 横向RecyclerView

- [ ] 创建 `mall_include_detail_tabs.xml` - 商品详情Tab
  - TabLayout
  - ViewPager

- [ ] 创建 `mall_include_reviews.xml` - 用户评价
  - 标题栏和平均评分
  - 评论列表RecyclerView

### 2.3 Item布局文件

- [ ] 创建 `item_promotion.xml` - 促销项布局
  - 图标、文字、右箭头

- [ ] 创建 `item_service.xml` - 服务项布局
  - 图标、文字

- [ ] 创建 `item_review.xml` - 评论项布局
  - 用户头像、昵称、时间
  - 星级评分
  - 评价内容

### 2.4 Fragment布局文件

- [ ] 创建 `fragment_drug_detail_info.xml` - 商品详情Fragment
  - 键值对列表显示详细信息

- [ ] 创建 `fragment_medication_guide.xml` - 用药指南Fragment
  - 用药指导内容

- [ ] 创建 `fragment_faq.xml` - 常见问题Fragment
  - 问答列表

---

## 阶段3: Adapter和Fragment创建

### 3.1 创建Adapter

- [ ] 创建 `DetailTabAdapter.java` - Tab适配器
  - 继承 `FragmentPagerAdapter`
  - 管理3个Fragment切换
  - 位置: `com.adinnet.demo.mall.adapter.DetailTabAdapter`

- [ ] 创建 `PromotionAdapter.java` - 促销活动适配器
  - 显示促销项列表
  - 支持点击事件
  - 位置: `com.adinnet.demo.mall.adapter.PromotionAdapter`

- [ ] 创建 `ReviewAdapter.java` - 用户评价适配器
  - 显示评论列表
  - 支持分页加载
  - 位置: `com.adinnet.demo.mall.adapter.ReviewAdapter`

### 3.2 创建Fragment

- [ ] 创建 `DrugDetailInfoFragment.java` - 商品详情Fragment
  - 显示药品详细信息
  - 位置: `com.adinnet.demo.mall.fragment.DrugDetailInfoFragment`

- [ ] 创建 `MedicationGuideFragment.java` - 用药指南Fragment
  - 显示用药指导内容
  - 位置: `com.adinnet.demo.mall.fragment.MedicationGuideFragment`

- [ ] 创建 `FAQFragment.java` - 常见问题Fragment
  - 显示常见问题列表
  - 位置: `com.adinnet.demo.mall.fragment.FAQFragment`

---

## 阶段4: Activity逻辑实现

### 4.1 创建Presenter

- [ ] 创建 `DrugDetailPresenter.java`
  - 处理药品详情加载
  - 处理推荐商品加载
  - 处理用户评价加载
  - 处理收藏、分享等操作
  - 位置: `com.adinnet.demo.mall.presenter.DrugDetailPresenter`

- [ ] 创建 `DrugDetailView.java` 接口
  - 定义View层接口方法
  - 位置: `com.adinnet.demo.mall.view.DrugDetailView`

### 4.2 更新DrugDetailActivity

- [ ] 实现MVP架构
  - 实现 `DrugDetailView` 接口
  - 创建 `DrugDetailPresenter` 实例

- [ ] 初始化视图组件
  - 图片轮播
  - 价格区域
  - 基本信息
  - 促销活动
  - 服务保障
  - 店铺信息
  - 推荐商品RecyclerView
  - Tab和ViewPager
  - 用户评价RecyclerView

- [ ] 实现数据加载
  - 加载药品详情
  - 加载推荐商品
  - 加载用户评价

- [ ] 实现交互功能
  - 返回按钮
  - 收藏按钮（切换收藏状态）
  - 分享按钮（分享药品信息）
  - 促销活动点击（显示活动详情）
  - 店铺信息点击（进入店铺页面）
  - 推荐商品点击（跳转到药品详情页）
  - Tab切换
  - 加入购物车
  - 立即购买
  - 客服按钮
  - 购物车按钮

### 4.3 实现图片轮播

- [ ] 配置HBanner
  - 设置图片列表
  - 设置指示器样式
  - 设置自动轮播

### 4.4 实现Tab切换

- [ ] 配置TabLayout和ViewPager
  - 设置Tab标题
  - 设置Fragment适配器
  - 实现Tab和ViewPager联动

---

## 阶段5: 测试和优化

### 5.1 功能测试

- [ ] 测试图片轮播
  - 手动滑动
  - 自动轮播
  - 指示器显示

- [ ] 测试数据加载
  - 药品详情加载
  - 推荐商品加载
  - 用户评价加载
  - 加载失败处理

- [ ] 测试交互功能
  - 所有按钮点击
  - Tab切换
  - 列表滚动
  - 页面跳转

### 5.2 UI测试

- [ ] 检查布局
  - 各模块间距
  - 圆角和阴影
  - 颜色和字体
  - 图标显示

- [ ] 检查适配
  - 不同屏幕尺寸
  - 横竖屏切换
  - 长文本处理

### 5.3 性能优化

- [ ] 图片加载优化
  - 使用Glide加载
  - 设置占位图
  - 设置缓存策略

- [ ] 列表滚动优化
  - RecyclerView优化
  - ViewHolder复用
  - 减少过度绘制

- [ ] 内存优化
  - 避免内存泄漏
  - 及时释放资源

### 5.4 代码优化

- [ ] 代码重构
  - 提取公共方法
  - 优化代码结构
  - 添加注释

- [ ] 错误处理
  - 网络错误
  - 数据异常
  - 空状态处理

---

## 验收标准

### 功能完整性
- [x] 所有模块正确显示
- [x] 图片轮播正常工作
- [x] Tab切换流畅
- [x] 推荐商品可点击跳转
- [x] 评价列表正确显示
- [x] 加入购物车功能正常
- [x] 立即购买功能正常
- [x] 收藏和分享功能正常
- [x] 促销活动可点击查看详情
- [x] 店铺信息可点击进入店铺页面

### UI一致性
- [x] 符合设计规范
- [x] 颜色和字体正确
- [x] 圆角和间距统一
- [x] 图标清晰显示

### 性能要求
- [x] 页面加载流畅
- [x] 滚动无卡顿
- [x] 图片加载快速
- [x] 无内存泄漏

---

**文档版本**: v1.0  
**创建时间**: 2026-02-04  
**状态**: 待执行
