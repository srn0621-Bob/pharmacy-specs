# 药品商城功能开发快速指南

## 文档导航

### 📋 主文档
**[药品商城功能详细修改文档.md](./药品商城功能详细修改文档.md)**
- 完整的功能需求说明
- 所有页面功能详细描述
- API接口清单（含实现状态）
- 页面跳转关系
- 数据模型定义
- 实施步骤和时间规划

### 🎨 UI设计文档
**[商城首页布局设计方案.md](./商城首页布局设计方案.md)**
- 完整的UI布局设计
- 所有XML布局文件（可直接使用）
- 所有Drawable资源文件
- 完整的Java实现代码
- 动画效果实现
- 性能优化建议

### 🔌 API补充文档
**[API需求补充说明.md](./API需求补充说明.md)**
- 后端API现状分析
- 需要补充的API详细说明
- 数据库表结构设计
- 实施优先级划分
- 开发工作量估算

---

## 快速开始

### 后端开发人员

#### 第一步：了解现状
阅读 [API需求补充说明.md](./API需求补充说明.md) 的"API现状检查"部分

**关键信息：**
- ✅ 购物车API已完整实现
- ✅ 药品基础API已实现
- ⚠️ 需要补充3个API（快捷分类、热门搜索、销售信息增强）

#### 第二步：实施开发
按照优先级实施API开发：

**高优先级（必须完成）：**
1. 快捷分类API
   - 文件：`DrugMallController.java`
   - 方法：`getQuickCategories()`
   - 预计：2小时

2. 药品销售信息增强
   - 修改：`DrugDTO.java`
   - 添加字段：addToCartCount、促销标签等
   - 预计：4小时

**中优先级（建议完成）：**
3. 热门搜索关键词API
   - 文件：`DrugMallController.java`
   - 方法：`getHotKeywords()`
   - 预计：2小时

#### 第三步：数据库更新
执行数据库迁移脚本（见API需求补充说明文档）

#### 第四步：测试
使用Postman测试新增的API接口

---

### 前端开发人员

#### 第一步：了解布局设计
阅读 [商城首页布局设计方案.md](./商城首页布局设计方案.md)

**关键特点：**
- 左侧分类导航（90dp宽，支持展开/收起）
- 顶部快捷分类横向滚动
- 右侧商品列表（带促销标签）
- 购物车角标实时更新

#### 第二步：创建项目结构
```
mshlwyy_patient/app/src/main/java/com/adinnet/demo/mall/
├── view/          # Activity和Fragment
├── presenter/     # MVP模式的Presenter
├── adapter/       # RecyclerView适配器
├── model/         # 数据模型
├── api/           # API接口定义
└── util/          # 工具类
```

#### 第三步：复制布局文件
从布局设计文档复制以下文件：
- `activity_drug_mall_main.xml`
- `include_search_bar.xml`
- `include_quick_categories.xml`
- `include_category_sidebar.xml`
- `include_drug_list.xml`
- `item_quick_category.xml`
- `item_category.xml`
- `item_drug.xml`

#### 第四步：复制Drawable资源
从布局设计文档复制以下资源：
- `bg_search_box.xml`
- `bg_cart_badge.xml`
- `bg_circle_category.xml`
- `bg_add_cart_button.xml`
- `bg_tag_orange.xml`
- `bg_tag_blue.xml`
- `selector_category_item.xml`
- `selector_category_text.xml`

#### 第五步：实现Activity和Adapter
参考布局设计文档中的Java代码：
- `DrugMallMainActivity.java`
- `QuickCategoryAdapter.java`
- `CategoryAdapter.java`
- `DrugListAdapter.java`

#### 第六步：集成API
参考主文档中的API调用示例

---

## API调用示例

### 获取快捷分类
```java
mallApiService.getQuickCategories()
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(response -> {
        if (response.isSuccess()) {
            showQuickCategories(response.getData());
        }
    });
```

### 获取购物车数量
```java
mallApiService.getCartItemCount(userId)
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(response -> {
        if (response.isSuccess()) {
            updateCartBadge(response.getData());
        }
    });
```

### 加入购物车
```java
CartOperationDTO operation = new CartOperationDTO();
operation.setUserId(userId);
operation.setDrugId(drugId);
operation.setQuantity(1);

mallApiService.addToCart(operation)
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(response -> {
        if (response.isSuccess()) {
            showToast("已加入购物车");
            updateCartBadge(response.getData().getTotalQuantity());
        }
    });
```

---

## 开发优先级

### 第一阶段（核心功能）
1. 商城首页（新布局）
2. 药品详情
3. 购物车
4. 订单确认
5. 订单列表和详情

### 第二阶段（辅助功能）
6. 药品分类页面
7. 药品搜索
8. 物流详情

### 第三阶段（优化）
9. 性能优化
10. 动画效果优化
11. 异常处理完善

---

## 常见问题

### Q1: 购物车API路径是什么？
A: 
- 获取数量：`GET /api/v1/mall/cart/{userId}/count`
- 添加商品：`POST /api/v1/mall/cart/add`
- 获取列表：`GET /api/v1/mall/cart/{userId}`

### Q2: 快捷分类和普通分类有什么区别？
A: 
- 快捷分类：首页顶部横向滚动的圆形图标分类（8-10个精选）
- 普通分类：左侧完整的分类列表（所有分类）

### Q3: 左侧分类默认显示多少个？
A: 默认显示12个分类，点击"全部▼"按钮可展开显示所有分类

### Q4: 商品卡片需要显示哪些促销标签？
A: 
- 包邮标签（橙色）
- 价保标签（蓝色）
- 分期标签
- 新品标签
- 热卖标签

### Q5: 购物车角标如何更新？
A: 
- 加入购物车成功后调用购物车数量API
- 使用缩放动画突出显示变化
- 数量为0时隐藏角标

---

## 联系方式

如有疑问，请联系：
- 后端负责人：[待补充]
- 前端负责人：[待补充]
- 项目经理：[待补充]

---

## 相关链接

- [主文档](./药品商城功能详细修改文档.md)
- [布局设计](./商城首页布局设计方案.md)
- [API补充说明](./API需求补充说明.md)
- [更新总结](./DOCUMENTATION_UPDATE_SUMMARY.md)

---

**最后更新：** 2026-01-21  
**版本：** v1.0
