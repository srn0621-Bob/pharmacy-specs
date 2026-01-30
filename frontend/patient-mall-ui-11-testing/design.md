# 设计文档: 患者端药房商城UI - 测试和验收

## 概述

本文档描述测试和验收的设计方案。

## 测试策略

### 1. 单元测试

```java
// Presenter 测试示例
@Test
public void testLoadDrugDetail_Success() {
    // Given
    Drug mockDrug = createMockDrug();
    when(apiService.getDrugDetail(anyString()))
        .thenReturn(Observable.just(BaseResponse.success(mockDrug)));
    
    // When
    presenter.loadDrugDetail();
    
    // Then
    verify(view).showDrugDetail(mockDrug);
}

// 工具类测试示例
@Test
public void testCalculateTotalPrice() {
    // Given
    List<CartItem> items = createMockCartItems();
    
    // When
    BigDecimal totalPrice = PriceCalculator.calculateTotalPrice(items);
    
    // Then
    assertEquals(expected, totalPrice);
}
```

### 2. UI 测试

```java
// Espresso 测试示例
@Test
public void testDrugDetailDisplay() {
    // Given
    onView(withId(R.id.tv_name))
        .check(matches(isDisplayed()));
    
    // When
    onView(withId(R.id.btn_add_cart))
        .perform(click());
    
    // Then
    onView(withText("加入购物车成功"))
        .check(matches(isDisplayed()));
}
```

### 3. 集成测试

```java
// API 集成测试示例
@Test
public void testGetHomeData() {
    // When
    TestObserver<BaseResponse<MallHomeData>> testObserver = 
        apiService.getHomeData().test();
    
    // Then
    testObserver.awaitTerminalEvent();
    testObserver.assertNoErrors();
    testObserver.assertValue(response -> response.isSuccess());
}
```

## 测试覆盖率目标

- Presenter 层: > 80%
- 工具类: > 90%
- 核心业务逻辑: > 85%

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
