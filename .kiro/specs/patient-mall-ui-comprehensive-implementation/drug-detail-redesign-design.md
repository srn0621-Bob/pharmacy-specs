# 设计文档: 药品详情页重新设计

> **文档版本**: v1.0  
> **创建时间**: 2026-02-05  
> **设计依据**: UI_DESIGN_VISUALIZATION.md 药品详情页设计

## 目录

- [一、概述](#一概述)
- [二、架构设计](#二架构设计)
- [三、数据模型设计](#三数据模型设计)
- [四、UI组件设计](#四ui组件设计)
- [五、API接口设计](#五api接口设计)
- [六、实施方案](#六实施方案)
- [七、性能优化](#七性能优化)
- [八、测试策略](#八测试策略)

---

## 一、概述

### 1.1 设计目标

重新设计药品详情页，实现：
1. 信息层次清晰的展示结构
2. 完整的药品信息展示
3. 推荐商品和用户评价功能
4. 流畅的用户体验

### 1.2 核心设计原则

1. **模块化设计**: 每个信息模块独立，便于维护和扩展
2. **MVP架构**: 使用MVP架构模式，职责分明
3. **性能优先**: 优化图片加载和列表滚动性能
4. **视觉一致性**: 遵循慈贞快药设计规范

---

## 二、架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                DrugDetailActivity (View)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  - 图片轮播                                       │  │
│  │  - 价格区域                                       │  │
│  │  - 基本信息                                       │  │
│  │  - 促销活动                                       │  │
│  │  - 服务保障                                       │  │
│  │  - 店铺信息                                       │  │
│  │  - 推荐商品 (RecyclerView)                       │  │
│  │  - 商品详情Tab (TabLayout + ViewPager)           │  │
│  │  - 用户评价 (RecyclerView)                       │  │
│  │  - 底部操作栏                                     │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                       │
│                 ▼                                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │         DrugDetailPresenter (Presenter)          │  │
│  │  - loadDrugDetail()                              │  │
│  │  - loadRecommendDrugs()                          │  │
│  │  - loadReviews()                                 │  │
│  │  - addToCart()                                   │  │
│  │  - buyNow()                                      │  │
│  └──────────────┬───────────────────────────────────┘  │
└─────────────────┼───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                  Data Layer                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  MallApiService                                  │  │
│  │  - getDrugDetail(drugId)                         │  │
│  │  - getRecommendDrugs(drugId)                     │  │
│  │  - getDrugReviews(drugId, page, pageSize)       │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Fragment架构（Tab内容）

```
ViewPager
├── DrugDetailInfoFragment (商品详情)
├── MedicationGuideFragment (用药指南)
└── FAQFragment (常见问题)
```

---

## 三、数据模型设计

### 3.1 DrugDetail模型

```java
package com.adinnet.demo.mall.model;

import java.util.List;

/**
 * 药品详细信息模型
 */
public class DrugDetail {
    // 基本信息
    private String genericName;      // 通用名称
    private String productName;      // 商品名称
    private String specification;    // 规格型号
    private String manufacturer;     // 生产企业
    private String approvalNumber;   // 批准文号
    private String expiryDate;       // 有效期至
    
    // 详细信息
    private String indications;      // 适应症
    private String dosage;           // 用法用量
    private String adverseReactions; // 不良反应
    private String precautions;      // 注意事项
    
    // 用药指南
    private String medicationGuide;  // 用药指导
    
    // 常见问题
    private List<FAQ> faqs;          // 常见问题列表
    
    // Getters and Setters
}
```

### 3.2 Review模型

```java
package com.adinnet.demo.mall.model;

/**
 * 用户评价模型
 */
public class Review {
    private String userId;           // 用户ID
    private String userName;         // 用户昵称
    private String userAvatar;       // 用户头像URL
    private float rating;            // 评分（1-5星）
    private String content;          // 评价内容
    private String createTime;       // 评价时间
    
    // Getters and Setters
}
```

### 3.3 Promotion模型

```java
package com.adinnet.demo.mall.model;

/**
 * 促销活动模型
 */
public class Promotion {
    private String id;               // 活动ID
    private String title;            // 活动标题
    private String description;      // 活动描述
    private String iconUrl;          // 图标URL
    
    // Getters and Setters
}
```

### 3.4 ShopInfo模型

```java
package com.adinnet.demo.mall.model;

import java.util.List;

/**
 * 店铺信息模型
 */
public class ShopInfo {
    private String id;               // 店铺ID
    private String name;             // 店铺名称
    private String logo;             // 店铺Logo URL
    private List<String> tags;       // 服务标签（包邮、28分钟送达等）
    
    // Getters and Setters
}
```

### 3.5 扩展Drug模型

```java
package com.adinnet.demo.mall.model;

import java.util.List;

/**
 * 药品模型（扩展）
 */
public class Drug {
    // 现有字段...
    
    // 新增字段
    private DrugDetail detail;           // 详细信息
    private List<Promotion> promotions;  // 促销活动列表
    private List<String> services;       // 服务保障列表
    private ShopInfo shop;               // 店铺信息
    private List<String> images;         // 图片列表
    private List<String> tags;           // 标签列表（处方药、医保、OTC、自营等）
    
    // Getters and Setters
}
```

---

## 四、UI组件设计

### 4.1 Adapter设计

#### 4.1.1 RecommendDrugAdapter（推荐商品）

```java
package com.adinnet.demo.mall.adapter;

import android.content.Context;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.adinnet.demo.R;
import com.adinnet.demo.mall.model.Drug;
import com.bumptech.glide.Glide;

import java.util.List;

/**
 * 推荐商品适配器
 */
public class RecommendDrugAdapter extends RecyclerView.Adapter<RecommendDrugAdapter.ViewHolder> {
    
    private Context context;
    private List<Drug> drugs;
    private OnItemClickListener listener;
    
    public interface OnItemClickListener {
        void onItemClick(Drug drug);
    }
    
    public RecommendDrugAdapter(Context context, List<Drug> drugs) {
        this.context = context;
        this.drugs = drugs;
    }
    
    public void setOnItemClickListener(OnItemClickListener listener) {
        this.listener = listener;
    }
    
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(
            R.layout.item_recommend_drug, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        Drug drug = drugs.get(position);
        
        // 加载图片
        Glide.with(context)
            .load(drug.getImageUrl())
            .placeholder(R.drawable.ic_placeholder)
            .error(R.drawable.ic_error)
            .into(holder.ivDrug);
        
        // 设置名称
        holder.tvName.setText(drug.getName());
        
        // 设置价格
        holder.tvPrice.setText(String.format("¥%.2f", drug.getPrice()));
        
        // 点击事件
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(drug);
            }
        });
    }
    
    @Override
    public int getItemCount() {
        return drugs != null ? drugs.size() : 0;
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivDrug;
        TextView tvName;
        TextView tvPrice;
        
        ViewHolder(View itemView) {
            super(itemView);
            ivDrug = itemView.findViewById(R.id.iv_drug);
            tvName = itemView.findViewById(R.id.tv_name);
            tvPrice = itemView.findViewById(R.id.tv_price);
        }
    }
}
```

#### 4.1.2 ReviewAdapter（用户评价）

```java
package com.adinnet.demo.mall.adapter;

import android.content.Context;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RatingBar;
import android.widget.TextView;

import com.adinnet.demo.R;
import com.adinnet.demo.mall.model.Review;
import com.bumptech.glide.Glide;

import java.util.List;

/**
 * 用户评价适配器
 */
public class ReviewAdapter extends RecyclerView.Adapter<ReviewAdapter.ViewHolder> {
    
    private Context context;
    private List<Review> reviews;
    
    public ReviewAdapter(Context context, List<Review> reviews) {
        this.context = context;
        this.reviews = reviews;
    }
    
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(
            R.layout.item_review, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        Review review = reviews.get(position);
        
        // 加载头像
        Glide.with(context)
            .load(review.getUserAvatar())
            .placeholder(R.drawable.ic_avatar_placeholder)
            .circleCrop()
            .into(holder.ivAvatar);
        
        // 设置昵称和时间
        holder.tvUserName.setText(review.getUserName());
        holder.tvTime.setText(review.getCreateTime());
        
        // 设置评分
        holder.ratingBar.setRating(review.getRating());
        
        // 设置评价内容
        holder.tvContent.setText(review.getContent());
    }
    
    @Override
    public int getItemCount() {
        return reviews != null ? reviews.size() : 0;
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivAvatar;
        TextView tvUserName;
        TextView tvTime;
        RatingBar ratingBar;
        TextView tvContent;
        
        ViewHolder(View itemView) {
            super(itemView);
            ivAvatar = itemView.findViewById(R.id.iv_avatar);
            tvUserName = itemView.findViewById(R.id.tv_user_name);
            tvTime = itemView.findViewById(R.id.tv_time);
            ratingBar = itemView.findViewById(R.id.rating_bar);
            tvContent = itemView.findViewById(R.id.tv_content);
        }
    }
}
```

#### 4.1.3 DetailTabAdapter（Tab适配器）

```java
package com.adinnet.demo.mall.adapter;

import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;

import com.adinnet.demo.mall.fragment.DrugDetailInfoFragment;
import com.adinnet.demo.mall.fragment.FAQFragment;
import com.adinnet.demo.mall.fragment.MedicationGuideFragment;

/**
 * 商品详情Tab适配器
 */
public class DetailTabAdapter extends FragmentPagerAdapter {
    
    private String[] titles = {"商品详情", "用药指南", "常见问题"};
    
    public DetailTabAdapter(FragmentManager fm) {
        super(fm);
    }
    
    @Override
    public Fragment getItem(int position) {
        switch (position) {
            case 0:
                return new DrugDetailInfoFragment();
            case 1:
                return new MedicationGuideFragment();
            case 2:
                return new FAQFragment();
            default:
                return null;
        }
    }
    
    @Override
    public int getCount() {
        return titles.length;
    }
    
    @Override
    public CharSequence getPageTitle(int position) {
        return titles[position];
    }
}
```

### 4.2 Fragment设计

#### 4.2.1 DrugDetailInfoFragment（商品详情）

```java
package com.adinnet.demo.mall.fragment;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.adinnet.demo.R;
import com.adinnet.demo.mall.model.DrugDetail;

/**
 * 商品详情Fragment
 */
public class DrugDetailInfoFragment extends Fragment {
    
    private DrugDetail drugDetail;
    
    // UI组件
    private TextView tvGenericName;
    private TextView tvProductName;
    private TextView tvSpecification;
    private TextView tvManufacturer;
    private TextView tvApprovalNumber;
    private TextView tvExpiryDate;
    private TextView tvIndications;
    private TextView tvDosage;
    private TextView tvAdverseReactions;
    private TextView tvPrecautions;
    
    public static DrugDetailInfoFragment newInstance(DrugDetail detail) {
        DrugDetailInfoFragment fragment = new DrugDetailInfoFragment();
        Bundle args = new Bundle();
        args.putSerializable("detail", detail);
        fragment.setArguments(args);
        return fragment;
    }
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_drug_detail_info, container, false);
        
        // 初始化UI组件
        initViews(view);
        
        // 获取数据
        if (getArguments() != null) {
            drugDetail = (DrugDetail) getArguments().getSerializable("detail");
            displayDetail();
        }
        
        return view;
    }
    
    private void initViews(View view) {
        tvGenericName = view.findViewById(R.id.tv_generic_name);
        tvProductName = view.findViewById(R.id.tv_product_name);
        tvSpecification = view.findViewById(R.id.tv_specification);
        tvManufacturer = view.findViewById(R.id.tv_manufacturer);
        tvApprovalNumber = view.findViewById(R.id.tv_approval_number);
        tvExpiryDate = view.findViewById(R.id.tv_expiry_date);
        tvIndications = view.findViewById(R.id.tv_indications);
        tvDosage = view.findViewById(R.id.tv_dosage);
        tvAdverseReactions = view.findViewById(R.id.tv_adverse_reactions);
        tvPrecautions = view.findViewById(R.id.tv_precautions);
    }
    
    private void displayDetail() {
        if (drugDetail == null) return;
        
        tvGenericName.setText(drugDetail.getGenericName());
        tvProductName.setText(drugDetail.getProductName());
        tvSpecification.setText(drugDetail.getSpecification());
        tvManufacturer.setText(drugDetail.getManufacturer());
        tvApprovalNumber.setText(drugDetail.getApprovalNumber());
        tvExpiryDate.setText(drugDetail.getExpiryDate());
        tvIndications.setText(drugDetail.getIndications());
        tvDosage.setText(drugDetail.getDosage());
        tvAdverseReactions.setText(drugDetail.getAdverseReactions());
        tvPrecautions.setText(drugDetail.getPrecautions());
    }
}
```

---

## 五、API接口设计

### 5.1 获取药品详情

```java
/**
 * 获取药品详情
 * @param drugId 药品ID
 * @return Observable<ApiResponse<Drug>>
 */
@GET("api/mall/drug/detail/{drugId}")
Observable<ApiResponse<Drug>> getDrugDetail(@Path("drugId") String drugId);
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "id": "1001",
    "name": "皮炎平软膏",
    "price": 12.80,
    "originalPrice": 19.90,
    "images": ["url1", "url2", "url3"],
    "tags": ["处方药", "医保", "OTC", "自营"],
    "spec": "20g/支",
    "unit": "盒",
    "manufacturer": "XX制药有限公司",
    "detail": {
      "genericName": "复方醋酸地塞米松乳膏",
      "productName": "皮炎平软膏",
      "specification": "20g/支",
      "manufacturer": "XX制药股份有限公司",
      "approvalNumber": "国药准字H12345678",
      "expiryDate": "2026-12-31",
      "indications": "用于过敏性皮炎、湿疹、神经性皮炎...",
      "dosage": "外用。取适量涂于患处，一日2-3次...",
      "adverseReactions": "偶见皮肤刺激如烧灼感，或过敏反应...",
      "precautions": "1. 避免接触眼睛和其他黏膜..."
    },
    "promotions": [
      {
        "id": "p1",
        "title": "满减活动",
        "description": "满99减10 满199减30",
        "iconUrl": "url"
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

### 5.2 获取推荐商品

```java
/**
 * 获取推荐商品
 * @param drugId 药品ID
 * @return Observable<ApiResponse<List<Drug>>>
 */
@GET("api/mall/drug/recommend/{drugId}")
Observable<ApiResponse<List<Drug>>> getRecommendDrugs(@Path("drugId") String drugId);
```

### 5.3 获取用户评价

```java
/**
 * 获取用户评价
 * @param drugId 药品ID
 * @param page 页码
 * @param pageSize 每页数量
 * @return Observable<ApiResponse<ReviewResponse>>
 */
@GET("api/mall/drug/reviews/{drugId}")
Observable<ApiResponse<ReviewResponse>> getDrugReviews(
    @Path("drugId") String drugId,
    @Query("page") int page,
    @Query("pageSize") int pageSize
);
```

**响应示例**:
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
        "content": "效果很好，送货速度快，包装完整...",
        "createTime": "2026-01-20"
      }
    ]
  }
}
```

---

## 六、实施方案

### 6.1 方案选择

#### 方案A: 渐进式改造（推荐）

**优点**:
- 风险低，可以逐步验证效果
- 不影响现有功能
- 可以分阶段实施

**缺点**:
- 可能存在代码冗余
- 需要处理新旧代码的兼容

**实施步骤**:
1. 在现有DrugDetailActivity基础上添加新模块
2. 逐步替换旧的UI组件
3. 测试验证每个模块
4. 清理旧代码

#### 方案B: 全新重写

**优点**:
- 代码结构清晰
- 完全符合新设计
- 无历史包袱

**缺点**:
- 风险较高
- 需要完整测试
- 可能影响现有功能

**实施步骤**:
1. 创建新的Activity和布局
2. 实现所有新功能
3. 完整测试
4. 替换旧Activity

### 6.2 推荐方案：方案A（渐进式改造）

**理由**:
1. 现有代码已经运行，风险较低
2. 可以逐步验证效果
3. 便于问题定位和修复

---

## 七、性能优化

### 7.1 图片加载优化

```java
// 使用Glide加载图片，配置缓存策略
Glide.with(context)
    .load(imageUrl)
    .placeholder(R.drawable.ic_placeholder)
    .error(R.drawable.ic_error)
    .diskCacheStrategy(DiskCacheStrategy.ALL)
    .into(imageView);
```

### 7.2 RecyclerView优化

```java
// 设置固定大小
recyclerView.setHasFixedSize(true);

// 配置RecycledViewPool
RecyclerView.RecycledViewPool pool = new RecyclerView.RecycledViewPool();
pool.setMaxRecycledViews(0, 10);
recyclerView.setRecycledViewPool(pool);

// 设置预加载
LinearLayoutManager layoutManager = new LinearLayoutManager(context);
layoutManager.setInitialPrefetchItemCount(4);
recyclerView.setLayoutManager(layoutManager);
```

### 7.3 ViewPager优化

```java
// 设置预加载页面数
viewPager.setOffscreenPageLimit(2);
```

---

## 八、测试策略

### 8.1 单元测试

**测试内容**:
- DrugDetailPresenter业务逻辑测试
- 数据模型序列化/反序列化测试
- 工具类方法测试

**测试框架**: JUnit 4 + Mockito

### 8.2 UI测试

**测试内容**:
- 页面加载测试
- Tab切换测试
- 列表滚动测试
- 按钮点击测试

**测试框架**: Espresso

### 8.3 性能测试

**测试内容**:
- 页面加载时间测试
- 图片加载性能测试
- 滚动流畅度测试
- 内存占用测试

**测试工具**: Android Profiler

---

**文档版本:** 1.0  
**创建日期:** 2026-02-05  
**最后更新:** 2026-02-05
