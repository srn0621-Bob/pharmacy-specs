# 药品详情页重新设计规范

> **版本**: v2.0  
> **创建时间**: 2026-02-04  
> **设计依据**: UI_DESIGN_VISUALIZATION.md 药品详情页设计

## 一、设计目标

根据真实药品详情页截图和UI设计文档，重新设计药品详情页，实现：

1. **信息层次清晰** - 价格 → 基本信息 → 促销 → 服务 → 详情
2. **模块化布局** - 每个信息模块独立卡片，间距8dp
3. **完整信息展示** - 商品详情、用药指南、常见问题Tab切换
4. **推荐商品** - 横向滚动展示，增加曝光和转化
5. **用户评价** - 显示评分和用户评论

## 二、页面结构

### 2.1 整体布局

```
CoordinatorLayout (根布局)
├── NestedScrollView (可滚动内容)
│   └── LinearLayout (垂直布局)
│       ├── 图片轮播区域 (HBanner)
│       ├── 价格区域 (CardView)
│       ├── 药品基本信息 (CardView)
│       ├── 促销活动 (CardView)
│       ├── 服务保障 (CardView)
│       ├── 店铺信息 (CardView)
│       ├── 推荐商品 (CardView + RecyclerView)
│       ├── 商品详情Tab (TabLayout + ViewPager)
│       └── 用户评价 (CardView)
└── 底部操作栏 (LinearLayout, 固定底部)
    ├── 客服图标
    ├── 购物车图标
    ├── 加入购物车按钮
    └── 立即购买按钮
```

### 2.2 新增模块

1. **推荐商品模块** - 横向滚动RecyclerView
2. **商品详情Tab** - TabLayout切换显示不同内容
3. **用户评价模块** - 显示评分和评论列表

## 三、详细设计

### 3.1 图片轮播区域

**布局**: FrameLayout包裹HBanner和顶部操作栏

**特点**:
- 全宽显示，正方形比例
- 顶部操作栏悬浮在图片上方（透明背景）
- 支持多图轮播，显示页码指示器

**组件**:
- HBanner: 图片轮播
- ImageView: 返回按钮、收藏按钮、分享按钮

### 3.2 价格区域

**布局**: CardView包裹LinearLayout

**内容**:
- 左侧: 大号价格（32sp, 翠绿色, 粗体）
- 右侧: 分享赚按钮、收藏按钮

**样式**:
- 16dp圆角
- 16dp padding
- 白色背景

### 3.3 药品基本信息

**布局**: CardView包裹LinearLayout

**内容**:
- 标签组（处方药、医保、OTC、自营等）
- 药品名称（18sp, 粗体）
- 规格、单位、生产企业（键值对形式）

**样式**:
- 16dp圆角
- 16dp padding
- 白色背景
- 8dp margin top

### 3.4 促销活动

**布局**: CardView包裹LinearLayout

**内容**:
- 多个促销项，每项包含：
  - 图标（绿色）
  - 活动文字
  - 右箭头

**样式**:
- 16dp圆角
- 16dp padding
- 白色背景
- 8dp margin top
- 每项可点击，显示活动详情

### 3.5 服务保障

**布局**: CardView包裹LinearLayout

**内容**:
- 28分钟送药上门
- 药师在线咨询
- 正品保障 假一赔十

**样式**:
- 16dp圆角
- 16dp padding
- 白色背景
- 8dp margin top
- 每项带图标

### 3.6 店铺信息

**布局**: CardView包裹LinearLayout

**内容**:
- 店铺Logo
- 店铺名称
- 服务标签（包邮、28分钟送达）
- 右箭头

**样式**:
- 16dp圆角
- 16dp padding
- 白色背景
- 8dp margin top
- 可点击进入店铺页面

### 3.7 推荐商品（新增）

**布局**: CardView包裹LinearLayout + RecyclerView

**内容**:
- 标题栏："为你推荐" + "查看更多"按钮
- 横向滚动的药品列表（3-6个商品）

**样式**:
- 16dp圆角
- 16dp padding
- 白色背景
- 8dp margin top
- RecyclerView横向布局

**商品卡片**:
- 图片（1:1比例）
- 药品名称（1行，超出省略）
- 价格（翠绿色）

### 3.8 商品详情Tab（新增）

**布局**: CardView包裹LinearLayout + TabLayout + ViewPager

**Tab选项**:
1. 商品详情
2. 用药指南
3. 常见问题

**内容**:
- TabLayout: 3个Tab切换
- ViewPager: 显示对应内容

**商品详情内容**:
- 通用名称
- 商品名称
- 规格型号
- 生产企业
- 批准文号
- 有效期至
- 适应症
- 用法用量
- 不良反应
- 注意事项

**样式**:
- 16dp圆角
- 16dp padding
- 白色背景
- 8dp margin top

### 3.9 用户评价（新增）

**布局**: CardView包裹LinearLayout + RecyclerView

**内容**:
- 标题栏："用户评价 (数量)" + "查看全部"按钮
- 平均评分（星级 + 分数）
- 评论列表（显示2-3条）

**评论项**:
- 用户头像
- 用户昵称
- 评价时间
- 星级评分
- 评价内容

**样式**:
- 16dp圆角
- 16dp padding
- 白色背景
- 8dp margin top

### 3.10 底部操作栏

**布局**: LinearLayout固定在底部

**内容**:
- 客服图标（48dp）
- 购物车图标（48dp）
- 加入购物车按钮（白色背景，绿色边框）
- 立即购买按钮（绿色背景，白色文字）

**样式**:
- 白色背景
- 16dp padding
- 4dp elevation（阴影）
- 按钮48dp高度

## 四、实施计划

### 4.1 布局文件调整

**文件**: `activity_drug_detail_new.xml`

**需要调整的部分**:
1. 添加推荐商品模块
2. 添加商品详情Tab模块
3. 添加用户评价模块
4. 调整各模块间距为8dp
5. 优化底部操作栏布局

### 4.2 Activity代码调整

**文件**: `DrugDetailActivity.java`

**需要添加的功能**:
1. 推荐商品数据加载和显示
2. Tab切换逻辑
3. 用户评价数据加载和显示
4. 收藏功能
5. 分享功能
6. 促销活动点击事件
7. 店铺信息点击事件

### 4.3 新增Adapter

1. **RecommendDrugAdapter** - 推荐商品适配器（已存在）
2. **DetailTabAdapter** - 商品详情Tab适配器（新增）
3. **ReviewAdapter** - 用户评价适配器（新增）

### 4.4 新增Fragment

1. **DrugDetailFragment** - 商品详情Fragment
2. **MedicationGuideFragment** - 用药指南Fragment
3. **FAQFragment** - 常见问题Fragment

### 4.5 新增Model

1. **DrugDetail** - 药品详细信息模型
2. **Review** - 用户评价模型
3. **Promotion** - 促销活动模型

## 五、数据模型设计

### 5.1 DrugDetail模型

```java
public class DrugDetail {
    private String genericName;      // 通用名称
    private String productName;      // 商品名称
    private String specification;    // 规格型号
    private String manufacturer;     // 生产企业
    private String approvalNumber;   // 批准文号
    private String expiryDate;       // 有效期至
    private String indications;      // 适应症
    private String dosage;           // 用法用量
    private String adverseReactions; // 不良反应
    private String precautions;      // 注意事项
}
```

### 5.2 Review模型

```java
public class Review {
    private String userId;           // 用户ID
    private String userName;         // 用户昵称
    private String userAvatar;       // 用户头像
    private float rating;            // 评分（1-5星）
    private String content;          // 评价内容
    private String createTime;       // 评价时间
}
```

### 5.3 Promotion模型

```java
public class Promotion {
    private String id;               // 活动ID
    private String title;            // 活动标题
    private String description;      // 活动描述
    private String iconUrl;          // 图标URL
}
```

## 六、API接口设计

### 6.1 获取药品详情

**接口**: `GET /api/mall/drug/detail/{drugId}`

**响应**:
```json
{
  "code": 200,
  "data": {
    "id": "1001",
    "name": "皮炎平软膏",
    "price": 12.80,
    "originalPrice": 19.90,
    "images": ["url1", "url2"],
    "tags": ["处方药", "医保", "OTC", "自营"],
    "spec": "20g/支",
    "unit": "盒",
    "manufacturer": "XX制药有限公司",
    "detail": {
      "genericName": "...",
      "productName": "...",
      // ... 其他详细信息
    },
    "promotions": [
      {
        "id": "p1",
        "title": "满减活动",
        "description": "满99减10 满199减30"
      }
    ],
    "services": [
      "28分钟送药上门",
      "药师在线咨询",
      "正品保障 假一赔十"
    ],
    "shop": {
      "id": "s1",
      "name": "叮当快药自营店",
      "logo": "url",
      "tags": ["包邮", "28分钟送达"]
    }
  }
}
```

### 6.2 获取推荐商品

**接口**: `GET /api/mall/drug/recommend/{drugId}`

**响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "2001",
      "name": "推荐药品1",
      "price": 18.90,
      "imageUrl": "url"
    }
  ]
}
```

### 6.3 获取用户评价

**接口**: `GET /api/mall/drug/reviews/{drugId}`

**参数**:
- page: 页码
- pageSize: 每页数量

**响应**:
```json
{
  "code": 200,
  "data": {
    "averageRating": 4.9,
    "totalCount": 1234,
    "reviews": [
      {
        "userId": "u1",
        "userName": "用户昵称",
        "userAvatar": "url",
        "rating": 5.0,
        "content": "效果很好...",
        "createTime": "2026-01-20"
      }
    ]
  }
}
```

## 七、实施步骤

### 步骤1: 创建新的布局文件

创建 `activity_drug_detail_v2.xml`，包含所有新增模块

### 步骤2: 创建新的Adapter和Fragment

1. DetailTabAdapter
2. ReviewAdapter
3. DrugDetailFragment
4. MedicationGuideFragment
5. FAQFragment

### 步骤3: 创建新的Model类

1. DrugDetail
2. Review
3. Promotion

### 步骤4: 更新DrugDetailActivity

添加新功能的实现逻辑

### 步骤5: 创建Presenter

创建 `DrugDetailPresenter` 处理业务逻辑

### 步骤6: 测试和优化

测试所有功能，优化性能和用户体验

## 八、注意事项

1. **图片加载优化** - 使用Glide加载图片，设置占位图和错误图
2. **数据缓存** - 缓存药品详情数据，减少网络请求
3. **滚动性能** - 优化RecyclerView滚动性能
4. **动画效果** - 添加平滑的过渡动画
5. **错误处理** - 处理网络错误和数据异常
6. **空状态** - 处理无推荐商品、无评价等空状态

## 九、验收标准

1. ✅ 所有模块正确显示
2. ✅ 图片轮播正常工作
3. ✅ Tab切换流畅
4. ✅ 推荐商品可点击跳转
5. ✅ 评价列表正确显示
6. ✅ 加入购物车功能正常
7. ✅ 立即购买功能正常
8. ✅ 收藏和分享功能正常
9. ✅ 促销活动可点击查看详情
10. ✅ 店铺信息可点击进入店铺页面

---

**文档版本**: v2.0  
**创建时间**: 2026-02-04  
**状态**: 待实施
