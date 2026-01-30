# 设计文档: 患者端药房商城UI - UI资源和样式

## 概述

本文档描述患者端药房商城 UI 资源和样式的设计方案,包括颜色规范、尺寸规范、样式定义、可绘制资源和公共布局组件的详细设计。

### 设计目标

1. **统一的视觉风格**: 与现有 mshlwyy_patient 应用保持一致
2. **可复用的资源**: 提高开发效率,减少重复代码
3. **标准化的规范**: 便于团队协作和维护
4. **响应式设计**: 适配不同屏幕尺寸

### 设计原则

- **4dp 基准**: 所有间距和尺寸使用 4dp 的倍数
- **语义化命名**: 使用有意义的名称而非具体数值
- **分层设计**: 从基础资源到组合样式逐层构建
- **Material Design**: 遵循 Material Design 设计规范

## 颜色设计

### 颜色规范

```xml
<!-- res/values/colors.xml -->
<resources>
    <!-- ==================== 主色调 - 绿色系 ==================== -->
    <color name="colorPrimary">#10B981</color>
    <color name="colorPrimaryDark">#059669</color>
    <color name="colorAccent">#34D399</color>
    <color name="colorPrimaryLight">#D1FAE5</color>
    
    <!-- ==================== 背景色 ==================== -->
    <color name="colorBackground">#F3F4F6</color>
    <color name="colorWhite">#FFFFFF</color>
    <color name="colorDivider">#E5E7EB</color>
    
    <!-- ==================== 文字颜色 ==================== -->
    <color name="colorTextPrimary">#1F2937</color>
    <color name="colorTextSecondary">#6B7280</color>
    <color name="colorTextHint">#9CA3AF</color>
    <color name="colorTextDisabled">#D1D5DB</color>
    
    <!-- ==================== 功能色 ==================== -->
    <color name="colorSuccess">#10B981</color>
    <color name="colorWarning">#F59E0B</color>
    <color name="colorError">#EF4444</color>
    <color name="colorInfo">#3B82F6</color>
    
    <!-- ==================== 标签颜色 ==================== -->
    <color name="colorTagOrange">#FED7AA</color>
    <color name="colorTagOrangeText">#EA580C</color>
    <color name="colorTagGreen">#D1FAE5</color>
    <color name="colorTagGreenText">#059669</color>
    <color name="colorTagBlue">#DBEAFE</color>
    <color name="colorTagBlueText">#1D4ED8</color>
    
    <!-- ==================== 价格颜色 ==================== -->
    <color name="colorPrice">#EF4444</color>
    <color name="colorOriginalPrice">#9CA3AF</color>
</resources>
```

### 颜色使用场景

| 颜色名称 | 使用场景 |
|---------|---------|
| colorPrimary | 主要按钮、重要操作、品牌标识 |
| colorPrimaryDark | 状态栏、深色主题 |
| colorAccent | 强调元素、选中状态 |
| colorBackground | 页面背景 |
| colorTextPrimary | 标题、重要文字 |
| colorTextSecondary | 正文、次要信息 |
| colorTextHint | 提示文字、占位符 |
| colorPrice | 价格显示 |

## 尺寸设计

### 尺寸规范

```xml
<!-- res/values/dimens.xml -->
<resources>
    <!-- ==================== 间距 ==================== -->
    <dimen name="spacing_tiny">4dp</dimen>
    <dimen name="spacing_small">8dp</dimen>
    <dimen name="spacing_medium">12dp</dimen>
    <dimen name="spacing_normal">16dp</dimen>
    <dimen name="spacing_large">20dp</dimen>
    <dimen name="spacing_xlarge">24dp</dimen>
    <dimen name="spacing_xxlarge">32dp</dimen>
    
    <!-- ==================== 圆角 ==================== -->
    <dimen name="corner_radius_small">4dp</dimen>
    <dimen name="corner_radius_medium">8dp</dimen>
    <dimen name="corner_radius_large">12dp</dimen>
    <dimen name="corner_radius_xlarge">16dp</dimen>
    <dimen name="corner_radius_round">999dp</dimen>
    
    <!-- ==================== 文字大小 ==================== -->
    <dimen name="text_size_tiny">10sp</dimen>
    <dimen name="text_size_small">12sp</dimen>
    <dimen name="text_size_normal">14sp</dimen>
    <dimen name="text_size_medium">16sp</dimen>
    <dimen name="text_size_large">18sp</dimen>
    <dimen name="text_size_xlarge">20sp</dimen>
    <dimen name="text_size_title">24sp</dimen>
    <dimen name="text_size_display">28sp</dimen>
    
    <!-- ==================== 图片尺寸 ==================== -->
    <dimen name="image_size_tiny">32dp</dimen>
    <dimen name="image_size_small">48dp</dimen>
    <dimen name="image_size_medium">80dp</dimen>
    <dimen name="image_size_large">120dp</dimen>
    <dimen name="image_size_xlarge">160dp</dimen>
    
    <!-- ==================== 按钮高度 ==================== -->
    <dimen name="button_height_small">32dp</dimen>
    <dimen name="button_height_normal">44dp</dimen>
    <dimen name="button_height_large">48dp</dimen>
    
    <!-- ==================== 卡片 ==================== -->
    <dimen name="card_elevation">2dp</dimen>
    <dimen name="card_padding">16dp</dimen>
    
    <!-- ==================== 分割线 ==================== -->
    <dimen name="divider_height">1dp</dimen>
</resources>
```

## 样式设计

### 样式定义

```xml
<!-- res/values/styles.xml -->
<resources>
    
    <!-- ==================== 卡片样式 ==================== -->
    <style name="CardStyle">
        <item name="android:background">@drawable/bg_card</item>
        <item name="android:elevation">@dimen/card_elevation</item>
        <item name="android:padding">@dimen/card_padding</item>
    </style>
    
    <!-- ==================== 按钮样式 ==================== -->
    <style name="ButtonPrimary">
        <item name="android:background">@drawable/bg_button_primary</item>
        <item name="android:textColor">@color/colorWhite</item>
        <item name="android:textSize">@dimen/text_size_medium</item>
        <item name="android:textStyle">bold</item>
        <item name="android:minHeight">@dimen/button_height_normal</item>
        <item name="android:gravity">center</item>
        <item name="android:paddingStart">@dimen/spacing_large</item>
        <item name="android:paddingEnd">@dimen/spacing_large</item>
    </style>
    
    <style name="ButtonSecondary">
        <item name="android:background">@drawable/bg_button_secondary</item>
        <item name="android:textColor">@color/colorPrimary</item>
        <item name="android:textSize">@dimen/text_size_medium</item>
        <item name="android:textStyle">bold</item>
        <item name="android:minHeight">@dimen/button_height_normal</item>
        <item name="android:gravity">center</item>
        <item name="android:paddingStart">@dimen/spacing_large</item>
        <item name="android:paddingEnd">@dimen/spacing_large</item>
    </style>
    
    <!-- ==================== 标签样式 ==================== -->
    <style name="TagStyle">
        <item name="android:background">@drawable/bg_tag</item>
        <item name="android:textSize">@dimen/text_size_tiny</item>
        <item name="android:paddingStart">@dimen/spacing_small</item>
        <item name="android:paddingEnd">@dimen/spacing_small</item>
        <item name="android:paddingTop">@dimen/spacing_tiny</item>
        <item name="android:paddingBottom">@dimen/spacing_tiny</item>
    </style>
    
    <!-- ==================== 文字样式 ==================== -->
    <style name="TitleStyle">
        <item name="android:textColor">@color/colorTextPrimary</item>
        <item name="android:textSize">@dimen/text_size_large</item>
        <item name="android:textStyle">bold</item>
    </style>
    
    <style name="SubtitleStyle">
        <item name="android:textColor">@color/colorTextSecondary</item>
        <item name="android:textSize">@dimen/text_size_normal</item>
    </style>
    
    <style name="PriceStyle">
        <item name="android:textColor">@color/colorPrice</item>
        <item name="android:textSize">@dimen/text_size_large</item>
        <item name="android:textStyle">bold</item>
    </style>
    
    <style name="OriginalPriceStyle">
        <item name="android:textColor">@color/colorOriginalPrice</item>
        <item name="android:textSize">@dimen/text_size_small</item>
    </style>
    
</resources>
```

## 可绘制资源设计

### 1. 卡片背景

```xml
<!-- res/drawable/bg_card.xml -->
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/colorWhite"/>
    <corners android:radius="@dimen/corner_radius_large"/>
</shape>
```

### 2. 主要按钮背景

```xml
<!-- res/drawable/bg_button_primary.xml -->
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/colorPrimary"/>
    <corners android:radius="@dimen/corner_radius_xlarge"/>
</shape>
```

### 3. 次要按钮背景

```xml
<!-- res/drawable/bg_button_secondary.xml -->
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <stroke 
        android:width="2dp"
        android:color="@color/colorPrimary"/>
    <solid android:color="@color/colorWhite"/>
    <corners android:radius="@dimen/corner_radius_xlarge"/>
</shape>
```

### 4. 标签背景

```xml
<!-- res/drawable/bg_tag.xml -->
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/colorTagOrange"/>
    <corners android:radius="@dimen/corner_radius_small"/>
</shape>
```

### 5. 搜索框背景

```xml
<!-- res/drawable/bg_search_bar.xml -->
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/colorBackground"/>
    <corners android:radius="@dimen/corner_radius_xlarge"/>
</shape>
```

## 公共布局设计

### 1. 搜索栏布局

```xml
<!-- res/layout/include_search_bar.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:background="@drawable/bg_search_bar"
    android:padding="@dimen/spacing_medium"
    android:gravity="center_vertical">
    
    <ImageView
        android:id="@+id/iv_search_icon"
        android:layout_width="@dimen/image_size_tiny"
        android:layout_height="@dimen/image_size_tiny"
        android:src="@drawable/ic_search"
        android:tint="@color/colorTextHint"/>
    
    <EditText
        android:id="@+id/et_search"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:layout_marginStart="@dimen/spacing_small"
        android:background="@null"
        android:hint="搜索药品名称"
        android:textSize="@dimen/text_size_normal"
        android:textColorHint="@color/colorTextHint"/>
    
</LinearLayout>
```


### 2. 章节标题布局

```xml
<!-- res/layout/include_section_title.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:padding="@dimen/spacing_normal"
    android:gravity="center_vertical">
    
    <TextView
        android:id="@+id/tv_section_title"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        style="@style/TitleStyle"
        android:text="章节标题"/>
    
    <TextView
        android:id="@+id/tv_section_more"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="更多"
        android:textSize="@dimen/text_size_small"
        android:textColor="@color/colorTextSecondary"
        android:drawableEnd="@drawable/ic_arrow_right"
        android:drawablePadding="@dimen/spacing_tiny"/>
    
</LinearLayout>
```

### 3. 空状态布局

```xml
<!-- res/layout/include_empty_state.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="@dimen/spacing_xlarge">
    
    <ImageView
        android:id="@+id/iv_empty_icon"
        android:layout_width="@dimen/image_size_xlarge"
        android:layout_height="@dimen/image_size_xlarge"
        android:src="@drawable/ic_empty_cart"
        android:tint="@color/colorTextHint"/>
    
    <TextView
        android:id="@+id/tv_empty_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="@dimen/spacing_normal"
        android:text="暂无数据"
        android:textSize="@dimen/text_size_medium"
        android:textColor="@color/colorTextSecondary"/>
    
    <TextView
        android:id="@+id/tv_empty_desc"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="@dimen/spacing_small"
        android:text="快去添加一些商品吧"
        android:textSize="@dimen/text_size_small"
        android:textColor="@color/colorTextHint"/>
    
    <Button
        android:id="@+id/btn_empty_action"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="@dimen/spacing_large"
        style="@style/ButtonPrimary"
        android:text="去逛逛"/>
    
</LinearLayout>
```

### 4. 加载状态布局

```xml
<!-- res/layout/include_loading_state.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="@dimen/spacing_xlarge">
    
    <ProgressBar
        android:id="@+id/progress_bar"
        android:layout_width="@dimen/image_size_medium"
        android:layout_height="@dimen/image_size_medium"
        android:indeterminateTint="@color/colorPrimary"/>
    
    <TextView
        android:id="@+id/tv_loading_text"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="@dimen/spacing_normal"
        android:text="加载中..."
        android:textSize="@dimen/text_size_normal"
        android:textColor="@color/colorTextSecondary"/>
    
</LinearLayout>
```

## 占位图和错误图

### 占位图资源列表

| 资源名称 | 用途 | 尺寸建议 |
|---------|------|---------|
| ic_drug_placeholder.png | 药品图片占位 | 120x120dp |
| ic_drug_error.png | 药品图片加载失败 | 120x120dp |
| ic_avatar_placeholder.png | 头像占位 | 48x48dp |
| ic_avatar_error.png | 头像加载失败 | 48x48dp |
| ic_empty_cart.png | 购物车空状态 | 160x160dp |
| ic_empty_search.png | 搜索无结果 | 160x160dp |

### 图标资源列表

| 资源名称 | 用途 |
|---------|------|
| ic_search.xml | 搜索图标 |
| ic_cart.xml | 购物车图标 |
| ic_home.xml | 首页图标 |
| ic_category.xml | 分类图标 |
| ic_mine.xml | 我的图标 |
| ic_arrow_right.xml | 右箭头 |
| ic_close.xml | 关闭图标 |
| ic_add.xml | 添加图标 |
| ic_remove.xml | 减少图标 |
| ic_delete.xml | 删除图标 |

## 正确性属性

*属性是一个特征或行为,应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。*

### Property 1: 颜色资源完整性

*对于任意*需要使用颜色的场景,都应该能在 colors.xml 中找到对应的颜色资源

**验证: 需求 1.1-1.5**

### Property 2: 尺寸规范一致性

*对于任意*尺寸值,都应该是 4dp 的倍数

**验证: 需求 2.1-2.5**

### Property 3: 样式可复用性

*对于任意*样式定义,都应该能在多个布局中复用

**验证: 需求 3.1-3.5**

### Property 4: 布局组件独立性

*对于任意*公共布局组件,都应该能独立使用而不依赖特定页面

**验证: 需求 5.1-5.4**

## 设计规范检查清单

### 颜色规范

- [ ] 所有颜色使用语义化命名
- [ ] 主色调与现有应用一致
- [ ] 提供了完整的颜色系列(主色、背景、文字、功能色)
- [ ] 颜色对比度符合无障碍要求

### 尺寸规范

- [ ] 所有尺寸使用 4dp 的倍数
- [ ] 提供了完整的尺寸系列(tiny, small, normal, large, xlarge)
- [ ] 文字大小使用 sp 单位
- [ ] 其他尺寸使用 dp 单位

### 样式规范

- [ ] 样式命名清晰,易于理解
- [ ] 样式可复用,避免重复定义
- [ ] 样式继承关系清晰
- [ ] 提供了常用组件的样式

### 可绘制资源

- [ ] 使用 vector drawable 而非 png(图标)
- [ ] 提供了必需的占位图和错误图
- [ ] 背景使用 shape drawable 而非图片
- [ ] 资源命名规范统一

### 公共布局

- [ ] 布局组件独立,可复用
- [ ] 使用 include 标签引入
- [ ] 提供了必要的 id 供外部访问
- [ ] 布局结构清晰,层级合理

## 测试策略

### 视觉测试

```java
/**
 * 颜色资源测试
 */
@Test
public void testColorResources() {
    Context context = InstrumentationRegistry.getTargetContext();
    Resources resources = context.getResources();
    
    // 验证主色调
    int colorPrimary = resources.getColor(R.color.colorPrimary);
    assertEquals(0xFF10B981, colorPrimary);
    
    // 验证其他关键颜色
    // ...
}
```

### 尺寸测试

```java
/**
 * 尺寸资源测试
 */
@Test
public void testDimensionResources() {
    Context context = InstrumentationRegistry.getTargetContext();
    Resources resources = context.getResources();
    
    // 验证间距是 4dp 的倍数
    float spacingTiny = resources.getDimension(R.dimen.spacing_tiny);
    assertTrue(spacingTiny % 4 == 0);
    
    // 验证其他尺寸
    // ...
}
```

### 布局测试

```java
/**
 * 公共布局测试
 */
@Test
public void testCommonLayouts() {
    // 测试搜索栏布局
    View searchBar = LayoutInflater.from(context)
        .inflate(R.layout.include_search_bar, null);
    assertNotNull(searchBar.findViewById(R.id.et_search));
    
    // 测试其他布局
    // ...
}
```

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
