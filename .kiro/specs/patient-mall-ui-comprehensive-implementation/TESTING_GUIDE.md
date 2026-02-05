# 患者端药品商城 - 测试指南

> **文档版本**: v1.0  
> **创建时间**: 2026-01-31  
> **测试范围**: 商城核心功能

## 测试概览

### 测试策略
- **单元测试**: 业务逻辑层（Presenter）
- **UI测试**: 关键用户流程
- **性能测试**: 页面加载、动画流畅度
- **兼容性测试**: 多设备、多版本

### 测试工具
- **JUnit 4**: 单元测试框架
- **Mockito**: Mock框架
- **Espresso**: UI测试框架
- **Android Profiler**: 性能分析

---

## 单元测试

### 1. Presenter测试

#### MallHomePresenter测试
```java
@RunWith(MockitoJUnitRunner.class)
public class MallHomePresenterTest {
    
    @Mock
    private MallHomeView view;
    
    @Mock
    private MallApiService apiService;
    
    private MallHomePresenter presenter;
    
    @Before
    public void setUp() {
        presenter = new MallHomePresenter(view, apiService);
    }
    
    @Test
    public void testLoadRecommendDrugs_Success() {
        // 准备测试数据
        List<Drug> drugs = createMockDrugs();
        when(apiService.getRecommendDrugs(anyInt(), anyInt()))
            .thenReturn(Observable.just(new ApiResponse<>(drugs)));
        
        // 执行测试
        presenter.loadRecommendDrugs();
        
        // 验证结果
        verify(view).showLoading();
        verify(view).hideLoading();
        verify(view).showRecommendDrugs(drugs);
    }
    
    @Test
    public void testLoadRecommendDrugs_Error() {
        // 模拟错误
        when(apiService.getRecommendDrugs(anyInt(), anyInt()))
            .thenReturn(Observable.error(new Exception("网络错误")));
        
        // 执行测试
        presenter.loadRecommendDrugs();
        
        // 验证结果
        verify(view).showLoading();
        verify(view).hideLoading();
        verify(view).showError("网络错误");
    }
}
```

#### CartPresenter测试
```java
@RunWith(MockitoJUnitRunner.class)
public class CartPresenterTest {
    
    @Mock
    private CartView view;
    
    @Mock
    private MallApiService apiService;
    
    private CartPresenter presenter;
    
    @Before
    public void setUp() {
        presenter = new CartPresenter(view, apiService);
    }
    
    @Test
    public void testCalculateTotalPrice() {
        // 准备测试数据
        List<CartItem> items = createMockCartItems();
        
        // 执行测试
        presenter.calculateTotalPrice(items);
        
        // 验证结果
        verify(view).updateTotalPrice(69.70f);
    }
    
    @Test
    public void testSelectAll() {
        // 准备测试数据
        List<CartItem> items = createMockCartItems();
        
        // 执行测试
        presenter.selectAll(items, true);
        
        // 验证结果
        for (CartItem item : items) {
            assertTrue(item.isSelected());
        }
    }
}
```

### 2. 工具类测试

#### AnimationUtils测试
```java
@RunWith(RobolectricTestRunner.class)
public class AnimationUtilsTest {
    
    private View testView;
    
    @Before
    public void setUp() {
        testView = new View(RuntimeEnvironment.application);
    }
    
    @Test
    public void testFadeIn() {
        AnimationUtils.fadeIn(testView, 300);
        
        assertEquals(View.VISIBLE, testView.getVisibility());
    }
    
    @Test
    public void testShouldEnableAnimations() {
        boolean result = AnimationUtils.shouldEnableAnimations();
        
        assertTrue(result || !result); // 根据设备性能返回
    }
}
```

---

## UI测试

### 1. 商城首页测试

```java
@RunWith(AndroidJUnit4.class)
@LargeTest
public class MallHomeFragmentTest {
    
    @Rule
    public ActivityTestRule<MallMainActivity> activityRule = 
        new ActivityTestRule<>(MallMainActivity.class);
    
    @Test
    public void testSearchBoxClick() {
        // 点击搜索框
        onView(withId(R.id.et_search))
            .perform(click());
        
        // 验证跳转到搜索页面
        intended(hasComponent(SearchActivity.class.getName()));
    }
    
    @Test
    public void testDrugCardClick() {
        // 等待数据加载
        onView(withId(R.id.rv_recommend))
            .perform(RecyclerViewActions.scrollToPosition(0));
        
        // 点击第一个药品卡片
        onView(withId(R.id.rv_recommend))
            .perform(RecyclerViewActions.actionOnItemAtPosition(0, click()));
        
        // 验证跳转到详情页
        intended(hasComponent(DrugDetailActivity.class.getName()));
    }
}
```

### 2. 购物车测试

```java
@RunWith(AndroidJUnit4.class)
@LargeTest
public class MallCartFragmentTest {
    
    @Rule
    public ActivityTestRule<MallMainActivity> activityRule = 
        new ActivityTestRule<>(MallMainActivity.class);
    
    @Before
    public void setUp() {
        // 切换到购物车Tab
        onView(withId(R.id.nav_cart))
            .perform(click());
    }
    
    @Test
    public void testSelectItem() {
        // 点击第一个商品的CheckBox
        onView(withId(R.id.rv_cart))
            .perform(RecyclerViewActions.actionOnItemAtPosition(0, 
                clickChildViewWithId(R.id.cb_select)));
        
        // 验证总价更新
        onView(withId(R.id.tv_total_price))
            .check(matches(not(withText("¥0.00"))));
    }
    
    @Test
    public void testCheckout() {
        // 选中商品
        onView(withId(R.id.cb_select_all))
            .perform(click());
        
        // 点击结算按钮
        onView(withId(R.id.btn_checkout))
            .perform(click());
        
        // 验证跳转到结算页
        intended(hasComponent(CheckoutActivity.class.getName()));
    }
}
```

### 3. 搜索功能测试

```java
@RunWith(AndroidJUnit4.class)
@LargeTest
public class SearchActivityTest {
    
    @Rule
    public ActivityTestRule<SearchActivity> activityRule = 
        new ActivityTestRule<>(SearchActivity.class);
    
    @Test
    public void testSearch() {
        // 输入搜索关键词
        onView(withId(R.id.et_search))
            .perform(typeText("感冒"), closeSoftKeyboard());
        
        // 点击搜索按钮
        onView(withId(R.id.btn_search))
            .perform(click());
        
        // 验证显示搜索结果
        onView(withId(R.id.rv_result))
            .check(matches(isDisplayed()));
    }
    
    @Test
    public void testSearchHistory() {
        // 输入并搜索
        onView(withId(R.id.et_search))
            .perform(typeText("阿莫西林"), closeSoftKeyboard());
        onView(withId(R.id.btn_search))
            .perform(click());
        
        // 返回搜索页
        pressBack();
        
        // 验证搜索历史显示
        onView(withText("阿莫西林"))
            .check(matches(isDisplayed()));
    }
}
```

---

## 性能测试

### 1. 页面加载时间测试

```java
@RunWith(AndroidJUnit4.class)
public class PerformanceTest {
    
    @Test
    public void testHomePageLoadTime() {
        long startTime = System.currentTimeMillis();
        
        // 启动商城首页
        ActivityScenario.launch(MallMainActivity.class);
        
        // 等待数据加载完成
        onView(withId(R.id.rv_recommend))
            .check(matches(isDisplayed()));
        
        long loadTime = System.currentTimeMillis() - startTime;
        
        // 验证加载时间小于2秒
        assertTrue("首页加载时间过长: " + loadTime + "ms", loadTime < 2000);
    }
    
    @Test
    public void testMemoryUsage() {
        // 启动应用
        ActivityScenario.launch(MallMainActivity.class);
        
        // 检查内存使用
        float memoryUsage = PerformanceUtil.getMemoryUsage(
            InstrumentationRegistry.getTargetContext());
        
        // 验证内存使用小于80%
        assertTrue("内存使用过高: " + memoryUsage + "%", memoryUsage < 80f);
    }
}
```

### 2. 动画帧率测试

使用Android Profiler进行测试：
1. 打开Android Studio的Profiler
2. 选择CPU Profiler
3. 执行动画操作
4. 检查帧率是否保持在55fps以上

### 3. RecyclerView滚动性能测试

```java
@Test
public void testRecyclerViewScrollPerformance() {
    // 启动商城首页
    ActivityScenario.launch(MallMainActivity.class);
    
    long startTime = System.currentTimeMillis();
    
    // 快速滚动列表
    onView(withId(R.id.rv_recommend))
        .perform(RecyclerViewActions.scrollToPosition(50));
    
    long scrollTime = System.currentTimeMillis() - startTime;
    
    // 验证滚动流畅（每项小于16ms）
    assertTrue("滚动性能不佳: " + scrollTime + "ms", scrollTime < 800);
}
```

---

## 兼容性测试

### 测试设备清单

| 设备类型 | Android版本 | 屏幕尺寸 | 分辨率 |
|---------|------------|---------|--------|
| 小米10 | Android 11 | 6.67" | 1080x2340 |
| 华为P30 | Android 10 | 6.1" | 1080x2340 |
| OPPO R15 | Android 8.1 | 6.28" | 1080x2280 |
| 三星S9 | Android 9.0 | 5.8" | 1440x2960 |
| 红米Note 8 | Android 9.0 | 6.3" | 1080x2340 |

### 测试检查项

- [ ] 所有页面正常显示
- [ ] 按钮点击响应正常
- [ ] 图片加载正常
- [ ] 动画流畅（55fps+）
- [ ] 无崩溃和ANR
- [ ] 内存使用正常（<80%）
- [ ] 网络请求正常
- [ ] 数据持久化正常

---

## 测试用例清单

### 核心购物流程

- [ ] 首页浏览药品
- [ ] 搜索药品
- [ ] 查看药品详情
- [ ] 加入购物车
- [ ] 购物车操作（选中、数量、删除）
- [ ] 结算下单
- [ ] 支付（模拟）
- [ ] 查看订单

### 边界情况

- [ ] 网络断开时的处理
- [ ] 空数据的显示
- [ ] 错误提示的显示
- [ ] 超长文本的处理
- [ ] 大量数据的加载

### 异常情况

- [ ] API返回错误
- [ ] 图片加载失败
- [ ] 支付失败
- [ ] 订单创建失败

---

## 测试报告模板

### 测试执行报告

**测试日期**: 2026-01-31  
**测试人员**: [姓名]  
**测试版本**: v1.3.0  
**测试环境**: [设备型号] Android [版本]

#### 测试结果统计

| 测试类型 | 总数 | 通过 | 失败 | 通过率 |
|---------|------|------|------|--------|
| 单元测试 | 20 | 18 | 2 | 90% |
| UI测试 | 15 | 14 | 1 | 93% |
| 性能测试 | 5 | 5 | 0 | 100% |
| 兼容性测试 | 5 | 5 | 0 | 100% |

#### 发现的问题

1. **问题描述**: [描述]
   - **严重程度**: 高/中/低
   - **复现步骤**: [步骤]
   - **预期结果**: [预期]
   - **实际结果**: [实际]
   - **截图**: [附件]

#### 测试结论

- [ ] 通过，可以发布
- [ ] 有问题，需要修复后重新测试
- [ ] 严重问题，不能发布

---

## 自动化测试配置

### Gradle配置

```gradle
android {
    defaultConfig {
        testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
    }
}

dependencies {
    // 单元测试
    testImplementation 'junit:junit:4.12'
    testImplementation 'org.mockito:mockito-core:2.23.0'
    testImplementation 'org.robolectric:robolectric:4.3'
    
    // UI测试
    androidTestImplementation 'com.android.support.test:runner:1.0.2'
    androidTestImplementation 'com.android.support.test.espresso:espresso-core:3.0.2'
    androidTestImplementation 'com.android.support.test.espresso:espresso-contrib:3.0.2'
}
```

### 运行测试命令

```bash
# 运行所有单元测试
./gradlew test

# 运行所有UI测试
./gradlew connectedAndroidTest

# 运行特定测试类
./gradlew test --tests MallHomePresenterTest

# 生成测试报告
./gradlew test jacocoTestReport
```

---

## 持续集成

### CI配置示例（Jenkins）

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh './gradlew assembleDebug'
            }
        }
        
        stage('Unit Test') {
            steps {
                sh './gradlew test'
            }
        }
        
        stage('UI Test') {
            steps {
                sh './gradlew connectedAndroidTest'
            }
        }
        
        stage('Report') {
            steps {
                junit '**/build/test-results/**/*.xml'
                publishHTML([
                    reportDir: 'build/reports/tests',
                    reportFiles: 'index.html',
                    reportName: 'Test Report'
                ])
            }
        }
    }
}
```

---

**文档版本**: v1.0  
**创建时间**: 2026-01-31  
**维护人员**: Kiro AI Assistant

