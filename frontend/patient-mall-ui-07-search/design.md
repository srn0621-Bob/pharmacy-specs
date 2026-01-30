# 设计文档: 患者端药房商城UI - 搜索功能

## 概述

本文档描述搜索功能的设计方案。

## 组件设计

### SearchActivity 布局

```xml
<LinearLayout orientation="vertical">
    <!-- 搜索栏 -->
    <LinearLayout>
        <EditText id="et_search" hint="搜索药品名称"/>
        <Button id="btn_search" text="搜索"/>
    </LinearLayout>
    
    <!-- 搜索历史 -->
    <LinearLayout id="layout_history">
        <TextView text="搜索历史"/>
        <FlexboxLayout id="fl_history"/>
        <TextView id="tv_clear_history" text="清空"/>
    </LinearLayout>
    
    <!-- 热门搜索 -->
    <LinearLayout id="layout_hot">
        <TextView text="热门搜索"/>
        <FlexboxLayout id="fl_hot"/>
    </LinearLayout>
    
    <!-- 搜索结果 -->
    <RecyclerView id="rv_result"/>
</LinearLayout>
```

## Presenter 实现

```java
public class SearchPresenterImpl implements SearchPresenter {
    
    @Override
    public void search(String keyword) {
        // 执行搜索
    }
    
    @Override
    public void loadSearchHistory() {
        // 加载搜索历史
    }
    
    @Override
    public void loadHotKeywords() {
        // 加载热门搜索
    }
}
```

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
