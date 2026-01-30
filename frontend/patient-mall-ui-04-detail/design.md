# 设计文档: 患者端药房商城UI - 药品详情页

## 概述

本文档描述患者端药房商城药品详情页的设计方案,包括页面布局、组件设计、数据流和交互逻辑的详细设计。

### 设计目标

1. **信息完整**: 展示药品的所有关键信息
2. **操作便捷**: 提供快速的购买入口
3. **体验流畅**: 优化加载和交互性能
4. **视觉统一**: 与现有应用风格保持一致

### 技术选型

- **架构模式**: MVP (Model-View-Presenter)
- **图片轮播**: Banner 库
- **图片加载**: Glide
- **网络请求**: Retrofit + RxJava

## 架构设计

### 页面结构

```
DrugDetailActivity
├── Toolbar (标题栏)
├── ScrollView (可滚动内容)
│   ├── Banner (图片轮播)
│   ├── BasicInfoSection (基本信息)
│   │   ├── 药品名称
│   │   ├── 标签列表
│   │   ├── 价格信息
│   │   └── 销量/库存
│   ├── SpecSection (规格信息)
│   ├── DescriptionSection (说明书)
│   └── RecommendSection (相关推荐)
└── BottomBar (底部操作栏)
    ├── 购物车按钮
    ├── 加入购物车按钮
    └── 立即购买按钮
```

## 组件设计

### 1. DrugDetailActivity

#### 布局设计

```xml
<!-- activity_drug_detail.xml -->
<androidx.coordinatorlayout.widget.CoordinatorLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    
    <!-- 工具栏 -->
    <com.google.android.material.appbar.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content">
        
        <androidx.appcompat.widget.Toolbar
            android:id="@+id/toolbar"
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            android:background="@color/colorWhite">
            
            <TextView
                android:id="@+id/tv_title"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="药品详情"
                style="@style/TitleStyle"/>
            
            <ImageView
                android:id="@+id/iv_cart"
                android:layout_width="@dimen/image_size_small"
                android:layout_height="@dimen/image_size_small"
                android:layout_gravity="end"
                android:layout_marginEnd="@dimen/spacing_normal"
                android:src="@drawable/ic_cart"
                android:padding="@dimen/spacing_small"/>
            
            <!-- 购物车角标 -->
            <TextView
                android:id="@+id/tv_cart_badge"
                android:layout_width="20dp"
                android:layout_height="20dp"
                android:layout_gravity="end|top"
                android:layout_marginEnd="@dimen/spacing_normal"
                android:layout_marginTop="@dimen/spacing_small"
                android:background="@drawable/bg_badge"
                android:gravity="center"
                android:textColor="@color/colorWhite"
                android:textSize="@dimen/text_size_tiny"
                android:visibility="gone"/>
            
        </androidx.appcompat.widget.Toolbar>
        
    </com.google.android.material.appbar.AppBarLayout>
    
    <!-- 内容区域 -->
    <androidx.core.widget.NestedScrollView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_behavior="@string/appbar_scrolling_view_behavior">
        
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical">
            
            <!-- 图片轮播 -->
            <com.youth.banner.Banner
                android:id="@+id/banner"
                android:layout_width="match_parent"
                android:layout_height="300dp"/>
            
            <!-- 基本信息卡片 -->
            <androidx.cardview.widget.CardView
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_margin="@dimen/spacing_normal"
                style="@style/CardStyle">
                
                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="vertical"
                    android:padding="@dimen/spacing_normal">
                    
                    <!-- 药品名称 -->
                    <TextView
                        android:id="@+id/tv_name"
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        style="@style/TitleStyle"/>
                    
                    <!-- 标签列表 -->
                    <com.google.android.flexbox.FlexboxLayout
                        android:id="@+id/fl_tags"
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="@dimen/spacing_small"
                        app:flexWrap="wrap"
                        app:alignItems="flex_start"/>
                    
                    <!-- 价格信息 -->
                    <LinearLayout
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="@dimen/spacing_medium"
                        android:orientation="horizontal"
                        android:gravity="center_vertical">
                        
                        <TextView
                            android:id="@+id/tv_price"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            style="@style/PriceStyle"/>
                        
                        <TextView
                            android:id="@+id/tv_original_price"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:layout_marginStart="@dimen/spacing_small"
                            style="@style/OriginalPriceStyle"
                            android:visibility="gone"/>
                        
                        <View
                            android:layout_width="0dp"
                            android:layout_height="1dp"
                            android:layout_weight="1"/>
                        
                        <TextView
                            android:id="@+id/tv_sales"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:textSize="@dimen/text_size_small"
                            android:textColor="@color/colorTextSecondary"/>
                        
                    </LinearLayout>
                    
                </LinearLayout>
                
            </androidx.cardview.widget.CardView>
            
            <!-- 规格信息卡片 -->
            <androidx.cardview.widget.CardView
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginStart="@dimen/spacing_normal"
                android:layout_marginEnd="@dimen/spacing_normal"
                android:layout_marginBottom="@dimen/spacing_normal"
                style="@style/CardStyle">
                
                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="vertical"
                    android:padding="@dimen/spacing_normal">
                    
                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="规格信息"
                        style="@style/TitleStyle"/>
                    
                    <!-- 规格项 -->
                    <include layout="@layout/include_spec_item"
                        android:id="@+id/spec_specification"/>
                    
                    <include layout="@layout/include_spec_item"
                        android:id="@+id/spec_manufacturer"/>
                    
                    <include layout="@layout/include_spec_item"
                        android:id="@+id/spec_brand"/>
                    
                </LinearLayout>
                
            </androidx.cardview.widget.CardView>
            
            <!-- 说明书卡片 -->
            <androidx.cardview.widget.CardView
                android:id="@+id/card_description"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginStart="@dimen/spacing_normal"
                android:layout_marginEnd="@dimen/spacing_normal"
                android:layout_marginBottom="@dimen/spacing_normal"
                style="@style/CardStyle">
                
                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="vertical"
                    android:padding="@dimen/spacing_normal">
                    
                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="药品说明书"
                        style="@style/TitleStyle"/>
                    
                    <TextView
                        android:id="@+id/tv_description"
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="@dimen/spacing_medium"
                        android:textSize="@dimen/text_size_normal"
                        android:textColor="@color/colorTextSecondary"
                        android:lineSpacingExtra="4dp"/>
                    
                    <TextView
                        android:id="@+id/tv_expand"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_gravity="center_horizontal"
                        android:layout_marginTop="@dimen/spacing_small"
                        android:text="展开"
                        android:textSize="@dimen/text_size_small"
                        android:textColor="@color/colorPrimary"
                        android:drawableEnd="@drawable/ic_arrow_down"
                        android:drawablePadding="@dimen/spacing_tiny"/>
                    
                </LinearLayout>
                
            </androidx.cardview.widget.CardView>
            
            <!-- 相关推荐 -->
            <LinearLayout
                android:id="@+id/layout_recommend"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:layout_marginBottom="@dimen/spacing_xxlarge"
                android:visibility="gone">
                
                <include layout="@layout/include_section_title"/>
                
                <androidx.recyclerview.widget.RecyclerView
                    android:id="@+id/rv_recommend"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:paddingStart="@dimen/spacing_normal"
                    android:paddingEnd="@dimen/spacing_normal"/>
                
            </LinearLayout>
            
        </LinearLayout>
        
    </androidx.core.widget.NestedScrollView>
    
    <!-- 底部操作栏 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom"
        android:orientation="horizontal"
        android:background="@color/colorWhite"
        android:elevation="4dp"
        android:padding="@dimen/spacing_normal">
        
        <ImageView
            android:id="@+id/iv_cart_bottom"
            android:layout_width="@dimen/image_size_small"
            android:layout_height="@dimen/image_size_small"
            android:src="@drawable/ic_cart"
            android:padding="@dimen/spacing_small"/>
        
        <Button
            android:id="@+id/btn_add_cart"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="@dimen/spacing_normal"
            android:text="加入购物车"
            style="@style/ButtonSecondary"/>
        
        <Button
            android:id="@+id/btn_buy_now"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="@dimen/spacing_small"
            android:text="立即购买"
            style="@style/ButtonPrimary"/>
        
    </LinearLayout>
    
    <!-- 加载状态 -->
    <include layout="@layout/include_loading_state"
        android:id="@+id/loading_state"
        android:visibility="gone"/>
    
</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

### 2. 数量选择弹窗

```xml
<!-- dialog_quantity_selector.xml -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:background="@drawable/bg_dialog"
    android:padding="@dimen/spacing_large">
    
    <!-- 药品信息 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal">
        
        <ImageView
            android:id="@+id/iv_drug_image"
            android:layout_width="@dimen/image_size_medium"
            android:layout_height="@dimen/image_size_medium"
            android:scaleType="centerCrop"/>
        
        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="@dimen/spacing_medium"
            android:orientation="vertical">
            
            <TextView
                android:id="@+id/tv_drug_name"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:textSize="@dimen/text_size_medium"
                android:textColor="@color/colorTextPrimary"
                android:maxLines="2"
                android:ellipsize="end"/>
            
            <TextView
                android:id="@+id/tv_drug_price"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="@dimen/spacing_small"
                style="@style/PriceStyle"/>
            
        </LinearLayout>
        
        <ImageView
            android:id="@+id/iv_close"
            android:layout_width="@dimen/image_size_tiny"
            android:layout_height="@dimen/image_size_tiny"
            android:src="@drawable/ic_close"
            android:padding="@dimen/spacing_tiny"/>
        
    </LinearLayout>
    
    <!-- 数量选择器 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="@dimen/spacing_large"
        android:orientation="horizontal"
        android:gravity="center_vertical">
        
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="购买数量"
            android:textSize="@dimen/text_size_normal"
            android:textColor="@color/colorTextPrimary"/>
        
        <View
            android:layout_width="0dp"
            android:layout_height="1dp"
            android:layout_weight="1"/>
        
        <!-- 数量选择控件 -->
        <LinearLayout
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical">
            
            <ImageView
                android:id="@+id/iv_decrease"
                android:layout_width="@dimen/button_height_small"
                android:layout_height="@dimen/button_height_small"
                android:src="@drawable/ic_remove"
                android:background="@drawable/bg_quantity_button"
                android:padding="@dimen/spacing_small"/>
            
            <EditText
                android:id="@+id/et_quantity"
                android:layout_width="60dp"
                android:layout_height="@dimen/button_height_small"
                android:layout_marginStart="@dimen/spacing_small"
                android:layout_marginEnd="@dimen/spacing_small"
                android:gravity="center"
                android:inputType="number"
                android:maxLength="3"
                android:text="1"
                android:textSize="@dimen/text_size_medium"
                android:textColor="@color/colorTextPrimary"
                android:background="@drawable/bg_quantity_input"/>
            
            <ImageView
                android:id="@+id/iv_increase"
                android:layout_width="@dimen/button_height_small"
                android:layout_height="@dimen/button_height_small"
                android:src="@drawable/ic_add"
                android:background="@drawable/bg_quantity_button"
                android:padding="@dimen/spacing_small"/>
            
        </LinearLayout>
        
    </LinearLayout>
    
    <!-- 库存提示 -->
    <TextView
        android:id="@+id/tv_stock_hint"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="end"
        android:layout_marginTop="@dimen/spacing_small"
        android:textSize="@dimen/text_size_small"
        android:textColor="@color/colorTextHint"/>
    
    <!-- 确认按钮 -->
    <Button
        android:id="@+id/btn_confirm"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="@dimen/spacing_large"
        android:text="确定"
        style="@style/ButtonPrimary"/>
    
</LinearLayout>
```

### 3. Presenter 实现

```java
package com.adinnet.demo.mall.presenter;

/**
 * 药品详情 Presenter 实现类
 */
public class DrugDetailPresenterImpl implements DrugDetailPresenter {
    
    private DrugDetailView view;
    private MallApiService apiService;
    private String drugId;
    private Drug currentDrug;
    
    public DrugDetailPresenterImpl(DrugDetailView view, String drugId) {
        this.view = view;
        this.drugId = drugId;
        this.apiService = RetrofitClient.getInstance().create(MallApiService.class);
    }
    
    @Override
    public void loadDrugDetail() {
        view.showLoading();
        
        apiService.getDrugDetail(drugId)
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(new Observer<BaseResponse<Drug>>() {
                @Override
                public void onSubscribe(Disposable d) {
                    // 保存 Disposable
                }
                
                @Override
                public void onNext(BaseResponse<Drug> response) {
                    view.hideLoading();
                    if (response.isSuccess()) {
                        currentDrug = response.getData();
                        view.showDrugDetail(currentDrug);
                        loadRecommendDrugs();
                    } else {
                        view.showError(response.getMessage());
                    }
                }
                
                @Override
                public void onError(Throwable e) {
                    view.hideLoading();
                    ErrorHandler.handleError(e, view);
                }
                
                @Override
                public void onComplete() {
                    // 完成
                }
            });
    }
    
    @Override
    public void loadRecommendDrugs() {
        apiService.getRecommendDrugs(drugId)
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(new Observer<BaseResponse<List<Drug>>>() {
                @Override
                public void onSubscribe(Disposable d) {
                    // 保存 Disposable
                }
                
                @Override
                public void onNext(BaseResponse<List<Drug>> response) {
                    if (response.isSuccess() && response.getData() != null) {
                        view.showRecommendDrugs(response.getData());
                    }
                }
                
                @Override
                public void onError(Throwable e) {
                    // 推荐加载失败不影响主流程
                    Log.e("DrugDetail", "加载推荐失败", e);
                }
                
                @Override
                public void onComplete() {
                    // 完成
                }
            });
    }
    
    @Override
    public void addToCart(int quantity) {
        if (currentDrug == null) {
            view.showError("药品信息加载中");
            return;
        }
        
        // 验证库存
        if (quantity > currentDrug.getStock()) {
            view.showError("库存不足");
            return;
        }
        
        AddCartRequest request = new AddCartRequest(drugId, quantity);
        
        apiService.addToCart(request)
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(new Observer<BaseResponse<Void>>() {
                @Override
                public void onSubscribe(Disposable d) {
                    // 保存 Disposable
                }
                
                @Override
                public void onNext(BaseResponse<Void> response) {
                    if (response.isSuccess()) {
                        // 更新本地购物车
                        CartItem item = new CartItem();
                        item.setDrug(currentDrug);
                        item.setQuantity(quantity);
                        CartManager.getInstance(context).addItem(item);
                        
                        view.showAddCartSuccess();
                        view.updateCartBadge(CartManager.getInstance(context).getCartCount());
                    } else {
                        view.showError(response.getMessage());
                    }
                }
                
                @Override
                public void onError(Throwable e) {
                    ErrorHandler.handleError(e, view);
                }
                
                @Override
                public void onComplete() {
                    // 完成
                }
            });
    }
    
    @Override
    public void buyNow(int quantity) {
        if (currentDrug == null) {
            view.showError("药品信息加载中");
            return;
        }
        
        // 验证库存
        if (quantity > currentDrug.getStock()) {
            view.showError("库存不足");
            return;
        }
        
        view.navigateToCheckout(drugId, quantity);
    }
}
```

## 数据流设计

### 页面加载流程

```
用户进入详情页
    ↓
Activity.onCreate()
    ↓
Presenter.loadDrugDetail()
    ↓
显示加载动画
    ↓
API 请求药品详情
    ↓
成功? ─No→ 显示错误提示
    ↓ Yes
隐藏加载动画
    ↓
View.showDrugDetail()
    ↓
展示药品信息
    ↓
Presenter.loadRecommendDrugs()
    ↓
API 请求推荐药品
    ↓
成功? ─No→ 忽略(不影响主流程)
    ↓ Yes
View.showRecommendDrugs()
    ↓
展示推荐列表
```

### 加入购物车流程

```
用户点击"加入购物车"
    ↓
显示数量选择弹窗
    ↓
用户选择数量并确认
    ↓
Presenter.addToCart(quantity)
    ↓
验证库存
    ↓
库存充足? ─No→ 显示库存不足提示
    ↓ Yes
API 请求添加到购物车
    ↓
成功? ─No→ 显示错误提示
    ↓ Yes
更新本地购物车
    ↓
显示成功提示
    ↓
更新购物车角标
    ↓
关闭弹窗
```

## 正确性属性

*属性是一个特征或行为,应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。*

### Property 1: 药品信息完整性

*对于任意*药品详情页,显示的药品信息应该包含名称、价格、规格、厂家等所有必需字段

**验证: 需求 1.1**

### Property 2: 图片加载降级

*对于任意*图片加载失败的情况,应该显示默认占位图而不是空白或崩溃

**验证: 需求 2.3**

### Property 3: 数量选择范围

*对于任意*数量选择操作,选择的数量应该在 [1, min(999, 库存)] 范围内

**验证: 需求 7.2, 7.3, 7.5**

### Property 4: 购物车数量一致性

*对于任意*加入购物车操作成功后,购物车角标显示的数量应该等于购物车中所有商品数量的总和

**验证: 需求 5.3**

### Property 5: 库存验证

*对于任意*购买操作,当选择数量超过库存时,应该禁止操作并提示库存不足

**验证: 需求 5.5, 6.4**

## 错误处理

### 网络错误

```java
/**
 * 处理网络错误
 */
private void handleNetworkError(Throwable throwable) {
    if (throwable instanceof HttpException) {
        HttpException httpException = (HttpException) throwable;
        switch (httpException.code()) {
            case 404:
                view.showError("药品不存在");
                break;
            case 500:
                view.showError("服务器错误,请稍后重试");
                break;
            default:
                view.showError("网络请求失败");
        }
    } else if (throwable instanceof SocketTimeoutException) {
        view.showError("网络超时,请检查网络连接");
    } else {
        view.showError("加载失败: " + throwable.getMessage());
    }
}
```

### 数据验证

```java
/**
 * 验证购买数量
 */
private boolean validateQuantity(int quantity, int stock) {
    if (quantity < 1) {
        view.showError("购买数量不能小于1");
        return false;
    }
    if (quantity > 999) {
        view.showError("购买数量不能超过999");
        return false;
    }
    if (quantity > stock) {
        view.showError("库存不足,当前库存: " + stock);
        return false;
    }
    return true;
}
```

## 测试策略

### 单元测试

```java
/**
 * DrugDetailPresenter 单元测试
 */
@Test
public void testLoadDrugDetail_Success() {
    // Given
    Drug mockDrug = createMockDrug();
    when(apiService.getDrugDetail(anyString()))
        .thenReturn(Observable.just(BaseResponse.success(mockDrug)));
    
    // When
    presenter.loadDrugDetail();
    
    // Then
    verify(view).showLoading();
    verify(view).hideLoading();
    verify(view).showDrugDetail(mockDrug);
}

@Test
public void testAddToCart_StockInsufficient() {
    // Given
    Drug mockDrug = createMockDrug();
    mockDrug.setStock(5);
    presenter.currentDrug = mockDrug;
    
    // When
    presenter.addToCart(10);
    
    // Then
    verify(view).showError("库存不足");
    verify(apiService, never()).addToCart(any());
}
```

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
