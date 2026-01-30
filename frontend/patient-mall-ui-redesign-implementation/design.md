# 设计文档: 患者端商城UI重构实施

> **文档版本**: v1.0  
> **创建时间**: 2026-01-29  
> **设计细节级别**: 高度详细 (包含完整代码示例和XML资源定义)

## 目录

- [一、概述](#一概述)
- [二、架构设计](#二架构设计)
- [三、视觉基础系统](#三视觉基础系统)
- [四、自定义组件设计](#四自定义组件设计)
- [五、页面布局设计](#五页面布局设计)
- [六、技术选型](#六技术选型)
- [七、性能优化](#七性能优化)
- [八、风险评估](#八风险评估)

---

## 一、概述

### 1.1 设计目标

本设计方案旨在通过系统化的UI重构,将Android患者端商城与dingdang-pharmacy的视觉一致性从当前的60-65%提升到75-80%。

### 1.2 核心设计原则

1. **视觉一致性优先**: 所有设计决策以dingdang-pharmacy为参考标准
2. **组件化设计**: 创建可复用的自定义组件
3. **资源隔离**: 使用独立的dingdang资源文件,避免与现有应用冲突
4. **性能优先**: 自定义组件绘制时间≤16ms,动画帧率≥55fps
5. **渐进式实施**: 支持分阶段实施,P0任务优先

### 1.3 设计范围

**包含**:
- 颜色系统重构 (colors_dingdang.xml)
- 圆角系统优化 (dimens_dingdang.xml)
- 样式系统定义 (styles_dingdang.xml)
- 自定义组件实现 (DingdangTagView、DingdangCheckBox、MallHeaderView)
- 页面布局优化 (首页、详情页、购物车)
- Drawable资源设计

**不包含**:
- 后端API修改
- 数据模型变更
- 业务逻辑调整

---

## 二、架构设计

### 2.1 模块结构

```
mshlwyy_patient/app/src/main/
├── java/com/adinnet/demo/
│   └── mall/
│       ├── widget/                    # 新增: 自定义组件
│       │   ├── DingdangTagView.java
│       │   ├── DingdangCheckBox.java
│       │   └── MallHeaderView.java
│       ├── activity/
│       ├── fragment/
│       ├── adapter/
│       └── ...
└── res/
    ├── values/
    │   ├── colors_dingdang.xml        # 新增: 叮当颜色系统
    │   ├── dimens_dingdang.xml        # 新增: 叮当尺寸系统
    │   └── styles_dingdang.xml        # 新增: 叮当样式系统
    ├── drawable/
    │   ├── dingdang_bg_tag_*.xml      # 新增: 标签背景
    │   ├── dingdang_bg_button_*.xml   # 新增: 按钮背景
    │   └── dingdang_bg_search_pill.xml # 新增: 搜索框背景
    └── layout/
        ├── mall_include_fixed_header.xml      # 新增: 固定Header
        ├── mall_include_section_title.xml     # 新增: 区域标题
        ├── mall_include_promo_tags.xml        # 新增: 促销标签
        ├── mall_include_medication_guide.xml  # 新增: 用药指导
        └── mall_include_shop_info.xml         # 新增: 店铺信息
```

### 2.2 设计模式

#### 2.2.1 资源隔离模式

**问题**: 避免与现有应用的UI资源冲突

**解决方案**: 所有dingdang相关资源使用`dingdang_`前缀

```xml
<!-- 现有资源 (保留) -->
<color name="colorPrimary">#ee8934</color>

<!-- 新增dingdang资源 (隔离) -->
<color name="dingdang_primary">#10b981</color>
```

#### 2.2.2 组件复用模式

**问题**: 标签、选中框等组件在多个页面重复使用

**解决方案**: 创建自定义View组件,封装样式和行为

```java
// 使用示例
DingdangTagView tagView = new DingdangTagView(context);
tagView.setTagType(TagType.EXPRESS);
tagView.setText("快递送");
```



---

## 三、视觉基础系统

### 3.1 颜色系统设计

#### 3.1.1 colors_dingdang.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- ==================== 主题色 - 翠绿色系 (必须使用) ==================== -->
    <color name="dingdang_primary">#10b981</color>
    <color name="dingdang_primary_dark">#059669</color>
    <color name="dingdang_primary_light">#34d399</color>
    <color name="dingdang_primary_lighter">#6ee7b7</color>
    
    <!-- ==================== 辅助色 ==================== -->
    <color name="dingdang_secondary">#ea580c</color>
    <color name="dingdang_secondary_light">#fb923c</color>
    
    <!-- ==================== 背景色 ==================== -->
    <color name="dingdang_background">#f5f5f5</color>
    <color name="dingdang_card_background">#ffffff</color>
    <color name="dingdang_divider">#e5e7eb</color>
    
    <!-- ==================== 文字颜色 ==================== -->
    <color name="dingdang_text_primary">#1f2937</color>
    <color name="dingdang_text_secondary">#6b7280</color>
    <color name="dingdang_text_hint">#9ca3af</color>
    <color name="dingdang_text_white">#ffffff</color>
    
    <!-- ==================== 标签颜色 ==================== -->
    <!-- 快递送标签 -->
    <color name="dingdang_tag_express_bg">#fed7aa</color>
    <color name="dingdang_tag_express_text">#ea580c</color>
    
    <!-- 自营标签 -->
    <color name="dingdang_tag_self_border">#10b981</color>
    <color name="dingdang_tag_self_text">#10b981</color>
    <color name="dingdang_tag_self_bg">#ffffff</color>
    
    <!-- 促销标签 -->
    <color name="dingdang_tag_promo_bg">#d1fae5</color>
    <color name="dingdang_tag_promo_text">#059669</color>
    
    <!-- 赠品标签 -->
    <color name="dingdang_tag_gift_border">#ea580c</color>
    <color name="dingdang_tag_gift_text">#ea580c</color>
    
    <!-- ==================== 状态颜色 ==================== -->
    <color name="dingdang_success">#10b981</color>
    <color name="dingdang_warning">#f59e0b</color>
    <color name="dingdang_error">#ef4444</color>
    <color name="dingdang_info">#3b82f6</color>
</resources>
```

#### 3.1.2 颜色使用规范

| 场景 | 颜色 | 色值 | 说明 |
|------|------|------|------|
| 主题色 | dingdang_primary | #10b981 | 按钮、价格、选中状态 |
| Header背景 | dingdang_primary | #10b981 | 固定Header背景色 |
| 价格文字 | dingdang_primary | #10b981 | 所有价格显示 |
| 按钮背景 | dingdang_primary | #10b981 | 主要按钮背景 |
| 快递送标签 | dingdang_tag_express_bg | #fed7aa | 橙色背景 |
| 自营标签 | dingdang_tag_self_border | #10b981 | 白底绿边 |
| 促销标签 | dingdang_tag_promo_bg | #d1fae5 | 绿色背景 |


### 3.2 尺寸系统设计

#### 3.2.1 dimens_dingdang.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- ==================== 圆角 (必须遵循) ==================== -->
    <dimen name="dingdang_corner_tiny">3dp</dimen>
    <dimen name="dingdang_corner_small">6dp</dimen>
    <dimen name="dingdang_corner_medium">8dp</dimen>
    <dimen name="dingdang_corner_large">12dp</dimen>
    <dimen name="dingdang_corner_xlarge">16dp</dimen>
    <dimen name="dingdang_corner_xxlarge">24dp</dimen>
    <dimen name="dingdang_corner_pill">9999dp</dimen>
    
    <!-- ==================== 间距 ==================== -->
    <dimen name="dingdang_spacing_tiny">4dp</dimen>
    <dimen name="dingdang_spacing_small">8dp</dimen>
    <dimen name="dingdang_spacing_medium">12dp</dimen>
    <dimen name="dingdang_spacing_large">16dp</dimen>
    <dimen name="dingdang_spacing_xlarge">24dp</dimen>
    <dimen name="dingdang_spacing_xxlarge">32dp</dimen>
    
    <!-- ==================== 字体大小 ==================== -->
    <dimen name="dingdang_text_micro">8sp</dimen>
    <dimen name="dingdang_text_tiny">10sp</dimen>
    <dimen name="dingdang_text_small">12sp</dimen>
    <dimen name="dingdang_text_body">13sp</dimen>
    <dimen name="dingdang_text_title">14sp</dimen>
    <dimen name="dingdang_text_large">16sp</dimen>
    <dimen name="dingdang_text_xlarge">18sp</dimen>
    
    <!-- ==================== 组件尺寸 ==================== -->
    <dimen name="dingdang_header_height">200dp</dimen>
    <dimen name="dingdang_banner_height">180dp</dimen>
    <dimen name="dingdang_card_elevation">2dp</dimen>
    <dimen name="dingdang_button_height">44dp</dimen>
    <dimen name="dingdang_checkbox_size">20dp</dimen>
</resources>
```

#### 3.2.2 圆角使用规范

| 组件 | 圆角值 | 使用场景 |
|------|--------|---------|
| tiny (3dp) | 标签 | DingdangTagView |
| small (6dp) | 小卡片 | 促销标签 |
| medium (8dp) | 输入框 | 限购说明 |
| large (12dp) | 中等卡片 | 用药指导卡片 |
| xlarge (16dp) | 大卡片 | 药品卡片、轮播图 |
| xxlarge (24dp) | 超大卡片 | 特殊大卡片 |
| pill (9999dp) | 按钮、搜索框 | 所有按钮、搜索框 |


### 3.3 样式系统设计

#### 3.3.1 styles_dingdang.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- ==================== 按钮样式 ==================== -->
    <style name="DingdangButton.Primary">
        <item name="android:background">@drawable/dingdang_bg_button_primary</item>
        <item name="android:textColor">@color/dingdang_text_white</item>
        <item name="android:textSize">@dimen/dingdang_text_title</item>
        <item name="android:gravity">center</item>
        <item name="android:paddingStart">24dp</item>
        <item name="android:paddingEnd">24dp</item>
        <item name="android:minHeight">@dimen/dingdang_button_height</item>
    </style>
    
    <style name="DingdangButton.Secondary">
        <item name="android:background">@drawable/dingdang_bg_button_secondary</item>
        <item name="android:textColor">@color/dingdang_primary</item>
        <item name="android:textSize">@dimen/dingdang_text_title</item>
        <item name="android:gravity">center</item>
        <item name="android:paddingStart">24dp</item>
        <item name="android:paddingEnd">24dp</item>
        <item name="android:minHeight">@dimen/dingdang_button_height</item>
    </style>
    
    <!-- ==================== 文字样式 ==================== -->
    <style name="DingdangText.Title">
        <item name="android:textColor">@color/dingdang_text_primary</item>
        <item name="android:textSize">@dimen/dingdang_text_title</item>
        <item name="android:textStyle">bold</item>
    </style>
    
    <style name="DingdangText.Body">
        <item name="android:textColor">@color/dingdang_text_primary</item>
        <item name="android:textSize">@dimen/dingdang_text_body</item>
    </style>
    
    <style name="DingdangText.Secondary">
        <item name="android:textColor">@color/dingdang_text_secondary</item>
        <item name="android:textSize">@dimen/dingdang_text_small</item>
    </style>
    
    <style name="DingdangText.Price">
        <item name="android:textColor">@color/dingdang_primary</item>
        <item name="android:textSize">@dimen/dingdang_text_large</item>
        <item name="android:textStyle">bold</item>
    </style>
    
    <!-- ==================== 卡片样式 ==================== -->
    <style name="DingdangCard">
        <item name="cardCornerRadius">@dimen/dingdang_corner_xlarge</item>
        <item name="cardElevation">@dimen/dingdang_card_elevation</item>
        <item name="cardBackgroundColor">@color/dingdang_card_background</item>
    </style>
</resources>
```


### 3.4 Drawable资源设计

#### 3.4.1 标签背景

**dingdang_bg_tag_express.xml** (快递送标签)
```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/dingdang_tag_express_bg"/>
    <corners android:radius="@dimen/dingdang_corner_tiny"/>
</shape>
```

**dingdang_bg_tag_self.xml** (自营标签)
```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/dingdang_tag_self_bg"/>
    <stroke 
        android:width="1dp" 
        android:color="@color/dingdang_tag_self_border"/>
    <corners android:radius="@dimen/dingdang_corner_tiny"/>
</shape>
```

**dingdang_bg_tag_promo.xml** (促销标签)
```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/dingdang_tag_promo_bg"/>
    <corners android:radius="@dimen/dingdang_corner_small"/>
</shape>
```

#### 3.4.2 按钮背景

**dingdang_bg_button_primary.xml** (主要按钮)
```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <gradient
        android:startColor="@color/dingdang_primary_light"
        android:endColor="@color/dingdang_primary"
        android:angle="90"/>
    <corners android:radius="@dimen/dingdang_corner_pill"/>
</shape>
```

**dingdang_bg_button_secondary.xml** (次要按钮)
```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/dingdang_card_background"/>
    <stroke 
        android:width="1dp" 
        android:color="@color/dingdang_primary"/>
    <corners android:radius="@dimen/dingdang_corner_pill"/>
</shape>
```

#### 3.4.3 搜索框背景

**dingdang_bg_search_pill.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/dingdang_card_background"/>
    <corners android:radius="@dimen/dingdang_corner_pill"/>
</shape>
```


---

## 四、自定义组件设计

### 4.1 标签组件 (DingdangTagView)

#### 4.1.1 组件功能

支持多种标签类型的自定义TextView组件:
- 快递送标签 (橙色背景)
- 自营标签 (白底绿边)
- 促销标签 (绿色背景)
- 赠品标签 (橙色边框)

#### 4.1.2 核心实现

```java
package com.adinnet.demo.mall.widget;

import android.content.Context;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.support.v7.widget.AppCompatTextView;
import com.adinnet.demo.R;

/**
 * 叮当商城标签组件
 * 支持多种标签类型: 快递送、自营、促销、赠品
 */
public class DingdangTagView extends AppCompatTextView {
    
    public enum TagType {
        EXPRESS,      // 快递送 - 橙色背景
        SELF_OPERATED, // 自营 - 白底绿边
        PROMO,        // 促销 - 绿色背景
        GIFT          // 赠 - 橙色边框
    }
    
    public DingdangTagView(Context context) {
        super(context);
        init();
    }
    
    public DingdangTagView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    private void init() {
        // 默认样式
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 8);
        int padding = dp(4);
        setPadding(padding, dp(2), padding, dp(2));
    }
    
    /**
     * 设置标签类型
     */
    public void setTagType(TagType type) {
        switch (type) {
            case EXPRESS:
                setBackgroundResource(R.drawable.dingdang_bg_tag_express);
                setTextColor(getResources().getColor(R.color.dingdang_tag_express_text));
                setText("快递送");
                break;
            case SELF_OPERATED:
                setBackgroundResource(R.drawable.dingdang_bg_tag_self);
                setTextColor(getResources().getColor(R.color.dingdang_tag_self_text));
                setText("自营");
                break;
            case PROMO:
                setBackgroundResource(R.drawable.dingdang_bg_tag_promo);
                setTextColor(getResources().getColor(R.color.dingdang_tag_promo_text));
                break;
            case GIFT:
                setBackgroundResource(R.drawable.dingdang_bg_tag_gift);
                setTextColor(getResources().getColor(R.color.dingdang_tag_gift_text));
                setText("赠");
                break;
        }
    }
    
    /**
     * 设置自定义文本 (用于促销标签)
     */
    public void setTagText(String text) {
        setText(text);
    }
    
    private int dp(int dp) {
        return (int) TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, dp, 
            getResources().getDisplayMetrics()
        );
    }
}
```

#### 4.1.3 使用示例

```java
// 快递送标签
DingdangTagView expressTag = new DingdangTagView(context);
expressTag.setTagType(TagType.EXPRESS);

// 自营标签
DingdangTagView selfTag = new DingdangTagView(context);
selfTag.setTagType(TagType.SELF_OPERATED);

// 促销标签 (自定义文本)
DingdangTagView promoTag = new DingdangTagView(context);
promoTag.setTagType(TagType.PROMO);
promoTag.setTagText("满99减50");
```


### 4.2 圆形选中组件 (DingdangCheckBox)

#### 4.2.1 组件功能

带动画效果的圆形CheckBox组件:
- 选中时显示翠绿色圆形背景
- 未选中时显示白色圆形边框
- 对勾绘制带200ms动画效果

#### 4.2.2 核心实现

```java
package com.adinnet.demo.mall.widget;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.util.AttributeSet;
import android.view.View;
import com.adinnet.demo.R;

/**
 * 叮当商城圆形选中组件
 * 带动画效果的圆形CheckBox
 */
public class DingdangCheckBox extends View {
    
    private Paint paint;
    private Paint checkPaint;
    private boolean isChecked = false;
    private float checkProgress = 0f;
    private ValueAnimator animator;
    
    private float centerX;
    private float centerY;
    private float radius;
    
    public DingdangCheckBox(Context context) {
        super(context);
        init();
    }
    
    public DingdangCheckBox(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    private void init() {
        paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setStrokeWidth(dp(2));
        
        checkPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        checkPaint.setColor(Color.WHITE);
        checkPaint.setStyle(Paint.Style.STROKE);
        checkPaint.setStrokeWidth(dp(2));
        checkPaint.setStrokeCap(Paint.Cap.ROUND);
        checkPaint.setStrokeJoin(Paint.Join.ROUND);
        
        setOnClickListener(v -> toggle());
    }
    
    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        centerX = w / 2f;
        centerY = h / 2f;
        radius = Math.min(w, h) / 2f - dp(2);
    }
    
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        
        // 绘制圆形背景
        if (isChecked) {
            paint.setColor(getResources().getColor(R.color.dingdang_primary));
            paint.setStyle(Paint.Style.FILL);
        } else {
            paint.setColor(Color.WHITE);
            paint.setStyle(Paint.Style.FILL);
            canvas.drawCircle(centerX, centerY, radius, paint);
            
            paint.setColor(getResources().getColor(R.color.dingdang_divider));
            paint.setStyle(Paint.Style.STROKE);
        }
        canvas.drawCircle(centerX, centerY, radius, paint);
        
        // 绘制对勾(带动画)
        if (checkProgress > 0) {
            drawCheckMark(canvas, checkProgress);
        }
    }
    
    /**
     * 绘制对勾
     */
    private void drawCheckMark(Canvas canvas, float progress) {
        Path path = new Path();
        
        float startX = centerX - radius * 0.4f;
        float startY = centerY;
        float midX = centerX - radius * 0.1f;
        float midY = centerY + radius * 0.3f;
        float endX = centerX + radius * 0.4f;
        float endY = centerY - radius * 0.3f;
        
        path.moveTo(startX, startY);
        
        if (progress <= 0.5f) {
            // 第一段: 从起点到中点
            float t = progress * 2;
            path.lineTo(
                startX + (midX - startX) * t,
                startY + (midY - startY) * t
            );
        } else {
            // 第二段: 从中点到终点
            path.lineTo(midX, midY);
            float t = (progress - 0.5f) * 2;
            path.lineTo(
                midX + (endX - midX) * t,
                midY + (endY - midY) * t
            );
        }
        
        canvas.drawPath(path, checkPaint);
    }
    
    /**
     * 切换选中状态
     */
    public void toggle() {
        setChecked(!isChecked);
    }
    
    /**
     * 设置选中状态
     */
    public void setChecked(boolean checked) {
        if (isChecked == checked) return;
        isChecked = checked;
        
        // 启动动画
        if (animator != null) {
            animator.cancel();
        }
        animator = ValueAnimator.ofFloat(checkProgress, checked ? 1f : 0f);
        animator.setDuration(200);
        animator.addUpdateListener(animation -> {
            checkProgress = (float) animation.getAnimatedValue();
            invalidate();
        });
        animator.start();
    }
    
    /**
     * 获取选中状态
     */
    public boolean isChecked() {
        return isChecked;
    }
    
    private int dp(int dp) {
        return (int) (dp * getResources().getDisplayMetrics().density);
    }
}
```

#### 4.2.3 使用示例

```java
// XML布局
<com.adinnet.demo.mall.widget.DingdangCheckBox
    android:id="@+id/checkbox"
    android:layout_width="20dp"
    android:layout_height="20dp"/>

// Java代码
DingdangCheckBox checkBox = findViewById(R.id.checkbox);
checkBox.setChecked(true);
checkBox.setOnClickListener(v -> {
    // 点击自动切换状态
});
```


### 4.3 固定Header组件

#### 4.3.1 组件功能

固定在页面顶部的翠绿色Header,包含:
- 标题和副标题
- 搜索框 (pill形状)
- 热门标签横向滚动
- 图标按钮 (历史、物流)

#### 4.3.2 布局设计 (mall_include_fixed_header.xml)

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:background="@color/dingdang_primary"
    android:elevation="4dp"
    android:padding="16dp">
    
    <!-- 标题区域 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical">
        
        <!-- 标题和副标题 -->
        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:orientation="vertical">
            
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="叮当商城"
                android:textColor="@color/dingdang_text_white"
                android:textSize="@dimen/dingdang_text_xlarge"
                android:textStyle="bold"/>
            
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="药企联盟直供 全国发货"
                android:textColor="@color/dingdang_text_white"
                android:textSize="@dimen/dingdang_text_micro"
                android:alpha="0.8"
                android:layout_marginTop="2dp"/>
        </LinearLayout>
        
        <!-- 图标按钮 -->
        <ImageView
            android:id="@+id/iv_history"
            android:layout_width="24dp"
            android:layout_height="24dp"
            android:src="@drawable/ic_history"
            android:tint="@color/dingdang_text_white"
            android:layout_marginStart="12dp"/>
        
        <ImageView
            android:id="@+id/iv_shipping"
            android:layout_width="24dp"
            android:layout_height="24dp"
            android:src="@drawable/ic_shipping"
            android:tint="@color/dingdang_text_white"
            android:layout_marginStart="12dp"/>
    </LinearLayout>
    
    <!-- 搜索框 -->
    <EditText
        android:id="@+id/et_search"
        android:layout_width="match_parent"
        android:layout_height="36dp"
        android:layout_marginTop="12dp"
        android:background="@drawable/dingdang_bg_search_pill"
        android:hint="缺铁性贫血"
        android:textColorHint="@color/dingdang_text_hint"
        android:textSize="@dimen/dingdang_text_body"
        android:paddingStart="16dp"
        android:paddingEnd="16dp"
        android:drawableStart="@drawable/ic_search"
        android:drawablePadding="8dp"
        android:singleLine="true"/>
    
    <!-- 热门标签 -->
    <HorizontalScrollView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="12dp"
        android:scrollbars="none">
        
        <LinearLayout
            android:id="@+id/ll_hot_tags"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal">
            
            <!-- 动态添加热门标签 -->
            <!-- 示例标签 -->
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="补气血"
                android:textColor="@color/dingdang_text_white"
                android:textSize="@dimen/dingdang_text_small"
                android:background="@drawable/dingdang_bg_hot_tag"
                android:paddingStart="12dp"
                android:paddingEnd="12dp"
                android:paddingTop="4dp"
                android:paddingBottom="4dp"
                android:layout_marginEnd="8dp"/>
        </LinearLayout>
    </HorizontalScrollView>
</LinearLayout>
```

#### 4.3.3 热门标签背景 (dingdang_bg_hot_tag.xml)

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#ffffff"/>
    <corners android:radius="@dimen/dingdang_corner_pill"/>
</shape>
```

#### 4.3.4 使用示例

```java
// 在Activity/Fragment中使用
public class MallHomeFragment extends Fragment {
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, 
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_mall_home, container, false);
        
        // 初始化热门标签
        LinearLayout llHotTags = view.findViewById(R.id.ll_hot_tags);
        String[] hotTags = {"补气血", "司美格鲁肽", "维生素", "感冒药"};
        
        for (String tag : hotTags) {
            TextView tagView = createHotTagView(tag);
            llHotTags.addView(tagView);
        }
        
        return view;
    }
    
    private TextView createHotTagView(String text) {
        TextView textView = new TextView(getContext());
        textView.setText(text);
        textView.setTextColor(Color.WHITE);
        textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        textView.setBackgroundResource(R.drawable.dingdang_bg_hot_tag);
        
        int padding = dp(12);
        textView.setPadding(padding, dp(4), padding, dp(4));
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMarginEnd(dp(8));
        textView.setLayoutParams(params);
        
        return textView;
    }
}
```


---

## 五、页面布局设计

### 5.1 商城首页布局

#### 5.1.1 整体结构

```xml
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/dingdang_background">
    
    <!-- 主内容 -->
    <android.support.v4.widget.SwipeRefreshLayout
        android:id="@+id/swipe_refresh"
        android:layout_width="match_parent"
        android:layout_height="match_parent">
        
        <android.support.v4.widget.NestedScrollView
            android:layout_width="match_parent"
            android:layout_height="match_parent">
            
            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical">
                
                <!-- 预留Header高度 -->
                <View
                    android:layout_width="match_parent"
                    android:layout_height="@dimen/dingdang_header_height"/>
                
                <!-- 轮播图 -->
                <com.youth.banner.Banner
                    android:id="@+id/banner"
                    android:layout_width="match_parent"
                    android:layout_height="@dimen/dingdang_banner_height"
                    android:layout_margin="16dp"/>
                
                <!-- 分类导航 -->
                <android.support.v7.widget.CardView
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="16dp"
                    android:layout_marginEnd="16dp"
                    android:layout_marginBottom="16dp"
                    app:cardCornerRadius="@dimen/dingdang_corner_xlarge"
                    app:cardElevation="@dimen/dingdang_card_elevation">
                    
                    <android.support.v7.widget.RecyclerView
                        android:id="@+id/rv_category"
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:padding="16dp"/>
                </android.support.v7.widget.CardView>
                
                <!-- 热销药品 -->
                <include layout="@layout/mall_include_section_title"
                    android:id="@+id/section_hot"/>
                
                <android.support.v7.widget.RecyclerView
                    android:id="@+id/rv_hot_drugs"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal"
                    android:paddingStart="16dp"
                    android:paddingEnd="16dp"
                    android:clipToPadding="false"/>
                
                <!-- 推荐药品 -->
                <include layout="@layout/mall_include_section_title"
                    android:id="@+id/section_recommend"/>
                
                <android.support.v7.widget.RecyclerView
                    android:id="@+id/rv_recommend"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:padding="16dp"/>
            </LinearLayout>
        </android.support.v4.widget.NestedScrollView>
    </android.support.v4.widget.SwipeRefreshLayout>
    
    <!-- 固定Header (覆盖在顶部) -->
    <include layout="@layout/mall_include_fixed_header"/>
</FrameLayout>
```

#### 5.1.2 区域标题布局 (mall_include_section_title.xml)

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:gravity="center_vertical"
    android:paddingStart="16dp"
    android:paddingEnd="16dp"
    android:paddingTop="24dp"
    android:paddingBottom="12dp">
    
    <TextView
        android:id="@+id/tv_title"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:text="热销药品"
        style="@style/DingdangText.Title"/>
    
    <TextView
        android:id="@+id/tv_more"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="查看更多 >"
        android:textColor="@color/dingdang_text_secondary"
        android:textSize="@dimen/dingdang_text_small"/>
</LinearLayout>
```


### 5.2 药品详情页布局优化

#### 5.2.1 促销标签横向滚动 (mall_include_promo_tags.xml)

```xml
<?xml version="1.0" encoding="utf-8"?>
<HorizontalScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginTop="12dp"
    android:scrollbars="none"
    android:paddingStart="16dp"
    android:paddingEnd="16dp">
    
    <LinearLayout
        android:id="@+id/ll_promo_tags"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="horizontal">
        
        <!-- 动态添加促销标签 -->
        <!-- 使用DingdangTagView -->
    </LinearLayout>
</HorizontalScrollView>
```

#### 5.2.2 用药指导卡片 (mall_include_medication_guide.xml)

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:background="#f5f5f5"
    android:padding="12dp"
    android:layout_margin="16dp">
    
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="用药指导"
        android:textSize="@dimen/dingdang_text_tiny"
        android:textStyle="bold"
        android:textColor="@color/dingdang_text_primary"/>
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginTop="8dp">
        
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="功能主治"
            android:textSize="@dimen/dingdang_text_tiny"
            android:textColor="@color/dingdang_text_secondary"
            android:layout_marginEnd="8dp"/>
        
        <TextView
            android:id="@+id/tv_function"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="清热燥湿,杀虫敛汗..."
            android:textSize="@dimen/dingdang_text_tiny"
            android:textColor="@color/dingdang_text_primary"
            android:maxLines="2"
            android:ellipsize="end"/>
    </LinearLayout>
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginTop="4dp">
        
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="用法用量"
            android:textSize="@dimen/dingdang_text_tiny"
            android:textColor="@color/dingdang_text_secondary"
            android:layout_marginEnd="8dp"/>
        
        <TextView
            android:id="@+id/tv_usage"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="外用,取粉40g沸水..."
            android:textSize="@dimen/dingdang_text_tiny"
            android:textColor="@color/dingdang_text_primary"
            android:maxLines="2"
            android:ellipsize="end"/>
    </LinearLayout>
</LinearLayout>
```

#### 5.2.3 店铺信息卡片 (mall_include_shop_info.xml)

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:background="@color/dingdang_card_background"
    android:padding="16dp"
    android:gravity="center_vertical">
    
    <ImageView
        android:id="@+id/iv_shop_logo"
        android:layout_width="40dp"
        android:layout_height="40dp"
        android:src="@drawable/ic_shop"
        android:scaleType="centerCrop"/>
    
    <LinearLayout
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:orientation="vertical"
        android:layout_marginStart="12dp">
        
        <TextView
            android:id="@+id/tv_shop_name"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="叮当商城旗舰店"
            android:textStyle="bold"
            android:textSize="@dimen/dingdang_text_title"
            android:textColor="@color/dingdang_text_primary"/>
        
        <TextView
            android:id="@+id/tv_shop_desc"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="满 ¥48包邮，快递送"
            android:textSize="@dimen/dingdang_text_tiny"
            android:textColor="@color/dingdang_text_secondary"
            android:layout_marginTop="4dp"/>
    </LinearLayout>
    
    <ImageView
        android:layout_width="16dp"
        android:layout_height="16dp"
        android:src="@drawable/ic_arrow_right"
        android:tint="@color/dingdang_text_hint"/>
</LinearLayout>
```

### 5.3 购物车页面布局优化

#### 5.3.1 店铺信息栏

```xml
<!-- 在购物车商品列表前添加 -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:background="@color/dingdang_card_background"
    android:padding="16dp"
    android:gravity="center_vertical">
    
    <com.adinnet.demo.mall.widget.DingdangCheckBox
        android:id="@+id/cb_shop"
        android:layout_width="20dp"
        android:layout_height="20dp"/>
    
    <LinearLayout
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:orientation="vertical"
        android:layout_marginStart="12dp">
        
        <LinearLayout
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal">
            
            <com.adinnet.demo.mall.widget.DingdangTagView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="商城"
                android:layout_marginEnd="4dp"/>
            
            <com.adinnet.demo.mall.widget.DingdangTagView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="自营"
                android:layout_marginEnd="8dp"/>
            
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="叮当商城旗舰店"
                android:textStyle="bold"
                android:textSize="@dimen/dingdang_text_title"/>
        </LinearLayout>
        
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="满48元包邮, 快递送"
            android:textSize="@dimen/dingdang_text_tiny"
            android:textColor="@color/dingdang_text_secondary"
            android:layout_marginTop="4dp"/>
    </LinearLayout>
</LinearLayout>
```

#### 5.3.2 活动提示栏

```xml
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:background="@color/dingdang_tag_promo_bg"
    android:padding="10dp"
    android:gravity="center_vertical"
    android:layout_margin="16dp">
    
    <TextView
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:text="店铺有1个活动，可超值换购1元商品!"
        android:textSize="@dimen/dingdang_text_tiny"
        android:textColor="@color/dingdang_text_primary"/>
    
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="查看更多 >"
        android:textSize="@dimen/dingdang_text_tiny"
        android:textColor="@color/dingdang_primary"/>
</LinearLayout>
```

#### 5.3.3 常买常逛区域

```xml
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:layout_marginTop="32dp">
    
    <!-- 分隔线 + 标题 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:paddingStart="16dp"
        android:paddingEnd="16dp">
        
        <View
            android:layout_width="0dp"
            android:layout_height="1dp"
            android:layout_weight="1"
            android:background="@color/dingdang_divider"/>
        
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="常买常逛"
            android:textColor="@color/dingdang_text_hint"
            android:textSize="@dimen/dingdang_text_small"
            android:paddingStart="12dp"
            android:paddingEnd="12dp"/>
        
        <View
            android:layout_width="0dp"
            android:layout_height="1dp"
            android:layout_weight="1"
            android:background="@color/dingdang_divider"/>
    </LinearLayout>
    
    <!-- 推荐商品网格 (2列) -->
    <android.support.v7.widget.RecyclerView
        android:id="@+id/rv_often_bought"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:padding="16dp"/>
</LinearLayout>
```


---

## 六、技术选型

### 6.1 UI框架

| 组件 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| RecyclerView | Support Library | 28.0.0 | 列表展示 |
| CardView | Support Library | 28.0.0 | 卡片容器 |
| SwipeRefreshLayout | Support Library | 28.0.0 | 下拉刷新 |
| Banner | youth.banner | 2.2.2 | 轮播图 |
| Glide | com.github.bumptech.glide | 4.12.0 | 图片加载 |

### 6.2 自定义组件

| 组件 | 实现方式 | 说明 |
|------|---------|------|
| DingdangTagView | 继承AppCompatTextView | 标签组件 |
| DingdangCheckBox | 继承View | 圆形选中组件 |
| MallHeaderView | 自定义布局 | 固定Header |

### 6.3 动画框架

| 功能 | 技术选型 | 说明 |
|------|---------|------|
| 属性动画 | ValueAnimator | 选中动画 |
| 布局动画 | LayoutTransition | 展开/收起动画 |
| 页面转场 | Activity Transition | 页面切换动画 |

---

## 七、性能优化

### 7.1 绘制性能

#### 7.1.1 自定义组件优化

**DingdangCheckBox绘制优化**:
```java
// 缓存Paint对象,避免重复创建
private Paint paint;
private Paint checkPaint;

// 使用硬件加速
setLayerType(View.LAYER_TYPE_HARDWARE, null);

// 减少onDraw中的对象创建
private Path checkPath = new Path(); // 复用Path对象
```

**性能目标**:
- 单次绘制时间 ≤ 16ms (60fps)
- 动画帧率 ≥ 55fps

#### 7.1.2 布局优化

**减少布局层级**:
```xml
<!-- ❌ 不推荐: 嵌套过深 -->
<LinearLayout>
    <LinearLayout>
        <LinearLayout>
            <TextView/>
        </LinearLayout>
    </LinearLayout>
</LinearLayout>

<!-- ✅ 推荐: 使用RelativeLayout或合并布局 -->
<RelativeLayout>
    <TextView/>
</RelativeLayout>
```

**使用ViewStub延迟加载**:
```xml
<!-- 用药指导卡片延迟加载 -->
<ViewStub
    android:id="@+id/stub_medication_guide"
    android:layout="@layout/mall_include_medication_guide"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"/>
```

### 7.2 内存优化

#### 7.2.1 图片加载优化

```java
// 使用Glide加载图片,自动管理内存
Glide.with(context)
    .load(imageUrl)
    .placeholder(R.drawable.placeholder)
    .error(R.drawable.error)
    .transform(new RoundedCorners(dp(16)))
    .into(imageView);
```

#### 7.2.2 RecyclerView优化

```java
// 设置固定大小,避免重新计算
recyclerView.setHasFixedSize(true);

// 设置RecycledViewPool,复用ViewHolder
RecyclerView.RecycledViewPool pool = new RecyclerView.RecycledViewPool();
pool.setMaxRecycledViews(0, 20);
recyclerView.setRecycledViewPool(pool);

// 预加载
LinearLayoutManager layoutManager = new LinearLayoutManager(context);
layoutManager.setInitialPrefetchItemCount(4);
recyclerView.setLayoutManager(layoutManager);
```

### 7.3 启动优化

#### 7.3.1 资源预加载

```java
// 在Application中预加载常用资源
public class MyApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        
        // 预加载颜色资源
        getResources().getColor(R.color.dingdang_primary);
        
        // 预加载Drawable
        getResources().getDrawable(R.drawable.dingdang_bg_button_primary);
    }
}
```

#### 7.3.2 懒加载

```java
// Fragment懒加载
public class MallHomeFragment extends Fragment {
    private boolean isLoaded = false;
    
    @Override
    public void onResume() {
        super.onResume();
        if (!isLoaded) {
            loadData();
            isLoaded = true;
        }
    }
}
```

---

## 八、风险评估

### 8.1 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| 自定义组件性能问题 | 中 | 低 | 性能测试,优化绘制逻辑 |
| 动画在低端设备卡顿 | 中 | 中 | 提供降级方案,检测设备性能 |
| 圆角裁剪图片异常 | 低 | 低 | 使用Glide transform |
| 内存泄漏 | 高 | 低 | 使用LeakCanary检测 |

### 8.2 兼容性风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| Android 4.4兼容性 | 中 | 中 | 测试低版本设备,使用兼容库 |
| 不同屏幕尺寸适配 | 中 | 低 | 使用dp单位,测试多种屏幕 |
| 不同分辨率图片模糊 | 低 | 低 | 提供多套图片资源 |

### 8.3 实施风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| 需求变更 | 高 | 中 | 分阶段交付,及时沟通 |
| 资源不足 | 高 | 低 | 优先实施P0任务 |
| 测试不充分 | 中 | 中 | 每阶段完成后充分测试 |
| 与现有代码冲突 | 中 | 低 | 使用dingdang_前缀隔离资源 |

### 8.4 风险应对策略

#### 8.4.1 性能降级方案

```java
// 检测设备性能,低端设备禁用动画
public class DeviceUtils {
    public static boolean isLowEndDevice() {
        ActivityManager am = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        ActivityManager.MemoryInfo memoryInfo = new ActivityManager.MemoryInfo();
        am.getMemoryInfo(memoryInfo);
        
        // 内存小于2GB视为低端设备
        return memoryInfo.totalMem < 2L * 1024 * 1024 * 1024;
    }
}

// 在DingdangCheckBox中应用
public void setChecked(boolean checked) {
    if (isChecked == checked) return;
    isChecked = checked;
    
    if (DeviceUtils.isLowEndDevice()) {
        // 低端设备直接设置,不播放动画
        checkProgress = checked ? 1f : 0f;
        invalidate();
    } else {
        // 高端设备播放动画
        startAnimation();
    }
}
```

#### 8.4.2 兼容性处理

```java
// Android版本兼容
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
    // 使用elevation
    view.setElevation(dp(4));
} else {
    // 使用阴影drawable
    view.setBackgroundResource(R.drawable.shadow_bg);
}
```

---

## 九、测试策略

### 9.1 单元测试

#### 9.1.1 组件测试

```java
@Test
public void testDingdangTagView() {
    DingdangTagView tagView = new DingdangTagView(context);
    
    // 测试快递送标签
    tagView.setTagType(TagType.EXPRESS);
    assertEquals("快递送", tagView.getText());
    
    // 测试自营标签
    tagView.setTagType(TagType.SELF_OPERATED);
    assertEquals("自营", tagView.getText());
}

@Test
public void testDingdangCheckBox() {
    DingdangCheckBox checkBox = new DingdangCheckBox(context);
    
    // 测试初始状态
    assertFalse(checkBox.isChecked());
    
    // 测试选中
    checkBox.setChecked(true);
    assertTrue(checkBox.isChecked());
    
    // 测试切换
    checkBox.toggle();
    assertFalse(checkBox.isChecked());
}
```

### 9.2 UI测试

#### 9.2.1 Espresso测试

```java
@Test
public void testMallHomePage() {
    // 测试Header显示
    onView(withId(R.id.mall_header))
        .check(matches(isDisplayed()));
    
    // 测试搜索框
    onView(withId(R.id.et_search))
        .check(matches(withHint("缺铁性贫血")));
    
    // 测试轮播图
    onView(withId(R.id.banner))
        .check(matches(isDisplayed()));
}
```

### 9.3 性能测试

#### 9.3.1 绘制性能测试

```java
@Test
public void testDrawPerformance() {
    DingdangCheckBox checkBox = new DingdangCheckBox(context);
    
    long startTime = System.nanoTime();
    checkBox.draw(new Canvas());
    long endTime = System.nanoTime();
    
    long duration = (endTime - startTime) / 1000000; // 转换为毫秒
    assertTrue("绘制时间应小于16ms", duration < 16);
}
```

### 9.4 视觉对比测试

#### 9.4.1 截图对比

```java
@Test
public void testVisualConsistency() {
    // 截取Android实现的截图
    Bitmap androidScreenshot = takeScreenshot();
    
    // 与dingdang-pharmacy参考图对比
    Bitmap referenceImage = loadReferenceImage();
    
    // 计算相似度
    double similarity = calculateSimilarity(androidScreenshot, referenceImage);
    
    // 验证相似度 >= 75%
    assertTrue("视觉一致性应 >= 75%", similarity >= 0.75);
}
```

---

## 十、实施计划

### 10.1 分阶段实施

#### 阶段一: 视觉基础重构 (1周, P0)
- 创建dingdang颜色、尺寸、样式资源
- 实现DingdangTagView和DingdangCheckBox
- 更新所有按钮和价格颜色为翠绿色

#### 阶段二: 首页优化 (3-4天, P0+P1)
- 实现固定Header
- 优化药品卡片样式
- 更新所有圆角为16dp

#### 阶段三: 详情页优化 (3-4天, P1)
- 实现促销标签横向滚动
- 实现用药指导卡片
- 实现店铺信息卡片

#### 阶段四: 购物车优化 (2-3天, P1)
- 实现店铺信息栏
- 实现活动提示栏
- 实现常买常逛区域

#### 阶段五: 交互动画 (2-3天, P2)
- 实现选中动画
- 实现按钮点击反馈
- 实现页面切换动画

### 10.2 验收标准

| 阶段 | 验收标准 | 预期一致性 |
|------|---------|-----------|
| 阶段一 | 主题色、圆角、标签样式正确 | 65-70% |
| 阶段二 | 首页Header、搜索框、卡片样式正确 | 70-75% |
| 阶段三 | 详情页信息完整,样式正确 | 72-77% |
| 阶段四 | 购物车信息完整,样式正确 | 75-80% |
| 阶段五 | 动画流畅,交互自然 | 75-80% |

---

## 十一、总结

### 11.1 设计亮点

1. **资源隔离**: 使用dingdang_前缀,避免与现有应用冲突
2. **组件化设计**: 自定义组件可复用,易于维护
3. **性能优先**: 绘制优化、内存优化、启动优化
4. **渐进式实施**: 支持分阶段交付,降低风险

### 11.2 关键决策

1. **颜色系统**: 完全采用翠绿色系统,放弃橙色
2. **圆角系统**: 新增pill形状(9999dp),用于按钮和搜索框
3. **自定义组件**: 实现DingdangTagView和DingdangCheckBox,确保视觉一致性
4. **固定Header**: 使用FrameLayout覆盖实现,而非CollapsingToolbarLayout

### 11.3 预期效果

完成本设计方案实施后:
- **视觉一致性**: 从60-65%提升到75-80%
- **用户体验**: 显著提升,接近dingdang-pharmacy
- **代码质量**: 组件化、可维护、高性能

---

**文档维护说明**:

1. 本文档为高度详细的设计文档,包含完整代码示例
2. 实施过程中如有调整,及时更新本文档
3. 每完成一个阶段,更新实施进度
4. 最终达到目标后,更新最终效果评估

**下一步行动**:

1. 审核本设计文档
2. 创建tasks.md任务文档
3. 开始实施阶段一任务

---

**文档版本历史**:

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|---------|------|
| 2026-01-29 | v1.0 | 初始版本,完整设计文档 | Kiro AI |
