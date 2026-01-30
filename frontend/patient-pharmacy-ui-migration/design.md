# 设计文档: 患者端药房商城UI迁移

## 概述

本文档描述如何将 dingdang-pharmacy React Web 应用迁移到 mshlwyy_patient Android 应用的设计方案。迁移将采用 MVP 架构模式,使用现有的技术栈(Retrofit + RxJava + ButterKnife),并保持与现有应用的 UI 风格一致。

### 设计目标

1. **架构一致性**: 使用与现有应用相同的 MVP 架构模式
2. **代码复用**: 复用现有的网络层、工具类和公共组件
3. **风格统一**: UI 设计与现有应用保持一致
4. **性能优化**: 使用 RecyclerView、Glide 等优化性能
5. **可维护性**: 清晰的代码结构和完整的注释

### 技术选型

- **架构模式**: MVP (Model-View-Presenter)
- **网络框架**: Retrofit 2.2.0 + OkHttp 3.10.0
- **响应式编程**: RxJava 2.1.7 + RxAndroid 2.0.1
- **视图绑定**: ButterKnife 8.8.1
- **图片加载**: Glide (现有依赖)
- **列表组件**: RecyclerView + BaseRecyclerViewAdapterHelper 2.9.50
- **下拉刷新**: Ultra-ptr 1.0.11

## 架构设计

### 整体架构

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
│                    Business Layer                        │
│         ┌──────────────────────┐                        │
│         │       Service        │                        │
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

### 模块划分

```
app/src/main/java/com/adinnet/demo/
├── mall/                          # 药品商城模块
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


## 组件设计

### 1. 商城首页 (MallHomeFragment)

#### 功能描述
- 展示轮播图、分类导航、热销药品、推荐药品
- 支持下拉刷新
- 支持搜索入口

#### 组件结构

```java
/**
 * 药品商城首页 Fragment
 */
public class MallHomeFragment extends BaseFragment 
    implements MallHomeView, SwipeRefreshLayout.OnRefreshListener {
    
    @BindView(R.id.banner)
    Banner banner;
    
    @BindView(R.id.rv_category)
    RecyclerView rvCategory;
    
    @BindView(R.id.rv_hot_drugs)
    RecyclerView rvHotDrugs;
    
    @BindView(R.id.rv_recommend)
    RecyclerView rvRecommend;
    
    @BindView(R.id.swipe_refresh)
    SwipeRefreshLayout swipeRefresh;
    
    private MallHomePresenter presenter;
    private DrugListAdapter hotDrugsAdapter;
    private DrugListAdapter recommendAdapter;
    
    // 初始化、数据加载、事件处理等方法
}
```

#### 布局设计

```xml
<!-- fragment_mall_home.xml -->
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
    <androidx.core.widget.NestedScrollView>
        <LinearLayout orientation="vertical">
            <!-- 搜索栏 -->
            <include layout="@layout/include_search_bar"/>
            
            <!-- 轮播图 -->
            <com.youth.banner.Banner/>
            
            <!-- 分类导航 -->
            <androidx.recyclerview.widget.RecyclerView
                android:id="@+id/rv_category"
                android:layout_height="wrap_content"/>
            
            <!-- 热销药品 -->
            <include layout="@layout/include_section_title"/>
            <androidx.recyclerview.widget.RecyclerView
                android:id="@+id/rv_hot_drugs"/>
            
            <!-- 推荐药品 -->
            <include layout="@layout/include_section_title"/>
            <androidx.recyclerview.widget.RecyclerView
                android:id="@+id/rv_recommend"/>
        </LinearLayout>
    </androidx.core.widget.NestedScrollView>
</androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
```

### 2. 药品详情页 (DrugDetailActivity)

#### 功能描述
- 展示药品完整信息(图片、价格、规格、说明书)
- 支持加入购物车
- 支持立即购买
- 展示相关推荐

#### 组件结构

```java
/**
 * 药品详情页 Activity
 */
public class DrugDetailActivity extends BaseActivity 
    implements DrugDetailView {
    
    @BindView(R.id.banner)
    Banner banner;
    
    @BindView(R.id.tv_name)
    TextView tvName;
    
    @BindView(R.id.tv_price)
    TextView tvPrice;
    
    @BindView(R.id.tv_sales)
    TextView tvSales;
    
    @BindView(R.id.rv_specs)
    RecyclerView rvSpecs;
    
    @BindView(R.id.rv_recommend)
    RecyclerView rvRecommend;
    
    @BindView(R.id.btn_add_cart)
    Button btnAddCart;
    
    @BindView(R.id.btn_buy_now)
    Button btnBuyNow;
    
    private DrugDetailPresenter presenter;
    private String drugId;
    
    // 初始化、数据加载、事件处理等方法
}
```

### 3. 购物车页面 (CartFragment)

#### 功能描述
- 展示购物车商品列表
- 支持选中/取消选中
- 支持修改数量
- 支持删除商品
- 计算总价并结算

#### 组件结构

```java
/**
 * 购物车 Fragment
 */
public class CartFragment extends BaseFragment 
    implements CartView {
    
    @BindView(R.id.rv_cart)
    RecyclerView rvCart;
    
    @BindView(R.id.cb_select_all)
    CheckBox cbSelectAll;
    
    @BindView(R.id.tv_total_price)
    TextView tvTotalPrice;
    
    @BindView(R.id.btn_checkout)
    Button btnCheckout;
    
    @BindView(R.id.rv_recommend)
    RecyclerView rvRecommend;
    
    private CartPresenter presenter;
    private CartItemAdapter adapter;
    
    // 初始化、数据加载、事件处理等方法
}
```

### 4. 结算页面 (CheckoutActivity)

#### 功能描述
- 展示订单信息
- 选择收货地址
- 选择支付方式
- 提交订单

#### 组件结构

```java
/**
 * 结算页 Activity
 */
public class CheckoutActivity extends BaseActivity 
    implements CheckoutView {
    
    @BindView(R.id.tv_address)
    TextView tvAddress;
    
    @BindView(R.id.rv_goods)
    RecyclerView rvGoods;
    
    @BindView(R.id.tv_goods_price)
    TextView tvGoodsPrice;
    
    @BindView(R.id.tv_shipping_fee)
    TextView tvShippingFee;
    
    @BindView(R.id.tv_total_price)
    TextView tvTotalPrice;
    
    @BindView(R.id.rg_payment)
    RadioGroup rgPayment;
    
    @BindView(R.id.btn_submit)
    Button btnSubmit;
    
    private CheckoutPresenter presenter;
    
    // 初始化、数据加载、事件处理等方法
}
```


## 数据模型

### 1. Drug (药品实体)

```java
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
}
```

### 2. CartItem (购物车项)

```java
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
    
    // Getter and Setter methods
    
    /**
     * 计算小计
     */
    public BigDecimal getSubtotal() {
        return drug.getPrice().multiply(new BigDecimal(quantity));
    }
}
```

### 3. Category (分类)

```java
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
}
```

### 4. Order (订单)

```java
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
}
```

### 5. Address (收货地址)

```java
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
    
    // Getter and Setter methods
    
    /**
     * 获取完整地址
     */
    public String getFullAddress() {
        return province + city + district + detail;
    }
}
```

## 接口设计

### API Service 接口

```java
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

### Presenter 接口

```java
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

### View 接口

```java
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


## 正确性属性

*属性是一个特征或行为,应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### Property 1: 购物车数量一致性

*对于任意*购物车状态,UI 显示的商品数量应该等于购物车中所有商品数量的总和

**验证: 需求 3.1, 3.2, 3.6**

### Property 2: 价格计算正确性

*对于任意*购物车中的选中商品,总价应该等于所有选中商品的(单价 × 数量)之和加上运费

**验证: 需求 3.3, 4.2**

### Property 3: 商品详情数据完整性

*对于任意*药品详情页,显示的药品信息应该包含名称、价格、规格、厂家、说明书等所有必需字段

**验证: 需求 2.2**

### Property 4: 搜索结果相关性

*对于任意*搜索关键词,返回的药品列表中每个药品的名称、编码或厂家应该包含该关键词

**验证: 需求 5.4**

### Property 5: 购物车操作幂等性

*对于任意*购物车项,连续两次执行相同的选中/取消选中操作,结果应该与执行一次相同

**验证: 需求 3.3**

### Property 6: 图片加载失败降级

*对于任意*药品图片加载失败的情况,应该显示默认占位图而不是空白或崩溃

**验证: 需求 2.2, 非功能性需求**

### Property 7: 列表分页一致性

*对于任意*分页列表,加载下一页后,列表中的商品总数应该等于之前的数量加上新加载的数量

**验证: 需求 1.6, 6.3**

### Property 8: 订单金额不可篡改

*对于任意*订单创建请求,服务端计算的订单金额应该与客户端显示的金额一致(允许浮点误差 < 0.01)

**验证: 需求 4.5**

## 错误处理

### 网络错误处理

```java
/**
 * 统一的网络错误处理
 */
public class ErrorHandler {
    
    /**
     * 处理网络请求错误
     */
    public static void handleError(Throwable throwable, View view) {
        if (throwable instanceof HttpException) {
            HttpException httpException = (HttpException) throwable;
            int code = httpException.code();
            
            switch (code) {
                case 401:
                    view.showError("登录已过期,请重新登录");
                    // 跳转到登录页
                    break;
                case 404:
                    view.showError("请求的资源不存在");
                    break;
                case 500:
                    view.showError("服务器错误,请稍后重试");
                    break;
                default:
                    view.showError("网络请求失败: " + code);
            }
        } else if (throwable instanceof SocketTimeoutException) {
            view.showError("网络超时,请检查网络连接");
        } else if (throwable instanceof UnknownHostException) {
            view.showError("无法连接到服务器");
        } else {
            view.showError("未知错误: " + throwable.getMessage());
        }
    }
}
```

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
    
    /**
     * 验证地址信息
     */
    public static boolean validateAddress(Address address) {
        return address != null
            && !TextUtils.isEmpty(address.getReceiverName())
            && !TextUtils.isEmpty(address.getReceiverPhone())
            && !TextUtils.isEmpty(address.getProvince())
            && !TextUtils.isEmpty(address.getCity())
            && !TextUtils.isEmpty(address.getDetail());
    }
}
```

### 异常边界处理

1. **空数据处理**: 列表为空时显示空状态页面
2. **图片加载失败**: 显示默认占位图
3. **网络超时**: 显示重试按钮
4. **数据解析失败**: 记录日志并显示友好提示
5. **库存不足**: 禁用加入购物车按钮并提示

## 测试策略

### 单元测试

#### Presenter 层测试

```java
/**
 * MallHomePresenter 单元测试
 */
@RunWith(MockitoJUnitRunner.class)
public class MallHomePresenterTest {
    
    @Mock
    private MallHomeView view;
    
    @Mock
    private MallApiService apiService;
    
    private MallHomePresenter presenter;
    
    @Before
    public void setUp() {
        presenter = new MallHomePresenterImpl(view, apiService);
    }
    
    @Test
    public void testLoadHomeData_Success() {
        // Given
        MallHomeData mockData = createMockHomeData();
        when(apiService.getHomeData())
            .thenReturn(Observable.just(BaseResponse.success(mockData)));
        
        // When
        presenter.loadHomeData();
        
        // Then
        verify(view).showLoading();
        verify(view).hideLoading();
        verify(view).showHomeData(mockData);
    }
    
    @Test
    public void testLoadHomeData_Error() {
        // Given
        when(apiService.getHomeData())
            .thenReturn(Observable.error(new IOException("Network error")));
        
        // When
        presenter.loadHomeData();
        
        // Then
        verify(view).showLoading();
        verify(view).hideLoading();
        verify(view).showError(anyString());
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
        // 10.5 * 2 + 20.0 * 1 = 41.0 (第三项未选中,不计入)
        assertEquals(new BigDecimal("41.0"), totalPrice);
    }
    
    @Test
    public void testCalculateShippingFee() {
        // Given
        BigDecimal goodsPrice = new BigDecimal("50.0");
        
        // When
        BigDecimal shippingFee = PriceCalculator.calculateShippingFee(goodsPrice);
        
        // Then
        // 满99包邮,否则运费6元
        assertEquals(new BigDecimal("6.0"), shippingFee);
    }
}
```

### UI 测试

#### Espresso 测试示例

```java
/**
 * MallHomeFragment UI 测试
 */
@RunWith(AndroidJUnit4.class)
public class MallHomeFragmentTest {
    
    @Rule
    public ActivityTestRule<MainActivity> activityRule = 
        new ActivityTestRule<>(MainActivity.class);
    
    @Test
    public void testSearchBarClick_NavigatesToSearchActivity() {
        // Given
        onView(withId(R.id.et_search)).perform(click());
        
        // Then
        intended(hasComponent(SearchActivity.class.getName()));
    }
    
    @Test
    public void testDrugItemClick_NavigatesToDetailActivity() {
        // Given
        onView(withId(R.id.rv_hot_drugs))
            .perform(RecyclerViewActions.actionOnItemAtPosition(0, click()));
        
        // Then
        intended(hasComponent(DrugDetailActivity.class.getName()));
    }
    
    @Test
    public void testPullToRefresh_ReloadsData() {
        // Given
        onView(withId(R.id.swipe_refresh))
            .perform(swipeDown());
        
        // Then
        onView(withId(R.id.swipe_refresh))
            .check(matches(isDisplayed()));
    }
}
```

### 集成测试

#### API 集成测试

```java
/**
 * MallApiService 集成测试
 */
@RunWith(AndroidJUnit4.class)
public class MallApiServiceIntegrationTest {
    
    private MallApiService apiService;
    
    @Before
    public void setUp() {
        apiService = RetrofitClient.getInstance().create(MallApiService.class);
    }
    
    @Test
    public void testGetHomeData() {
        // When
        TestObserver<BaseResponse<MallHomeData>> testObserver = 
            apiService.getHomeData().test();
        
        // Then
        testObserver.awaitTerminalEvent();
        testObserver.assertNoErrors();
        testObserver.assertValue(response -> 
            response.isSuccess() && response.getData() != null
        );
    }
    
    @Test
    public void testAddToCart() {
        // Given
        AddCartRequest request = new AddCartRequest("drug123", 2);
        
        // When
        TestObserver<BaseResponse<Void>> testObserver = 
            apiService.addToCart(request).test();
        
        // Then
        testObserver.awaitTerminalEvent();
        testObserver.assertNoErrors();
        testObserver.assertValue(BaseResponse::isSuccess);
    }
}
```

### 性能测试

#### 列表滚动性能测试

```java
/**
 * RecyclerView 滚动性能测试
 */
@RunWith(AndroidJUnit4.class)
public class RecyclerViewPerformanceTest {
    
    @Test
    public void testDrugListScrollPerformance() {
        // Given
        List<Drug> drugs = createLargeDrugList(1000);
        
        // When
        long startTime = System.currentTimeMillis();
        onView(withId(R.id.rv_drugs))
            .perform(RecyclerViewActions.scrollToPosition(999));
        long endTime = System.currentTimeMillis();
        
        // Then
        long duration = endTime - startTime;
        assertTrue("滚动耗时应小于2秒", duration < 2000);
    }
}
```

### 测试覆盖率目标

- **Presenter 层**: 覆盖率 > 80%
- **工具类**: 覆盖率 > 90%
- **关键业务逻辑**: 覆盖率 > 85%
- **UI 测试**: 覆盖核心用户流程


## UI 设计规范

### 颜色规范

```xml
<!-- colors.xml -->
<resources>
    <!-- 主色调 - 绿色系 -->
    <color name="colorPrimary">#10B981</color>
    <color name="colorPrimaryDark">#059669</color>
    <color name="colorAccent">#34D399</color>
    
    <!-- 背景色 -->
    <color name="colorBackground">#F3F4F6</color>
    <color name="colorWhite">#FFFFFF</color>
    
    <!-- 文字颜色 -->
    <color name="colorTextPrimary">#1F2937</color>
    <color name="colorTextSecondary">#6B7280</color>
    <color name="colorTextHint">#9CA3AF</color>
    
    <!-- 功能色 -->
    <color name="colorSuccess">#10B981</color>
    <color name="colorWarning">#F59E0B</color>
    <color name="colorError">#EF4444</color>
    <color name="colorInfo">#3B82F6</color>
    
    <!-- 标签颜色 -->
    <color name="colorTagOrange">#FED7AA</color>
    <color name="colorTagOrangeText">#EA580C</color>
    <color name="colorTagGreen">#D1FAE5</color>
    <color name="colorTagGreenText">#059669</color>
</resources>
```

### 尺寸规范

```xml
<!-- dimens.xml -->
<resources>
    <!-- 间距 -->
    <dimen name="spacing_tiny">4dp</dimen>
    <dimen name="spacing_small">8dp</dimen>
    <dimen name="spacing_medium">12dp</dimen>
    <dimen name="spacing_normal">16dp</dimen>
    <dimen name="spacing_large">20dp</dimen>
    <dimen name="spacing_xlarge">24dp</dimen>
    
    <!-- 圆角 -->
    <dimen name="corner_radius_small">4dp</dimen>
    <dimen name="corner_radius_medium">8dp</dimen>
    <dimen name="corner_radius_large">12dp</dimen>
    <dimen name="corner_radius_xlarge">16dp</dimen>
    
    <!-- 文字大小 -->
    <dimen name="text_size_tiny">10sp</dimen>
    <dimen name="text_size_small">12sp</dimen>
    <dimen name="text_size_normal">14sp</dimen>
    <dimen name="text_size_medium">16sp</dimen>
    <dimen name="text_size_large">18sp</dimen>
    <dimen name="text_size_xlarge">20sp</dimen>
    <dimen name="text_size_title">24sp</dimen>
    
    <!-- 图片尺寸 -->
    <dimen name="image_size_small">48dp</dimen>
    <dimen name="image_size_medium">80dp</dimen>
    <dimen name="image_size_large">120dp</dimen>
    
    <!-- 按钮高度 -->
    <dimen name="button_height_small">32dp</dimen>
    <dimen name="button_height_normal">44dp</dimen>
    <dimen name="button_height_large">48dp</dimen>
</resources>
```

### 样式规范

```xml
<!-- styles.xml -->
<resources>
    <!-- 卡片样式 -->
    <style name="CardStyle">
        <item name="android:background">@drawable/bg_card</item>
        <item name="android:elevation">2dp</item>
        <item name="android:padding">@dimen/spacing_normal</item>
    </style>
    
    <!-- 按钮样式 -->
    <style name="ButtonPrimary">
        <item name="android:background">@drawable/bg_button_primary</item>
        <item name="android:textColor">@color/colorWhite</item>
        <item name="android:textSize">@dimen/text_size_medium</item>
        <item name="android:textStyle">bold</item>
        <item name="android:minHeight">@dimen/button_height_normal</item>
    </style>
    
    <style name="ButtonSecondary">
        <item name="android:background">@drawable/bg_button_secondary</item>
        <item name="android:textColor">@color/colorPrimary</item>
        <item name="android:textSize">@dimen/text_size_medium</item>
        <item name="android:textStyle">bold</item>
        <item name="android:minHeight">@dimen/button_height_normal</item>
    </style>
    
    <!-- 标签样式 -->
    <style name="TagStyle">
        <item name="android:background">@drawable/bg_tag</item>
        <item name="android:textSize">@dimen/text_size_tiny</item>
        <item name="android:paddingStart">@dimen/spacing_small</item>
        <item name="android:paddingEnd">@dimen/spacing_small</item>
        <item name="android:paddingTop">@dimen/spacing_tiny</item>
        <item name="android:paddingBottom">@dimen/spacing_tiny</item>
    </style>
    
    <!-- 标题样式 -->
    <style name="TitleStyle">
        <item name="android:textColor">@color/colorTextPrimary</item>
        <item name="android:textSize">@dimen/text_size_large</item>
        <item name="android:textStyle">bold</item>
    </style>
    
    <!-- 副标题样式 -->
    <style name="SubtitleStyle">
        <item name="android:textColor">@color/colorTextSecondary</item>
        <item name="android:textSize">@dimen/text_size_normal</item>
    </style>
</resources>
```

### 可绘制资源

```xml
<!-- bg_card.xml -->
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/colorWhite"/>
    <corners android:radius="@dimen/corner_radius_large"/>
</shape>

<!-- bg_button_primary.xml -->
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/colorPrimary"/>
    <corners android:radius="@dimen/corner_radius_xlarge"/>
</shape>

<!-- bg_button_secondary.xml -->
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <stroke 
        android:width="2dp"
        android:color="@color/colorPrimary"/>
    <solid android:color="@color/colorWhite"/>
    <corners android:radius="@dimen/corner_radius_xlarge"/>
</shape>

<!-- bg_tag.xml -->
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/colorTagOrange"/>
    <corners android:radius="@dimen/corner_radius_small"/>
</shape>
```

## 性能优化

### 图片加载优化

```java
/**
 * Glide 图片加载配置
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
}
```

### RecyclerView 优化

```java
/**
 * RecyclerView 优化配置
 */
public class RecyclerViewOptimizer {
    
    /**
     * 优化 RecyclerView 性能
     */
    public static void optimize(RecyclerView recyclerView) {
        // 设置固定大小
        recyclerView.setHasFixedSize(true);
        
        // 设置 ItemAnimator
        recyclerView.setItemAnimator(new DefaultItemAnimator());
        
        // 设置 RecycledViewPool
        RecyclerView.RecycledViewPool pool = new RecyclerView.RecycledViewPool();
        pool.setMaxRecycledViews(0, 20);
        recyclerView.setRecycledViewPool(pool);
        
        // 设置预加载
        LinearLayoutManager layoutManager = 
            (LinearLayoutManager) recyclerView.getLayoutManager();
        if (layoutManager != null) {
            layoutManager.setInitialPrefetchItemCount(4);
        }
    }
}
```

### 内存优化

```java
/**
 * 内存优化工具类
 */
public class MemoryOptimizer {
    
    /**
     * 清理图片缓存
     */
    public static void clearImageCache(Context context) {
        new Thread(() -> {
            Glide.get(context).clearDiskCache();
        }).start();
        Glide.get(context).clearMemory();
    }
    
    /**
     * 监控内存使用
     */
    public static void monitorMemory() {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();
        float memoryUsage = (float) usedMemory / maxMemory * 100;
        
        Log.d("MemoryOptimizer", "内存使用率: " + memoryUsage + "%");
        
        if (memoryUsage > 80) {
            Log.w("MemoryOptimizer", "内存使用率过高,建议清理缓存");
        }
    }
}
```

### 网络优化

```java
/**
 * OkHttp 网络优化配置
 */
public class NetworkOptimizer {
    
    /**
     * 创建优化的 OkHttpClient
     */
    public static OkHttpClient createOptimizedClient() {
        // 创建缓存目录
        File cacheDir = new File(context.getCacheDir(), "http_cache");
        Cache cache = new Cache(cacheDir, 10 * 1024 * 1024); // 10MB
        
        return new OkHttpClient.Builder()
            .cache(cache)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .addInterceptor(new CacheInterceptor())
            .addInterceptor(new LoggingInterceptor())
            .build();
    }
    
    /**
     * 缓存拦截器
     */
    private static class CacheInterceptor implements Interceptor {
        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();
            
            // 无网络时使用缓存
            if (!NetworkUtil.isNetworkAvailable()) {
                request = request.newBuilder()
                    .cacheControl(CacheControl.FORCE_CACHE)
                    .build();
            }
            
            Response response = chain.proceed(request);
            
            // 有网络时设置缓存有效期
            if (NetworkUtil.isNetworkAvailable()) {
                int maxAge = 60; // 1分钟
                response = response.newBuilder()
                    .removeHeader("Pragma")
                    .removeHeader("Cache-Control")
                    .header("Cache-Control", "public, max-age=" + maxAge)
                    .build();
            } else {
                int maxStale = 60 * 60 * 24 * 7; // 7天
                response = response.newBuilder()
                    .removeHeader("Pragma")
                    .removeHeader("Cache-Control")
                    .header("Cache-Control", "public, only-if-cached, max-stale=" + maxStale)
                    .build();
            }
            
            return response;
        }
    }
}
```

## 安全设计

### 数据加密

```java
/**
 * 数据加密工具类
 */
public class EncryptionUtil {
    
    /**
     * 加密敏感信息
     */
    public static String encrypt(String data) {
        // 使用 AES 加密
        try {
            SecretKeySpec key = new SecretKeySpec(getKey(), "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encrypted = cipher.doFinal(data.getBytes());
            return Base64.encodeToString(encrypted, Base64.DEFAULT);
        } catch (Exception e) {
            Log.e("EncryptionUtil", "加密失败", e);
            return null;
        }
    }
    
    /**
     * 解密敏感信息
     */
    public static String decrypt(String encryptedData) {
        // 使用 AES 解密
        try {
            SecretKeySpec key = new SecretKeySpec(getKey(), "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decrypted = cipher.doFinal(
                Base64.decode(encryptedData, Base64.DEFAULT)
            );
            return new String(decrypted);
        } catch (Exception e) {
            Log.e("EncryptionUtil", "解密失败", e);
            return null;
        }
    }
    
    private static byte[] getKey() {
        // 从安全存储获取密钥
        return KeyManager.getEncryptionKey();
    }
}
```

### Token 管理

```java
/**
 * Token 管理类
 */
public class TokenManager {
    
    private static final String KEY_TOKEN = "user_token";
    private static final String KEY_REFRESH_TOKEN = "refresh_token";
    
    /**
     * 保存 Token
     */
    public static void saveToken(String token, String refreshToken) {
        SharedPreferences sp = getSecurePreferences();
        sp.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .apply();
    }
    
    /**
     * 获取 Token
     */
    public static String getToken() {
        SharedPreferences sp = getSecurePreferences();
        return sp.getString(KEY_TOKEN, null);
    }
    
    /**
     * 清除 Token
     */
    public static void clearToken() {
        SharedPreferences sp = getSecurePreferences();
        sp.edit()
            .remove(KEY_TOKEN)
            .remove(KEY_REFRESH_TOKEN)
            .apply();
    }
    
    /**
     * 获取安全的 SharedPreferences
     */
    private static SharedPreferences getSecurePreferences() {
        // 使用加密的 SharedPreferences
        return EncryptedSharedPreferences.create(
            "secure_prefs",
            MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        );
    }
}
```

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
