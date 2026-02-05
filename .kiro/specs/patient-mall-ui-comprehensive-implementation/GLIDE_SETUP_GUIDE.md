# Glide 配置指南

## 概述

本文档说明如何为患者端药品商城配置 Glide 图片加载库。

## 1. 添加依赖

在 `app/build.gradle` 文件中添加 Glide 依赖：

```gradle
dependencies {
    // Glide - 图片加载库
    implementation 'com.github.bumptech.glide:glide:4.12.0'
    annotationProcessor 'com.github.bumptech.glide:compiler:4.12.0'
    
    // 可选: OkHttp3 集成 (用于网络图片加载)
    implementation 'com.github.bumptech.glide:okhttp3-integration:4.12.0'
}
```

## 2. 创建 GlideModule

创建 `MyGlideModule.java` 文件：

```java
package com.adinnet.demo.mall.glide;

import android.content.Context;

import com.bumptech.glide.Glide;
import com.bumptech.glide.GlideBuilder;
import com.bumptech.glide.Registry;
import com.bumptech.glide.annotation.GlideModule;
import com.bumptech.glide.load.engine.cache.InternalCacheDiskCacheFactory;
import com.bumptech.glide.load.engine.cache.LruResourceCache;
import com.bumptech.glide.module.AppGlideModule;

/**
 * Glide 配置模块
 */
@GlideModule
public class MyGlideModule extends AppGlideModule {
    
    @Override
    public void applyOptions(Context context, GlideBuilder builder) {
        // 设置内存缓存大小 (50MB)
        int memoryCacheSizeBytes = 1024 * 1024 * 50;
        builder.setMemoryCache(new LruResourceCache(memoryCacheSizeBytes));
        
        // 设置磁盘缓存大小 (250MB)
        int diskCacheSizeBytes = 1024 * 1024 * 250;
        builder.setDiskCache(new InternalCacheDiskCacheFactory(context, diskCacheSizeBytes));
    }
    
    @Override
    public boolean isManifestParsingEnabled() {
        return false;
    }
}
```

## 3. 更新 ImageLoaderUtil

更新 `ImageLoaderUtil.java` 以使用 Glide：

```java
package com.adinnet.demo.mall.utils;

import android.content.Context;
import android.widget.ImageView;

import com.adinnet.demo.R;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.CenterCrop;
import com.bumptech.glide.load.resource.bitmap.RoundedCorners;
import com.bumptech.glide.request.RequestOptions;

/**
 * 图片加载工具类 (Glide实现)
 */
public class ImageLoaderUtil {
    
    /**
     * 加载普通图片
     */
    public static void loadImage(Context context, String url, ImageView imageView) {
        Glide.with(context)
            .load(url)
            .placeholder(R.drawable.ic_placeholder)
            .error(R.drawable.ic_error)
            .into(imageView);
    }
    
    /**
     * 加载圆角图片
     */
    public static void loadRoundedImage(Context context, String url, ImageView imageView, int radius) {
        RequestOptions options = new RequestOptions()
            .placeholder(R.drawable.ic_placeholder)
            .error(R.drawable.ic_error)
            .transform(new CenterCrop(), new RoundedCorners(dp2px(context, radius)));
        
        Glide.with(context)
            .load(url)
            .apply(options)
            .into(imageView);
    }
    
    /**
     * 加载圆形图片
     */
    public static void loadCircleImage(Context context, String url, ImageView imageView) {
        RequestOptions options = new RequestOptions()
            .placeholder(R.drawable.ic_default_avatar)
            .error(R.drawable.ic_default_avatar)
            .circleCrop();
        
        Glide.with(context)
            .load(url)
            .apply(options)
            .into(imageView);
    }
    
    /**
     * 预加载图片
     */
    public static void preloadImage(Context context, String url) {
        Glide.with(context)
            .load(url)
            .preload();
    }
    
    /**
     * 清除内存缓存
     */
    public static void clearMemoryCache(Context context) {
        Glide.get(context).clearMemory();
    }
    
    /**
     * 清除磁盘缓存（需要在后台线程执行）
     */
    public static void clearDiskCache(Context context) {
        new Thread(() -> {
            Glide.get(context).clearDiskCache();
        }).start();
    }
    
    /**
     * dp转px
     */
    private static int dp2px(Context context, float dp) {
        float density = context.getResources().getDisplayMetrics().density;
        return (int) (dp * density + 0.5f);
    }
}
```

## 4. 混淆配置

在 `proguard-rules.pro` 中添加 Glide 混淆规则：

```proguard
# Glide
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep class * extends com.bumptech.glide.module.AppGlideModule {
 <init>(...);
}
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}
-keep class com.bumptech.glide.load.data.ParcelFileDescriptorRewinder$InternalRewinder {
  *** rewind();
}
```

## 5. 权限配置

确保 `AndroidManifest.xml` 中有网络权限：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 6. 使用示例

### 加载普通图片
```java
ImageLoaderUtil.loadImage(context, drug.getImageUrl(), ivDrugImage);
```

### 加载圆角图片
```java
ImageLoaderUtil.loadRoundedImage(context, drug.getImageUrl(), ivDrugImage, 16);
```

### 加载圆形头像
```java
ImageLoaderUtil.loadCircleImage(context, user.getAvatarUrl(), ivAvatar);
```

### 预加载图片
```java
ImageLoaderUtil.preloadImage(context, drug.getImageUrl());
```

### 清除缓存
```java
// 清除内存缓存 (主线程)
ImageLoaderUtil.clearMemoryCache(context);

// 清除磁盘缓存 (后台线程)
ImageLoaderUtil.clearDiskCache(context);
```

## 7. 性能优化建议

### 7.1 列表优化
在 RecyclerView 中使用 Glide 时：

```java
@Override
public void onBindViewHolder(ViewHolder holder, int position) {
    Drug drug = drugList.get(position);
    
    // Glide 会自动处理 RecyclerView 的复用
    ImageLoaderUtil.loadImage(holder.itemView.getContext(), 
        drug.getImageUrl(), holder.ivDrugImage);
}
```

### 7.2 缩略图策略
对于大图，可以先加载缩略图：

```java
Glide.with(context)
    .load(url)
    .thumbnail(0.1f) // 先加载10%大小的缩略图
    .into(imageView);
```

### 7.3 图片尺寸限制
限制加载的图片尺寸以节省内存：

```java
RequestOptions options = new RequestOptions()
    .override(800, 800); // 限制最大尺寸为800x800

Glide.with(context)
    .load(url)
    .apply(options)
    .into(imageView);
```

## 8. 常见问题

### Q1: 图片加载失败
**A:** 检查网络权限、URL是否正确、服务器是否可访问

### Q2: 内存占用过高
**A:** 调整内存缓存大小，使用 override() 限制图片尺寸

### Q3: 图片显示模糊
**A:** 检查图片原始尺寸，避免过度放大

### Q4: 圆角不生效
**A:** 确保使用 CenterCrop + RoundedCorners 组合

## 9. 验证步骤

1. 添加依赖并同步项目
2. 创建 MyGlideModule 类
3. 更新 ImageLoaderUtil 实现
4. 运行项目，测试图片加载
5. 检查内存和磁盘缓存是否正常工作

## 10. 参考资料

- [Glide 官方文档](https://bumptech.github.io/glide/)
- [Glide GitHub](https://github.com/bumptech/glide)
- [Glide 中文文档](https://muyangmin.github.io/glide-docs-cn/)

---

**文档版本**: 1.0  
**创建时间**: 2026-01-31  
**作者**: Kiro AI Assistant
