# 实施计划: 患者端药房商城UI - UI资源和样式

## 概述

准备患者端药房商城的 UI 资源和样式,包括颜色资源、尺寸资源、样式资源、可绘制资源和公共布局组件。

**预计工作量:** 3-4 小时

## 任务列表

- [ ] 1. 创建颜色资源
  - 在 `res/values/` 目录下创建或编辑 `colors.xml`
  - 定义主色调(colorPrimary, colorPrimaryDark, colorAccent, colorPrimaryLight)
  - 定义背景色(colorBackground, colorWhite, colorDivider)
  - 定义文字颜色(colorTextPrimary, colorTextSecondary, colorTextHint, colorTextDisabled)
  - 定义功能色(colorSuccess, colorWarning, colorError, colorInfo)
  - 定义标签颜色(colorTagOrange, colorTagOrangeText, colorTagGreen, colorTagGreenText, colorTagBlue, colorTagBlueText)
  - 定义价格颜色(colorPrice, colorOriginalPrice)
  - 添加完整的中文注释,使用 ASCII 分块注释
  - _需求: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. 创建尺寸资源
  - 在 `res/values/` 目录下创建或编辑 `dimens.xml`
  - 定义间距规范(spacing_tiny, spacing_small, spacing_medium, spacing_normal, spacing_large, spacing_xlarge, spacing_xxlarge)
  - 定义圆角规范(corner_radius_small, corner_radius_medium, corner_radius_large, corner_radius_xlarge, corner_radius_round)
  - 定义文字大小规范(text_size_tiny, text_size_small, text_size_normal, text_size_medium, text_size_large, text_size_xlarge, text_size_title, text_size_display)
  - 定义图片尺寸规范(image_size_tiny, image_size_small, image_size_medium, image_size_large, image_size_xlarge)
  - 定义按钮高度规范(button_height_small, button_height_normal, button_height_large)
  - 定义卡片相关尺寸(card_elevation, card_padding)
  - 定义分割线高度(divider_height)
  - 添加完整的中文注释,使用 ASCII 分块注释
  - _需求: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. 创建样式资源
  - 在 `res/values/` 目录下创建或编辑 `styles.xml`
  - 定义卡片样式(CardStyle)
  - 定义按钮样式(ButtonPrimary, ButtonSecondary)
  - 定义标签样式(TagStyle)
  - 定义文字样式(TitleStyle, SubtitleStyle, PriceStyle, OriginalPriceStyle)
  - 添加完整的中文注释,使用 ASCII 分块注释
  - _需求: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. 创建可绘制资源
  - [ ] 4.1 创建背景资源
    - 在 `res/drawable/` 目录下创建 `bg_card.xml` (卡片背景)
    - 创建 `bg_button_primary.xml` (主要按钮背景)
    - 创建 `bg_button_secondary.xml` (次要按钮背景)
    - 创建 `bg_tag.xml` (标签背景)
    - 创建 `bg_search_bar.xml` (搜索框背景)
    - 使用 shape drawable,设置合适的颜色和圆角
    - _需求: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 4.2 准备占位图和错误图
    - 准备 `ic_drug_placeholder.png` (药品图片占位,120x120dp)
    - 准备 `ic_drug_error.png` (药品图片加载失败,120x120dp)
    - 准备 `ic_avatar_placeholder.png` (头像占位,48x48dp)
    - 准备 `ic_avatar_error.png` (头像加载失败,48x48dp)
    - 准备 `ic_empty_cart.png` (购物车空状态,160x160dp)
    - 准备 `ic_empty_search.png` (搜索无结果,160x160dp)
    - 放置到对应的 drawable 目录(hdpi, xhdpi, xxhdpi, xxxhdpi)
    - _需求: 4.5_
  
  - [ ] 4.3 创建图标资源
    - 创建 `ic_search.xml` (搜索图标,使用 vector drawable)
    - 创建 `ic_cart.xml` (购物车图标)
    - 创建 `ic_home.xml` (首页图标)
    - 创建 `ic_category.xml` (分类图标)
    - 创建 `ic_mine.xml` (我的图标)
    - 创建 `ic_arrow_right.xml` (右箭头)
    - 创建 `ic_close.xml` (关闭图标)
    - 创建 `ic_add.xml` (添加图标)
    - 创建 `ic_remove.xml` (减少图标)
    - 创建 `ic_delete.xml` (删除图标)
    - 优先使用 vector drawable 而非 png
    - _需求: 4.5_

- [ ] 5. 创建公共布局组件
  - [ ] 5.1 创建搜索栏布局
    - 在 `res/layout/` 目录下创建 `include_search_bar.xml`
    - 包含搜索图标和输入框
    - 使用定义好的颜色、尺寸和样式
    - 添加必要的 id 供外部访问
    - _需求: 5.1_
  
  - [ ] 5.2 创建章节标题布局
    - 创建 `include_section_title.xml`
    - 包含标题文字和"更多"按钮
    - 使用定义好的样式
    - _需求: 5.2_
  
  - [ ] 5.3 创建空状态布局
    - 创建 `include_empty_state.xml`
    - 包含空状态图标、标题、描述和操作按钮
    - 使用定义好的颜色、尺寸和样式
    - _需求: 5.3_
  
  - [ ] 5.4 创建加载状态布局
    - 创建 `include_loading_state.xml`
    - 包含进度条和加载文字
    - 使用定义好的颜色和尺寸
    - _需求: 5.4_

- [ ]* 6. 编写资源测试
  - 编写颜色资源测试,验证关键颜色值
  - 编写尺寸资源测试,验证尺寸是 4dp 的倍数
  - 编写布局测试,验证公共布局可以正常加载
  - _需求: 测试策略, Property 1, Property 2, Property 4_

- [ ] 7. 验证和检查
  - 在 Android Studio 中预览所有布局
  - 检查颜色在不同主题下的显示效果
  - 验证尺寸在不同屏幕密度下的适配
  - 确保所有资源文件命名规范
  - 确保注释完整且使用中文
  - 询问用户是否有问题或需要调整

## 注意事项

### 开发规范
1. 所有资源文件使用小写字母和下划线命名
2. 颜色、尺寸、样式使用语义化命名
3. 添加完整的中文注释,使用 ASCII 分块注释
4. 优先使用 vector drawable 而非 png

### 技术要点
1. 所有尺寸使用 4dp 的倍数
2. 文字大小使用 sp 单位
3. 其他尺寸使用 dp 单位
4. 颜色使用十六进制格式(#RRGGBB 或 #AARRGGBB)
5. 样式可以继承,避免重复定义

### 设计要点
1. 主色调使用绿色系(#10B981),与现有应用保持一致
2. 间距使用 4dp 基准,保持视觉节奏
3. 圆角使用渐进式设计(4dp, 8dp, 12dp, 16dp)
4. 文字大小遵循 Material Design 规范
5. 功能色使用标准色(成功-绿色,警告-橙色,错误-红色,信息-蓝色)

### 依赖关系
- 本 spec 依赖 Spec 1 (基础架构)
- 后续所有 UI 相关的 spec 都将依赖本 spec 的资源定义

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
