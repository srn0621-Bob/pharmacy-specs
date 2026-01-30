# 设计文档: 患者端药房商城UI - 结算页面

## 概述

本文档描述结算页面的设计方案。

## 组件设计

### CheckoutActivity 布局

```xml
<ScrollView>
    <LinearLayout orientation="vertical">
        <!-- 收货地址卡片 -->
        <CardView>
            <LinearLayout>
                <TextView text="收货人信息"/>
                <TextView id="tv_address"/>
            </LinearLayout>
        </CardView>
        
        <!-- 商品列表卡片 -->
        <CardView>
            <RecyclerView id="rv_goods"/>
        </CardView>
        
        <!-- 价格明细卡片 -->
        <CardView>
            <TextView text="商品总价"/>
            <TextView id="tv_goods_price"/>
            <TextView text="运费"/>
            <TextView id="tv_shipping_fee"/>
        </CardView>
        
        <!-- 支付方式卡片 -->
        <CardView>
            <RadioGroup id="rg_payment">
                <RadioButton text="微信支付"/>
                <RadioButton text="支付宝支付"/>
            </RadioGroup>
        </CardView>
    </LinearLayout>
</ScrollView>

<!-- 底部提交按钮 -->
<LinearLayout layout_gravity="bottom">
    <TextView id="tv_total_price"/>
    <Button id="btn_submit" text="提交订单"/>
</LinearLayout>
```

## Presenter 实现

```java
public class CheckoutPresenterImpl implements CheckoutPresenter {
    
    @Override
    public void loadCheckoutData(List<String> cartItemIds) {
        // 加载结算数据
    }
    
    @Override
    public void submitOrder() {
        // 提交订单
    }
}
```

## 正确性属性

### Property 1: 价格计算正确性

*对于任意*订单,订单总价应该等于商品总价加上运费

**验证: 需求 3.1-3.3**

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
