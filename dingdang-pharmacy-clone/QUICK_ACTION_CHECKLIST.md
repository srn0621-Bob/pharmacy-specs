# 快速执行清单 - 慈贞药房 Android 迁移

## 🎯 目标：100% 还原 React 版本 UI

---

## ✅ 第一步：验证现有资源（5分钟）

### 检查清单
- [x] 颜色定义 - `colors_dingdang.xml` ✅ 已精确匹配
- [x] 尺寸定义 - `dimens_dingdang.xml` ✅ 已定义
- [x] 样式定义 - `styles_dingdang.xml` ✅ 已创建
- [ ] 图标资源 - 需补充 Material Icons
- [ ] 动画资源 - 需创建弹窗动画

---

## 🔨 第二步：关键组件实现（按优先级）

### Priority 1: 首页瀑布流 ⭐⭐⭐
**文件**: `MallHomeFragment.java` + `fragment_mall_home.xml`

**需要修改:**
```java
// 1. 修改 LayoutManager
StaggeredGridLayoutManager layoutManager = 
    new StaggeredGridLayoutManager(2, StaggeredGridLayoutManager.VERTICAL);

// 2. 设置间距
recyclerView.addItemDecoration(new GridSpacingItemDecoration(2, 12, false));

// 3. 优化滚动性能
recyclerView.setHasFixedSize(false); // 瀑布流高度不固定
```

**预期效果**: 左右两列商品卡片高度不同，自然瀑布流

---

### Priority 2: 加购成功弹窗 ⭐⭐⭐
**文件**: `AddCartSuccessDialog.java` + `dialog_add_cart_success_full.xml`

**需要创建:**
```java
public class AddCartSuccessBottomSheet extends BottomSheetDialogFragment {
    @Override
    public View onCreateView(...) {
        View view = inflater.inflate(R.layout.dialog_add_cart_success_full, ...);
        
        // 设置推荐商品网格 (3列)
        RecyclerView rvRecommend = view.findViewById(R.id.rv_recommend);
        rvRecommend.setLayoutManager(new GridLayoutManager(context, 3));
        
        return view;
    }
}
```

**预期效果**: 从底部滑出，顶部圆角 32dp，背景半透明遮罩

---

### Priority 3: 购物车嵌套滚动 ⭐⭐
**文件**: `MallCartFragment.java` + `fragment_mall_cart.xml`

**需要优化:**
```xml
<androidx.core.widget.NestedScrollView>
    <LinearLayout>
        <!-- 购物车列表 -->
        <RecyclerView
            android:nestedScrollingEnabled="false"
            android:layout_height="wrap_content"/>
        
        <!-- 推荐商品 -->
        <RecyclerView
            android:nestedScrollingEnabled="false"
            android:layout_height="wrap_content"/>
    </LinearLayout>
</androidx.core.widget.NestedScrollView>
```

**预期效果**: 流畅滚动，无卡顿

---

### Priority 4: 支付页渐变背景 ⭐
**文件**: `CheckoutActivity.java` + `activity_checkout.xml`

**需要创建:**
```xml
<!-- drawable/bg_checkout_header_gradient.xml -->
<shape>
    <gradient
        android:startColor="#059669"
        android:endColor="#10b981"
        android:angle="270"/>
</shape>
```

**预期效果**: 顶部绿色渐变，价格居中显示

---

## 🎨 第三步：视觉细节打磨

### 细节清单
- [ ] 搜索框改为完全圆角 (9999dp)
- [ ] 分类图标背景色调整（10种不同颜色）
- [ ] 商品卡片阴影调整为 elevation 4dp
- [ ] 标签圆角统一为 4dp
- [ ] 价格符号大小调整（¥ 小号，数字大号）

---

## 📊 第四步：数据对接

### 模拟数据 vs 真实 API
```java
// 当前使用 MockDataGenerator
// 需要对接真实 API:
// - GET /api/mall/drugs - 商品列表
// - POST /api/mall/cart/add - 加入购物车
// - GET /api/mall/cart - 购物车列表
```

---

## 🧪 第五步：测试验证

### 测试场景
1. **首页滚动测试**
   - 快速滑动不卡顿
   - 图片加载流畅
   - 瀑布流布局正确

2. **加购流程测试**
   - 点击"加入清单"按钮
   - 弹窗从底部滑出
   - 推荐商品正确显示
   - 点击"去清单结算"跳转正确

3. **购物车测试**
   - 商品数量修改
   - 全选/取消全选
   - 价格计算正确
   - 提交订单跳转

4. **支付测试**
   - 倒计时正常运行
   - 支付方式选择
   - 支付按钮点击

---

## 🚀 立即开始

### 建议执行顺序
1. ✅ 阅读完整迁移指南
2. 🔨 实现首页瀑布流（最重要）
3. 🔨 实现加购弹窗（用户体验关键）
4. 🔨 优化购物车滚动
5. 🔨 完成支付页
6. 🎨 细节打磨
7. 🧪 全流程测试

---

## 💡 关键提示

### 避免的坑
1. **不要**使用 GridLayoutManager，必须用 StaggeredGridLayoutManager
2. **不要**在 RecyclerView 内嵌套 RecyclerView 时忘记设置 `nestedScrollingEnabled="false"`
3. **不要**忘记设置 BottomSheetDialog 的圆角背景
4. **不要**硬编码颜色和尺寸，使用资源文件

### 最佳实践
1. **复用**现有的 DingdangTagView、DingdangCheckBox 组件
2. **统一**使用 Glide 加载图片
3. **封装**通用的商品卡片组件
4. **测试**在不同屏幕尺寸上的显示效果

---

## 📞 需要帮助？

如果遇到问题，请提供：
1. 具体的错误信息或截图
2. 相关的代码片段
3. 期望的效果描述

我会立即协助解决！

---

**准备好开始了吗？告诉我从哪个部分开始！** 🚀
