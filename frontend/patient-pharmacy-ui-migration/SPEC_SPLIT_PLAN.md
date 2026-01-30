# 患者端药房商城UI迁移 - Spec拆分方案

## 概述

将 dingdang-pharmacy React Web 应用迁移到 mshlwyy_patient Android 应用的任务拆分为多个独立的小 spec,每个 spec 可以独立开发和测试。

## 拆分原则

1. **独立性**: 每个 spec 可以独立开发和测试
2. **渐进性**: 按照依赖关系排序,后续 spec 依赖前面的 spec
3. **可交付**: 每个 spec 完成后都有可演示的成果
4. **命名规范**: `patient-mall-ui-{阶段序号}-{功能名称}`

## Spec 列表

### 阶段一: 基础架构 (2个spec)

#### Spec 1: patient-mall-ui-01-foundation
**功能**: 搭建基础架构和数据模型
**工作量**: 4-5小时
**内容**:
- 创建项目目录结构
- 定义数据模型类(Drug, CartItem, Category, Order, Address)
- 创建 API 接口定义
- 定义 MVP 接口
- 创建基础工具类(CartManager, PriceCalculator, ImageLoader)

**交付物**:
- 完整的包结构
- 所有数据模型类
- MallApiService 接口
- MVP View 和 Presenter 接口
- 工具类实现

**依赖**: 无

---

#### Spec 2: patient-mall-ui-02-resources
**功能**: 准备 UI 资源和样式
**工作量**: 3-4小时
**内容**:
- 创建颜色资源(colors.xml)
- 创建尺寸资源(dimens.xml)
- 创建样式资源(styles.xml)
- 创建可绘制资源(背景、按钮、标签等)
- 创建公共布局组件(搜索栏、空状态、加载状态等)

**交付物**:
- 完整的 UI 资源文件
- 可复用的布局组件
- 统一的视觉风格

**依赖**: Spec 1

---

### 阶段二: 核心页面 (3个spec)

#### Spec 3: patient-mall-ui-03-home
**功能**: 实现商城首页
**工作量**: 6-8小时
**内容**:
- 创建 MallHomeFragment 布局
- 实现 MallHomePresenter
- 实现 MallHomeFragment 类
- 创建分类适配器 CategoryAdapter
- 创建药品列表适配器 DrugListAdapter
- 实现下拉刷新功能
- 实现轮播图功能

**交付物**:
- 可浏览的商城首页
- 支持下拉刷新
- 可点击跳转到详情页(占位)

**依赖**: Spec 1, Spec 2

---

#### Spec 4: patient-mall-ui-04-detail
**功能**: 实现药品详情页
**工作量**: 5-6小时
**内容**:
- 创建 DrugDetailActivity 布局
- 实现 DrugDetailPresenter
- 实现 DrugDetailActivity 类
- 创建推荐药品适配器 RecommendAdapter
- 实现加入购物车功能
- 实现加入购物车成功弹窗
- 实现立即购买功能

**交付物**:
- 完整的药品详情页
- 可加入购物车
- 可查看相关推荐

**依赖**: Spec 1, Spec 2, Spec 3

---

#### Spec 5: patient-mall-ui-05-cart
**功能**: 实现购物车页面
**工作量**: 5-7小时
**内容**:
- 创建 CartFragment 布局
- 实现 CartPresenter
- 实现 CartFragment 类
- 创建购物车项适配器 CartItemAdapter
- 实现数量选择器自定义控件
- 实现选中/取消选中功能
- 实现数量修改功能
- 实现删除功能
- 实现总价计算
- 实现空状态显示

**交付物**:
- 完整的购物车页面
- 支持商品管理
- 可跳转到结算页(占位)

**依赖**: Spec 1, Spec 2, Spec 4

---

### 阶段三: 辅助功能 (3个spec)

#### Spec 6: patient-mall-ui-06-checkout
**功能**: 实现结算页面
**工作量**: 4-5小时
**内容**:
- 创建 CheckoutActivity 布局
- 实现 CheckoutPresenter
- 实现 CheckoutActivity 类
- 实现收货地址选择
- 实现支付方式选择
- 实现订单提交
- 实现价格明细显示

**交付物**:
- 完整的结算页面
- 可提交订单
- 可跳转到支付页(占位)

**依赖**: Spec 1, Spec 2, Spec 5

---

#### Spec 7: patient-mall-ui-07-search
**功能**: 实现搜索功能
**工作量**: 4-5小时
**内容**:
- 创建 SearchActivity 布局
- 实现 SearchPresenter
- 实现 SearchActivity 类
- 实现搜索历史管理
- 实现热门搜索显示
- 实现实时搜索建议
- 实现搜索结果展示

**交付物**:
- 完整的搜索页面
- 支持搜索历史
- 支持热门搜索

**依赖**: Spec 1, Spec 2, Spec 3

---

#### Spec 8: patient-mall-ui-08-category
**功能**: 实现分类页面
**工作量**: 3-4小时
**内容**:
- 创建 MallCategoryFragment 布局
- 实现 CategoryPresenter
- 实现 MallCategoryFragment 类
- 实现左侧分类列表
- 实现右侧药品列表
- 实现分页加载

**交付物**:
- 完整的分类页面
- 支持分类浏览
- 支持分页加载

**依赖**: Spec 1, Spec 2, Spec 3

---

### 阶段四: 集成和优化 (2个spec)

#### Spec 9: patient-mall-ui-09-navigation
**功能**: 实现底部导航和主容器
**工作量**: 3-4小时
**内容**:
- 创建 MallMainActivity 布局
- 实现 MallMainActivity 类
- 配置 ViewPager 和 Fragment 适配器
- 配置 BottomNavigationView
- 实现购物车数量角标
- 创建"我的"页面占位 Fragment
- 集成到主应用导航

**交付物**:
- 完整的商城主容器
- 支持底部导航切换
- 可从主应用进入商城

**依赖**: Spec 3, Spec 5, Spec 8

---

#### Spec 10: patient-mall-ui-10-optimization
**功能**: 性能优化和安全加固
**工作量**: 4-5小时
**内容**:
- 优化图片加载(Glide 配置)
- 优化列表滚动(RecyclerView 优化)
- 优化网络请求(OkHttp 缓存)
- 实现统一错误处理
- 实现 Token 管理
- 实现敏感数据加密
- 配置网络安全策略
- 添加关键操作日志

**交付物**:
- 优化后的性能表现
- 完善的错误处理
- 安全的数据传输

**依赖**: 所有前面的 spec

---

### 阶段五: 测试和验收 (1个spec)

#### Spec 11: patient-mall-ui-11-testing
**功能**: 测试和验收
**工作量**: 4-6小时
**内容**:
- 编写单元测试(Presenter 层)
- 编写 UI 测试(Espresso)
- 编写集成测试
- 功能测试
- UI/UX 测试
- 性能测试
- 代码审查和文档

**交付物**:
- 完整的测试套件
- 测试报告
- 使用文档

**依赖**: 所有前面的 spec

---

## 依赖关系图

```
Spec 1 (基础架构) ✅
  ↓
Spec 2 (UI资源) ✅
  ↓
  ├─→ Spec 3 (首页) ✅
  │     ↓
  │     ├─→ Spec 4 (详情) ✅
  │     │     ↓
  │     │     └─→ Spec 5 (购物车) ✅
  │     │           ↓
  │     │           └─→ Spec 6 (结算) ✅
  │     ├─→ Spec 7 (搜索) ✅
  │     └─→ Spec 8 (分类) ✅
  │
  └─→ Spec 9 (导航) ✅ ← 依赖 Spec 3, 5, 8
        ↓
      Spec 10 (优化) ✅ ← 依赖所有前面的spec
        ↓
      Spec 11 (测试) ✅ ← 依赖所有前面的spec
```

## 实施建议

### 串行开发方案
按照 Spec 1 → Spec 2 → Spec 3 → ... → Spec 11 的顺序依次开发

**总时间**: 45-58小时 (约6-8个工作日)

### 部分并行方案
- **第一批**: Spec 1, Spec 2 (串行, 7-9小时)
- **第二批**: Spec 3 (6-8小时)
- **第三批**: Spec 4, Spec 7, Spec 8 (可并行, 最长6小时)
- **第四批**: Spec 5 (5-7小时)
- **第五批**: Spec 6 (4-5小时)
- **第六批**: Spec 9 (3-4小时)
- **第七批**: Spec 10 (4-5小时)
- **第八批**: Spec 11 (4-6小时)

**总时间**: 约33-44小时 (如果有3人并行开发)

## 下一步行动

1. 为每个 spec 创建独立的目录和文档
2. 每个 spec 包含:
   - `requirements.md` - 需求文档
   - `design.md` - 设计文档
   - `tasks.md` - 任务列表
3. 按照顺序逐个实施

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
