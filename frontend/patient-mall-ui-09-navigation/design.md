# 设计文档: 患者端药房商城UI - 底部导航和主容器

## 概述

本文档描述商城主容器和底部导航的设计方案。

## 组件设计

### MallMainActivity 布局

```xml
<LinearLayout orientation="vertical">
    <!-- ViewPager -->
    <androidx.viewpager.widget.ViewPager
        android:id="@+id/view_pager"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"/>
    
    <!-- 底部导航 -->
    <com.google.android.material.bottomnavigation.BottomNavigationView
        android:id="@+id/bottom_navigation"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:menu="@menu/menu_mall_bottom"/>
</LinearLayout>
```

## Fragment 管理

```java
public class MallMainActivity extends BaseActivity {
    
    private List<Fragment> fragments;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        fragments = Arrays.asList(
            new MallHomeFragment(),
            new MallCategoryFragment(),
            new CartFragment(),
            new MallMineFragment()
        );
        
        setupViewPager();
        setupBottomNavigation();
    }
}
```

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
