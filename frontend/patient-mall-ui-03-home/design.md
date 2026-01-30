# 设计文档: 患者端药房商城UI - 商城首页

## 概述

本文档描述患者端药房商城首页的详细设计方案,包括页面布局、组件设计、数据加载、交互逻辑等。

### 设计目标

1. **清晰的导航**: 提供多种方式让用户快速找到药品
2. **丰富的内容**: 展示推荐药品和分类信息
3. **流畅的体验**: 优化加载和滚动性能
4. **可扩展性**: 便于后续添加新功能

### 技术选型

- **架构模式**: MVP (Model-View-Presenter)
- **布局方式**: NestedScrollView + RecyclerView
- **下拉刷新**: SwipeRefreshLayout
- **瀑布流**: StaggeredGridLayoutManager
- **图片加载**: Glide (来自 Spec 1)
- **网络请求**: Retrofit + RxJava (来自 Spec 1)

## 架构设计

### 组件结构

```
MallHomeFragment (View)
    ↓
MallHomePresenter (Presenter)
    ↓
MallApiService (Model)
```

### 类图

```
┌─────────────────────────────────────┐
│      MallHomeFragment               │
│  (implements MallHomeView)          │
├─────────────────────────────────────┤
│ - presenter: MallHomePresenter      │
│ - categoryAdapter: CategoryAdapter  │
│ - drugAdapter: DrugListAdapter      │
│ - swipeRefresh: SwipeRefreshLayout  │
├─────────────────────────────────────┤
│ + showLoading()                     │
│ + hideLoading()                     │
│ + showHomeData(data)                │
│ + showError(message)                │
│ + navigateToDrugDetail(drugId)      │
│ + navigateToSearch()                │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│    MallHomePresenterImpl            │
│  (implements MallHomePresenter)     │
├─────────────────────────────────────┤
│ - view: MallHomeView                │
│ - apiService: MallApiService        │
├─────────────────────────────────────┤
│ + loadHomeData()                    │
│ + refreshHomeData()                 │
│ + onDrugClick(drug)                 │
│ + onCategoryClick(category)         │
└─────────────────────────────────────┘
```

## 页面布局设计

### 整体布局结构

```xml
<!-- fragment_mall_home.xml -->
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout
    android:id="@+id/swipe_refresh"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    
    <androidx.core.widget.NestedScrollView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="@color/colorBackground">
        
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical">
            
            <!-- 页面头部 -->
            <include layout="@layout/include_mall_home_header"/>
            
            <!-- 分类导航 -->
            <include layout="@layout/include_mall_categories"/>
            
            <!-- 药品列表 -->
            <androidx.recyclerview.widget.RecyclerView
                android:id="@+id/rv_drugs"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:padding="@dimen/spacing_small"
                android:nestedScrollingEnabled="false"/>
            
        </LinearLayout>
        
    </androidx.core.widget.NestedScrollView>
    
</androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
```

### 页面头部布局

```xml
<!-- include_mall_home_header.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:background="@color/colorPrimary"
    android:padding="@dimen/spacing_normal">
    
    <!-- 标题区域 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:layout_marginBottom="@dimen/spacing_normal">
        
        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:orientation="vertical">
            
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="叮当商城"
                android:textColor="@color/colorWhite"
                android:textSize="@dimen/text_size_xlarge"
                android:textStyle="bold"/>
            
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="药企联盟直供 全国发货"
                android:textColor="@color/colorWhite"
                android:textSize="@dimen/text_size_tiny"
                android:alpha="0.8"/>
            
        </LinearLayout>
        
        <!-- 右侧图标 -->
        <ImageView
            android:id="@+id/iv_history"
            android:layout_width="@dimen/image_size_small"
            android:layout_height="@dimen/image_size_small"
            android:src="@drawable/ic_history"
            android:tint="@color/colorWhite"
            android:padding="@dimen/spacing_small"/>
        
        <ImageView
            android:id="@+id/iv_logistics"
            android:layout_width="@dimen/image_size_small"
            android:layout_height="@dimen/image_size_small"
            android:src="@drawable/ic_logistics"
            android:tint="@color/colorWhite"
            android:padding="@dimen/spacing_small"/>
        
    </LinearLayout>
    
    <!-- 搜索框 -->
    <LinearLayout
        android:id="@+id/ll_search"
        android:layout_width="match_parent"
        android:layout_height="@dimen/button_height_normal"
        android:orientation="horizontal"
        android:background="@drawable/bg_search_bar"
        android:gravity="center_vertical"
        android:paddingStart="@dimen/spacing_medium"
        android:paddingEnd="@dimen/spacing_medium"
        android:layout_marginBottom="@dimen/spacing_medium">
        
        <ImageView
            android:layout_width="@dimen/image_size_tiny"
            android:layout_height="@dimen/image_size_tiny"
            android:src="@drawable/ic_search"
            android:tint="@color/colorTextHint"/>
        
        <TextView
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="@dimen/spacing_small"
            android:text="搜索药品名称"
            android:textSize="@dimen/text_size_normal"
            android:textColor="@color/colorTextHint"/>
        
    </LinearLayout>
    
    <!-- 热门标签 -->
    <HorizontalScrollView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:scrollbars="none">
        
        <LinearLayout
            android:id="@+id/ll_hot_tags"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal">
            
            <!-- 动态添加热门标签 -->
            
        </LinearLayout>
        
    </HorizontalScrollView>
    
</LinearLayout>
```
