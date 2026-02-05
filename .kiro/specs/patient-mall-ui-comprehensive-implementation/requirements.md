# 需求文档: 患者端药品商城UI综合实施

> **文档版本**: v1.0  
> **创建时间**: 2026-01-30  
> **基于**: patient-pharmacy-ui-migration + patient-mall-ui-redesign-implementation

## 介绍

本需求文档综合了 `patient-pharmacy-ui-migration` 的功能迁移需求和 `patient-mall-ui-redesign-implementation` 的UI重构需求,旨在一次性完成从dingdang-pharmacy到Android患者端的完整迁移,同时确保高度的视觉一致性(目标75-80%)。

### 背景

- **功能基础**: dingdang-pharmacy React Web应用包含完整的药品商城功能
- **后端就绪**: 13个后端API spec已完成设计和实现
- **现有应用**: mshlwyy_patient Android应用需要集成药品商城模块
- **视觉标准**: 以dingdang-pharmacy为参考,实现高度视觉一致性

### 目标

1. **功能完整性**: 实现所有核心购物流程(浏览、搜索、购物车、结算)
2. **视觉一致性**: 达到75-80%的视觉一致性评分
3. **性能优化**: 页面加载<2秒,动画帧率≥55fps
4. **代码质量**: 清晰的架构,可维护的代码,完整的注释

## 术语表

- **System**: 患者端商城Android应用
- **dingdang-pharmacy**: React Web版本的慈贞商城(参考标准)
- **MVP架构**: Model-View-Presenter架构模式
- **翠绿色主题**: 使用#10b981作为品牌主色调
- **Pill形状**: 圆角半径为9999dp的完全圆角设计
- **DingdangTagView**: 自定义标签组件
- **DingdangCheckBox**: 自定义圆形选中组件
- **固定Header**: 固定在页面顶部的翠绿色导航栏
- **视觉一致性**: Android实现与dingdang-pharmacy在视觉呈现上的相似程度

## 需求

### 需求 1: 视觉基础系统建立

**用户故事:** 作为开发者,我希望建立完整的视觉基础系统,以便后续页面开发保持一致性

#### 验收标准

1. WHEN 系统初始化资源 THEN 系统 SHALL 创建colors_dingdang.xml、dimens_dingdang.xml、styles_dingdang.xml
2. WHEN 系统定义主题色 THEN 系统 SHALL 使用翠绿色#10b981作为primary颜色
3. WHEN 系统定义圆角 THEN 系统 SHALL 包含tiny(3dp)、small(6dp)、medium(8dp)、large(12dp)、xlarge(16dp)、xxlarge(24dp)、pill(9999dp)
4. WHEN 系统定义标签颜色 THEN 系统 SHALL 包含快递送(橙色)、自营(绿边)、促销(绿色)、赠品(橙边)
5. WHEN 系统定义按钮样式 THEN 系统 SHALL 使用pill形状和翠绿色渐变
6. WHEN 系统定义文字样式 THEN 系统 SHALL 包含标题、正文、价格等样式

### 需求 2: 自定义组件实现

**用户故事:** 作为开发者,我希望实现可复用的自定义组件,以便在多个页面中保持一致的视觉效果

#### 验收标准

1. WHEN 系统创建DingdangTagView THEN 系统 SHALL 支持EXPRESS、SELF_OPERATED、PROMO、GIFT四种类型
2. WHEN 标签类型为EXPRESS THEN 系统 SHALL 显示橙色背景(#fed7aa)和橙色文字(#ea580c)
3. WHEN 标签类型为SELF_OPERATED THEN 系统 SHALL 显示白色背景和翠绿色边框
4. WHEN 标签类型为PROMO THEN 系统 SHALL 显示绿色背景(#d1fae5)和绿色文字(#059669)
5. WHEN 系统创建DingdangCheckBox THEN 系统 SHALL 实现圆形选中组件
6. WHEN 用户点击DingdangCheckBox THEN 系统 SHALL 播放200ms的填充动画
7. WHEN DingdangCheckBox选中 THEN 系统 SHALL 显示翠绿色圆形背景和白色对勾
8. WHEN DingdangCheckBox未选中 THEN 系统 SHALL 显示白色圆形边框

### 需求 3: 商城首页实现

**用户故事:** 作为患者,我希望浏览药品商城首页,以便快速找到需要的药品

#### 验收标准

1. WHEN 用户打开药品商城 THEN 系统 SHALL 显示固定的翠绿色Header
2. WHEN Header显示 THEN 系统 SHALL 包含"慈贞商城"标题、副标题、搜索框、热门标签
3. WHEN 搜索框显示 THEN 系统 SHALL 使用pill形状(9999dp圆角)和白色背景
4. WHEN 热门标签显示 THEN 系统 SHALL 支持横向滚动
5. WHEN 首页加载 THEN 系统 SHALL 显示轮播图(180dp高度,16dp圆角)
6. WHEN 首页显示分类导航 THEN 系统 SHALL 使用CardView包裹,16dp圆角
7. WHEN 首页显示分类图标 THEN 系统 SHALL 实现彩色圆形背景
8. WHEN 首页显示热销药品 THEN 系统 SHALL 使用横向RecyclerView
9. WHEN 首页显示推荐药品 THEN 系统 SHALL 使用网格RecyclerView(2列)
10. WHEN 首页显示药品卡片 THEN 系统 SHALL 使用16dp圆角和DingdangTagView标签
11. WHEN 首页显示价格 THEN 系统 SHALL 使用翠绿色
12. WHEN 用户下拉刷新 THEN 系统 SHALL 重新加载首页数据
13. WHEN 用户点击药品卡片 THEN 系统 SHALL 跳转到药品详情页
14. WHEN 用户点击分类 THEN 系统 SHALL 跳转到该分类的药品列表

### 需求 4: 药品详情页实现

**用户故事:** 作为患者,我希望查看药品的详细信息,以便了解药品并决定是否购买

#### 验收标准

1. WHEN 用户打开药品详情页 THEN 系统 SHALL 显示药品的完整信息
2. WHEN 详情页显示图片 THEN 系统 SHALL 使用轮播图,支持滑动切换
3. WHEN 详情页显示促销标签 THEN 系统 SHALL 使用HorizontalScrollView横向滚动
4. WHEN 促销标签显示 THEN 系统 SHALL 使用DingdangTagView(PROMO类型)
5. WHEN 详情页显示用药指导 THEN 系统 SHALL 创建灰色背景卡片(#f5f5f5)
6. WHEN 用药指导显示 THEN 系统 SHALL 包含"功能主治"和"用法用量"字段
7. WHEN 详情页显示限购说明 THEN 系统 SHALL 使用绿色背景(#d1fae5)和8dp圆角
8. WHEN 详情页显示店铺信息 THEN 系统 SHALL 创建独立的店铺信息卡片
9. WHEN 店铺信息显示 THEN 系统 SHALL 包含店铺图标、名称、包邮提示
10. WHEN 用户点击"加入购物车" THEN 系统 SHALL 将药品添加到购物车
11. WHEN 添加成功 THEN 系统 SHALL 显示底部弹出Dialog
12. WHEN 成功弹窗显示 THEN 系统 SHALL 包含推荐商品网格(3列)和"去结算"按钮
13. WHEN 用户点击"立即购买" THEN 系统 SHALL 跳转到结算页面
14. WHEN 详情页显示相关推荐 THEN 系统 SHALL 展示同类或相关药品

### 需求 5: 购物车页面实现

**用户故事:** 作为患者,我希望管理购物车中的药品,以便调整购买数量或删除不需要的药品

#### 验收标准

1. WHEN 用户打开购物车 THEN 系统 SHALL 显示购物车中的所有药品
2. WHEN 购物车显示商品 THEN 系统 SHALL 显示店铺信息栏
3. WHEN 店铺信息栏显示 THEN 系统 SHALL 包含DingdangCheckBox、"商城"标签、"自营"标签、店铺名称
4. WHEN 店铺信息栏显示 THEN 系统 SHALL 包含包邮提示(如"满48元包邮, 快递送")
5. WHEN 购物车有活动 THEN 系统 SHALL 显示活动提示栏(绿色背景)
6. WHEN 活动提示栏显示 THEN 系统 SHALL 包含活动文案和"查看更多"链接
7. WHEN 购物车显示商品 THEN 系统 SHALL 使用DingdangCheckBox替换标准CheckBox
8. WHEN 购物车显示价格 THEN 系统 SHALL 在价格下方显示预估到手价(绿色标签)
9. WHEN 用户选中/取消选中商品 THEN 系统 SHALL 更新总价计算
10. WHEN 用户点击"全选" THEN 系统 SHALL 选中所有商品
11. WHEN 用户增加/减少数量 THEN 系统 SHALL 更新该商品数量和总价
12. WHEN 用户删除商品 THEN 系统 SHALL 从购物车移除该商品
13. WHEN 购物车底部 THEN 系统 SHALL 显示常买常逛区域
14. WHEN 常买常逛区域显示 THEN 系统 SHALL 使用网格RecyclerView(2列)
15. WHEN 用户点击"结算" THEN 系统 SHALL 跳转到结算页面
16. WHEN 购物车为空 THEN 系统 SHALL 显示空状态提示和"去逛逛"按钮

### 需求 6: 结算页面实现

**用户故事:** 作为患者,我希望确认订单信息并完成支付,以便购买药品

#### 验收标准

1. WHEN 用户打开结算页 THEN 系统 SHALL 显示订单信息和收货地址
2. WHEN 结算页加载 THEN 系统 SHALL 显示商品列表、收货地址、运费、总价
3. WHEN 用户点击"选择地址" THEN 系统 SHALL 跳转到地址选择页面
4. WHEN 用户选择地址后返回 THEN 系统 SHALL 更新显示的收货地址
5. WHEN 用户点击"提交订单" THEN 系统 SHALL 创建订单并跳转到支付页面
6. WHEN 订单创建失败 THEN 系统 SHALL 显示错误提示
7. WHEN 用户点击返回 THEN 系统 SHALL 返回购物车页面

### 需求 7: 药品搜索实现

**用户故事:** 作为患者,我希望搜索药品,以便快速找到需要的药品

#### 验收标准

1. WHEN 用户点击搜索框 THEN 系统 SHALL 跳转到搜索页面
2. WHEN 搜索页加载 THEN 系统 SHALL 显示搜索历史和热门搜索
3. WHEN 用户输入关键词 THEN 系统 SHALL 实时显示搜索建议
4. WHEN 用户提交搜索 THEN 系统 SHALL 显示搜索结果列表
5. WHEN 搜索结果为空 THEN 系统 SHALL 显示"暂无结果"和推荐药品
6. WHEN 用户点击搜索历史 THEN 系统 SHALL 自动填充并搜索
7. WHEN 用户清空搜索历史 THEN 系统 SHALL 删除所有历史记录

### 需求 8: 药品分类实现

**用户故事:** 作为患者,我希望按分类浏览药品,以便找到特定类别的药品

#### 验收标准

1. WHEN 用户打开分类页 THEN 系统 SHALL 显示所有药品分类
2. WHEN 用户选择分类 THEN 系统 SHALL 显示该分类下的药品列表
3. WHEN 分类列表支持滚动 THEN 系统 SHALL 实现分页加载
4. WHEN 用户点击药品 THEN 系统 SHALL 跳转到药品详情页
5. WHEN 分类数据加载失败 THEN 系统 SHALL 显示错误提示

### 需求 9: 底部导航栏实现

**用户故事:** 作为患者,我希望通过底部导航快速切换功能模块,以便方便地使用不同功能

#### 验收标准

1. WHEN 药品商城模块激活 THEN 系统 SHALL 在底部显示导航栏
2. WHEN 导航栏显示 THEN 系统 SHALL 包含"首页"、"分类"、"购物车"、"我的"四个标签
3. WHEN 用户点击标签 THEN 系统 SHALL 切换到对应页面
4. WHEN 当前页面对应的标签 THEN 系统 SHALL 高亮显示(翠绿色)
5. WHEN 购物车有商品 THEN 系统 SHALL 在购物车标签显示数量角标

### 需求 10: 交互动画实现

**用户故事:** 作为用户,我希望看到流畅的交互动画,以便获得更好的使用体验

#### 验收标准

1. WHEN 用户点击按钮 THEN 系统 SHALL 播放缩放动画(scale 0.95, 100ms)
2. WHEN 用户点击按钮 THEN 系统 SHALL 显示涟漪效果(ripple)
3. WHEN Activity切换 THEN 系统 SHALL 播放淡入淡出动画
4. WHEN Fragment切换 THEN 系统 SHALL 播放滑动动画
5. WHEN 用户下拉刷新 THEN 系统 SHALL 显示翠绿色刷新动画
6. WHEN 列表加载更多 THEN 系统 SHALL 显示加载动画
7. WHEN 所有动画播放 THEN 系统 SHALL 使用ease-in-out缓动曲线
8. WHEN 所有动画播放 THEN 系统 SHALL 保持流畅(>=55fps)
9. WHEN 低端设备检测 THEN 系统 SHALL 提供动画降级方案

## 非功能性需求

### 性能需求

1. **页面加载时间**: 首页首次加载时间 < 2秒
2. **页面切换**: 页面切换动画流畅,无卡顿
3. **图片加载**: 使用 Glide 实现图片懒加载和缓存
4. **列表滚动**: RecyclerView 滚动流畅,帧率 > 50fps
5. **自定义组件绘制**: 单次绘制时间 ≤ 16ms
6. **动画流畅度**: 所有动画帧率 ≥ 55fps
7. **内存占用**: UI重构后内存增长 ≤ 10%

### UI/UX 需求

1. **视觉一致性**: 与dingdang-pharmacy达到75-80%的视觉一致性
2. **主题色系统**: 使用翠绿色#10b981作为品牌主色调
3. **圆角系统**: 遵循3dp-9999dp的圆角规范
4. **Material Design**: 遵循 Material Design 设计规范
5. **响应式**: 适配不同屏幕尺寸和分辨率
6. **无障碍**: 支持 TalkBack 等无障碍功能

### 兼容性需求

1. **Android 版本**: 支持 Android 4.4+ (API 19+)
2. **屏幕适配**: 支持 4.0-7.0 寸屏幕
3. **分辨率**: 支持 hdpi、xhdpi、xxhdpi、xxxhdpi
4. **低端设备**: 提供动画降级方案

### 安全需求

1. **数据传输**: 所有 API 请求使用 HTTPS
2. **用户认证**: 使用 Token 进行身份验证
3. **敏感信息**: 不在本地明文存储敏感信息

### 可维护性需求

1. **资源组织**: 创建独立的dingdang资源文件(colors_dingdang.xml、dimens_dingdang.xml、styles_dingdang.xml)
2. **组件复用**: 自定义组件(DingdangTagView、DingdangCheckBox)可在多个页面复用
3. **代码注释**: 所有自定义组件和关键逻辑使用中文注释
4. **命名规范**: 所有dingdang相关资源使用`dingdang_`前缀
5. **架构清晰**: 使用MVP架构模式,职责分明

## 约束条件

### 技术约束

1. **开发语言**: 使用 Java (与现有代码保持一致)
2. **最低 SDK**: minSdkVersion 19 (Android 4.4)
3. **目标 SDK**: targetSdkVersion 28 (Android 9.0)
4. **架构模式**: MVP (Model-View-Presenter)
5. **网络框架**: 使用 Retrofit 2.2.0 + OkHttp 3.10.0
6. **响应式编程**: RxJava 2.1.7 + RxAndroid 2.0.1
7. **视图绑定**: ButterKnife 8.8.1
8. **图片加载**: 使用 Glide 4.12.0
9. **列表组件**: RecyclerView + BaseRecyclerViewAdapterHelper 2.9.50

### 设计约束

1. **包名**: 在 com.adinnet.demo 包下创建 mall 子包
2. **命名规范**: 遵循现有代码的命名规范
3. **代码注释**: 所有代码注释使用中文
4. **文件组织**: 按照现有项目结构组织文件
5. **资源隔离**: 所有dingdang相关资源使用`dingdang_`前缀

### 业务约束

1. **API 对接**: 必须对接已有的后端药品商城 API
2. **数据模型**: 使用后端 API 定义的数据模型
3. **业务逻辑**: 遵循后端 API 的业务规则

## 优先级定义

- **P0 (必须实现)**: 需求1-6 (视觉基础、自定义组件、首页、详情页、购物车、结算)
- **P1 (强烈建议)**: 需求7-9 (搜索、分类、底部导航)
- **P2 (建议实现)**: 需求10 (交互动画)

## 验收标准清单

### 功能完整性

- [ ] 所有 dingdang-pharmacy 的页面都已转换为 Android 实现
- [ ] 所有核心功能都能正常工作
- [ ] 与后端 API 对接成功
- [ ] 页面导航流程正确

### 视觉一致性

- [ ] 视觉一致性评分 >= 75%
- [ ] 主题色系统正确(翠绿色#10b981)
- [ ] 圆角系统正确(3dp-9999dp)
- [ ] 标签样式正确(快递送、自营、促销、赠品)
- [ ] 自定义组件样式正确(DingdangTagView、DingdangCheckBox)

### UI/UX 质量

- [ ] UI 风格与dingdang-pharmacy高度一致
- [ ] 页面布局美观,间距合理
- [ ] 交互反馈及时,动画流畅
- [ ] 适配不同屏幕尺寸

### 代码质量

- [ ] 代码结构清晰,职责分明
- [ ] 遵循 MVP 架构模式
- [ ] 代码注释完整,使用中文
- [ ] 无明显的性能问题
- [ ] 资源隔离正确(dingdang_前缀)

### 性能指标

- [ ] 首页加载时间 < 2秒
- [ ] 动画帧率 >= 55fps
- [ ] 自定义组件绘制时间 <= 16ms
- [ ] 内存增长 <= 10%

### 测试覆盖

- [ ] 核心功能有单元测试
- [ ] 关键页面有 UI 测试
- [ ] 在多种设备上测试通过
- [ ] 无崩溃和 ANR 问题
- [ ] 视觉对比测试通过(一致性 >= 75%)

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

- **mshlwyy_patient**: `mshlwyy_patient/app/` 目录
  - `src/main/java/com/adinnet/demo/activity/`: Activity 示例
  - `src/main/java/com/adinnet/demo/fragment/`: Fragment 示例
  - `src/main/java/com/adinnet/demo/adapter/`: Adapter 示例
  - `src/main/res/layout/`: 布局文件示例

### API 文档参考

- **药品商城 API Spec**: `pharmacy-specs/backend/` 目录
  - patient-mall-phase1-db-extension: 基础数据准备
  - patient-mall-phase2-*: 核心查询功能
  - patient-mall-phase3-*: 购物车功能
  - patient-mall-phase4-*: 订单功能
  - patient-mall-phase5-*: 物流功能
  - patient-mall-phase6-*: 优化功能

### 设计参考

- **UI一致性分析**: `pharmacy-specs/frontend/patient-mall-ui-redesign-01/UI_CONSISTENCY_ANALYSIS.md`
- **优化建议**: `pharmacy-specs/frontend/patient-mall-ui-redesign-01/SPEC_OPTIMIZATION_RECOMMENDATIONS.md`

---

**文档版本:** 1.0  
**创建日期:** 2026-01-30  
**最后更新:** 2026-01-30
