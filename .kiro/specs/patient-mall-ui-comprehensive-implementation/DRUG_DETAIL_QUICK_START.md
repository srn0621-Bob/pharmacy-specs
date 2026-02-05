# 药品详情页重新设计 - 快速开始指南

> **版本**: v1.0  
> **创建时间**: 2026-02-04  
> **目标**: 30分钟内完成第一个模块

## 一、准备工作

### 1.1 查看设计文档

阅读以下文档了解设计细节：
- `DRUG_DETAIL_REDESIGN_SPEC.md` - 完整设计规范
- `UI_DESIGN_VISUALIZATION.md` - UI可视化设计
- `DRUG_DETAIL_IMPLEMENTATION_TASKS.md` - 实施任务清单

### 1.2 确认现有代码

检查以下文件：
- `activity_drug_detail_new.xml` - 现有布局文件
- `DrugDetailActivity.java` - 现有Activity代码
- `Drug.java` - 药品模型
- `RecommendDrugAdapter.java` - 推荐商品适配器（已存在）

## 二、快速实施路径

### 方案A: 渐进式改造（推荐）

**优点**: 风险低，可以逐步验证效果  
**适合**: 现有代码已经运行，不想大改

**步骤**:
1. 先添加推荐商品模块（最简单）
2. 再添加用户评价模块
3. 最后添加Tab切换模块

### 方案B: 全新重写

**优点**: 代码结构清晰，完全符合设计  
**适合**: 现有代码问题较多，需要重构

**步骤**:
1. 创建新的布局文件 `activity_drug_detail_v2.xml`
2. 创建新的Activity `DrugDetailActivityV2.java`
3. 逐步迁移功能

## 三、30分钟快速开始（方案A）

### 第1步: 添加推荐商品模块 (10分钟)

#### 1.1 创建布局文件

创建 `mall_include_recommend_drugs.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<android.support.v7.widget.CardView 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginStart="@dimen/dingdang_spacing_medium"
    android:layout_marginEnd="@dimen/dingdang_spacing_medium"
    android:layout_marginTop="@dimen/dingdang_spacing_small"
    app:cardCornerRadius="@dimen/dingdang_corner_large"
    app:cardElevation="@dimen/dingdang_card_elevation">
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="@dimen/dingdang_spacing_large">
        
        <!-- 标题栏 -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical">
            
            <TextView
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="为你推荐"
                android:textColor="@color/dingdang_text_primary"
                android:textSize="@dimen/dingdang_text_large"
                android:textStyle="bold"/>
            
            <TextView
                android:id="@+id/tv_view_more"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="查看更多"
                android:textColor="@color/dingdang_text_secondary"
                android:textSize="@dimen/dingdang_text_body"
                android:background="?attr/selectableItemBackground"
                android:padding="@dimen/dingdang_spacing_small"/>
        </LinearLayout>
        
        <!-- 推荐商品列表 -->
        <android.support.v7.widget.RecyclerView
            android:id="@+id/rv_recommend_drugs"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="@dimen/dingdang_spacing_medium"
            android:orientation="horizontal"/>
    </LinearLayout>
</android.support.v7.widget.CardView>
```

#### 1.2 在主布局中引入

在 `activity_drug_detail_new.xml` 的店铺信息后面添加:

```xml
<!-- 推荐商品 -->
<include layout="@layout/mall_include_recommend_drugs"/>
```

#### 1.3 在Activity中初始化

在 `DrugDetailActivity.java` 中添加:

```java
private RecyclerView rvRecommendDrugs;
private RecommendDrugAdapter recommendDrugAdapter;

private void initViews() {
    // ... 现有代码
    
    // 推荐商品
    rvRecommendDrugs = findViewById(R.id.rv_recommend_drugs);
    setupRecommendDrugs();
}

private void setupRecommendDrugs() {
    // 设置横向布局
    LinearLayoutManager layoutManager = new LinearLayoutManager(
        this, LinearLayoutManager.HORIZONTAL, false);
    rvRecommendDrugs.setLayoutManager(layoutManager);
    
    // 创建适配器
    recommendDrugAdapter = new RecommendDrugAdapter(this);
    rvRecommendDrugs.setAdapter(recommendDrugAdapter);
    
    // 设置点击事件
    recommendDrugAdapter.setOnItemClickListener(new RecommendDrugAdapter.OnItemClickListener() {
        @Override
        public void onItemClick(Drug drug) {
            // 跳转到药品详情页
            DrugDetailActivity.start(DrugDetailActivity.this, drug.getId(), drug.getName());
        }
    });
    
    // 加载推荐商品
    loadRecommendDrugs();
}

private void loadRecommendDrugs() {
    // 获取推荐商品列表
    List<Drug> recommendDrugs = getRecommendDrugs();
    recommendDrugAdapter.setData(recommendDrugs);
}
```

### 第2步: 测试推荐商品模块 (5分钟)

1. 编译运行应用
2. 进入药品详情页
3. 检查推荐商品是否正确显示
4. 测试点击推荐商品是否能跳转

### 第3步: 添加用户评价模块 (15分钟)

#### 3.1 创建Review模型

创建 `Review.java`:

```java
package com.adinnet.demo.mall.model;

public class Review {
    private String userId;
    private String userName;
    private String userAvatar;
    private float rating;
    private String content;
    private String createTime;
    
    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public String getUserAvatar() { return userAvatar; }
    public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }
    
    public float getRating() { return rating; }
    public void setRating(float rating) { this.rating = rating; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getCreateTime() { return createTime; }
    public void setCreateTime(String createTime) { this.createTime = createTime; }
}
```

#### 3.2 创建评论项布局

创建 `item_review.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="@dimen/dingdang_spacing_medium"
    android:background="?attr/selectableItemBackground">
    
    <!-- 用户信息 -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical">
        
        <!-- 用户头像 -->
        <ImageView
            android:id="@+id/iv_avatar"
            android:layout_width="40dp"
            android:layout_height="40dp"
            android:src="@android:drawable/ic_menu_myplaces"
            android:contentDescription="用户头像"/>
        
        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:orientation="vertical"
            android:layout_marginStart="@dimen/dingdang_spacing_medium">
            
            <!-- 用户昵称 -->
            <TextView
                android:id="@+id/tv_user_name"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="用户昵称"
                android:textColor="@color/dingdang_text_primary"
                android:textSize="@dimen/dingdang_text_body"
                android:textStyle="bold"/>
            
            <!-- 评价时间 -->
            <TextView
                android:id="@+id/tv_create_time"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="2026-01-20"
                android:textColor="@color/dingdang_text_secondary"
                android:textSize="@dimen/dingdang_text_small"
                android:layout_marginTop="2dp"/>
        </LinearLayout>
        
        <!-- 评分 -->
        <RatingBar
            android:id="@+id/rating_bar"
            style="?android:attr/ratingBarStyleSmall"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:numStars="5"
            android:rating="5"
            android:isIndicator="true"/>
    </LinearLayout>
    
    <!-- 评价内容 -->
    <TextView
        android:id="@+id/tv_content"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="效果很好，送货速度快，包装完整..."
        android:textColor="@color/dingdang_text_primary"
        android:textSize="@dimen/dingdang_text_body"
        android:layout_marginTop="@dimen/dingdang_spacing_medium"
        android:lineSpacingExtra="4dp"/>
</LinearLayout>
```

#### 3.3 创建ReviewAdapter

创建 `ReviewAdapter.java`:

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

import java.util.ArrayList;
import java.util.List;

public class ReviewAdapter extends RecyclerView.Adapter<ReviewAdapter.ViewHolder> {
    
    private Context context;
    private List<Review> reviews = new ArrayList<>();
    
    public ReviewAdapter(Context context) {
        this.context = context;
    }
    
    public void setData(List<Review> reviews) {
        this.reviews = reviews;
        notifyDataSetChanged();
    }
    
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_review, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        Review review = reviews.get(position);
        
        holder.tvUserName.setText(review.getUserName());
        holder.tvCreateTime.setText(review.getCreateTime());
        holder.tvContent.setText(review.getContent());
        holder.ratingBar.setRating(review.getRating());
        
        // TODO: 加载用户头像
        // Glide.with(context).load(review.getUserAvatar()).into(holder.ivAvatar);
    }
    
    @Override
    public int getItemCount() {
        return reviews.size();
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivAvatar;
        TextView tvUserName;
        TextView tvCreateTime;
        TextView tvContent;
        RatingBar ratingBar;
        
        ViewHolder(View itemView) {
            super(itemView);
            ivAvatar = itemView.findViewById(R.id.iv_avatar);
            tvUserName = itemView.findViewById(R.id.tv_user_name);
            tvCreateTime = itemView.findViewById(R.id.tv_create_time);
            tvContent = itemView.findViewById(R.id.tv_content);
            ratingBar = itemView.findViewById(R.id.rating_bar);
        }
    }
}
```

#### 3.4 创建用户评价布局

创建 `mall_include_reviews.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<android.support.v7.widget.CardView 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginStart="@dimen/dingdang_spacing_medium"
    android:layout_marginEnd="@dimen/dingdang_spacing_medium"
    android:layout_marginTop="@dimen/dingdang_spacing_small"
    app:cardCornerRadius="@dimen/dingdang_corner_large"
    app:cardElevation="@dimen/dingdang_card_elevation">
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="@dimen/dingdang_spacing_large">
        
        <!-- 标题栏 -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical">
            
            <TextView
                android:id="@+id/tv_review_title"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="用户评价 (1234)"
                android:textColor="@color/dingdang_text_primary"
                android:textSize="@dimen/dingdang_text_large"
                android:textStyle="bold"/>
            
            <TextView
                android:id="@+id/tv_view_all_reviews"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="查看全部"
                android:textColor="@color/dingdang_text_secondary"
                android:textSize="@dimen/dingdang_text_body"
                android:background="?attr/selectableItemBackground"
                android:padding="@dimen/dingdang_spacing_small"/>
        </LinearLayout>
        
        <!-- 平均评分 -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical"
            android:layout_marginTop="@dimen/dingdang_spacing_medium">
            
            <RatingBar
                android:id="@+id/rating_bar_average"
                style="?android:attr/ratingBarStyleSmall"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:numStars="5"
                android:rating="4.9"
                android:isIndicator="true"/>
            
            <TextView
                android:id="@+id/tv_average_rating"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="4.9分"
                android:textColor="@color/dingdang_text_primary"
                android:textSize="@dimen/dingdang_text_body"
                android:layout_marginStart="@dimen/dingdang_spacing_small"/>
        </LinearLayout>
        
        <!-- 评论列表 -->
        <android.support.v7.widget.RecyclerView
            android:id="@+id/rv_reviews"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="@dimen/dingdang_spacing_medium"
            android:nestedScrollingEnabled="false"/>
    </LinearLayout>
</android.support.v7.widget.CardView>
```

#### 3.5 在主布局中引入

在 `activity_drug_detail_new.xml` 的推荐商品后面添加:

```xml
<!-- 用户评价 -->
<include layout="@layout/mall_include_reviews"/>
```

#### 3.6 在Activity中初始化

在 `DrugDetailActivity.java` 中添加:

```java
private RecyclerView rvReviews;
private ReviewAdapter reviewAdapter;
private TextView tvReviewTitle;
private TextView tvAverageRating;
private RatingBar ratingBarAverage;

private void initViews() {
    // ... 现有代码
    
    // 用户评价
    rvReviews = findViewById(R.id.rv_reviews);
    tvReviewTitle = findViewById(R.id.tv_review_title);
    tvAverageRating = findViewById(R.id.tv_average_rating);
    ratingBarAverage = findViewById(R.id.rating_bar_average);
    setupReviews();
}

private void setupReviews() {
    // 设置垂直布局
    LinearLayoutManager layoutManager = new LinearLayoutManager(this);
    rvReviews.setLayoutManager(layoutManager);
    
    // 创建适配器
    reviewAdapter = new ReviewAdapter(this);
    rvReviews.setAdapter(reviewAdapter);
    
    // 加载评价数据
    loadReviews();
}

private void loadReviews() {
    // 模拟数据
    List<Review> reviews = getMockReviews();
    
    // 设置平均评分
    float averageRating = 4.9f;
    ratingBarAverage.setRating(averageRating);
    tvAverageRating.setText(String.format("%.1f分", averageRating));
    
    // 设置标题
    tvReviewTitle.setText(String.format("用户评价 (%d)", reviews.size()));
    
    // 显示评论列表（只显示前3条）
    List<Review> displayReviews = reviews.subList(0, Math.min(3, reviews.size()));
    reviewAdapter.setData(displayReviews);
}

private List<Review> getMockReviews() {
    List<Review> reviews = new ArrayList<>();
    
    for (int i = 1; i <= 5; i++) {
        Review review = new Review();
        review.setUserId("user_" + i);
        review.setUserName("用户" + i);
        review.setRating(4.5f + (i % 2) * 0.5f);
        review.setContent("效果很好，送货速度快，包装完整，值得购买！");
        review.setCreateTime("2026-01-" + (20 + i));
        reviews.add(review);
    }
    
    return reviews;
}
```

## 四、下一步计划

完成以上两个模块后，您可以继续：

1. **添加Tab切换模块** - 显示商品详情、用药指南、常见问题
2. **完善促销活动** - 添加点击事件，显示活动详情
3. **完善店铺信息** - 添加点击事件，跳转到店铺页面
4. **实现收藏功能** - 切换收藏状态，保存到本地
5. **实现分享功能** - 分享药品信息到社交平台

## 五、常见问题

### Q1: 推荐商品不显示？
A: 检查 `getRecommendDrugs()` 方法是否返回了数据，检查RecyclerView的布局管理器是否正确设置。

### Q2: 评论列表显示不全？
A: 确保RecyclerView设置了 `android:nestedScrollingEnabled="false"`，并且父布局是NestedScrollView。

### Q3: 图片不显示？
A: 确保已经集成Glide库，并且图片URL正确。可以先使用占位图测试布局。

### Q4: 点击事件无响应？
A: 检查是否设置了点击监听器，检查是否有其他View遮挡了点击区域。

## 六、参考资源

- **设计规范**: `DRUG_DETAIL_REDESIGN_SPEC.md`
- **任务清单**: `DRUG_DETAIL_IMPLEMENTATION_TASKS.md`
- **UI设计**: `UI_DESIGN_VISUALIZATION.md`
- **现有代码**: `DrugDetailActivity.java`, `activity_drug_detail_new.xml`

---

**文档版本**: v1.0  
**创建时间**: 2026-02-04  
**预计完成时间**: 30-45分钟
