# 需求文档: 患者端商城UI重构实施

> **文档版本**: v1.0  
> **创建时间**: 2026-01-29  
> **目标**: 实现与dingdang-pharmacy高度一致的UI和交互体验

## 介绍

本需求文档基于 `patient-mall-ui-redesign-01` 的UI一致性分析和优化建议,旨在通过系统化的UI重构,将Android患者端商城与dingdang-pharmacy的视觉一致性从当前的60-65%提升到75-80%。

### 背景

当前Android实现是功能性实现,核心购物流程完整,但视觉呈现与dingdang-pharmacy存在显著差异:
- 主题色系统完全不同(橙色 vs 翠绿色)
- 圆角系统偏小(8-12dp vs 16-24dp)
- 标签样式完全缺失
- 缺少关键UI组件(固定Header、促销标签、用药指导等)
- 交互动画缺失

### 目标

通过分阶段实施,实现以下目标:
- **阶段一(1周)**: 视觉基础一致性达到68-72%
- **完整方案(3-4周)**: 整体一致性达到76-82%

## 术语表

- **System**: 患者端商城Android应用
- **dingdang-pharmacy**: React Web版本的叮当商城(参考标准)
- **视觉一致性**: Android实现与dingdang-pharmacy在视觉呈现上的相似程度
- **主题色**: 翠绿色(#10b981)作为品牌主色调
- **Pill形状**: 圆角半径为9999dp的完全圆角按钮/搜索框
- **DingdangTagView**: 自定义标签组件,支持快递送/自营/促销等样式
- **DingdangCheckBox**: 自定义圆形选中组件,带动画效果
- **固定Header**: 固定在页面顶部的翠绿色导航栏

## 需求

### 需求 1: 视觉一致性基础系统

**用户故事:** 作为产品经理,我希望Android版本与dingdang-pharmacy保持高度视觉一致,以便提供统一的品牌体验

#### 验收标准

1. WHEN 用户查看任意商城页面 THEN 系统 SHALL 使用翠绿色(#10b981)作为主题色
2. WHEN 用户查看卡片组件 THEN 系统 SHALL 使用16dp或24dp的大圆角
3. WHEN 用户查看按钮 THEN 系统 SHALL 使用pill形状(9999dp圆角)
4. WHEN 用户查看药品标签 THEN 系统 SHALL 显示彩色背景标签(快递送/自营/促销)
5. WHEN 用户查看价格 THEN 系统 SHALL 使用翠绿色显示
6. WHEN 设计师对比两个版本 THEN 视觉一致性评分 SHALL >= 68%

### 需求 2: 主题色系统重构

**用户故事:** 作为用户,我希望看到与Web版一致的翠绿色主题,以便获得统一的品牌认知

#### 验收标准

1. WHEN 系统初始化颜色资源 THEN 系统 SHALL 创建colors_dingdang.xml文件
2. WHEN 系统定义主题色 THEN 系统 SHALL 使用翠绿色#10b981作为primary颜色
3. WHEN 系统定义辅助色 THEN 系统 SHALL 使用深绿色#059669和浅绿色#34d399
4. WHEN 系统显示价格 THEN 系统 SHALL 使用翠绿色#10b981
5. WHEN 系统显示按钮 THEN 系统 SHALL 使用翠绿色背景或边框
6. WHEN 系统显示标签 THEN 系统 SHALL 使用定义的标签颜色系统(橙色/绿色)

### 需求 3: 圆角系统优化

**用户故事:** 作为用户,我希望看到更大的圆角设计,以便获得更现代化的视觉体验

#### 验收标准

1. WHEN 系统初始化尺寸资源 THEN 系统 SHALL 创建dimens_dingdang.xml文件
2. WHEN 系统定义圆角尺寸 THEN 系统 SHALL 包含tiny(3dp)、small(6dp)、medium(8dp)、large(12dp)、xlarge(16dp)、xxlarge(24dp)、pill(9999dp)
3. WHEN 系统显示卡片 THEN 系统 SHALL 使用16dp圆角
4. WHEN 系统显示大卡片 THEN 系统 SHALL 使用24dp圆角
5. WHEN 系统显示按钮 THEN 系统 SHALL 使用pill形状(9999dp圆角)
6. WHEN 系统显示搜索框 THEN 系统 SHALL 使用pill形状(9999dp圆角)
7. WHEN 系统显示标签 THEN 系统 SHALL 使用3dp小圆角

### 需求 4: 标签组件实现

**用户故事:** 作为用户,我希望看到清晰的药品标签(快递送/自营/促销),以便快速识别药品特性

#### 验收标准

1. WHEN 系统创建标签组件 THEN 系统 SHALL 实现DingdangTagView类
2. WHEN 标签类型为"快递送" THEN 系统 SHALL 显示橙色背景(#fed7aa)和橙色文字(#ea580c)
3. WHEN 标签类型为"自营" THEN 系统 SHALL 显示白色背景和翠绿色边框及文字
4. WHEN 标签类型为"促销" THEN 系统 SHALL 显示绿色背景(#d1fae5)和绿色文字(#059669)
5. WHEN 标签类型为"赠品" THEN 系统 SHALL 显示橙色边框和橙色文字
6. WHEN 系统显示标签 THEN 系统 SHALL 使用8sp字号和3dp圆角
7. WHEN 药品卡片包含多个标签 THEN 系统 SHALL 横向排列标签,间距4dp

### 需求 5: 圆形选中组件实现

**用户故事:** 作为用户,我希望看到圆形的选中图标(带动画),以便获得更流畅的交互体验

#### 验收标准

1. WHEN 系统创建选中组件 THEN 系统 SHALL 实现DingdangCheckBox类
2. WHEN 组件未选中 THEN 系统 SHALL 显示白色圆形边框
3. WHEN 组件选中 THEN 系统 SHALL 显示翠绿色圆形填充背景
4. WHEN 组件选中 THEN 系统 SHALL 绘制白色对勾图标
5. WHEN 用户点击组件 THEN 系统 SHALL 播放200ms的填充动画
6. WHEN 动画播放 THEN 系统 SHALL 使用ease-in-out缓动曲线
7. WHEN 组件用于购物车 THEN 系统 SHALL 替换标准CheckBox

### 需求 6: 商城首页固定Header

**用户故事:** 作为用户,我希望首页有固定的翠绿色Header,以便快速访问搜索和热门标签

#### 验收标准

1. WHEN 用户打开商城首页 THEN 系统 SHALL 显示固定在顶部的翠绿色Header
2. WHEN Header显示 THEN 系统 SHALL 包含"叮当商城"标题(18sp粗体白色)
3. WHEN Header显示 THEN 系统 SHALL 包含"药企联盟直供 全国发货"副标题(8sp白色半透明)
4. WHEN Header显示 THEN 系统 SHALL 包含pill形状的白色搜索框
5. WHEN Header显示 THEN 系统 SHALL 包含热门标签横向滚动区域
6. WHEN Header显示 THEN 系统 SHALL 包含历史和物流图标按钮
7. WHEN 用户滚动页面 THEN Header SHALL 保持固定在顶部
8. WHEN Header覆盖内容 THEN 系统 SHALL 在主内容顶部预留Header高度

### 需求 7: 商城首页布局优化

**用户故事:** 作为用户,我希望首页布局与Web版一致,以便获得熟悉的浏览体验

#### 验收标准

1. WHEN 首页加载 THEN 系统 SHALL 使用FrameLayout实现Header覆盖效果
2. WHEN 首页显示轮播图 THEN 系统 SHALL 设置高度180dp和圆角16dp
3. WHEN 首页显示分类导航 THEN 系统 SHALL 使用CardView包裹,圆角16dp
4. WHEN 首页显示分类图标 THEN 系统 SHALL 实现彩色圆形背景
5. WHEN 首页显示热销药品 THEN 系统 SHALL 使用横向RecyclerView
6. WHEN 首页显示推荐药品 THEN 系统 SHALL 使用网格RecyclerView(2列)
7. WHEN 首页显示药品卡片 THEN 系统 SHALL 使用16dp圆角
8. WHEN 首页显示药品卡片 THEN 系统 SHALL 集成DingdangTagView显示标签
9. WHEN 首页显示价格 THEN 系统 SHALL 使用翠绿色

### 需求 8: 药品详情页促销标签

**用户故事:** 作为用户,我希望看到详情页的促销标签横向滚动,以便了解所有促销活动

#### 验收标准

1. WHEN 详情页显示促销信息 THEN 系统 SHALL 创建HorizontalScrollView
2. WHEN 促销标签显示 THEN 系统 SHALL 使用DingdangTagView组件
3. WHEN 促销标签超过屏幕宽度 THEN 系统 SHALL 支持横向滚动
4. WHEN 促销标签显示 THEN 系统 SHALL 包含"低价换购"、"返叮当币"、"满减"等标签
5. WHEN 促销标签显示 THEN 系统 SHALL 使用绿色背景样式
6. WHEN 促销标签显示 THEN 系统 SHALL 隐藏滚动条

### 需求 9: 药品详情页用药指导

**用户故事:** 作为用户,我希望看到用药指导卡片,以便了解药品的功能主治和用法用量

#### 验收标准

1. WHEN 详情页显示用药指导 THEN 系统 SHALL 创建独立的灰色背景卡片(#f5f5f5)
2. WHEN 用药指导显示 THEN 系统 SHALL 包含"用药指导"标题(10sp粗体)
3. WHEN 用药指导显示 THEN 系统 SHALL 包含"功能主治"字段和内容
4. WHEN 用药指导显示 THEN 系统 SHALL 包含"用法用量"字段和内容
5. WHEN 用药指导显示 THEN 系统 SHALL 使用12dp圆角
6. WHEN 用药指导显示 THEN 系统 SHALL 使用12dp内边距

### 需求 10: 药品详情页限购说明

**用户故事:** 作为用户,我希望看到清晰的限购说明,以便了解购买限制

#### 验收标准

1. WHEN 药品有限购规则 THEN 系统 SHALL 显示限购说明
2. WHEN 限购说明显示 THEN 系统 SHALL 使用绿色背景(#d1fae5)
3. WHEN 限购说明显示 THEN 系统 SHALL 使用绿色文字(#059669)
4. WHEN 限购说明显示 THEN 系统 SHALL 使用8dp圆角
5. WHEN 限购说明显示 THEN 系统 SHALL 使用8dp内边距
6. WHEN 限购说明显示 THEN 系统 SHALL 显示具体限购数量

### 需求 11: 药品详情页店铺信息

**用户故事:** 作为用户,我希望看到店铺信息卡片,以便了解店铺和包邮政策

#### 验收标准

1. WHEN 详情页显示店铺信息 THEN 系统 SHALL 创建独立的店铺信息卡片
2. WHEN 店铺信息显示 THEN 系统 SHALL 包含店铺图标
3. WHEN 店铺信息显示 THEN 系统 SHALL 包含店铺名称(粗体)
4. WHEN 店铺信息显示 THEN 系统 SHALL 包含包邮提示(如"满¥48包邮，快递送")
5. WHEN 店铺信息显示 THEN 系统 SHALL 包含右箭头图标
6. WHEN 店铺信息显示 THEN 系统 SHALL 使用白色背景和16dp内边距
7. WHEN 用户点击店铺信息 THEN 系统 SHALL 跳转到店铺详情页

### 需求 12: 药品详情页成功弹窗

**用户故事:** 作为用户,我希望添加成功后看到底部弹窗,以便快速查看推荐商品或去结算

#### 验收标准

1. WHEN 用户成功添加商品到购物车 THEN 系统 SHALL 显示底部弹出Dialog
2. WHEN 成功弹窗显示 THEN 系统 SHALL 包含成功提示文字
3. WHEN 成功弹窗显示 THEN 系统 SHALL 显示推荐商品网格(3列)
4. WHEN 成功弹窗显示 THEN 系统 SHALL 包含"返回"按钮
5. WHEN 成功弹窗显示 THEN 系统 SHALL 包含"去结算"按钮(翠绿色)
6. WHEN 弹窗出现 THEN 系统 SHALL 播放从底部弹出动画(300ms)
7. WHEN 用户点击返回 THEN 系统 SHALL 关闭弹窗
8. WHEN 用户点击去结算 THEN 系统 SHALL 跳转到购物车页面

### 需求 13: 购物车店铺信息栏

**用户故事:** 作为用户,我希望看到购物车的店铺信息栏,以便了解商品来源和包邮政策

#### 验收标准

1. WHEN 购物车显示商品 THEN 系统 SHALL 显示店铺信息栏
2. WHEN 店铺信息栏显示 THEN 系统 SHALL 包含DingdangCheckBox选中组件
3. WHEN 店铺信息栏显示 THEN 系统 SHALL 包含"商城"标签(紫色背景)
4. WHEN 店铺信息栏显示 THEN 系统 SHALL 包含"自营"标签(绿色边框)
5. WHEN 店铺信息栏显示 THEN 系统 SHALL 包含店铺名称(粗体)
6. WHEN 店铺信息栏显示 THEN 系统 SHALL 包含包邮提示(如"满48元包邮, 快递送")
7. WHEN 用户点击选中框 THEN 系统 SHALL 选中/取消选中该店铺所有商品

### 需求 14: 购物车活动提示栏

**用户故事:** 作为用户,我希望看到活动提示栏,以便了解当前可用的优惠活动

#### 验收标准

1. WHEN 购物车有活动 THEN 系统 SHALL 显示活动提示栏
2. WHEN 活动提示栏显示 THEN 系统 SHALL 使用绿色背景(#d1fae5)
3. WHEN 活动提示栏显示 THEN 系统 SHALL 使用12dp圆角
4. WHEN 活动提示栏显示 THEN 系统 SHALL 显示活动文案(如"店铺有1个活动，可超值换购1元商品!")
5. WHEN 活动提示栏显示 THEN 系统 SHALL 包含"查看更多 >"链接(翠绿色)
6. WHEN 用户点击查看更多 THEN 系统 SHALL 展开活动详情或跳转活动页面

### 需求 15: 购物车选中组件替换

**用户故事:** 作为用户,我希望看到圆形的选中图标,以便获得与Web版一致的交互体验

#### 验收标准

1. WHEN 购物车显示商品 THEN 系统 SHALL 使用DingdangCheckBox替换标准CheckBox
2. WHEN 用户选中商品 THEN 系统 SHALL 显示翠绿色圆形填充和白色对勾
3. WHEN 用户取消选中 THEN 系统 SHALL 显示白色圆形边框
4. WHEN 选中状态改变 THEN 系统 SHALL 播放200ms动画
5. WHEN 全选按钮点击 THEN 系统 SHALL 同步更新所有商品的选中状态

### 需求 16: 购物车预估到手价

**用户故事:** 作为用户,我希望看到预估到手价,以便了解优惠后的实际价格

#### 验收标准

1. WHEN 购物车显示商品价格 THEN 系统 SHALL 在价格下方显示预估到手价
2. WHEN 预估到手价显示 THEN 系统 SHALL 使用10sp小字号
3. WHEN 预估到手价显示 THEN 系统 SHALL 使用绿色背景标签
4. WHEN 预估到手价显示 THEN 系统 SHALL 计算优惠后的实际价格
5. WHEN 商品无优惠 THEN 系统 SHALL 不显示预估到手价

### 需求 17: 购物车常买常逛推荐

**用户故事:** 作为用户,我希望看到常买常逛推荐,以便发现更多感兴趣的商品

#### 验收标准

1. WHEN 购物车底部 THEN 系统 SHALL 显示常买常逛区域
2. WHEN 常买常逛区域显示 THEN 系统 SHALL 包含分隔线和"常买常逛"标题
3. WHEN 常买常逛区域显示 THEN 系统 SHALL 使用网格RecyclerView(2列)
4. WHEN 常买常逛区域显示 THEN 系统 SHALL 复用药品卡片样式
5. WHEN 推荐商品显示 THEN 系统 SHALL 使用16dp圆角卡片
6. WHEN 推荐商品显示 THEN 系统 SHALL 集成DingdangTagView显示标签
7. WHEN 用户点击推荐商品 THEN 系统 SHALL 跳转到商品详情页

### 需求 18: 购物车优惠明细展开

**用户故事:** 作为用户,我希望查看优惠明细,以便了解具体的优惠构成

#### 验收标准

1. WHEN 购物车有优惠 THEN 系统 SHALL 显示优惠明细入口
2. WHEN 用户点击优惠明细 THEN 系统 SHALL 展开优惠详情
3. WHEN 优惠明细展开 THEN 系统 SHALL 显示各项优惠的名称和金额
4. WHEN 优惠明细展开 THEN 系统 SHALL 播放展开动画
5. WHEN 用户再次点击 THEN 系统 SHALL 收起优惠明细
6. WHEN 优惠明细收起 THEN 系统 SHALL 播放收起动画

### 需求 19: 交互动画实现

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

## 非功能性需求

### 视觉规范

1. **主题色系统**: 
   - 主色: 翠绿色 #10b981
   - 深色: #059669
   - 浅色: #34d399
   - 价格色: 翠绿色 #10b981

2. **圆角系统**:
   - 小圆角: 3-6dp (标签)
   - 中圆角: 8-12dp (输入框)
   - 大圆角: 16dp (卡片)
   - 超大圆角: 24dp (大卡片)
   - Pill形状: 9999dp (按钮、搜索框)

3. **标签样式**:
   - 快递送: 橙色背景(#fed7aa) + 橙色文字(#ea580c)
   - 自营: 白色背景 + 翠绿色边框和文字
   - 促销: 绿色背景(#d1fae5) + 绿色文字(#059669)

4. **字体系统**:
   - 超大标题: 18sp
   - 大标题: 14sp
   - 标题: 12sp
   - 正文: 13sp
   - 小字: 10sp
   - 微小字: 8sp

### 性能需求

1. **响应时间**: 所有UI操作响应时间 <= 100ms
2. **动画流畅度**: 所有动画帧率 >= 55fps
3. **内存占用**: UI重构后内存增长 <= 10%
4. **自定义组件绘制**: 绘制时间 <= 16ms

### 兼容性需求

1. **Android版本**: 支持Android 4.4+ (API 19+)
2. **屏幕尺寸**: 支持4.0-7.0英寸屏幕
3. **屏幕密度**: 支持hdpi、xhdpi、xxhdpi、xxxhdpi
4. **低端设备**: 提供动画降级方案

### 可维护性需求

1. **资源组织**: 创建独立的dingdang资源文件(colors_dingdang.xml、dimens_dingdang.xml、styles_dingdang.xml)
2. **组件复用**: 自定义组件(DingdangTagView、DingdangCheckBox)可在多个页面复用
3. **代码注释**: 所有自定义组件和关键逻辑使用中文注释
4. **命名规范**: 所有dingdang相关资源使用`dingdang_`前缀

### 测试需求

1. **视觉对比测试**: 与dingdang-pharmacy进行截图对比,一致性评分 >= 75%
2. **功能测试**: 所有新增功能正常工作
3. **性能测试**: 动画流畅度和响应时间符合要求
4. **兼容性测试**: 在不同设备和Android版本上测试
5. **回归测试**: 确保现有功能不受影响

## 优先级定义

- **P0 (必须实现)**: 需求1-7 (视觉基础系统、主题色、圆角、标签、选中组件、首页Header和布局)
- **P1 (强烈建议)**: 需求8-18 (详情页和购物车的信息完善)
- **P2 (建议实现)**: 需求19 (交互动画)

## 参考文档

- [UI_CONSISTENCY_ANALYSIS.md](../patient-mall-ui-redesign-01/UI_CONSISTENCY_ANALYSIS.md) - UI一致性分析报告
- [SPEC_OPTIMIZATION_RECOMMENDATIONS.md](../patient-mall-ui-redesign-01/SPEC_OPTIMIZATION_RECOMMENDATIONS.md) - Spec优化建议
- [CONSISTENCY_IMPROVEMENT_ASSESSMENT.md](../patient-mall-ui-redesign-01/CONSISTENCY_IMPROVEMENT_ASSESSMENT.md) - 一致性提升评估
- [dingdang-pharmacy源码](../../../../dingdang-pharmacy/) - React Web版本参考实现
