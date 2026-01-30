# 患者端药房商城 UI - 完整实施指南

## 📋 文档说明

本文档提供 Spec 5-11 的**完整实施蓝图**,包含:
- 每个文件的核心代码框架
- 关键逻辑实现要点
- 快速实施步骤

开发者可以直接复制代码框架,填充业务逻辑即可完成实施。

---

## Spec 5: 购物车页面 (剩余 80%)

### 文件 1: CartItemAdapter.java

```java
package com.adinnet.demo.mall.adapter;

import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.TextView;
import com.adinnet.demo.R;
import com.adinnet.demo.mall.model.CartItem;
import com.adinnet.demo.mall.util.ImageLoader;
import com.chad.library.adapter.base.BaseQuickAdapter;
import com.chad.library.adapter.base.BaseViewHolder;

/**
 * 购物车项适配器
 */
public class CartItemAdapter extends BaseQuickAdapter<CartItem, BaseViewHolder> {
    
    private OnQuantityChangeListener quantityChangeListener;
    
    public interface OnQuantityChangeListener {
        void onIncrease(CartItem item, int position);
        void onDecrease(CartItem item, int position);
    }
    
    public CartItemAdapter() {
        super(R.layout.item_cart);
    }
    
    @Override
    protected void convert(BaseViewHolder helper, CartItem item) {
        // 选择框
        CheckBox cbSelect = helper.getView(R.id.cb_select);
        cbSelect.setChecked(item.getSelected() != null && item.getSelected());
        cbSelect.setOnCheckedChangeListener((buttonView, isChecked) -> {
            item.setSelected(isChecked);
            if (getOnItemChildClickListener() != null) {
                getOnItemChildClickListener().onItemChildClick(
                    this, buttonView, helper.getAdapterPosition());
            }
        });
        
        // 药品图片
        ImageView ivImage = helper.getView(R.id.iv_drug_image);
        if (item.getDrug() != null) {
            ImageLoader.loadDrugImage(mContext, item.getDrug().getImage(), ivImage);
            helper.setText(R.id.tv_drug_name, item.getDrug().getName());
            helper.setText(R.id.tv_drug_price, "¥" + item.getDrug().getPrice());
        }
        
        // 数量
        helper.setText(R.id.tv_quantity, String.valueOf(item.getQuantity()));
        
        // 数量按钮
        helper.addOnClickListener(R.id.tv_increase);
        helper.addOnClickListener(R.id.tv_decrease);
    }
    
    public void setOnQuantityChangeListener(OnQuantityChangeListener listener) {
        this.quantityChangeListener = listener;
    }
}
```

### 文件 2: CartPresenterImpl.java

```java
package com.adinnet.demo.mall.presenter.impl;

import com.adinnet.demo.base.LifePresenter;
import com.adinnet.demo.mall.model.CartItem;
import com.adinnet.demo.mall.presenter.CartPresenter;
import com.adinnet.demo.mall.util.CartManager;
import com.adinnet.demo.mall.util.PriceCalculator;
import com.adinnet.demo.mall.view.CartView;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * 购物车 Presenter 实现
 */
public class CartPresenterImpl extends LifePresenter<CartView> implements CartPresenter {
    
    private CartManager cartManager;
    private List<CartItem> cartItems = new ArrayList<>();
    
    public void setCartManager(CartManager cartManager) {
        this.cartManager = cartManager;
    }
    
    @Override
    public void loadCartList() {
        if (!isViewAttached() || cartManager == null) return;
        
        cartItems = cartManager.getCartItems();
        if (cartItems.isEmpty()) {
            getView().showEmptyCart();
        } else {
            getView().showCartList(cartItems);
            updateTotalPrice();
        }
    }
    
    @Override
    public void selectItem(String itemId, boolean selected) {
        if (cartManager == null) return;
        
        for (CartItem item : cartItems) {
            if (item.getId().equals(itemId)) {
                item.setSelected(selected);
                break;
            }
        }
        cartManager.getCartItems().clear();
        cartManager.getCartItems().addAll(cartItems);
        updateTotalPrice();
    }
    
    @Override
    public void selectAll(boolean selected) {
        for (CartItem item : cartItems) {
            item.setSelected(selected);
        }
        if (isViewAttached()) {
            getView().showCartList(cartItems);
            updateTotalPrice();
        }
    }
    
    @Override
    public void updateQuantity(String itemId, int quantity) {
        if (cartManager == null || quantity < 1) return;
        
        cartManager.updateQuantity(itemId, quantity);
        loadCartList();
    }
    
    @Override
    public void deleteItem(String itemId) {
        if (cartManager == null) return;
        
        cartManager.removeItem(itemId);
        loadCartList();
    }
    
    @Override
    public void checkout(List<String> selectedItemIds) {
        if (!isViewAttached() || selectedItemIds.isEmpty()) {
            getView().showError("请选择要结算的商品");
            return;
        }
        
        // 跳转到结算页面
        // TODO: 传递选中的商品ID列表
    }
    
    private void updateTotalPrice() {
        if (!isViewAttached()) return;
        
        BigDecimal totalPrice = PriceCalculator.calculateTotalPrice(cartItems);
        getView().updateTotalPrice(totalPrice);
    }
}
```

### 文件 3: CartFragment.java

```java
package com.adinnet.demo.mall.fragment;

import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.TextView;
import com.adinnet.demo.R;
import com.adinnet.demo.base.BaseMvpFragment;
import com.adinnet.demo.mall.adapter.CartItemAdapter;
import com.adinnet.demo.mall.model.CartItem;
import com.adinnet.demo.mall.presenter.CartPresenter;
import com.adinnet.demo.mall.presenter.impl.CartPresenterImpl;
import com.adinnet.demo.mall.util.CartManager;
import com.adinnet.demo.mall.view.CartView;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

/**
 * 购物车 Fragment
 */
public class CartFragment extends BaseMvpFragment<CartView, CartPresenter> implements CartView {
    
    @BindView(R.id.srl_cart) SwipeRefreshLayout srlRefresh;
    @BindView(R.id.rv_cart) RecyclerView rvCart;
    @BindView(R.id.cb_select_all) CheckBox cbSelectAll;
    @BindView(R.id.tv_total_price) TextView tvTotalPrice;
    @BindView(R.id.tv_shipping_tip) TextView tvShippingTip;
    @BindView(R.id.btn_checkout) Button btnCheckout;
    @BindView(R.id.include_empty) View emptyView;
    
    private CartItemAdapter adapter;
    
    public static CartFragment newInstance() {
        return new CartFragment();
    }
    
    @Override
    public CartPresenter createPresenter() {
        CartPresenterImpl presenter = new CartPresenterImpl();
        presenter.setCartManager(CartManager.getInstance(getContext()));
        return presenter;
    }
    
    @Override
    protected int getLayoutId() {
        return R.layout.fragment_cart;
    }
    
    @Override
    protected void initView(Bundle savedInstanceState) {
        ButterKnife.bind(this, getView());
        initRecyclerView();
        initRefreshLayout();
    }
    
    @Override
    protected void initData() {
        loadData();
    }
    
    private void initRecyclerView() {
        adapter = new CartItemAdapter();
        rvCart.setLayoutManager(new LinearLayoutManager(getContext()));
        rvCart.setAdapter(adapter);
        
        adapter.setOnItemChildClickListener((adapter, view, position) -> {
            CartItem item = this.adapter.getItem(position);
            if (view.getId() == R.id.cb_select && presenter != null) {
                presenter.selectItem(item.getId(), item.getSelected());
            } else if (view.getId() == R.id.tv_increase && presenter != null) {
                presenter.updateQuantity(item.getId(), item.getQuantity() + 1);
            } else if (view.getId() == R.id.tv_decrease && presenter != null) {
                if (item.getQuantity() > 1) {
                    presenter.updateQuantity(item.getId(), item.getQuantity() - 1);
                }
            }
        });
    }
    
    private void initRefreshLayout() {
        srlRefresh.setColorSchemeResources(R.color.mall_colorPrimary);
        srlRefresh.setOnRefreshListener(this::loadData);
    }
    
    private void loadData() {
        if (presenter != null) {
            presenter.loadCartList();
        }
    }
    
    @OnClick(R.id.cb_select_all)
    void onSelectAllClick() {
        if (presenter != null) {
            presenter.selectAll(cbSelectAll.isChecked());
        }
    }
    
    @OnClick(R.id.btn_checkout)
    void onCheckoutClick() {
        if (presenter != null && adapter != null) {
            List<String> selectedIds = new ArrayList<>();
            for (CartItem item : adapter.getData()) {
                if (item.getSelected() != null && item.getSelected()) {
                    selectedIds.add(item.getId());
                }
            }
            presenter.checkout(selectedIds);
        }
    }
    
    @Override
    public void showCartList(List<CartItem> items) {
        if (srlRefresh.isRefreshing()) {
            srlRefresh.setRefreshing(false);
        }
        emptyView.setVisibility(View.GONE);
        adapter.setNewData(items);
    }
    
    @Override
    public void showEmptyCart() {
        if (srlRefresh.isRefreshing()) {
            srlRefresh.setRefreshing(false);
        }
        emptyView.setVisibility(View.VISIBLE);
        adapter.setNewData(null);
    }
    
    @Override
    public void updateTotalPrice(BigDecimal totalPrice) {
        tvTotalPrice.setText("¥" + totalPrice.toString());
        
        BigDecimal shippingFee = PriceCalculator.calculateShippingFee(totalPrice);
        if (shippingFee.compareTo(BigDecimal.ZERO) == 0) {
            tvShippingTip.setText("已包邮");
        } else {
            BigDecimal remaining = new BigDecimal("99.00").subtract(totalPrice);
            tvShippingTip.setText("再买¥" + remaining + "包邮");
        }
    }
    
    @Override
    public void showError(String message) {
        // TODO: 显示错误提示
    }
    
    @Override
    public void navigateToCheckout(List<String> cartItemIds) {
        // TODO: 跳转到结算页面
    }
}
```

---

## Spec 6-11: 快速实施框架

由于篇幅限制,以下提供核心文件的**代码框架**和**关键实现要点**:

### Spec 6: 结算页面

**核心文件**:
1. `activity_checkout.xml` - 结算页布局
2. `CheckoutPresenterImpl.java` - Presenter 实现
3. `CheckoutActivity.java` - Activity 实现

**关键代码要点**:
```java
// CheckoutPresenterImpl.java 核心方法
- loadCheckoutData(List<String> cartItemIds): 加载结算数据
- selectAddress(String addressId): 选择收货地址
- selectPaymentMethod(String method): 选择支付方式
- submitOrder(): 提交订单,调用 API 创建订单
```

### Spec 7: 搜索功能

**核心文件**:
1. `activity_search.xml` - 搜索页布局
2. `SearchPresenterImpl.java` - Presenter 实现
3. `SearchActivity.java` - Activity 实现

**关键代码要点**:
```java
// SearchPresenterImpl.java 核心方法
- searchDrugs(String keyword): 调用 API 搜索药品
- loadSearchHistory(): 从 SharedPreferences 加载搜索历史
- saveSearchHistory(String keyword): 保存搜索历史
- clearSearchHistory(): 清空搜索历史
```

### Spec 8: 分类页面

**核心文件**:
1. `fragment_category.xml` - 分类页布局
2. `CategoryPresenterImpl.java` - Presenter 实现
3. `CategoryFragment.java` - Fragment 实现

**关键代码要点**:
```java
// CategoryFragment.java 核心逻辑
- 左侧分类列表使用 RecyclerView (LinearLayoutManager)
- 右侧药品列表使用 RecyclerView (GridLayoutManager, 2列)
- 点击左侧分类,右侧列表刷新对应药品
```

### Spec 9: 底部导航

**核心文件**:
1. `activity_main.xml` - 主页布局(包含 BottomNavigationView)
2. `MainActivity.java` - 主 Activity

**关键代码要点**:
```java
// MainActivity.java 核心逻辑
private void setupBottomNavigation() {
    bottomNav.setOnNavigationItemSelectedListener(item -> {
        switch (item.getItemId()) {
            case R.id.nav_home:
                showFragment(homeFragment);
                return true;
            case R.id.nav_category:
                showFragment(categoryFragment);
                return true;
            case R.id.nav_cart:
                showFragment(cartFragment);
                return true;
            case R.id.nav_mine:
                showFragment(mineFragment);
                return true;
        }
        return false;
    });
}
```

### Spec 10: 性能优化

**优化要点**:
```java
// 1. RecyclerView 优化
recyclerView.setHasFixedSize(true);
recyclerView.setItemViewCacheSize(20);
recyclerView.setDrawingCacheEnabled(true);

// 2. Glide 缓存配置
@GlideModule
public class MyGlideModule extends AppGlideModule {
    @Override
    public void applyOptions(Context context, GlideBuilder builder) {
        builder.setMemoryCache(new LruResourceCache(20 * 1024 * 1024));
        builder.setDiskCache(new InternalCacheDiskCacheFactory(context, 100 * 1024 * 1024));
    }
}

// 3. 列表滚动优化
recyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
    @Override
    public void onScrollStateChanged(RecyclerView recyclerView, int newState) {
        if (newState == RecyclerView.SCROLL_STATE_IDLE) {
            Glide.with(context).resumeRequests();
        } else {
            Glide.with(context).pauseRequests();
        }
    }
});
```

### Spec 11: 测试验收

**测试要点**:
```java
// 1. Presenter 单元测试示例
@Test
public void testCalculateTotalPrice() {
    List<CartItem> items = createMockCartItems();
    BigDecimal total = PriceCalculator.calculateTotalPrice(items);
    assertEquals(new BigDecimal("150.00"), total);
}

// 2. UI 测试示例 (Espresso)
@Test
public void testAddToCart() {
    onView(withId(R.id.btn_add_cart)).perform(click());
    onView(withText("加入购物车成功")).check(matches(isDisplayed()));
}
```

---

## 🚀 快速实施步骤

### 步骤 1: 完成购物车 (Spec 5)
```bash
1. 复制上面的 CartItemAdapter.java
2. 复制上面的 CartPresenterImpl.java
3. 复制上面的 CartFragment.java
4. 在 MainActivity 中集成 CartFragment
5. 测试购物车功能
```

### 步骤 2: 完成结算页面 (Spec 6)
```bash
1. 创建 activity_checkout.xml 布局
2. 实现 CheckoutPresenterImpl.java
3. 实现 CheckoutActivity.java
4. 从购物车跳转到结算页
5. 测试结算流程
```

### 步骤 3: 完成搜索功能 (Spec 7)
```bash
1. 创建 activity_search.xml 布局
2. 实现 SearchPresenterImpl.java
3. 实现 SearchActivity.java
4. 从首页搜索栏跳转到搜索页
5. 测试搜索功能
```

### 步骤 4: 完成分类页面 (Spec 8)
```bash
1. 创建 fragment_category.xml 布局
2. 实现 CategoryPresenterImpl.java
3. 实现 CategoryFragment.java
4. 在 MainActivity 中集成
5. 测试分类切换
```

### 步骤 5: 完成底部导航 (Spec 9)
```bash
1. 创建 activity_main.xml (包含 BottomNavigationView)
2. 实现 MainActivity.java
3. 集成所有 Fragment
4. 配置导航菜单
5. 测试页面切换
```

### 步骤 6: 性能优化 (Spec 10)
```bash
1. 配置 RecyclerView 优化参数
2. 配置 Glide 缓存
3. 实现列表滚动优化
4. 使用 LeakCanary 检查内存泄漏
5. 使用 Profiler 分析性能
```

### 步骤 7: 测试验收 (Spec 11)
```bash
1. 编写 Presenter 单元测试
2. 编写 UI 测试 (Espresso)
3. 手动测试所有功能
4. 修复发现的问题
5. 最终验收
```

---

## 📊 预计完成时间

| Spec | 预计时间 | 累计时间 |
|------|---------|---------|
| Spec 5 | 4-5h | 4-5h |
| Spec 6 | 3-4h | 7-9h |
| Spec 7 | 3-4h | 10-13h |
| Spec 8 | 2-3h | 12-16h |
| Spec 9 | 2-3h | 14-19h |
| Spec 10 | 3-4h | 17-23h |
| Spec 11 | 3-4h | 20-27h |

**总计**: 20-27 小时可完成所有剩余工作

---

## ✅ 验收清单

### 功能完整性
- [ ] 所有页面可以正常打开和关闭
- [ ] 所有按钮和交互功能正常工作
- [ ] 数据可以正确加载和显示
- [ ] 页面间跳转流畅

### 代码质量
- [ ] 遵循 MVP 架构模式
- [ ] 代码注释完整(中文)
- [ ] 命名规范统一
- [ ] 无明显内存泄漏
- [ ] 无崩溃和 ANR

### UI/UX
- [ ] 界面美观,符合设计规范
- [ ] 交互流畅,无卡顿
- [ ] 错误提示友好
- [ ] 适配不同屏幕尺寸
- [ ] 支持横竖屏切换

### 性能
- [ ] 列表滚动流畅 (60fps)
- [ ] 图片加载快速
- [ ] 内存占用合理
- [ ] 启动时间 < 3秒

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
