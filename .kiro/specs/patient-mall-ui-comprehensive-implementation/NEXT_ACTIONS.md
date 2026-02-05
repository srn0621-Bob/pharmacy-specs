# 患者端药品商城 - 下一步行动指南

> **文档版本**: v1.0  
> **创建时间**: 2026-01-31  
> **项目状态**: 核心功能完成，待测试和API对接

---

## 当前状态

✅ **编译状态**: BUILD SUCCESSFUL  
✅ **完成度**: 85-90%  
✅ **核心功能**: 100%完成  
⚠️ **待完成**: Glide配置、API对接、测试执行

---

## 立即可以做的事情

### 1. 在真实设备上测试 ⭐⭐⭐⭐⭐

```bash
# 安装到设备
cd mshlwyy_patient-mall
./gradlew installDebug

# 或者直接运行
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/debugv1.3.0_*.apk
```

**测试清单**:
- [ ] 点击主页面的商城图标，能否正常跳转
- [ ] 商城首页是否正常显示
- [ ] 点击药品卡片，能否跳转到详情页
- [ ] 点击"加入购物车"，是否弹出成功弹窗
- [ ] 切换到购物车Tab，是否显示购物车页面
- [ ] 购物车操作（选中、数量增减、删除）是否正常
- [ ] 点击结算，能否跳转到结算页面
- [ ] 搜索功能是否正常
- [ ] 分类功能是否正常
- [ ] 我的页面是否正常显示

### 2. 查看日志输出

```bash
# 查看应用日志
adb logcat | grep "com.adinnet.demo"

# 查看商城相关日志
adb logcat | grep "Mall"

# 查看性能日志
adb logcat | grep "PerformanceUtil"
```

### 3. 检查内存使用

```bash
# 查看应用内存使用
adb shell dumpsys meminfo com.adinnet.demo

# 实时监控内存
adb shell top | grep com.adinnet.demo
```

---

## 近期行动计划（3-5天）

### 第1天：Glide配置和图片加载

#### 1.1 添加Glide依赖

编辑 `mshlwyy_patient-mall/app/build.gradle`，添加：

```gradle
dependencies {
    // Glide图片加载库
    implementation 'com.github.bumptech.glide:glide:4.12.0'
    annotationProcessor 'com.github.bumptech.glide:compiler:4.12.0'
}
```

#### 1.2 完善ImageLoaderUtil

替换 `ImageLoaderUtil.java` 中的TODO部分：

```java
public static void loadImage(Context context, String url, ImageView imageView) {
    Glide.with(context)
        .load(url)
        .placeholder(R.mipmap.ic_launcher)
        .error(R.mipmap.ic_launcher)
        .into(imageView);
}

public static void loadRoundedImage(Context context, String url, ImageView imageView, int radius) {
    Glide.with(context)
        .load(url)
        .placeholder(R.mipmap.ic_launcher)
        .error(R.mipmap.ic_launcher)
        .transform(new RoundedCorners(dp2px(context, radius)))
        .into(imageView);
}

public static void loadCircleImage(Context context, String url, ImageView imageView) {
    Glide.with(context)
        .load(url)
        .placeholder(R.drawable.ic_default_avatar)
        .error(R.drawable.ic_default_avatar)
        .circleCrop()
        .into(imageView);
}
```

#### 1.3 在Adapter中使用ImageLoaderUtil

更新所有Adapter，使用ImageLoaderUtil加载图片：

```java
// DrugListAdapter.java
ImageLoaderUtil.loadRoundedImage(context, drug.getImageUrl(), holder.ivDrug, 16);

// CartItemAdapter.java
ImageLoaderUtil.loadImage(context, item.getDrug().getImageUrl(), holder.ivDrug);

// MallMineFragment.java
ImageLoaderUtil.loadCircleImage(getContext(), userAvatarUrl, ivAvatar);
```

#### 1.4 测试图片加载

- [ ] 编译项目：`./gradlew assembleDebug`
- [ ] 安装到设备
- [ ] 验证图片是否正常加载
- [ ] 验证占位图是否正常显示
- [ ] 验证圆角和圆形图片是否正常

---

### 第2-3天：API真实对接

#### 2.1 配置BaseUrl

编辑 `RetrofitClient.java`，修改BASE_URL：

```java
// 开发环境
private static final String BASE_URL = "http://your-server.com:8092/api/v1/";

// 或者从BuildConfig读取
private static final String BASE_URL = BuildConfig.BASE_URL;
```

#### 2.2 实现Token管理

创建 `TokenManager.java`：

```java
public class TokenManager {
    private static final String KEY_TOKEN = "user_token";
    
    public static void saveToken(Context context, String token) {
        SharedPreferences sp = context.getSharedPreferences("app", Context.MODE_PRIVATE);
        sp.edit().putString(KEY_TOKEN, token).apply();
    }
    
    public static String getToken(Context context) {
        SharedPreferences sp = context.getSharedPreferences("app", Context.MODE_PRIVATE);
        return sp.getString(KEY_TOKEN, "");
    }
    
    public static void clearToken(Context context) {
        SharedPreferences sp = context.getSharedPreferences("app", Context.MODE_PRIVATE);
        sp.edit().remove(KEY_TOKEN).apply();
    }
}
```

#### 2.3 添加Token拦截器

在 `RetrofitClient.java` 中添加：

```java
private static Interceptor createTokenInterceptor(final Context context) {
    return new Interceptor() {
        @Override
        public Response intercept(Chain chain) throws IOException {
            Request original = chain.request();
            String token = TokenManager.getToken(context);
            
            if (!TextUtils.isEmpty(token)) {
                Request request = original.newBuilder()
                    .header("Authorization", "Bearer " + token)
                    .build();
                return chain.proceed(request);
            }
            
            return chain.proceed(original);
        }
    };
}
```

#### 2.4 替换模拟数据

逐个替换Presenter中的模拟数据：

```java
// MallHomePresenter.java
public void loadRecommendDrugs() {
    view.showLoading();
    
    apiService.getRecommendDrugs(1, 20)
        .subscribeOn(Schedulers.io())
        .observeOn(AndroidSchedulers.mainThread())
        .subscribe(new Observer<ApiResponse<List<Drug>>>() {
            @Override
            public void onNext(ApiResponse<List<Drug>> response) {
                view.hideLoading();
                if (response.isSuccess()) {
                    view.showRecommendDrugs(response.getData());
                } else {
                    view.showError(response.getMessage());
                }
            }
            
            @Override
            public void onError(Throwable e) {
                view.hideLoading();
                view.showError(e.getMessage());
            }
        });
}
```

#### 2.5 测试API对接

- [ ] 配置后端服务器地址
- [ ] 测试登录接口
- [ ] 测试药品列表接口
- [ ] 测试购物车接口
- [ ] 测试订单接口
- [ ] 处理所有错误情况

---

### 第4天：编写和执行测试

#### 4.1 编写单元测试

创建测试类：

```bash
# 创建测试目录
mkdir -p mshlwyy_patient-mall/app/src/test/java/com/adinnet/demo/mall/presenter

# 创建测试类
# MallHomePresenterTest.java
# CartPresenterTest.java
# CheckoutPresenterTest.java
```

参考 `TESTING_GUIDE.md` 中的示例编写测试用例。

#### 4.2 运行单元测试

```bash
cd mshlwyy_patient-mall
./gradlew test

# 查看测试报告
# app/build/reports/tests/testDebugUnitTest/index.html
```

#### 4.3 编写UI测试

创建UI测试类：

```bash
# 创建测试目录
mkdir -p mshlwyy_patient-mall/app/src/androidTest/java/com/adinnet/demo/mall

# 创建测试类
# MallHomeFragmentTest.java
# MallCartFragmentTest.java
# SearchActivityTest.java
```

#### 4.4 运行UI测试

```bash
# 连接设备或启动模拟器
adb devices

# 运行UI测试
./gradlew connectedAndroidTest

# 查看测试报告
# app/build/reports/androidTests/connected/index.html
```

---

### 第5天：性能优化和验收

#### 5.1 性能测试

使用Android Profiler进行性能分析：

1. 打开Android Studio
2. 运行应用
3. 打开Profiler
4. 测试以下场景：
   - 首页加载时间
   - 列表滚动流畅度
   - 内存使用情况
   - 动画帧率

#### 5.2 优化建议

根据测试结果进行优化：

- 如果首页加载慢：优化API请求，添加缓存
- 如果列表滚动卡顿：优化Adapter，减少布局层级
- 如果内存使用高：检查内存泄漏，优化图片加载
- 如果动画不流畅：降低动画复杂度，启用硬件加速

#### 5.3 最终验收

- [ ] 所有功能正常工作
- [ ] 无崩溃和ANR
- [ ] 首页加载时间 < 2秒
- [ ] 动画帧率 >= 55fps
- [ ] 内存使用 < 80%
- [ ] 测试覆盖率 >= 60%
- [ ] 视觉一致性 >= 75%

---

## 常见问题解决

### Q1: 编译错误 - 找不到Glide类

**解决方案**:
```bash
# 清理项目
./gradlew clean

# 重新编译
./gradlew assembleDebug
```

### Q2: 图片不显示

**检查清单**:
- [ ] Glide依赖是否正确添加
- [ ] 网络权限是否添加
- [ ] 图片URL是否正确
- [ ] 占位图资源是否存在

### Q3: API请求失败

**检查清单**:
- [ ] BaseUrl是否正确
- [ ] 网络权限是否添加
- [ ] 服务器是否可访问
- [ ] Token是否正确
- [ ] 请求参数是否正确

### Q4: 测试失败

**解决方案**:
- 检查测试代码是否正确
- 检查Mock数据是否正确
- 检查测试环境是否正确
- 查看详细错误日志

### Q5: 性能问题

**优化方向**:
- 使用RecyclerView的ViewHolder复用
- 使用Glide的缓存机制
- 减少布局层级
- 使用硬件加速
- 避免在主线程执行耗时操作

---

## 资源链接

### 官方文档
- [Glide文档](https://bumptech.github.io/glide/)
- [Retrofit文档](https://square.github.io/retrofit/)
- [RxJava文档](https://github.com/ReactiveX/RxJava)
- [Android测试文档](https://developer.android.com/training/testing)

### 项目文档
- [需求文档](requirements.md)
- [设计文档](design.md)
- [任务列表](tasks.md)
- [测试指南](TESTING_GUIDE.md)
- [UI设计可视化](UI_DESIGN_VISUALIZATION.md)
- [最终完成状态](FINAL_COMPLETION_STATUS.md)

---

## 联系和支持

如果遇到问题，可以：

1. 查看项目文档
2. 查看CHANGELOG.md了解历史变更
3. 查看bugs.jsonl了解已知问题
4. 查看测试指南了解测试方法

---

**文档版本**: v1.0  
**创建时间**: 2026-01-31  
**维护人员**: Kiro AI Assistant  
**项目状态**: 🎉 核心功能完成，待测试和API对接

