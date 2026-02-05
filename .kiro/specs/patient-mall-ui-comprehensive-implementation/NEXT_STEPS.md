# 后续实施指南

> **更新时间**: 2026-01-30T16:30:00+08:00  
> **当前进度**: 20% 完成  
> **预计剩余时间**: 2-3周

## 快速开始

### 1. 验证已完成的工作

在继续之前，请先验证已完成的基础框架：

```bash
# 1. 在Android Studio中打开项目
cd mshlwyy_patient-mall
# 使用Android Studio打开

# 2. 检查资源文件
# 确认以下文件存在且无错误：
# - res/values/colors_dingdang.xml
# - res/values/dimens_dingdang.xml
# - res/values/styles_dingdang.xml
# - res/drawable/dingdang_bg_*.xml

# 3. 检查Java类
# 确认以下类存在且可编译：
# - mall/widget/DingdangTagView.java
# - mall/widget/DingdangCheckBox.java
# - mall/fragment/MallHomeFragment.java
# - mall/adapter/DrugListAdapter.java

# 4. 尝试编译项目
# 在Android Studio中: Build > Make Project
```

### 2. 立即执行的任务 (P0 - 必须完成)

#### 任务A: 创建MallMainActivity (1-2小时)

**目标:** 创建主Activity，集成底部导航和4个Fragment

**步骤:**

1. 创建布局文件 `activity_mall_main.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">
    
    <!-- Fragment容器 -->
    <FrameLayout
        android:id="@+id/fragment_container"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"/>
    
    <!-- 底部导航栏 -->
    <android.support.design.widget.BottomNavigationView
        android:id="@+id/bottom_navigation"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@color/dingdang_card_background"
        app:menu="@menu/bottom_navigation_menu"/>
</LinearLayout>
```

2. 创建菜单文件 `menu/bottom_navigation_menu.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:id="@+id/nav_home"
        android:icon="@android:drawable/ic_menu_home"
        android:title="首页"/>
    <item
        android:id="@+id/nav_category"
        android:icon="@android:drawable/ic_menu_sort_by_size"
        android:title="分类"/>
    <item
        android:id="@+id/nav_cart"
        android:icon="@android:drawable/ic_menu_shopping_cart"
        android:title="购物车"/>
    <item
        android:id="@+id/nav_mine"
        android:icon="@android:drawable/ic_menu_my_calendar"
        android:title="我的"/>
</menu>
```

3. 创建Java类 `MallMainActivity.java`:
```java
package com.adinnet.demo.mall.activity;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.design.widget.BottomNavigationView;
import android.support.v4.app.Fragment;
import android.support.v7.app.AppCompatActivity;
import android.view.MenuItem;

import com.adinnet.demo.R;
import com.adinnet.demo.mall.fragment.MallHomeFragment;
// import 其他Fragment...

public class MallMainActivity extends AppCompatActivity {
    
    private BottomNavigationView bottomNavigation;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mall_main);
        
        initViews();
        initListeners();
        
        // 默认显示首页
        showFragment(MallHomeFragment.newInstance());
    }
    
    private void initViews() {
        bottomNavigation = findViewById(R.id.bottom_navigation);
    }
    
    private void initListeners() {
        bottomNavigation.setOnNavigationItemSelectedListener(
            new BottomNavigationView.OnNavigationItemSelectedListener() {
                @Override
                public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                    switch (item.getItemId()) {
                        case R.id.nav_home:
                            showFragment(MallHomeFragment.newInstance());
                            return true;
                        case R.id.nav_category:
                            // TODO: 显示分类Fragment
                            return true;
                        case R.id.nav_cart:
                            // TODO: 显示购物车Fragment
                            return true;
                        case R.id.nav_mine:
                            // TODO: 显示我的Fragment
                            return true;
                    }
                    return false;
                }
            }
        );
    }
    
    private void showFragment(Fragment fragment) {
        getSupportFragmentManager()
            .beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit();
    }
}
```

4. 在AndroidManifest.xml中注册Activity

**验证:**
- 运行应用，确认底部导航显示正常
- 点击"首页"，确认MallHomeFragment显示
- 确认导航栏高亮正确

#### 任务B: 配置Glide图片加载 (30分钟)

**目标:** 配置Glide，实现药品图片加载

**步骤:**

1. 在build.gradle中添加依赖（如果还没有）:
```gradle
implementation 'com.github.bumptech.glide:glide:4.12.0'
annotationProcessor 'com.github.bumptech.glide:compiler:4.12.0'
```

2. 在DrugListAdapter中启用Glide:
```java
// 取消注释并修改
Glide.with(context)
    .load(drug.getImageUrl())
    .placeholder(R.drawable.placeholder_drug)
    .error(R.drawable.error_drug)
    .into(holder.ivDrug);
```

3. 创建占位图和错误图（可以使用简单的颜色drawable）

**验证:**
- 运行应用，确认图片加载正常
- 测试网络图片加载
- 测试占位图显示

#### 任务C: 实现页面跳转 (1小时)

**目标:** 实现从首页到详情页的跳转

**步骤:**

1. 创建DrugDetailActivity（简化版）:
```java
package com.adinnet.demo.mall.activity;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.widget.TextView;

import com.adinnet.demo.R;

public class DrugDetailActivity extends AppCompatActivity {
    
    private static final String EXTRA_DRUG_ID = "drug_id";
    private static final String EXTRA_DRUG_NAME = "drug_name";
    
    public static void start(Context context, String drugId, String drugName) {
        Intent intent = new Intent(context, DrugDetailActivity.class);
        intent.putExtra(EXTRA_DRUG_ID, drugId);
        intent.putExtra(EXTRA_DRUG_NAME, drugName);
        context.startActivity(intent);
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drug_detail);
        
        String drugId = getIntent().getStringExtra(EXTRA_DRUG_ID);
        String drugName = getIntent().getStringExtra(EXTRA_DRUG_NAME);
        
        // TODO: 加载药品详情
        TextView tvTitle = findViewById(R.id.tv_title);
        tvTitle.setText(drugName);
    }
}
```

2. 创建简单的详情页布局 `activity_drug_detail.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">
    
    <TextView
        android:id="@+id/tv_title"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="16dp"
        android:text="药品详情"
        android:textSize="18sp"
        android:textStyle="bold"/>
    
    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="16dp"
        android:text="详情页内容待实现"/>
</LinearLayout>
```

3. 在MallHomeFragment中修改点击事件:
```java
hotDrugsAdapter.setOnItemClickListener(new DrugListAdapter.OnItemClickListener() {
    @Override
    public void onItemClick(Drug drug) {
        DrugDetailActivity.start(getContext(), drug.getId(), drug.getName());
    }
});
```

**验证:**
- 点击药品卡片，确认跳转到详情页
- 确认药品名称正确显示

### 3. 近期执行的任务 (P0 - 核心功能)

#### 任务D: 完成药品详情页 (1-2天)

参考设计文档中的详情页设计，实现：
- 图片轮播
- 促销标签
- 用药指导
- 店铺信息
- 加入购物车
- 立即购买

**关键文件:**
- `activity_drug_detail.xml` (完整版)
- `DrugDetailActivity.java` (完整版)
- `DrugDetailPresenter.java`
- `DrugDetailView.java`
- `mall_include_promo_tags.xml`
- `mall_include_medication_guide.xml`
- `mall_include_shop_info.xml`

#### 任务E: 完成购物车页面 (1-2天)

实现购物车的所有功能：
- 商品列表
- 数量增减
- 全选/取消全选
- 总价计算
- 结算跳转

**关键文件:**
- `fragment_mall_cart.xml`
- `MallCartFragment.java`
- `CartPresenter.java`
- `CartView.java`
- `CartItemAdapter.java`
- `CartItem.java` (数据模型)

#### 任务F: 完成结算页面 (1天)

实现订单结算功能：
- 地址选择
- 商品列表
- 价格明细
- 订单创建

**关键文件:**
- `activity_checkout.xml`
- `CheckoutActivity.java`
- `CheckoutPresenter.java`
- `CheckoutView.java`
- `Order.java` (数据模型)
- `Address.java` (数据模型)

### 4. 后续执行的任务 (P1 - 重要功能)

#### 任务G: 实现搜索功能 (1天)
#### 任务H: 实现分类功能 (1天)
#### 任务I: 对接真实API (2-3天)
#### 任务J: 实现交互动画 (1-2天)
#### 任务K: 性能优化 (1-2天)
#### 任务L: 测试和验收 (2-3天)

## 开发规范

### 代码规范
1. 所有代码注释使用中文
2. 遵循MVP架构模式
3. 使用dingdang_前缀命名资源
4. 保持代码简洁清晰

### 提交规范
1. 每完成一个任务提交一次
2. 提交信息格式: `[Mall] 完成XXX功能`
3. 更新CHANGELOG.md

### 测试规范
1. 每完成一个功能立即测试
2. 在多种设备上测试
3. 记录发现的问题

## 常见问题

### Q1: 编译错误怎么办？
A: 检查以下几点：
- 确认所有import语句正确
- 确认R.java已生成
- 清理并重新构建项目
- 检查依赖库版本

### Q2: 布局显示不正确？
A: 检查以下几点：
- 确认资源文件引用正确
- 检查布局层级是否合理
- 使用Layout Inspector查看
- 在不同屏幕尺寸上测试

### Q3: 自定义组件不显示？
A: 检查以下几点：
- 确认组件尺寸设置正确
- 检查onMeasure和onDraw方法
- 查看Logcat错误信息
- 简化组件逻辑进行调试

### Q4: 性能问题怎么办？
A: 优化建议：
- 使用ViewHolder模式
- 启用RecyclerView缓存
- 优化图片加载
- 减少过度绘制
- 使用Android Profiler分析

## 参考资料

### 项目文档
- `requirements.md` - 需求文档
- `design.md` - 设计文档
- `tasks.md` - 任务列表
- `IMPLEMENTATION_STATUS.md` - 实施状态
- `EXECUTION_SUMMARY.md` - 执行总结

### 技术文档
- [Android开发文档](https://developer.android.com/)
- [Material Design指南](https://material.io/design)
- [Glide文档](https://bumptech.github.io/glide/)
- [RxJava文档](https://github.com/ReactiveX/RxJava)

### 参考代码
- 已实现的MallHomeFragment
- 已实现的DingdangTagView
- 已实现的DingdangCheckBox
- 已实现的DrugListAdapter

## 联系和支持

如果在实施过程中遇到问题：
1. 查看本文档的常见问题部分
2. 查看执行总结报告中的技术实现亮点
3. 参考已实现的代码示例
4. 查看设计文档中的详细说明

## 进度跟踪

建议使用以下方式跟踪进度：
1. 在tasks.md中标记任务状态
2. 定期更新CHANGELOG.md
3. 记录遇到的问题到bugs.jsonl
4. 每周更新IMPLEMENTATION_STATUS.md

---

**文档版本:** 1.0  
**创建时间:** 2026-01-30T16:30:00+08:00  
**下次更新:** 完成任务A-C后

祝开发顺利！🚀
