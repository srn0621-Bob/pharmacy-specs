# 设计文档: 患者端药房商城UI - 基础架构

## 概述

本文档描述患者端药房商城基础架构的设计方案,包括项目目录结构、数据模型类、API 接口定义、MVP 接口和基础工具类的详细设计。

### 设计目标

1. **清晰的目录结构**: 便于代码组织和维护
2. **完整的数据模型**: 支持所有业务场景
3. **标准的 API 接口**: 与后端服务无缝对接
4. **规范的 MVP 架构**: 实现清晰的分层
5. **实用的工具类**: 提供通用功能复用

### 技术选型

- **架构模式**: MVP (Model-View-Presenter)
- **网络框架**: Retrofit 2.2.0 + OkHttp 3.10.0
- **响应式编程**: RxJava 2.1.7 + RxAndroid 2.0.1
- **图片加载**: Glide
- **数据存储**: SharedPreferences

## 架构设计

### 目录结构设计

```
app/src/main/java/com/adinnet/demo/
└── mall/                          # 药品商城模块
    ├── activity/                  # Activity 层
    ├── fragment/                  # Fragment 层
    ├── adapter/                   # 适配器层
    ├── presenter/                 # Presenter 层
    ├── view/                      # View 接口层
    ├── model/                     # 数据模型层
    ├── api/                       # API 接口层
    └── util/                      # 工具类
```

### MVP 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Activity   │  │   Fragment   │  │    Adapter   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                  │                             │
│         └──────────┬───────┘                             │
│                    │                                     │
│         ┌──────────▼───────────┐                        │
│         │     Presenter        │                        │
│         └──────────┬───────────┘                        │
└────────────────────┼─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                     Data Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  API Client  │  │  Repository  │  │  Cache/DB    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## 数据模型设计

### 1. Drug (药品实体)

```java
package com.adinnet.demo.mall.model;

import java.math.BigDecimal;
import java.util.List;

/**
 * 药品实体类
 */
public class Drug {
    private String id;                  // 药品ID
    private String name;                // 药品名称
    private String brand;               // 品牌
    private BigDecimal price;           // 价格
    private BigDecimal originalPrice;   // 原价
    private String image;               // 主图URL
    private List<String> images;        // 图片列表
    private List<String> tags;          // 标签列表
    private Integer sales;              // 销量
    private String category;            // 分类
    private String specification;       // 规格
    private String manufacturer;        // 生产厂家
    private String description;         // 说明书
    private Integer stock;              // 库存
    private Boolean isFreeShipping;     // 是否包邮
    
    // Getter and Setter methods
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    // ... 其他 Getter 和 Setter 方法
}
```


### 2. CartItem (购物车项)

```java
package com.adinnet.demo.mall.model;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 购物车项实体类
 */
public class CartItem {
    private String id;                  // 购物车项ID
    private String userId;              // 用户ID
    private Drug drug;                  // 药品信息
    private Integer quantity;           // 数量
    private Boolean selected;           // 是否选中
    private Date createTime;            // 添加时间
    private Date updateTime;            // 更新时间
    
    /**
     * 计算小计
     */
    public BigDecimal getSubtotal() {
        if (drug == null || drug.getPrice() == null) {
            return BigDecimal.ZERO;
        }
        return drug.getPrice().multiply(new BigDecimal(quantity));
    }
    
    // Getter and Setter methods
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Drug getDrug() { return drug; }
    public void setDrug(Drug drug) { this.drug = drug; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public Boolean getSelected() { return selected; }
    public void setSelected(Boolean selected) { this.selected = selected; }
    
    // ... 其他 Getter 和 Setter 方法
}
```

### 3. Category (分类)

```java
package com.adinnet.demo.mall.model;

/**
 * 药品分类实体类
 */
public class Category {
    private String id;                  // 分类ID
    private String name;                // 分类名称
    private String icon;                // 图标URL
    private String color;               // 颜色代码
    private Integer sort;               // 排序
    private Integer drugCount;          // 药品数量
    
    // Getter and Setter methods
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    // ... 其他 Getter 和 Setter 方法
}
```

### 4. Order (订单)

```java
package com.adinnet.demo.mall.model;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * 订单实体类
 */
public class Order {
    private String id;                  // 订单ID
    private String orderNo;             // 订单号
    private String userId;              // 用户ID
    private List<OrderItem> items;      // 订单项列表
    private BigDecimal goodsPrice;      // 商品总价
    private BigDecimal shippingFee;     // 运费
    private BigDecimal totalPrice;      // 订单总价
    private String addressId;           // 收货地址ID
    private Address address;            // 收货地址信息
    private String paymentMethod;       // 支付方式
    private String status;              // 订单状态
    private Date createTime;            // 创建时间
    
    // Getter and Setter methods
    // ... 省略
}

/**
 * 订单项实体类
 */
public class OrderItem {
    private String drugId;              // 药品ID
    private String drugName;            // 药品名称
    private String drugImage;           // 药品图片
    private BigDecimal price;           // 单价
    private Integer quantity;           // 数量
    private BigDecimal subtotal;        // 小计
    
    // Getter and Setter methods
    // ... 省略
}
```

### 5. Address (收货地址)

```java
package com.adinnet.demo.mall.model;

/**
 * 收货地址实体类
 */
public class Address {
    private String id;                  // 地址ID
    private String userId;              // 用户ID
    private String receiverName;        // 收货人姓名
    private String receiverPhone;       // 收货人电话
    private String province;            // 省份
    private String city;                // 城市
    private String district;            // 区县
    private String detail;              // 详细地址
    private Boolean isDefault;          // 是否默认地址
    
    /**
     * 获取完整地址
     */
    public String getFullAddress() {
        return province + city + district + detail;
    }
    
    // Getter and Setter methods
    // ... 省略
}
```

## API 接口设计

### MallApiService 接口

```java
package com.adinnet.demo.mall.api;

import com.adinnet.demo.mall.model.*;
import io.reactivex.Observable;
import retrofit2.http.*;

/**
 * 药品商城 API 服务接口
 */
public interface MallApiService {
    
    /**
     * 获取首页数据
     */
    @GET("mall/home")
    Observable<BaseResponse<MallHomeData>> getHomeData();
    
    /**
     * 获取药品分类列表
     */
    @GET("mall/categories")
    Observable<BaseResponse<List<Category>>> getCategories();
    
    /**
     * 按分类查询药品
     */
    @GET("mall/drugs/category/{categoryId}")
    Observable<BaseResponse<PageResult<Drug>>> getDrugsByCategory(
        @Path("categoryId") String categoryId,
        @Query("page") int page,
        @Query("size") int size
    );
    
    /**
     * 搜索药品
     */
    @GET("mall/drugs/search")
    Observable<BaseResponse<PageResult<Drug>>> searchDrugs(
        @Query("keyword") String keyword,
        @Query("page") int page,
        @Query("size") int size
    );
    
    /**
     * 获取药品详情
     */
    @GET("mall/drugs/{drugId}")
    Observable<BaseResponse<Drug>> getDrugDetail(
        @Path("drugId") String drugId
    );
    
    /**
     * 获取相关推荐
     */
    @GET("mall/drugs/{drugId}/recommend")
    Observable<BaseResponse<List<Drug>>> getRecommendDrugs(
        @Path("drugId") String drugId
    );
    
    /**
     * 添加到购物车
     */
    @POST("mall/cart/add")
    Observable<BaseResponse<Void>> addToCart(
        @Body AddCartRequest request
    );
    
    /**
     * 获取购物车列表
     */
    @GET("mall/cart")
    Observable<BaseResponse<List<CartItem>>> getCartList();
    
    /**
     * 更新购物车项数量
     */
    @PUT("mall/cart/{itemId}/quantity")
    Observable<BaseResponse<Void>> updateCartQuantity(
        @Path("itemId") String itemId,
        @Body UpdateQuantityRequest request
    );
    
    /**
     * 删除购物车项
     */
    @DELETE("mall/cart/{itemId}")
    Observable<BaseResponse<Void>> deleteCartItem(
        @Path("itemId") String itemId
    );
    
    /**
     * 创建订单
     */
    @POST("mall/orders")
    Observable<BaseResponse<Order>> createOrder(
        @Body CreateOrderRequest request
    );
    
    /**
     * 获取订单详情
     */
    @GET("mall/orders/{orderId}")
    Observable<BaseResponse<Order>> getOrderDetail(
        @Path("orderId") String orderId
    );
}
```


## MVP 接口设计

### View 接口

```java
package com.adinnet.demo.mall.view;

/**
 * 商城首页 View 接口
 */
public interface MallHomeView {
    void showLoading();
    void hideLoading();
    void showHomeData(MallHomeData data);
    void showError(String message);
    void navigateToDrugDetail(String drugId);
    void navigateToCategoryList(String categoryId);
}

/**
 * 药品详情 View 接口
 */
public interface DrugDetailView {
    void showLoading();
    void hideLoading();
    void showDrugDetail(Drug drug);
    void showRecommendDrugs(List<Drug> drugs);
    void showAddCartSuccess();
    void showError(String message);
    void navigateToCart();
    void navigateToCheckout(String drugId, int quantity);
}

/**
 * 购物车 View 接口
 */
public interface CartView {
    void showLoading();
    void hideLoading();
    void showCartList(List<CartItem> items);
    void showEmptyCart();
    void updateTotalPrice(BigDecimal totalPrice);
    void showError(String message);
    void navigateToCheckout(List<String> selectedItemIds);
}

/**
 * 结算 View 接口
 */
public interface CheckoutView {
    void showLoading();
    void hideLoading();
    void showCheckoutData(CheckoutData data);
    void showAddressInfo(Address address);
    void showError(String message);
    void navigateToPayment(String orderId);
}
```

### Presenter 接口

```java
package com.adinnet.demo.mall.presenter;

/**
 * 商城首页 Presenter 接口
 */
public interface MallHomePresenter {
    void loadHomeData();
    void refreshHomeData();
    void onDrugClick(Drug drug);
    void onCategoryClick(Category category);
}

/**
 * 药品详情 Presenter 接口
 */
public interface DrugDetailPresenter {
    void loadDrugDetail(String drugId);
    void addToCart(String drugId, int quantity);
    void buyNow(String drugId, int quantity);
    void loadRecommendDrugs(String drugId);
}

/**
 * 购物车 Presenter 接口
 */
public interface CartPresenter {
    void loadCartList();
    void selectItem(String itemId, boolean selected);
    void selectAll(boolean selected);
    void updateQuantity(String itemId, int quantity);
    void deleteItem(String itemId);
    void checkout(List<String> selectedItemIds);
}

/**
 * 结算 Presenter 接口
 */
public interface CheckoutPresenter {
    void loadCheckoutData(List<String> cartItemIds);
    void selectAddress(String addressId);
    void selectPaymentMethod(String paymentMethod);
    void submitOrder();
}
```

## 工具类设计

### 1. CartManager (购物车管理)

```java
package com.adinnet.demo.mall.util;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.util.ArrayList;
import java.util.List;

/**
 * 购物车管理类
 * 使用 SharedPreferences 本地存储购物车数据
 */
public class CartManager {
    
    private static final String PREF_NAME = "mall_cart";
    private static final String KEY_CART_ITEMS = "cart_items";
    
    private static CartManager instance;
    private SharedPreferences preferences;
    private Gson gson;
    
    private CartManager(Context context) {
        preferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        gson = new Gson();
    }
    
    public static CartManager getInstance(Context context) {
        if (instance == null) {
            synchronized (CartManager.class) {
                if (instance == null) {
                    instance = new CartManager(context.getApplicationContext());
                }
            }
        }
        return instance;
    }
    
    /**
     * 添加商品到购物车
     */
    public void addItem(CartItem item) {
        List<CartItem> items = getCartItems();
        
        // 检查是否已存在
        boolean exists = false;
        for (CartItem existingItem : items) {
            if (existingItem.getDrug().getId().equals(item.getDrug().getId())) {
                // 已存在,增加数量
                existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            items.add(item);
        }
        
        saveCartItems(items);
    }
    
    /**
     * 删除购物车项
     */
    public void removeItem(String itemId) {
        List<CartItem> items = getCartItems();
        items.removeIf(item -> item.getId().equals(itemId));
        saveCartItems(items);
    }
    
    /**
     * 更新购物车项数量
     */
    public void updateQuantity(String itemId, int quantity) {
        List<CartItem> items = getCartItems();
        for (CartItem item : items) {
            if (item.getId().equals(itemId)) {
                item.setQuantity(quantity);
                break;
            }
        }
        saveCartItems(items);
    }
    
    /**
     * 获取购物车列表
     */
    public List<CartItem> getCartItems() {
        String json = preferences.getString(KEY_CART_ITEMS, "[]");
        return gson.fromJson(json, new TypeToken<List<CartItem>>(){}.getType());
    }
    
    /**
     * 获取购物车商品总数
     */
    public int getCartCount() {
        List<CartItem> items = getCartItems();
        int count = 0;
        for (CartItem item : items) {
            count += item.getQuantity();
        }
        return count;
    }
    
    /**
     * 清空购物车
     */
    public void clearCart() {
        preferences.edit().remove(KEY_CART_ITEMS).apply();
    }
    
    /**
     * 保存购物车数据
     */
    private void saveCartItems(List<CartItem> items) {
        String json = gson.toJson(items);
        preferences.edit().putString(KEY_CART_ITEMS, json).apply();
    }
}
```

### 2. PriceCalculator (价格计算)

```java
package com.adinnet.demo.mall.util;

import com.adinnet.demo.mall.model.CartItem;
import java.math.BigDecimal;
import java.util.List;

/**
 * 价格计算工具类
 */
public class PriceCalculator {
    
    // 包邮门槛
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("99.00");
    // 运费
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("6.00");
    
    /**
     * 计算购物车总价(仅计算选中的商品)
     */
    public static BigDecimal calculateTotalPrice(List<CartItem> items) {
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : items) {
            if (item.getSelected() != null && item.getSelected()) {
                total = total.add(item.getSubtotal());
            }
        }
        return total;
    }
    
    /**
     * 计算运费
     * 规则: 满99包邮,否则运费6元
     */
    public static BigDecimal calculateShippingFee(BigDecimal goodsPrice) {
        if (goodsPrice.compareTo(FREE_SHIPPING_THRESHOLD) >= 0) {
            return BigDecimal.ZERO;
        }
        return SHIPPING_FEE;
    }
    
    /**
     * 计算订单总价(商品总价 + 运费)
     */
    public static BigDecimal calculateOrderTotal(BigDecimal goodsPrice, BigDecimal shippingFee) {
        return goodsPrice.add(shippingFee);
    }
    
    /**
     * 计算选中商品数量
     */
    public static int calculateSelectedCount(List<CartItem> items) {
        int count = 0;
        for (CartItem item : items) {
            if (item.getSelected() != null && item.getSelected()) {
                count += item.getQuantity();
            }
        }
        return count;
    }
}
```

### 3. ImageLoader (图片加载)

```java
package com.adinnet.demo.mall.util;

import android.content.Context;
import android.widget.ImageView;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.load.resource.bitmap.RoundedCorners;
import com.adinnet.demo.R;

/**
 * 图片加载工具类
 * 封装 Glide 图片加载功能
 */
public class ImageLoader {
    
    /**
     * 加载药品图片
     */
    public static void loadDrugImage(Context context, String url, ImageView imageView) {
        Glide.with(context)
            .load(url)
            .placeholder(R.drawable.ic_drug_placeholder)
            .error(R.drawable.ic_drug_error)
            .diskCacheStrategy(DiskCacheStrategy.ALL)
            .transform(new RoundedCorners(16))
            .into(imageView);
    }
    
    /**
     * 加载缩略图
     */
    public static void loadThumbnail(Context context, String url, ImageView imageView) {
        Glide.with(context)
            .load(url)
            .placeholder(R.drawable.ic_drug_placeholder)
            .error(R.drawable.ic_drug_error)
            .override(200, 200)
            .diskCacheStrategy(DiskCacheStrategy.ALL)
            .into(imageView);
    }
    
    /**
     * 加载圆形图片
     */
    public static void loadCircleImage(Context context, String url, ImageView imageView) {
        Glide.with(context)
            .load(url)
            .placeholder(R.drawable.ic_avatar_placeholder)
            .error(R.drawable.ic_avatar_error)
            .circleCrop()
            .diskCacheStrategy(DiskCacheStrategy.ALL)
            .into(imageView);
    }
}
```

## 正确性属性

*属性是一个特征或行为,应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。*

### Property 1: 数据模型完整性

*对于任意*数据模型类,所有必需字段都应该有对应的 Getter 和 Setter 方法

**验证: 需求 2.6**

### Property 2: 购物车数量一致性

*对于任意*购物车状态,CartManager 返回的商品总数应该等于所有购物车项的数量之和

**验证: 需求 5.1**

### Property 3: 价格计算正确性

*对于任意*购物车商品列表,PriceCalculator 计算的总价应该等于所有选中商品的(单价 × 数量)之和

**验证: 需求 5.2**

### Property 4: 运费计算规则

*对于任意*商品总价,当总价 >= 99 时运费为 0,否则运费为 6

**验证: 需求 5.2**

## 错误处理

### 数据验证

```java
/**
 * 数据验证工具类
 */
public class ValidationUtil {
    
    /**
     * 验证购物车数量
     */
    public static boolean validateCartQuantity(int quantity) {
        return quantity > 0 && quantity <= 999;
    }
    
    /**
     * 验证价格
     */
    public static boolean validatePrice(BigDecimal price) {
        return price != null && price.compareTo(BigDecimal.ZERO) > 0;
    }
}
```

## 测试策略

### 单元测试

#### 数据模型测试

```java
/**
 * CartItem 单元测试
 */
public class CartItemTest {
    
    @Test
    public void testGetSubtotal() {
        // Given
        Drug drug = new Drug();
        drug.setPrice(new BigDecimal("10.5"));
        
        CartItem item = new CartItem();
        item.setDrug(drug);
        item.setQuantity(2);
        
        // When
        BigDecimal subtotal = item.getSubtotal();
        
        // Then
        assertEquals(new BigDecimal("21.0"), subtotal);
    }
}
```

#### 工具类测试

```java
/**
 * PriceCalculator 单元测试
 */
public class PriceCalculatorTest {
    
    @Test
    public void testCalculateTotalPrice() {
        // Given
        List<CartItem> items = Arrays.asList(
            createCartItem("1", new BigDecimal("10.5"), 2, true),
            createCartItem("2", new BigDecimal("20.0"), 1, true),
            createCartItem("3", new BigDecimal("15.0"), 3, false)
        );
        
        // When
        BigDecimal totalPrice = PriceCalculator.calculateTotalPrice(items);
        
        // Then
        assertEquals(new BigDecimal("41.0"), totalPrice);
    }
    
    @Test
    public void testCalculateShippingFee_FreeShipping() {
        // Given
        BigDecimal goodsPrice = new BigDecimal("100.0");
        
        // When
        BigDecimal shippingFee = PriceCalculator.calculateShippingFee(goodsPrice);
        
        // Then
        assertEquals(BigDecimal.ZERO, shippingFee);
    }
    
    @Test
    public void testCalculateShippingFee_WithFee() {
        // Given
        BigDecimal goodsPrice = new BigDecimal("50.0");
        
        // When
        BigDecimal shippingFee = PriceCalculator.calculateShippingFee(goodsPrice);
        
        // Then
        assertEquals(new BigDecimal("6.0"), shippingFee);
    }
}
```

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
