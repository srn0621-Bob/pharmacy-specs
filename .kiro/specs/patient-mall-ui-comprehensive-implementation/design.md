# 设计文档: 患者端药品商城UI综合实施

> **文档版本**: v1.0  
> **创建时间**: 2026-01-30  
> **设计细节级别**: 高度详细 (包含完整代码示例和XML资源定义)

## 目录

- [一、概述](#一概述)
- [二、架构设计](#二架构设计)
- [三、视觉基础系统](#三视觉基础系统)
- [四、自定义组件设计](#四自定义组件设计)
- [五、页面实现设计](#五页面实现设计)
- [六、数据模型设计](#六数据模型设计)
- [七、API接口设计](#七api接口设计)
- [八、性能优化](#八性能优化)
- [九、测试策略](#九测试策略)
- [十、实施计划](#十实施计划)

---

## 一、概述

### 1.1 设计目标

本设计方案综合了功能迁移和UI重构两个方面,旨在:
1. 完整实现dingdang-pharmacy的所有核心功能
2. 达到75-80%的视觉一致性
3. 保持高性能和良好的用户体验
4. 确保代码质量和可维护性

### 1.2 核心设计原则

1. **功能优先,视觉并重**: 在保证功能完整的基础上,追求视觉一致性
2. **组件化设计**: 创建可复用的自定义组件
3. **资源隔离**: 使用独立的dingdang资源文件,避免与现有应用冲突
4. **性能优先**: 自定义组件绘制时间≤16ms,动画帧率≥55fps
5. **MVP架构**: 使用MVP架构模式,职责分明
6. **渐进式实施**: 支持分阶段实施,P0任务优先

### 1.3 技术栈

- **架构模式**: MVP (Model-View-Presenter)
- **网络框架**: Retrofit 2.2.0 + OkHttp 3.10.0
- **响应式编程**: RxJava 2.1.7 + RxAndroid 2.0.1
- **视图绑定**: ButterKnife 8.8.1
- **图片加载**: Glide 4.12.0
- **列表组件**: RecyclerView + BaseRecyclerViewAdapterHelper 2.9.50
- **下拉刷新**: SwipeRefreshLayout
- **轮播图**: youth.banner 2.2.2

---

## 二、架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Activity   │  │   Fragment   │  │    Adapter   │  │
│  │              │  │              │  │              │  │
│  │  - MallMain  │  │  - MallHome  │  │  - DrugList  │  │
│  │  - DrugDetail│  │  - Category  │  │  - Cart      │  │
│  │  - Cart      │  │  - Cart      │  │  - Category  │  │
│  │  - Checkout  │  │  - Mine      │  │              │  │
│  │  - Search    │  │              │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                  │                             │
│         └──────────┬───────┘                             │
│                    │                                     │
│         ┌──────────▼───────────┐                        │
│         │     Presenter        │                        │
│         │                      │                        │
│         │  - MallHomePresenter │                        │
│         │  - DrugDetailPresenter│                       │
│         │  - CartPresenter     │                        │
│         │  - CheckoutPresenter │                        │
│         └──────────┬───────────┘                        │
└────────────────────┼─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                    Business Layer                        │
│         ┌──────────────────────┐                        │
│         │       Service        │                        │
│         │                      │                        │
│         │  - MallApiService    │                        │
│         │  - CartManager       │                        │
│         │  - PriceCalculator   │                        │
│         └──────────┬───────────┘                        │
└────────────────────┼─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                     Data Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  API Client  │  │  Repository  │  │  Cache/DB    │  │
│  │              │  │              │  │              │  │
│  │  - Retrofit  │  │  - DrugRepo  │  │  - SharedPref│  │
│  │  - OkHttp    │  │  - CartRepo  │  │  - SQLite    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────┘
```


### 2.2 模块划分

```
app/src/main/java/com/adinnet/demo/
├── mall/                          # 药品商城模块
│   ├── widget/                    # 自定义组件 (新增)
│   │   ├── DingdangTagView.java
│   │   ├── DingdangCheckBox.java
│   │   └── MallHeaderView.java
│   ├── activity/                  # Activity 层
│   │   ├── MallMainActivity.java
│   │   ├── DrugDetailActivity.java
│   │   ├── CartActivity.java
│   │   ├── CheckoutActivity.java
│   │   └── SearchActivity.java
│   ├── fragment/                  # Fragment 层
│   │   ├── MallHomeFragment.java
│   │   ├── MallCategoryFragment.java
│   │   ├── MallCartFragment.java
│   │   └── MallMineFragment.java
│   ├── adapter/                   # 适配器层
│   │   ├── DrugListAdapter.java
│   │   ├── CategoryAdapter.java
│   │   ├── CartItemAdapter.java
│   │   └── RecommendAdapter.java
│   ├── presenter/                 # Presenter 层
│   │   ├── MallHomePresenter.java
│   │   ├── DrugDetailPresenter.java
│   │   ├── CartPresenter.java
│   │   └── CheckoutPresenter.java
│   ├── view/                      # View 接口层
│   │   ├── MallHomeView.java
│   │   ├── DrugDetailView.java
│   │   ├── CartView.java
│   │   └── CheckoutView.java
│   ├── model/                     # 数据模型层
│   │   ├── Drug.java
│   │   ├── CartItem.java
│   │   ├── Category.java
│   │   └── Order.java
│   ├── api/                       # API 接口层
│   │   └── MallApiService.java
│   └── util/                      # 工具类
│       ├── CartManager.java
│       └── PriceCalculator.java
```

### 2.3 资源组织

```
app/src/main/res/
├── values/
│   ├── colors_dingdang.xml        # 慈贞颜色系统 (新增)
│   ├── dimens_dingdang.xml        # 慈贞尺寸系统 (新增)
│   └── styles_dingdang.xml        # 慈贞样式系统 (新增)
├── drawable/
│   ├── dingdang_bg_tag_*.xml      # 标签背景 (新增)
│   ├── dingdang_bg_button_*.xml   # 按钮背景 (新增)
│   └── dingdang_bg_search_pill.xml # 搜索框背景 (新增)
└── layout/
    ├── activity_mall_main.xml
    ├── fragment_mall_home.xml
    ├── activity_drug_detail.xml
    ├── fragment_mall_cart.xml
    ├── activity_checkout.xml
    ├── mall_include_fixed_header.xml      # 固定Header (新增)
    ├── mall_include_section_title.xml     # 区域标题 (新增)
    ├── mall_include_promo_tags.xml        # 促销标签 (新增)
    ├── mall_include_medication_guide.xml  # 用药指导 (新增)
    └── mall_include_shop_info.xml         # 店铺信息 (新增)
```

---

## 三、视觉基础系统

### 3.1 颜色系统 (colors_dingdang.xml)

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- ==================== 主题色 - 翠绿色系 ==================== -->
    <color name="dingdang_primary">#10b981</color>
    <color name="dingdang_primary_dark">#059669</color>
    <color name="dingdang_primary_light">#34d399</color>
    
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
</resources>
```

### 3.2 尺寸系统 (dimens_dingdang.xml)

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- ==================== 圆角 ==================== -->
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

### 3.3 样式系统 (styles_dingdang.xml)

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
    
    <!-- ==================== 文字样式 ==================== -->
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

### 3.4 Drawable资源

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

**dingdang_bg_tag_express.xml** (快递送标签)
```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/dingdang_tag_express_bg"/>
    <corners android:radius="@dimen/dingdang_corner_tiny"/>
</shape>
```

**dingdang_bg_search_pill.xml** (搜索框)
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
 * 慈贞商城标签组件
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

