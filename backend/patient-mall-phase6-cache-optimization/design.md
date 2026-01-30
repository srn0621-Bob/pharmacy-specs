# Spec 13: 缓存优化 - 设计文档

## 文档信息

**Spec编号:** Spec 13  
**功能名称:** 缓存优化  
**所属阶段:** 阶段六 - 优化功能  
**创建日期:** 2026-01-23

---

## 1. 系统架构

### 1.1 缓存架构图

```
┌─────────────┐
│  患者端APP  │
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────────────────────────────┐
│     患者端API (adinnet-patient-api)  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Controller层                │  │
│  └────────────┬─────────────────┘  │
│               ↓                     │
│  ┌──────────────────────────────┐  │
│  │  Service层                   │  │
│  │  - 缓存查询                   │  │
│  │  - 缓存更新                   │  │
│  └────────────┬─────────────────┘  │
│               ↓                     │
│  ┌──────────────────────────────┐  │
│  │  CacheService                │  │
│  │  - get()                     │  │
│  │  - set()                     │  │
│  │  - delete()                  │  │
│  │  - exists()                  │  │
│  └────────────┬─────────────────┘  │
└───────────────┼─────────────────────┘
                ↓
       ┌────────┴────────┐
       │                 │
       ↓                 ↓
┌─────────────┐   ┌─────────────┐
│    Redis    │   │   MySQL     │
│   (缓存)     │   │  (持久化)    │
└─────────────┘   └─────────────┘
```

### 1.2 缓存层次

```
请求 → Service层 → CacheService → Redis → 数据库
                      ↓
                  缓存命中 → 直接返回
                      ↓
                  缓存未命中 → 查询数据库 → 写入缓存 → 返回
```

---

## 2. 核心组件设计

### 2.1 CacheService（缓存服务）

```java
package com.patient.api.common.cache;

import com.alibaba.fastjson.JSON;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * 缓存服务
 */
@Slf4j
@Service
public class CacheService {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    /**
     * 获取缓存数据
     */
    public <T> T get(String key, Class<T> clazz) {
        try {
            String value = redisTemplate.opsForValue().get(key);
            if (StringUtils.isNotEmpty(value)) {
                return JSON.parseObject(value, clazz);
            }
        } catch (Exception e) {
            log.error("获取缓存失败: key={}, error={}", key, e.getMessage(), e);
        }
        return null;
    }
    
    /**
     * 设置缓存数据
     */
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        try {
            String jsonValue = JSON.toJSONString(value);
            redisTemplate.opsForValue().set(key, jsonValue, timeout, unit);
        } catch (Exception e) {
            log.error("设置缓存失败: key={}, error={}", key, e.getMessage(), e);
        }
    }
    
    /**
     * 删除缓存
     */
    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("删除缓存失败: key={}, error={}", key, e.getMessage(), e);
        }
    }
    
    /**
     * 批量删除缓存
     */
    public void deletePattern(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("批量删除缓存失败: pattern={}, error={}", pattern, e.getMessage(), e);
        }
    }
    
    /**
     * 判断缓存是否存在
     */
    public boolean exists(String key) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("判断缓存存在失败: key={}, error={}", key, e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * 获取缓存或查询数据库
     * 防止缓存击穿
     */
    public <T> T getOrLoad(String key, Class<T> clazz, long timeout, TimeUnit unit, 
                           Supplier<T> loader) {
        // 1. 尝试从缓存获取
        T value = get(key, clazz);
        if (value != null) {
            return value;
        }
        
        // 2. 使用分布式锁防止缓存击穿
        String lockKey = "lock:" + key;
        try {
            Boolean locked = redisTemplate.opsForValue().setIfAbsent(
                lockKey, "1", 10, TimeUnit.SECONDS
            );
            
            if (Boolean.TRUE.equals(locked)) {
                try {
                    // 再次检查缓存（双重检查）
                    value = get(key, clazz);
                    if (value != null) {
                        return value;
                    }
                    
                    // 从数据库加载
                    value = loader.get();
                    
                    // 写入缓存
                    if (value != null) {
                        set(key, value, timeout, unit);
                    } else {
                        // 缓存空值防止缓存穿透
                        set(key, "", 5, TimeUnit.MINUTES);
                    }
                    
                    return value;
                } finally {
                    // 释放锁
                    redisTemplate.delete(lockKey);
                }
            } else {
                // 等待其他线程加载完成
                Thread.sleep(100);
                return get(key, clazz);
            }
        } catch (Exception e) {
            log.error("获取或加载缓存失败: key={}, error={}", key, e.getMessage(), e);
            // 降级：直接查询数据库
            return loader.get();
        }
    }
}
```

### 2.2 CacheKeyGenerator（缓存Key生成器）

```java
package com.patient.api.common.cache;

/**
 * 缓存Key生成器
 */
public class CacheKeyGenerator {
    
    private static final String PREFIX = "mall:";
    
    /**
     * 药品分类列表
     */
    public static String categoryList() {
        return PREFIX + "category:list";
    }
    
    /**
     * 快捷分类列表
     */
    public static String quickCategoryList() {
        return PREFIX + "category:quick";
    }
    
    /**
     * 药品详情
     */
    public static String drugDetail(Long drugId) {
        return PREFIX + "drug:detail:" + drugId;
    }
    
    /**
     * 热门药品
     */
    public static String hotDrugs(Integer limit) {
        return PREFIX + "drug:hot:" + limit;
    }
    
    /**
     * 搜索结果
     */
    public static String searchResult(String keyword, Integer page, Integer size) {
        return PREFIX + "search:" + keyword + ":" + page + ":" + size;
    }
    
    /**
     * 购物车
     */
    public static String cart(Long userId) {
        return PREFIX + "cart:" + userId;
    }
    
    /**
     * 分类药品列表
     */
    public static String categoryDrugs(Long categoryId, Integer page, Integer size) {
        return PREFIX + "category:" + categoryId + ":drugs:" + page + ":" + size;
    }
    
    /**
     * 首页推荐
     */
    public static String homeRecommend() {
        return PREFIX + "recommend:home";
    }
    
    /**
     * 相关推荐
     */
    public static String relatedRecommend(Long drugId) {
        return PREFIX + "recommend:related:" + drugId;
    }
}
```

### 2.3 CacheWarmer（缓存预热）

```java
package com.patient.api.common.cache;

import com.patient.api.app.mall.service.DrugService;
import com.patient.api.app.mall.service.CategoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * 缓存预热
 * 系统启动时自动执行
 */
@Slf4j
@Component
public class CacheWarmer implements ApplicationRunner {
    
    @Autowired
    private DrugService drugService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Override
    public void run(ApplicationArguments args) {
        log.info("========== 开始缓存预热 ==========");
        long startTime = System.currentTimeMillis();
        
        try {
            // 1. 预热药品分类
            warmupCategories();
            
            // 2. 预热热门药品
            warmupHotDrugs();
            
            // 3. 预热首页推荐
            warmupHomeRecommend();
            
            long endTime = System.currentTimeMillis();
            log.info("========== 缓存预热完成，耗时: {}ms ==========", endTime - startTime);
            
        } catch (Exception e) {
            log.error("缓存预热失败: error={}", e.getMessage(), e);
        }
    }
    
    /**
     * 预热药品分类
     */
    private void warmupCategories() {
        try {
            log.info("预热药品分类...");
            categoryService.getAllCategories();
            categoryService.getQuickCategories();
            log.info("药品分类预热完成");
        } catch (Exception e) {
            log.error("药品分类预热失败: error={}", e.getMessage(), e);
        }
    }
    
    /**
     * 预热热门药品
     */
    private void warmupHotDrugs() {
        try {
            log.info("预热热门药品...");
            drugService.getHotDrugs(100);
            log.info("热门药品预热完成");
        } catch (Exception e) {
            log.error("热门药品预热失败: error={}", e.getMessage(), e);
        }
    }
    
    /**
     * 预热首页推荐
     */
    private void warmupHomeRecommend() {
        try {
            log.info("预热首页推荐...");
            drugRecommendService.getHomeRecommend();
            log.info("首页推荐预热完成");
        } catch (Exception e) {
            log.error("首页推荐预热失败: error={}", e.getMessage(), e);
        }
    }
}
```

---

## 3. 缓存更新策略

### 3.1 药品信息更新

```java
/**
 * 更新药品信息
 */
@Transactional
public void updateDrug(Drug drug) {
    // 1. 更新数据库
    drugMapper.updateById(drug);
    
    // 2. 清除相关缓存
    clearDrugCache(drug.getId(), drug.getCategoryId());
}

/**
 * 清除药品相关缓存
 */
private void clearDrugCache(Long drugId, Long categoryId) {
    // 清除药品详情缓存
    cacheService.delete(CacheKeyGenerator.drugDetail(drugId));
    
    // 清除分类药品列表缓存
    cacheService.deletePattern(CacheKeyGenerator.categoryDrugs(categoryId, "*", "*"));
    
    // 清除搜索结果缓存
    cacheService.deletePattern("mall:search:*");
    
    // 清除热门药品缓存
    cacheService.deletePattern("mall:drug:hot:*");
    
    // 清除推荐缓存
    cacheService.delete(CacheKeyGenerator.homeRecommend());
    cacheService.delete(CacheKeyGenerator.relatedRecommend(drugId));
}
```

### 3.2 分类信息更新

```java
/**
 * 更新分类信息
 */
@Transactional
public void updateCategory(Category category) {
    // 1. 更新数据库
    categoryMapper.updateById(category);
    
    // 2. 清除相关缓存
    clearCategoryCache(category.getId());
}

/**
 * 清除分类相关缓存
 */
private void clearCategoryCache(Long categoryId) {
    // 清除分类列表缓存
    cacheService.delete(CacheKeyGenerator.categoryList());
    cacheService.delete(CacheKeyGenerator.quickCategoryList());
    
    // 清除分类药品列表缓存
    cacheService.deletePattern(CacheKeyGenerator.categoryDrugs(categoryId, "*", "*"));
    
    // 清除首页推荐缓存
    cacheService.delete(CacheKeyGenerator.homeRecommend());
}
```

---

## 4. 缓存过期时间配置

### 4.1 配置类

```java
package com.patient.api.common.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 缓存配置
 */
@Data
@Component
@ConfigurationProperties(prefix = "cache")
public class CacheProperties {
    
    /**
     * 药品分类缓存过期时间（分钟）
     */
    private Integer categoryExpire = 60;
    
    /**
     * 药品详情缓存过期时间（分钟）
     */
    private Integer drugDetailExpire = 10;
    
    /**
     * 热门药品缓存过期时间（分钟）
     */
    private Integer hotDrugExpire = 30;
    
    /**
     * 搜索结果缓存过期时间（分钟）
     */
    private Integer searchExpire = 5;
    
    /**
     * 购物车缓存过期时间（天）
     */
    private Integer cartExpire = 7;
    
    /**
     * 推荐列表缓存过期时间（分钟）
     */
    private Integer recommendExpire = 30;
}
```

### 4.2 配置文件

```properties
# 缓存配置
cache.category-expire=60
cache.drug-detail-expire=10
cache.hot-drug-expire=30
cache.search-expire=5
cache.cart-expire=7
cache.recommend-expire=30
```

---

## 5. 缓存监控

### 5.1 缓存统计

```java
package com.patient.api.common.cache;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicLong;

/**
 * 缓存统计
 */
@Data
@Component
public class CacheStatistics {
    
    private AtomicLong hitCount = new AtomicLong(0);
    private AtomicLong missCount = new AtomicLong(0);
    
    /**
     * 记录缓存命中
     */
    public void recordHit() {
        hitCount.incrementAndGet();
    }
    
    /**
     * 记录缓存未命中
     */
    public void recordMiss() {
        missCount.incrementAndGet();
    }
    
    /**
     * 获取缓存命中率
     */
    public double getHitRate() {
        long total = hitCount.get() + missCount.get();
        if (total == 0) {
            return 0.0;
        }
        return (double) hitCount.get() / total * 100;
    }
    
    /**
     * 重置统计
     */
    public void reset() {
        hitCount.set(0);
        missCount.set(0);
    }
}
```

---

## 6. 性能优化方案

### 6.1 批量查询优化

```java
/**
 * 批量获取药品详情（优化版）
 */
public List<Drug> getDrugsByIds(List<Long> drugIds) {
    List<Drug> result = new ArrayList<>();
    List<Long> missedIds = new ArrayList<>();
    
    // 1. 批量从缓存获取
    for (Long drugId : drugIds) {
        String key = CacheKeyGenerator.drugDetail(drugId);
        Drug drug = cacheService.get(key, Drug.class);
        if (drug != null) {
            result.add(drug);
        } else {
            missedIds.add(drugId);
        }
    }
    
    // 2. 批量从数据库查询未命中的数据
    if (!missedIds.isEmpty()) {
        List<Drug> drugs = drugMapper.selectBatchIds(missedIds);
        result.addAll(drugs);
        
        // 3. 批量写入缓存
        for (Drug drug : drugs) {
            String key = CacheKeyGenerator.drugDetail(drug.getId());
            cacheService.set(key, drug, 10, TimeUnit.MINUTES);
        }
    }
    
    return result;
}
```

### 6.2 缓存过期时间随机化

```java
/**
 * 获取随机化的过期时间（防止缓存雪崩）
 */
private long getRandomExpireTime(long baseTime) {
    // 在基础时间上增加±10%的随机值
    long randomOffset = (long) (baseTime * 0.1 * Math.random());
    return baseTime + randomOffset;
}
```

---

## 7. 测试策略

### 7.1 单元测试

```java
@Test
public void testCacheService() {
    // 测试缓存设置和获取
    String key = "test:key";
    String value = "test value";
    
    cacheService.set(key, value, 1, TimeUnit.MINUTES);
    String cached = cacheService.get(key, String.class);
    
    assertEquals(value, cached);
}

@Test
public void testCacheHitRate() {
    // 测试缓存命中率
    // 模拟100次请求，其中90次命中缓存
    for (int i = 0; i < 90; i++) {
        cacheStatistics.recordHit();
    }
    for (int i = 0; i < 10; i++) {
        cacheStatistics.recordMiss();
    }
    
    double hitRate = cacheStatistics.getHitRate();
    assertTrue(hitRate >= 90.0);
}
```

### 7.2 性能测试

- 测试缓存命中率
- 测试缓存响应时间
- 测试缓存预热时间
- 测试并发场景下的缓存性能

---

**文档创建日期:** 2026-01-23  
**创建人员:** Kiro AI Assistant  
**状态:** 待评审
