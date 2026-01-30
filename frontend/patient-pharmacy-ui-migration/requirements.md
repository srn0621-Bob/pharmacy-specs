# 需求文档: 患者端药房商城UI迁移

## 简介

将 dingdang-pharmacy React Web 应用的 UI 和交互逻辑迁移到 mshlwyy_patient Android 应用中,实现与现有页面风格一致的原生 Android 药品商城功能。

## 术语表

- **dingdang-pharmacy**: 基于 React 的药房商城 Web 应用原型
- **mshlwyy_patient**: 现有的 Android 患者端应用
- **药品商城**: 患者端的药品浏览、购买功能模块
- **原生实现**: 使用 Android 原生组件和 Java 代码实现
- **风格一致**: UI 设计、交互方式与现有 Android 应用保持一致

## 需求概述

### 背景

- dingdang-pharmacy 是一个 React Web 应用,包含药品商城的核心功能
- mshlwyy_patient 是现有的 Android 患者端应用
- 后端 API 已通过 13 个 spec 完成设计和实现
- 需要将 Web 版本的 UI 和交互逻辑转换为 Android 原生实现

### 目标

1. 将 dingdang-pharmacy 的所有页面转换为 Android Activity/Fragment
2. 保持与现有 mshlwyy_patient 应用的 UI 风格一致
3. 对接已有的后端药品商城 API
4. 实现流畅的用户体验和页面导航

## 功能需求

### 需求 1: 商城首页

**用户故事:** 作为患者,我想浏览药品商城首页,以便快速找到需要的药品

#### 验收标准

1. WHEN 用户打开药品商城 THEN 系统 SHALL 显示商城首页
2. WHEN 首页加载 THEN 系统 SHALL 显示轮播图、分类导航、热销药品、推荐药品
3. WHEN 用户点击轮播图 THEN 系统 SHALL 跳转到对应的活动页面或药品详情
4. WHEN 用户点击分类 THEN 系统 SHALL 跳转到该分类的药品列表
5. WHEN 用户点击药品卡片 THEN 系统 SHALL 跳转到药品详情页
6. WHEN 用户下拉刷新 THEN 系统 SHALL 重新加载首页数据
7. WHEN 首页数据加载失败 THEN 系统 SHALL 显示错误提示和重试按钮

### 需求 2: 药品详情页

**用户故事:** 作为患者,我想查看药品的详细信息,以便了解药品并决定是否购买

#### 验收标准

1. WHEN 用户打开药品详情页 THEN 系统 SHALL 显示药品的完整信息
2. WHEN 详情页加载 THEN 系统 SHALL 显示药品图片轮播、名称、价格、规格、厂家、说明书
3. WHEN 用户滑动图片 THEN 系统 SHALL 切换显示不同的药品图片
4. WHEN 用户点击"加入购物车" THEN 系统 SHALL 将药品添加到购物车并显示成功提示
5. WHEN 用户点击"立即购买" THEN 系统 SHALL 跳转到结算页面
6. WHEN 用户点击返回 THEN 系统 SHALL 返回上一页
7. WHEN 详情页显示相关推荐 THEN 系统 SHALL 展示同类或相关药品

### 需求 3: 购物车页面

**用户故事:** 作为患者,我想管理购物车中的药品,以便调整购买数量或删除不需要的药品

#### 验收标准

1. WHEN 用户打开购物车 THEN 系统 SHALL 显示购物车中的所有药品
2. WHEN 购物车有商品 THEN 系统 SHALL 显示药品列表、总价、结算按钮
3. WHEN 用户选中/取消选中商品 THEN 系统 SHALL 更新总价计算
4. WHEN 用户点击"全选" THEN 系统 SHALL 选中所有商品
5. WHEN 用户增加/减少数量 THEN 系统 SHALL 更新该商品数量和总价
6. WHEN 用户删除商品 THEN 系统 SHALL 从购物车移除该商品
7. WHEN 用户点击"结算" THEN 系统 SHALL 跳转到结算页面
8. WHEN 购物车为空 THEN 系统 SHALL 显示空状态提示和"去逛逛"按钮

### 需求 4: 结算页面

**用户故事:** 作为患者,我想确认订单信息并完成支付,以便购买药品

#### 验收标准

1. WHEN 用户打开结算页 THEN 系统 SHALL 显示订单信息和收货地址
2. WHEN 结算页加载 THEN 系统 SHALL 显示商品列表、收货地址、运费、总价
3. WHEN 用户点击"选择地址" THEN 系统 SHALL 跳转到地址选择页面
4. WHEN 用户选择地址后返回 THEN 系统 SHALL 更新显示的收货地址
5. WHEN 用户点击"提交订单" THEN 系统 SHALL 创建订单并跳转到支付页面
6. WHEN 订单创建失败 THEN 系统 SHALL 显示错误提示
7. WHEN 用户点击返回 THEN 系统 SHALL 返回购物车页面

### 需求 5: 药品搜索

**用户故事:** 作为患者,我想搜索药品,以便快速找到需要的药品

#### 验收标准

1. WHEN 用户点击搜索框 THEN 系统 SHALL 跳转到搜索页面
2. WHEN 搜索页加载 THEN 系统 SHALL 显示搜索历史和热门搜索
3. WHEN 用户输入关键词 THEN 系统 SHALL 实时显示搜索建议
4. WHEN 用户提交搜索 THEN 系统 SHALL 显示搜索结果列表
5. WHEN 搜索结果为空 THEN 系统 SHALL 显示"暂无结果"和推荐药品
6. WHEN 用户点击搜索历史 THEN 系统 SHALL 自动填充并搜索
7. WHEN 用户清空搜索历史 THEN 系统 SHALL 删除所有历史记录

### 需求 6: 药品分类

**用户故事:** 作为患者,我想按分类浏览药品,以便找到特定类别的药品

#### 验收标准

1. WHEN 用户打开分类页 THEN 系统 SHALL 显示所有药品分类
2. WHEN 用户选择分类 THEN 系统 SHALL 显示该分类下的药品列表
3. WHEN 分类列表支持滚动 THEN 系统 SHALL 实现分页加载
4. WHEN 用户点击药品 THEN 系统 SHALL 跳转到药品详情页
5. WHEN 分类数据加载失败 THEN 系统 SHALL 显示错误提示

### 需求 7: 底部导航栏

**用户故事:** 作为患者,我想通过底部导航快速切换功能模块,以便方便地使用不同功能

#### 验收标准

1. WHEN 药品商城模块激活 THEN 系统 SHALL 在底部显示导航栏
2. WHEN 导航栏显示 THEN 系统 SHALL 包含"首页"、"分类"、"购物车"、"我的"四个标签
3. WHEN 用户点击标签 THEN 系统 SHALL 切换到对应页面
4. WHEN 当前页面对应的标签 THEN 系统 SHALL 高亮显示
5. WHEN 购物车有商品 THEN 系统 SHALL 在购物车标签显示数量角标

## 非功能性需求

### 性能需求

1. **页面加载时间**: 首页首次加载时间 < 2秒
2. **页面切换**: 页面切换动画流畅,无卡顿
3. **图片加载**: 使用 Glide 实现图片懒加载和缓存
4. **列表滚动**: RecyclerView 滚动流畅,帧率 > 50fps

### UI/UX 需求

1. **风格一致**: 与现有 mshlwyy_patient 应用保持一致的 UI 风格
2. **Material Design**: 遵循 Material Design 设计规范
3. **响应式**: 适配不同屏幕尺寸和分辨率
4. **无障碍**: 支持 TalkBack 等无障碍功能

### 兼容性需求

1. **Android 版本**: 支持 Android 5.0 (API 21) 及以上
2. **屏幕适配**: 支持 4.5 寸到 7 寸屏幕
3. **分辨率**: 支持 hdpi、xhdpi、xxhdpi、xxxhdpi

### 安全需求

1. **数据传输**: 所有 API 请求使用 HTTPS
2. **用户认证**: 使用 Token 进行身份验证
3. **敏感信息**: 不在本地明文存储敏感信息

## 约束条件

### 技术约束

1. **开发语言**: 使用 Java (与现有代码保持一致)
2. **最低 SDK**: minSdkVersion 19 (Android 4.4)
3. **目标 SDK**: targetSdkVersion 28 (Android 9.0)
4. **网络框架**: 使用 Retrofit + OkHttp
5. **图片加载**: 使用 Glide
6. **UI 组件**: 使用 RecyclerView、CardView 等 Support Library 组件

### 设计约束

1. **包名**: 在 com.adinnet.demo 包下创建 mall 子包
2. **命名规范**: 遵循现有代码的命名规范
3. **代码注释**: 所有代码注释使用中文
4. **文件组织**: 按照现有项目结构组织文件

### 业务约束

1. **API 对接**: 必须对接已有的后端药品商城 API
2. **数据模型**: 使用后端 API 定义的数据模型
3. **业务逻辑**: 遵循后端 API 的业务规则

## 验收标准清单

### 功能完整性

- [ ] 所有 dingdang-pharmacy 的页面都已转换为 Android 实现
- [ ] 所有核心功能都能正常工作
- [ ] 与后端 API 对接成功
- [ ] 页面导航流程正确

### UI/UX 质量

- [ ] UI 风格与现有应用一致
- [ ] 页面布局美观,间距合理
- [ ] 交互反馈及时,动画流畅
- [ ] 适配不同屏幕尺寸

### 代码质量

- [ ] 代码结构清晰,职责分明
- [ ] 遵循 MVP 或 MVVM 架构模式
- [ ] 代码注释完整,使用中文
- [ ] 无明显的性能问题

### 测试覆盖

- [ ] 核心功能有单元测试
- [ ] 关键页面有 UI 测试
- [ ] 在多种设备上测试通过
- [ ] 无崩溃和 ANR 问题

## 参考资料

### 源代码参考

- **dingdang-pharmacy**: `dingdang-pharmacy/` 目录
  - `App.tsx`: 主应用组件和路由
  - `views/HomeView.tsx`: 首页实现
  - `views/ProductDetailView.tsx`: 详情页实现
  - `views/CartView.tsx`: 购物车实现
  - `views/CheckoutView.tsx`: 结算页实现
  - `types.ts`: 数据模型定义

### 现有代码参考

- **mshlwyy_patient**: `mshlwyy_patient/mshlwyy_patient/app/` 目录
  - `src/main/java/com/adinnet/demo/activity/`: Activity 示例
  - `src/main/java/com/adinnet/demo/fragment/`: Fragment 示例
  - `src/main/java/com/adinnet/demo/adapter/`: Adapter 示例
  - `src/main/res/layout/`: 布局文件示例

### API 文档参考

- **药品商城 API Spec**: `.kiro/specs/patient-mall-phase*/` 目录
  - 阶段一: 基础数据准备
  - 阶段二: 核心查询功能
  - 阶段三: 购物车功能
  - 阶段四: 订单功能
  - 阶段五: 物流功能
  - 阶段六: 优化功能

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
