# 实施任务清单: 患者端商城UI重构

> **文档版本**: v1.0  
> **创建时间**: 2026-01-29  
> **预计工期**: 3-4周  
> **目标**: 将Android患者端商城与dingdang-pharmacy的视觉一致性从60-65%提升到75-80%

## 概述

本任务清单基于设计文档,将UI重构工作分解为5个阶段,共计约3-4周工作量。每个阶段都有明确的验收标准和预期效果。

### 优先级说明

- **P0**: 必须完成,核心视觉一致性
- **P1**: 重要功能,提升信息密度
- **P2**: 优化项,提升交互体验

### 实施路径

```
阶段一(P0) → 阶段二(P0+P1) → 阶段三(P1) → 阶段四(P1) → 阶段五(P2)
视觉基础    首页优化        详情页优化    购物车优化    交互动画
1周         3-4天           3-4天         2-3天         2-3天
65-70%      70-75%          72-77%        75-80%        75-80%
```

---

## 阶段一: 视觉基础重构 (P0优先级, 1周)

### 目标
实现与dingdang-pharmacy一致的视觉基础系统,达到65-70%一致性

### 任务清单

- [ ] 1.1 创建dingdang颜色系统
  - 创建 `res/values/colors_dingdang.xml` 文件
  - 定义翠绿色主题色系统 (#10b981)
  - 定义标签颜色系统 (快递送/自营/促销)
  - 定义背景色和文字颜色
  - _Requirements: 8.1_

- [ ] 1.2 创建dingdang尺寸系统
  - 创建 `res/values/dimens_dingdang.xml` 文件
  - 定义圆角系统 (tiny 3dp ~ pill 9999dp)
  - 定义间距系统 (4dp ~ 32dp)
  - 定义字体大小系统 (8sp ~ 18sp)
  - 定义组件尺寸 (Header高度、Banner高度等)
  - _Requirements: 8.2, 8.3_


- [ ] 1.3 创建dingdang样式系统
  - 创建 `res/values/styles_dingdang.xml` 文件
  - 定义按钮样式 (Primary/Secondary, pill形状)
  - 定义文字样式 (Title/Body/Secondary/Price)
  - 定义卡片样式 (圆角16dp, elevation 2dp)
  - _Requirements: 8.4_

- [ ] 1.4 创建标签Drawable资源
  - 创建 `res/drawable/dingdang_bg_tag_express.xml` (橙色背景 #fed7aa)
  - 创建 `res/drawable/dingdang_bg_tag_self.xml` (白底绿边)
  - 创建 `res/drawable/dingdang_bg_tag_promo.xml` (绿色背景 #d1fae5)
  - 创建 `res/drawable/dingdang_bg_tag_gift.xml` (橙色边框)
  - _Requirements: 8.4_

- [ ] 1.5 创建按钮Drawable资源
  - 创建 `res/drawable/dingdang_bg_button_primary.xml` (翠绿色渐变+pill)
  - 创建 `res/drawable/dingdang_bg_button_secondary.xml` (白底绿边+pill)
  - _Requirements: 8.3_

- [ ] 1.6 创建搜索框和其他Drawable资源
  - 创建 `res/drawable/dingdang_bg_search_pill.xml` (白色pill形状)
  - 创建 `res/drawable/dingdang_bg_hot_tag.xml` (热门标签背景)
  - _Requirements: 8.6_

### 验收标准
- [ ] 所有颜色资源使用翠绿色系统
- [ ] 圆角定义包含pill形状(9999dp)
- [ ] 标签Drawable样式与dingdang完全一致
- [ ] 按钮使用pill形状圆角

---

## 阶段二: 自定义组件实现 (P0优先级, 1周)

### 目标
实现dingdang特有的自定义UI组件

### 任务清单

- [ ] 2.1 实现标签组件 (DingdangTagView)
  - 创建 `mall/widget/DingdangTagView.java`
  - 继承AppCompatTextView
  - 实现TagType枚举 (EXPRESS/SELF_OPERATED/PROMO/GIFT)
  - 实现setTagType()方法,自动切换样式
  - 实现setTagText()方法,支持自定义文本
  - 字号8sp, padding 4dp/2dp
  - _Requirements: 8.4_

- [ ] 2.2 实现圆形选中组件 (DingdangCheckBox)
  - 创建 `mall/widget/DingdangCheckBox.java`
  - 继承View,实现自定义绘制
  - 实现圆形背景绘制 (选中翠绿色填充,未选中白色边框)
  - 实现对勾路径绘制 (分两段动画)
  - 实现ValueAnimator动画 (200ms)
  - 实现setChecked()和toggle()方法
  - _Requirements: 3.11_


- [ ] 2.3 实现固定Header布局
  - 创建 `res/layout/mall_include_fixed_header.xml`
  - 实现翠绿色背景 (#10b981)
  - 实现标题区域 (叮当商城 + 副标题)
  - 实现图标按钮 (历史、物流)
  - 实现pill形状搜索框
  - 实现热门标签横向滚动
  - elevation 4dp
  - _Requirements: 8.6_

- [ ] 2.4 创建公共布局组件
  - 创建 `res/layout/mall_include_section_title.xml` (区域标题)
  - 创建 `res/layout/mall_include_promo_tags.xml` (促销标签滚动)
  - 创建 `res/layout/mall_include_medication_guide.xml` (用药指导卡片)
  - 创建 `res/layout/mall_include_shop_info.xml` (店铺信息卡片)
  - _Requirements: 2.8, 2.9, 2.11_

### 验收标准
- [ ] DingdangTagView支持4种标签类型,样式与dingdang一致
- [ ] DingdangCheckBox动画流畅,200ms完成
- [ ] 固定Header可正常覆盖在内容上方
- [ ] 所有公共布局组件可复用

---

## 阶段三: 商城首页实现 (P0+P1优先级, 3-4天)

### 目标
首页达到70-75%视觉一致性

### 任务清单

- [ ] 3.1 实现首页布局结构
  - 修改 `res/layout/frm_mall.xml` 或创建新布局
  - 使用FrameLayout实现Header覆盖效果
  - 主内容使用SwipeRefreshLayout + NestedScrollView
  - 主内容顶部预留Header高度 (200dp)
  - 集成 `mall_include_fixed_header.xml`
  - _Requirements: 1.1, 1.2, 8.6_

- [ ] 3.2 实现轮播图区域
  - 配置Banner组件 (高度180dp)
  - 设置圆角16dp (使用Glide transform)
  - 实现点击跳转
  - margin 16dp
  - _Requirements: 1.3_

- [ ] 3.3 实现分类导航区域
  - 使用CardView包裹 (圆角16dp)
  - 实现网格布局 (GridLayoutManager, 5列)
  - 实现彩色圆形图标
  - 实现分类点击跳转
  - _Requirements: 1.4_

- [ ] 3.4 实现热销药品区域
  - 集成 `mall_include_section_title.xml`
  - 使用横向RecyclerView (LinearLayoutManager.HORIZONTAL)
  - 药品卡片使用CardView (圆角16dp)
  - 集成DingdangTagView显示标签
  - 价格使用翠绿色 (@color/dingdang_primary)
  - _Requirements: 1.2, 1.5_


- [ ] 3.5 实现推荐药品区域
  - 集成 `mall_include_section_title.xml`
  - 使用网格RecyclerView (GridLayoutManager, 2列)
  - 药品卡片使用CardView (圆角16dp)
  - 集成DingdangTagView显示标签
  - 价格使用翠绿色
  - _Requirements: 1.2, 1.5_

- [ ] 3.6 实现下拉刷新
  - 配置SwipeRefreshLayout
  - 设置主题色为翠绿色
  - 实现刷新逻辑
  - _Requirements: 1.6_

- [ ] 3.7 实现热门标签动态加载
  - 在MallHomeFragment中动态创建热门标签
  - 使用TextView + dingdang_bg_hot_tag背景
  - 实现标签点击搜索
  - _Requirements: 8.6_

### 验收标准
- [ ] Header固定在顶部,翠绿色背景
- [ ] 搜索框为pill形状
- [ ] 分类图标有彩色圆形背景
- [ ] 药品卡片圆角16dp
- [ ] 标签样式与dingdang一致
- [ ] 价格显示为翠绿色

---

## 阶段四: 药品详情页实现 (P1优先级, 3-4天)

### 目标
详情页达到72-77%视觉一致性

### 任务清单

- [ ] 4.1 优化详情页基础布局
  - 更新现有详情页布局
  - 确保使用CardView (圆角16dp)
  - 价格使用翠绿色
  - 集成DingdangTagView显示标签
  - _Requirements: 2.1, 2.2_

- [ ] 4.2 实现促销标签横向滚动
  - 集成 `mall_include_promo_tags.xml`
  - 使用HorizontalScrollView
  - 动态添加DingdangTagView (PROMO类型)
  - 实现横向滚动
  - _Requirements: 2.8_

- [ ] 4.3 实现用药指导卡片
  - 集成 `mall_include_medication_guide.xml`
  - 显示功能主治和用法用量
  - 使用灰色背景 (#f5f5f5)
  - 圆角12dp
  - _Requirements: 2.9_

- [ ] 4.4 实现限购说明
  - 创建TextView
  - 使用绿色背景 (#d1fae5)
  - 使用绿色文字 (#059669)
  - 圆角8dp
  - _Requirements: 2.10_

- [ ] 4.5 实现店铺信息卡片
  - 集成 `mall_include_shop_info.xml`
  - 显示店铺Logo、名称、包邮信息
  - 实现点击跳转店铺页
  - _Requirements: 2.11_


- [ ] 4.6 实现成功弹窗
  - 创建底部弹出Dialog
  - 显示成功提示
  - 显示推荐商品网格 (GridLayoutManager, 3列)
  - 实现返回/去结算按钮
  - 弹出动画300ms
  - _Requirements: 2.12_

### 验收标准
- [ ] 促销标签可横向滚动
- [ ] 用药指导卡片样式正确
- [ ] 限购说明使用绿色背景
- [ ] 店铺信息完整展示
- [ ] 成功弹窗从底部弹出

---

## 阶段五: 购物车页面实现 (P1优先级, 2-3天)

### 目标
购物车达到75-80%视觉一致性

### 任务清单

- [ ] 5.1 实现店铺信息栏
  - 在购物车商品列表前添加店铺信息栏
  - 集成DingdangCheckBox (店铺全选)
  - 显示商城/自营标签 (使用DingdangTagView)
  - 显示店铺名称
  - 显示包邮提示
  - _Requirements: 3.9_

- [ ] 5.2 实现活动提示栏
  - 创建LinearLayout
  - 使用绿色背景 (#d1fae5)
  - 显示活动文案
  - 实现"查看更多"链接
  - 圆角12dp
  - _Requirements: 3.10_

- [ ] 5.3 替换选中组件
  - 将现有CheckBox替换为DingdangCheckBox
  - 商品选中使用圆形图标
  - 实现选中动画
  - _Requirements: 3.11_

- [ ] 5.4 实现预估到手价
  - 在价格下方显示预估到手价
  - 使用小字号 (10sp)
  - 使用绿色背景标签
  - _Requirements: 3.12_

- [ ] 5.5 实现常买常逛区域
  - 添加分隔线 + 标题
  - 实现推荐商品网格 (GridLayoutManager, 2列)
  - 复用药品卡片样式
  - _Requirements: 3.13_

- [ ] 5.6 实现优惠明细展开
  - 实现明细展开/收起动画
  - 显示优惠详情
  - 使用LayoutTransition
  - _Requirements: 3.14_

### 验收标准
- [ ] 店铺信息栏样式正确
- [ ] 活动提示栏使用绿色背景
- [ ] 选中使用圆形图标+动画
- [ ] 预估到手价正确显示
- [ ] 常买常逛推荐正常展示
- [ ] 优惠明细可展开查看

---

## 阶段六: 交互动画实现 (P2优先级, 2-3天)

### 目标
提升交互体验,动画流畅自然

### 任务清单

- [ ] 6.1 优化选中动画
  - 确保DingdangCheckBox对勾绘制动画流畅
  - 圆形填充动画自然
  - 动画时长200ms
  - _Requirements: 3.11_


- [ ] 6.2 实现按钮点击反馈
  - 按钮点击缩放动画 (scale 0.95)
  - 添加涟漪效果 (ripple)
  - 动画时长150ms
  - _Requirements: 非功能性需求_

- [ ] 6.3 实现页面切换动画
  - Activity切换淡入淡出
  - Fragment切换滑动
  - 动画时长300ms
  - _Requirements: 非功能性需求_

- [ ] 6.4 实现加载动画
  - 下拉刷新动画优化
  - 列表加载更多动画
  - _Requirements: 1.6_

- [ ] 6.5 实现弹窗动画
  - 成功弹窗从底部弹出 (300ms)
  - 弹窗关闭动画
  - 使用ease-in-out曲线
  - _Requirements: 2.12_

### 验收标准
- [ ] 所有动画流畅,无卡顿
- [ ] 动画时长合理 (150-300ms)
- [ ] 动画曲线自然 (ease-in-out)
- [ ] 低端设备有降级方案

---

## 阶段七: 性能优化与测试 (P1优先级, 2-3天)

### 目标
确保性能达标,通过测试验收

### 任务清单

- [ ] 7.1 性能优化
  - 优化DingdangCheckBox绘制性能 (≤16ms)
  - 优化RecyclerView (setHasFixedSize, RecycledViewPool)
  - 实现图片圆角裁剪 (Glide transform)
  - 实现低端设备检测和动画降级
  - _Requirements: 非功能性需求_

- [ ] 7.2 内存优化
  - 检查内存泄漏 (使用LeakCanary)
  - 优化图片加载 (Glide配置)
  - 优化RecyclerView内存占用
  - _Requirements: 非功能性需求_

- [ ] 7.3 兼容性测试
  - 测试Android 4.4+ (API 19+)
  - 测试不同屏幕尺寸 (手机/平板)
  - 测试不同分辨率
  - _Requirements: 非功能性需求_

- [ ] 7.4 视觉对比测试
  - 截图对比 (Android vs dingdang-pharmacy)
  - 颜色系统验证 (主题色、标签色)
  - 圆角系统验证 (卡片、按钮、标签)
  - 布局结构验证 (Header、区域标题、卡片)
  - _Requirements: 8.7_

- [ ] 7.5 功能测试
  - 首页功能测试 (轮播图、分类、列表)
  - 详情页功能测试 (促销标签、用药指导、店铺信息)
  - 购物车功能测试 (选中、活动提示、常买常逛)
  - _Requirements: 1.x, 2.x, 3.x_

### 验收标准
- [ ] 绘制性能 ≤ 16ms
- [ ] 动画帧率 ≥ 55fps
- [ ] 无内存泄漏
- [ ] 兼容Android 4.4+
- [ ] 视觉一致性 ≥ 75%

---

## Checkpoint任务

### Checkpoint 1: 阶段一完成后
- [ ] 确保所有资源文件创建完成
- [ ] 验证颜色、尺寸、样式定义正确
- [ ] 询问用户是否有问题或需要调整

### Checkpoint 2: 阶段二完成后
- [ ] 确保自定义组件功能正常
- [ ] 验证DingdangTagView和DingdangCheckBox样式正确
- [ ] 询问用户是否有问题或需要调整

### Checkpoint 3: 阶段三完成后
- [ ] 确保首页布局正确
- [ ] 验证Header、轮播图、分类、列表显示正常
- [ ] 询问用户是否有问题或需要调整

### Checkpoint 4: 阶段四完成后
- [ ] 确保详情页信息完整
- [ ] 验证促销标签、用药指导、店铺信息显示正常
- [ ] 询问用户是否有问题或需要调整

### Checkpoint 5: 阶段五完成后
- [ ] 确保购物车功能完整
- [ ] 验证店铺信息栏、活动提示、常买常逛显示正常
- [ ] 询问用户是否有问题或需要调整

### Checkpoint 6: 阶段六完成后
- [ ] 确保所有动画流畅
- [ ] 验证交互反馈自然
- [ ] 询问用户是否有问题或需要调整

### Checkpoint 7: 最终验收
- [ ] 确保所有测试通过
- [ ] 验证视觉一致性达标 (≥75%)
- [ ] 询问用户是否满意,是否需要进一步优化

---

## 工作量估算

| 阶段 | 任务数 | 预计工期 | 优先级 | 预期一致性 |
|------|--------|---------|--------|-----------|
| 阶段一 | 6 | 1周 | P0 | 65-70% |
| 阶段二 | 4 | 1周 | P0 | 65-70% |
| 阶段三 | 7 | 3-4天 | P0+P1 | 70-75% |
| 阶段四 | 6 | 3-4天 | P1 | 72-77% |
| 阶段五 | 6 | 2-3天 | P1 | 75-80% |
| 阶段六 | 5 | 2-3天 | P2 | 75-80% |
| 阶段七 | 5 | 2-3天 | P1 | 75-80% |
| **总计** | **39** | **3-4周** | - | **75-80%** |

---

## 快速实施方案 (1周MVP)

如果时间紧迫,可以只实施P0优先级任务:

### 第1-2天: 视觉基础
- [ ] 执行阶段一任务 1.1-1.6
- [ ] 创建所有dingdang资源文件

### 第3-4天: 自定义组件
- [ ] 执行阶段二任务 2.1-2.2
- [ ] 实现DingdangTagView和DingdangCheckBox

### 第5天: 首页Header
- [ ] 执行阶段二任务 2.3
- [ ] 执行阶段三任务 3.1
- [ ] 实现固定Header和首页基础布局

**预期效果**: 整体视觉一致性达到 **65-70%**

---

## 注意事项

### 资源隔离
- 所有新增资源使用 `dingdang_` 前缀
- 避免修改现有应用的资源文件
- 使用独立的颜色、尺寸、样式文件

### 代码组织
- 自定义组件放在 `mall/widget/` 目录
- 公共布局放在 `res/layout/mall_include_*.xml`
- Drawable资源使用 `dingdang_bg_*.xml` 命名

### 性能考虑
- 自定义组件绘制时间 ≤ 16ms
- 动画帧率 ≥ 55fps
- 低端设备提供降级方案

### 测试要求
- 每个阶段完成后进行Checkpoint测试
- 最终进行完整的视觉对比测试
- 确保视觉一致性 ≥ 75%

---

## 参考文档

- [requirements.md](./requirements.md) - 需求文档
- [design.md](./design.md) - 设计文档
- [SPEC_OPTIMIZATION_RECOMMENDATIONS.md](../patient-mall-ui-redesign-01/SPEC_OPTIMIZATION_RECOMMENDATIONS.md) - 优化建议

---

**文档版本历史**:

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|---------|------|
| 2026-01-29 | v1.0 | 初始版本,完整任务清单 | Kiro AI |
