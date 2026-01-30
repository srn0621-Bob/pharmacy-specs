# 需求文档: 患者端药房商城UI - UI资源和样式

## 简介

准备患者端药房商城的 UI 资源和样式,包括颜色资源、尺寸资源、样式资源、可绘制资源和公共布局组件。确保 UI 风格与现有 mshlwyy_patient 应用保持一致。

## 术语表

- **颜色资源**: colors.xml 中定义的颜色值
- **尺寸资源**: dimens.xml 中定义的尺寸值
- **样式资源**: styles.xml 中定义的样式
- **可绘制资源**: drawable 目录中的图形资源
- **公共布局**: 可复用的 include 布局组件

## 需求概述

### 背景

- 需要为药房商城创建统一的 UI 资源
- UI 风格必须与现有 mshlwyy_patient 应用保持一致
- 需要创建可复用的布局组件以提高开发效率

### 目标

1. 定义完整的颜色规范
2. 定义完整的尺寸规范
3. 定义可复用的样式
4. 创建必需的可绘制资源
5. 创建公共布局组件

## 功能需求

### 需求 1: 颜色资源定义

**用户故事:** 作为开发者,我想要定义统一的颜色资源,以便在整个应用中保持视觉一致性

#### 验收标准

1. THE 系统 SHALL 在 `values/colors.xml` 中定义主色调(绿色系)
2. THE 系统 SHALL 定义背景色(白色、灰色背景)
3. THE 系统 SHALL 定义文字颜色(主要文字、次要文字、提示文字)
4. THE 系统 SHALL 定义功能色(成功、警告、错误、信息)
5. THE 系统 SHALL 定义标签颜色(橙色标签、绿色标签)

### 需求 2: 尺寸资源定义

**用户故事:** 作为开发者,我想要定义统一的尺寸资源,以便在布局中使用标准间距和大小

#### 验收标准

1. THE 系统 SHALL 在 `values/dimens.xml` 中定义间距规范(tiny, small, medium, normal, large, xlarge)
2. THE 系统 SHALL 定义圆角规范(small, medium, large, xlarge)
3. THE 系统 SHALL 定义文字大小规范(tiny, small, normal, medium, large, xlarge, title)
4. THE 系统 SHALL 定义图片尺寸规范(small, medium, large)
5. THE 系统 SHALL 定义按钮高度规范(small, normal, large)

### 需求 3: 样式资源定义

**用户故事:** 作为开发者,我想要定义可复用的样式,以便快速应用统一的视觉效果

#### 验收标准

1. THE 系统 SHALL 在 `values/styles.xml` 中定义卡片样式
2. THE 系统 SHALL 定义按钮样式(主要按钮、次要按钮)
3. THE 系统 SHALL 定义标签样式
4. THE 系统 SHALL 定义标题样式
5. THE 系统 SHALL 定义副标题样式

### 需求 4: 可绘制资源创建

**用户故事:** 作为开发者,我想要创建必需的可绘制资源,以便在 UI 中使用

#### 验收标准

1. THE 系统 SHALL 创建卡片背景 `bg_card.xml`
2. THE 系统 SHALL 创建主要按钮背景 `bg_button_primary.xml`
3. THE 系统 SHALL 创建次要按钮背景 `bg_button_secondary.xml`
4. THE 系统 SHALL 创建标签背景 `bg_tag.xml`
5. THE 系统 SHALL 创建占位图和错误图

### 需求 5: 公共布局组件

**用户故事:** 作为开发者,我想要创建可复用的布局组件,以便在多个页面中使用

#### 验收标准

1. THE 系统 SHALL 创建搜索栏布局 `include_search_bar.xml`
2. THE 系统 SHALL 创建章节标题布局 `include_section_title.xml`
3. THE 系统 SHALL 创建空状态布局 `include_empty_state.xml`
4. THE 系统 SHALL 创建加载状态布局 `include_loading_state.xml`

## 非功能性需求

### UI/UX 需求

1. **风格一致**: 与现有 mshlwyy_patient 应用保持一致的 UI 风格
2. **Material Design**: 遵循 Material Design 设计规范
3. **响应式**: 适配不同屏幕尺寸和分辨率

### 兼容性需求

1. **Android 版本**: 支持 Android 5.0 (API 21) 及以上
2. **屏幕适配**: 支持 hdpi、xhdpi、xxhdpi、xxxhdpi

## 约束条件

### 设计约束

1. **颜色规范**: 主色调使用绿色系(#10B981)
2. **间距规范**: 使用 4dp 的倍数
3. **圆角规范**: 使用 4dp 的倍数
4. **文件命名**: 使用小写字母和下划线

## 验收标准清单

### 颜色资源

- [ ] 定义了主色调
- [ ] 定义了背景色
- [ ] 定义了文字颜色
- [ ] 定义了功能色
- [ ] 定义了标签颜色

### 尺寸资源

- [ ] 定义了间距规范
- [ ] 定义了圆角规范
- [ ] 定义了文字大小规范
- [ ] 定义了图片尺寸规范
- [ ] 定义了按钮高度规范

### 样式资源

- [ ] 定义了卡片样式
- [ ] 定义了按钮样式
- [ ] 定义了标签样式
- [ ] 定义了标题样式

### 可绘制资源

- [ ] 创建了所有背景资源
- [ ] 创建了占位图和错误图

### 公共布局

- [ ] 创建了搜索栏布局
- [ ] 创建了章节标题布局
- [ ] 创建了空状态布局
- [ ] 创建了加载状态布局

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
