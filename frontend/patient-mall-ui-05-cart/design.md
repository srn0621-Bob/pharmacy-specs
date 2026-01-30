# 设计文档: 患者端药房商城UI - 购物车页面

## 概述

本文档描述患者端药房商城购物车页面的设计方案,包括页面布局、适配器设计、数据流和交互逻辑。

### 设计目标

1. **操作便捷**: 提供流畅的商品管理体验
2. **信息清晰**: 清晰展示价格和优惠信息
3. **性能优化**: 优化列表滚动和价格计算性能
4. **视觉统一**: 与现有应用风格保持一致

### 技术选型

- **架构模式**: MVP (Model-View-Presenter)
- **列表组件**: RecyclerView + BaseRecyclerViewAdapterHelper
- **下拉刷新**: SwipeRefreshLayout
- **侧滑删除**: ItemTouchHelper

## 架构设计

### 页面结构

```
CartFragment
├── SwipeRefreshLayout (下拉刷新)
│   └── RecyclerView (购物车列表)
│       ├── CartItem (购物车商品项)
│       └── RecommendSection (推荐商品)
├── EmptyStateView (空状态)
└── BottomBar (底部操作栏)
    ├── 全选复选框
    ├── 总价显示
    └── 去结算按钮
```

## 组件设计

### 1. CartFragment 布局

```xml
<!-- fragment_cart.xml -->
<androidx.coordinatorlayout.widget.CoordinatorLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    
    <!-- 下拉刷新 -->
    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipe_refresh"
        android:layout_width="match_parent"
        android:layout_height="match_parent">
        
        <androidx.recyclerview.widget.RecyclerView
            android:id="@+id/rv_cart"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:background="@color/colorBackground"/>
        
    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
    
    <!-- 空状态 -->
    <include layout="@layout/include_empty_state"
        android:id="@+id/empty_state"
        android:visibility="gone"/>
    
    <!-- 底部操作栏 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom"
        android:orientation="horizontal"
        android:background="@color/colorWhite"
        android:elevation="4dp"
        android:padding="@dimen/spacing_normal"
        android:gravity="center_vertical">
        
        <CheckBox
            android:id="@+id/cb_select_all"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="全选"/>
        
        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="@dimen/spacing_normal"
            android:orientation="vertical">
            
            <LinearLayout
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:orientation="horizontal"
                android:gravity="center_vertical">
                
                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="合计:"
                    android:textSize="@dimen/text_size_normal"
                    android:textColor="@color/colorTextPrimary"/>
                
                <TextView
                    android:id="@+id/tv_total_price"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/spacing_small"
                    style="@style/PriceStyle"/>
                
            </LinearLayout>
            
            <TextView
                android:id="@+id/tv_shipping_hint"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="@dimen/spacing_tiny"
                android:textSize="@dimen/text_size_tiny"
                android:textColor="@color/colorTextHint"/>
            
        </LinearLayout>
        
        <Button
            android:id="@+id/btn_checkout"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="去结算"
            android:minWidth="100dp"
            style="@style/ButtonPrimary"/>
        
    </LinearLayout>
    
</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

### 2. 购物车项布局

```xml
<!-- item_cart.xml -->
<androidx.cardview.widget.CardView
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="@dimen/spacing_small"
    style="@style/CardStyle">
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:padding="@dimen/spacing_normal"
        android:gravity="center_vertical">
        
        <!-- 选择框 -->
        <CheckBox
            android:id="@+id/cb_select"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"/>
        
        <!-- 药品图片 -->
        <ImageView
            android:id="@+id/iv_drug_image"
            android:layout_width="@dimen/image_size_medium"
            android:layout_height="@dimen/image_size_medium"
            android:layout_marginStart="@dimen/spacing_small"
            android:scaleType="centerCrop"/>
        
        <!-- 药品信息 -->
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
                android:textSize="@dimen/text_size_normal"
                android:textColor="@color/colorTextPrimary"
                android:maxLines="2"
                android:ellipsize="end"/>
            
            <TextView
                android:id="@+id/tv_drug_spec"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="@dimen/spacing_tiny"
                android:textSize="@dimen/text_size_small"
                android:textColor="@color/colorTextSecondary"/>
            
            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="@dimen/spacing_small"
                android:orientation="horizontal"
                android:gravity="center_vertical">
                
                <TextView
                    android:id="@+id/tv_price"
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    style="@style/PriceStyle"/>
                
                <!-- 数量选择器 -->
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
                    
                    <TextView
                        android:id="@+id/tv_quantity"
                        android:layout_width="40dp"
                        android:layout_height="@dimen/button_height_small"
                        android:layout_marginStart="@dimen/spacing_small"
                        android:layout_marginEnd="@dimen/spacing_small"
                        android:gravity="center"
                        android:textSize="@dimen/text_size_normal"
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
            
        </LinearLayout>
        
    </LinearLayout>
    
</androidx.cardview.widget.CardView>
```

### 3. CartPresenter 实现

```java
/**
 * 购物车 Presenter 实现类
 */
public class CartPresenterImpl implements CartPresenter {
    
    private CartView view;
    private MallApiService apiService;
    private List<CartItem> cartItems;
    
    @Override
    public void loadCartList() {
        view.showLoading();
        
        apiService.getCartList()
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(new Observer<BaseResponse<List<CartItem>>>() {
                @Override
                public void onNext(BaseResponse<List<CartItem>> response) {
                    view.hideLoading();
                    if (response.isSuccess()) {
                        cartItems = response.getData();
                        if (cartItems == null || cartItems.isEmpty()) {
                            view.showEmptyCart();
                        } else {
                            view.showCartList(cartItems);
                            updateTotalPrice();
                        }
                    } else {
                        view.showError(response.getMessage());
                    }
                }
                
                @Override
                public void onError(Throwable e) {
                    view.hideLoading();
                    ErrorHandler.handleError(e, view);
                }
            });
    }
    
    @Override
    public void selectItem(String itemId, boolean selected) {
        for (CartItem item : cartItems) {
            if (item.getId().equals(itemId)) {
                item.setSelected(selected);
                break;
            }
        }
        updateTotalPrice();
    }
    
    @Override
    public void selectAll(boolean selected) {
        for (CartItem item : cartItems) {
            item.setSelected(selected);
        }
        updateTotalPrice();
    }
    
    @Override
    public void updateQuantity(String itemId, int quantity) {
        UpdateQuantityRequest request = new UpdateQuantityRequest(quantity);
        
        apiService.updateCartQuantity(itemId, request)
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(new Observer<BaseResponse<Void>>() {
                @Override
                public void onNext(BaseResponse<Void> response) {
                    if (response.isSuccess()) {
                        // 更新本地数据
                        for (CartItem item : cartItems) {
                            if (item.getId().equals(itemId)) {
                                item.setQuantity(quantity);
                                break;
                            }
                        }
                        updateTotalPrice();
                    } else {
                        view.showError(response.getMessage());
                    }
                }
                
                @Override
                public void onError(Throwable e) {
                    ErrorHandler.handleError(e, view);
                }
            });
    }
    
    @Override
    public void deleteItem(String itemId) {
        apiService.deleteCartItem(itemId)
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(new Observer<BaseResponse<Void>>() {
                @Override
                public void onNext(BaseResponse<Void> response) {
                    if (response.isSuccess()) {
                        // 从列表中移除
                        cartItems.removeIf(item -> item.getId().equals(itemId));
                        if (cartItems.isEmpty()) {
                            view.showEmptyCart();
                        } else {
                            view.showCartList(cartItems);
                            updateTotalPrice();
                        }
                    } else {
                        view.showError(response.getMessage());
                    }
                }
                
                @Override
                public void onError(Throwable e) {
                    ErrorHandler.handleError(e, view);
                }
            });
    }
    
    @Override
    public void checkout(List<String> selectedItemIds) {
        if (selectedItemIds == null || selectedItemIds.isEmpty()) {
            view.showError("请选择要结算的商品");
            return;
        }
        view.navigateToCheckout(selectedItemIds);
    }
    
    private void updateTotalPrice() {
        BigDecimal totalPrice = PriceCalculator.calculateTotalPrice(cartItems);
        view.updateTotalPrice(totalPrice);
    }
}
```

## 正确性属性

### Property 1: 价格计算正确性

*对于任意*购物车商品列表,总价应该等于所有选中商品的(单价 × 数量)之和

**验证: 需求 5.1, 5.2**

### Property 2: 全选状态一致性

*对于任意*购物车状态,当所有商品都被选中时,"全选"复选框应该被勾选

**验证: 需求 2.4, 2.5**

### Property 3: 数量修改范围

*对于任意*数量修改操作,修改后的数量应该在 [1, min(999, 库存)] 范围内

**验证: 需求 3.1, 3.2, 3.5**

## 测试策略

### 单元测试

```java
@Test
public void testCalculateTotalPrice() {
    List<CartItem> items = Arrays.asList(
        createCartItem("1", new BigDecimal("10.5"), 2, true),
        createCartItem("2", new BigDecimal("20.0"), 1, false)
    );
    
    BigDecimal totalPrice = PriceCalculator.calculateTotalPrice(items);
    
    assertEquals(new BigDecimal("21.0"), totalPrice);
}
```

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
