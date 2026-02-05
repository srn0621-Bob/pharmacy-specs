# Build.gradle 依赖配置指南

> **文档版本**: v1.0  
> **创建时间**: 2026-01-30  
> **适用项目**: mshlwyy_patient-mall

## 概述

本文档列出了药品商城UI实施所需的所有Gradle依赖配置。

## 必需依赖

### 1. 图片加载 - Glide

```gradle
dependencies {
    // Glide - 图片加载库
    implementation 'com.github.bumptech.glide:glide:4.12.0'
    annotationProcessor 'com.github.bumptech.glide:compiler:4.12.0'
}
```

**用途**:
- 加载药品图片
- 加载用户头像
- 图片缓存管理
- 圆角图片处理

**使用位置**:
- DrugListAdapter
- CartItemAdapter
- CheckoutDrugAdapter
- CategoryAdapter
- MallMineFragment

### 2. 流式布局 - FlexboxLayout

```gradle
dependencies {
    // FlexboxLayout - 流式布局
    implementation 'com.google.android.flexbox:flexbox:3.0.0'
}
```

**用途**:
- 搜索页面的历史标签
- 搜索页面的热门标签
- 药品详情页的促销标签

**使用位置**:
- SearchActivity (搜索历史、热门搜索)
- DrugDetailActivity (促销标签)

### 3. 网络请求 - Retrofit & OkHttp

```gradle
dependencies {
    // Retrofit - 网络请求框架
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.retrofit2:adapter-rxjava2:2.9.0'
    
    // OkHttp - HTTP客户端
    implementation 'com.squareup.okhttp3:okhttp:4.9.3'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.9.3'
}
```

**用途**:
- API接口调用
- HTTP缓存
- 请求日志
- 拦截器

**使用位置**:
- RetrofitClient
- MallApiService
- 所有Presenter

### 4. 响应式编程 - RxJava & RxAndroid

```gradle
dependencies {
    // RxJava - 响应式编程
    implementation 'io.reactivex.rxjava2:rxjava:2.2.21'
    implementation 'io.reactivex.rxjava2:rxandroid:2.1.1'
}
```

**用途**:
- 异步网络请求
- 线程切换
- 数据流处理

**使用位置**:
- 所有Presenter
- RetrofitClient

### 5. JSON解析 - Gson

```gradle
dependencies {
    // Gson - JSON解析
    implementation 'com.google.code.gson:gson:2.8.9'
}
```

**用途**:
- API响应解析
- 数据模型序列化

**使用位置**:
- RetrofitClient
- 所有数据模型

## 已有依赖（需确认）

以下依赖应该已经在项目中，需要确认版本：

```gradle
dependencies {
    // Android Support Library
    implementation 'com.android.support:appcompat-v7:28.0.0'
    implementation 'com.android.support:design:28.0.0'
    implementation 'com.android.support:cardview-v7:28.0.0'
    implementation 'com.android.support:recyclerview-v7:28.0.0'
    
    // ButterKnife - 视图绑定（可选）
    implementation 'com.jakewharton:butterknife:8.8.1'
    annotationProcessor 'com.jakewharton:butterknife-compiler:8.8.1'
}
```

## 完整的build.gradle配置示例

```gradle
apply plugin: 'com.android.application'

android {
    compileSdkVersion 28
    buildToolsVersion "28.0.3"
    
    defaultConfig {
        applicationId "com.adinnet.demo"
        minSdkVersion 19
        targetSdkVersion 28
        versionCode 1
        versionName "1.0"
        
        // 启用MultiDex
        multiDexEnabled true
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    
    // ==================== Android Support ====================
    implementation 'com.android.support:appcompat-v7:28.0.0'
    implementation 'com.android.support:design:28.0.0'
    implementation 'com.android.support:cardview-v7:28.0.0'
    implementation 'com.android.support:recyclerview-v7:28.0.0'
    implementation 'com.android.support:support-v4:28.0.0'
    
    // ==================== 图片加载 ====================
    implementation 'com.github.bumptech.glide:glide:4.12.0'
    annotationProcessor 'com.github.bumptech.glide:compiler:4.12.0'
    
    // ==================== 流式布局 ====================
    implementation 'com.google.android.flexbox:flexbox:3.0.0'
    
    // ==================== 网络请求 ====================
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.retrofit2:adapter-rxjava2:2.9.0'
    implementation 'com.squareup.okhttp3:okhttp:4.9.3'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.9.3'
    
    // ==================== 响应式编程 ====================
    implementation 'io.reactivex.rxjava2:rxjava:2.2.21'
    implementation 'io.reactivex.rxjava2:rxandroid:2.1.1'
    
    // ==================== JSON解析 ====================
    implementation 'com.google.code.gson:gson:2.8.9'
    
    // ==================== 视图绑定（可选） ====================
    implementation 'com.jakewharton:butterknife:8.8.1'
    annotationProcessor 'com.jakewharton:butterknife-compiler:8.8.1'
    
    // ==================== MultiDex ====================
    implementation 'com.android.support:multidex:1.0.3'
}
```

## 配置步骤

### 1. 打开build.gradle文件
```
mshlwyy_patient-mall/app/build.gradle
```

### 2. 添加依赖
将上述依赖添加到`dependencies`块中

### 3. 同步项目
点击Android Studio顶部的"Sync Now"按钮

### 4. 验证依赖
确保所有依赖下载成功，无冲突

## 常见问题

### Q1: 依赖冲突
**问题**: 出现依赖版本冲突  
**解决**: 使用`exclude`排除冲突的依赖

```gradle
implementation('com.squareup.retrofit2:retrofit:2.9.0') {
    exclude group: 'com.squareup.okhttp3', module: 'okhttp'
}
```

### Q2: MultiDex问题
**问题**: 方法数超过65536  
**解决**: 启用MultiDex

```gradle
android {
    defaultConfig {
        multiDexEnabled true
    }
}

dependencies {
    implementation 'com.android.support:multidex:1.0.3'
}
```

在Application类中：
```java
public class MyApplication extends MultiDexApplication {
    // ...
}
```

### Q3: 编译错误
**问题**: 编译时出现"Cannot resolve symbol"  
**解决**: 
1. 清理项目：Build → Clean Project
2. 重新构建：Build → Rebuild Project
3. 使缓存失效：File → Invalidate Caches / Restart

### Q4: Glide配置
**问题**: Glide需要额外配置  
**解决**: 创建GlideModule

```java
@GlideModule
public class MyGlideModule extends AppGlideModule {
    @Override
    public void applyOptions(@NonNull Context context, @NonNull GlideBuilder builder) {
        // 配置缓存大小
        builder.setDiskCache(new InternalCacheDiskCacheFactory(context, 100 * 1024 * 1024));
    }
}
```

## 权限配置

在AndroidManifest.xml中添加必要权限：

```xml
<!-- 网络权限 -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- 存储权限（Glide缓存） -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## ProGuard配置

如果启用了代码混淆，需要添加以下规则：

```proguard
# Retrofit
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions

# OkHttp
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Gson
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Glide
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

# RxJava
-dontwarn sun.misc.**
-keepclassmembers class rx.internal.util.unsafe.*ArrayQueue*Field* {
   long producerIndex;
   long consumerIndex;
}

# 数据模型
-keep class com.adinnet.demo.mall.model.** { *; }
```

## 验证清单

- [ ] 所有依赖已添加到build.gradle
- [ ] 项目同步成功
- [ ] 无依赖冲突
- [ ] 编译通过
- [ ] 权限已配置
- [ ] ProGuard规则已添加（如果启用混淆）

## 下一步

1. 配置Glide占位图和错误图
2. 在所有Adapter中启用Glide图片加载
3. 测试网络请求
4. 对接真实API

---

**文档版本**: 1.0  
**创建日期**: 2026-01-30  
**最后更新**: 2026-01-30
