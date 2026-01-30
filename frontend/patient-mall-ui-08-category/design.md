# 设计文档: 患者端药房商城UI - 分类页面

## 概述

本文档描述分类页面的设计方案。

## 组件设计

### MallCategoryFragment 布局

```xml
<LinearLayout orientation="horizontal">
    <!-- 左侧分类列表 -->
    <RecyclerView 
        id="rv_category"
        android:layout_width="100dp"
        android:layout_height="match_parent"/>
    
    <!-- 右侧药品列表 -->
    <RecyclerView 
        id="rv_drugs"
        android:layout_width="0dp"
        android:layout_weight="1"
        android:layout_height="match_parent"/>
</LinearLayout>
```

## Presenter 实现

```java
public class CategoryPresenterImpl implements CategoryPresenter {
    
    @Override
    public void loadCategories() {
        // 加载分类列表
    }
    
    @Override
    public void loadDrugsByCategory(String categoryId, int page) {
        // 加载分类药品
    }
}
```

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
