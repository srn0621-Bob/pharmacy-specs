# Spec 13: 缓存优化 - 任务列表

## 文档信息

**Spec编号:** Spec 13  
**功能名称:** 缓存优化  
**所属阶段:** 阶段六 - 优化功能  
**创建日期:** 2026-01-23  
**预计工作量:** 2-3小时

---

## 任务概览

| 任务ID | 任务名称 | 预计工时 | 依赖 | 优先级 |
|--------|---------|---------|------|--------|
| T13.1 | 创建缓存服务组件 | 1小时 | 无 | P0 |
| T13.2 | 优化现有Service层缓存 | 1小时 | T13.1 | P0 |
| T13.3 | 实现缓存预热 | 0.5小时 | T13.2 | P0 |
| T13.4 | 实现缓存更新策略 | 0.5小时 | T13.2 | P0 |
| T13.5 | 添加缓存监控 | 0.5小时 | T13.1 | P1 |

**总计:** 2.5-3小时

---

## 任务详情

### T13.1 创建缓存服务组件

**目标:** 创建统一的缓存服务组件

**实施步骤:**

1. 创建CacheService类
2. 创建CacheKeyGenerator类
3. 创建CacheProperties配置类
4. 创建CacheStatistics统计类

**代码示例:**

```java
// 文件: com/patient/api/common/cache/CacheService.java
package com.patient.api.common.cache;

import com.alibaba.fastjson.JSON;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Slf4j
@Service
public class CacheService {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Autowired
    private CacheStatistics cacheStatistics;
    
    /**
     * 获取缓存数据
     */
    public <T> T get(String key, Class<T> clazz) {
        try {
            String value = redisTemplate.opsForValue().get(key);
            if (StringUtils.isNotEmpty(value)) {
                cacheStatistics.recordHit();
                return JSON.parseObject(value, clazz);
            }
            cacheStatistics.recordMiss();
        } catch (Exception e) {
            log.error("获取缓存失败: key={}, error={}", key, e.getMessage(), e);
            cacheStatistics.recordMiss();
        }
        return null;
    }
    
    /**
     * 设置缓存数据
     */
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        try {
            String jsonValue = JSON.toJSONString(value);
            // 添加随机过期时间防止缓存雪崩
            long randomTimeout = getRandomExpireTime(timeout);
            redisTemplate.opsForValue().set(key, jsonValue, randomTimeout, unit);
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
     * 获取缓存或查询数据库（防止缓存击穿）
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
                    // 双重检查
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
                    redisTemplate.delete(lockKey);
                }
            } else {
                // 等待其他线程加载完成
                Thread.sleep(100);
                return get(key, clazz);
            }
        } catch (Exception e) {
            log.error("获取或加载缓存失败: key={}, error={}", key, e.getMessage(), e);
            return loader.get();
        }
    }
    
    /**
     * 获取随机化的过期时间（防止缓存雪崩）
     */
    private long getRandomExpireTime(long baseTime) {
        long randomOffset = (long) (baseTime * 0.1 * Math.random());
        return baseTime + randomOffset;
    }
}
```

**验收标准:**

- [ ] CacheService类创建完成
- [ ] CacheKeyGenerator类创建完成
- [ ] CacheProperties配置类创建完成
- [ ] CacheStatistics统计类创建完成
- [ ] 所有方法实现正确
- [ ] 代码编译通过

---

### T13.2 优化现有Service层缓存

**目标:** 优化现有Service层的缓存使用

**实施步骤:**

1. 优化DrugService的缓存使用
2. 优化CategoryService的缓存使用
3. 优化CartService的缓存使用
4. 优化SearchService的缓存使用
5. 优化RecommendService的缓存使用

**代码示例:**

```java
// 优化DrugService
@Service
public class DrugServiceImpl implements DrugService {
    
    @Autowired
    private CacheService cacheService;
    
    @Autowired
    private CacheProperties cacheProperties;
    
    @Autowired
    private DrugMapper drugMapper;
    
    @Override
    public Drug getDrugDetail(Long drugId) {
        String key = CacheKeyGenerator.drugDetail(drugId);
        
        return cacheService.getOrLoad(
            key,
            Drug.class,
            cacheProperties.getDrugDetailExpire(),
            TimeUnit.MINUTES,
            () -> drugMapper.selectById(drugId)
        );
    }
    
    @Override
    public List<Drug> getHotDrugs(Integer limit) {
        String key = CacheKeyGenerator.hotDrugs(limit);
        
        List<Drug> cached = cacheService.get(key, List.class);
        if (cached != null) {
            return cached;
        }
        
        List<Drug> drugs = drugMapper.selectHotSales(limit);
        cacheService.set(
            key,
            drugs,
            cacheProperties.getHotDrugExpire(),
            TimeUnit.MINUTES
        );
        
        return drugs;
    }
}
```

**验收标准:**

- [ ] DrugService缓存优化完成
- [ ] CategoryService缓存优化完成
- [ ] CartService缓存优化完成
- [ ] SearchService缓存优化完成
- [ ] RecommendService缓存优化完成
- [ ] 所有Service使用统一的CacheService
- [ ] 代码编译通过

---

### T13.3 实现缓存预热

**目标:** 实现系统启动时的缓存预热

**实施步骤:**

1. 创建CacheWarmer类
2. 实现ApplicationRunner接口
3. 预热药品分类数据
4. 预热热门药品数据
5. 预热首页推荐数据

**代码示例:**

```java
// 文件: com/patient/api/common/cache/CacheWarmer.java
package com.patient.api.common.cache;

import com.patient.api.app.mall.service.DrugService;
import com.patient.api.app.mall.service.CategoryService;
import com.patient.api.app.mall.service.DrugRecommendService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CacheWarmer implements ApplicationRunner {
    
    @Autowired
    private DrugService drugService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private DrugRecommendService drugRecommendService;
    
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
    
    private void warmupHotDrugs() {
        try {
            log.info("预热热门药品...");
            drugService.getHotDrugs(100);
            log.info("热门药品预热完成");
        } catch (Exception e) {
            log.error("热门药品预热失败: error={}", e.getMessage(), e);
        }
    }
    
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

**验收标准:**

- [ ] CacheWarmer类创建完成
- [ ] 系统启动时自动执行预热
- [ ] 预热时间 < 30秒
- [ ] 预热失败不影响系统启动
- [ ] 预热日志记录完整

---

### T13.4 实现缓存更新策略

**目标:** 实现数据更新时的缓存清除策略

**实施步骤:**

1. 在DrugService添加缓存清除逻辑
2. 在CategoryService添加缓存清除逻辑
3. 创建CacheCleaner工具类

**代码示例:**

```java
// 文件: com/patient/api/common/cache/CacheCleaner.java
package com.patient.api.common.cache;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CacheCleaner {
    
    @Autowired
    private CacheService cacheService;
    
    /**
     * 清除药品相关缓存
     */
    public void clearDrugCache(Long drugId, Long categoryId) {
        log.info("清除药品相关缓存: drugId={}, categoryId={}", drugId, categoryId);
        
        // 清除药品详情缓存
        cacheService.delete(CacheKeyGenerator.drugDetail(drugId));
        
        // 清除分类药品列表缓存
        cacheService.deletePattern("mall:category:" + categoryId + ":drugs:*");
        
        // 清除搜索结果缓存
        cacheService.deletePattern("mall:search:*");
        
        // 清除热门药品缓存
        cacheService.deletePattern("mall:drug:hot:*");
        
        // 清除推荐缓存
        cacheService.delete(CacheKeyGenerator.homeRecommend());
        cacheService.delete(CacheKeyGenerator.relatedRecommend(drugId));
    }
    
    /**
     * 清除分类相关缓存
     */
    public void clearCategoryCache(Long categoryId) {
        log.info("清除分类相关缓存: categoryId={}", categoryId);
        
        // 清除分类列表缓存
        cacheService.delete(CacheKeyGenerator.categoryList());
        cacheService.delete(CacheKeyGenerator.quickCategoryList());
        
        // 清除分类药品列表缓存
        cacheService.deletePattern("mall:category:" + categoryId + ":drugs:*");
        
        // 清除首页推荐缓存
        cacheService.delete(CacheKeyGenerator.homeRecommend());
    }
}
```

**验收标准:**

- [ ] CacheCleaner类创建完成
- [ ] 药品更新时缓存正确清除
- [ ] 分类更新时缓存正确清除
- [ ] 缓存清除日志记录完整
- [ ] 代码编译通过

---

### T13.5 添加缓存监控

**目标:** 添加缓存监控和统计功能

**实施步骤:**

1. 创建CacheStatistics类
2. 在CacheService中集成统计
3. 创建缓存监控接口

**代码示例:**

```java
// 文件: com/patient/api/app/mall/controller/CacheMonitorController.java
package com.patient.api.app.mall.controller;

import com.adinnet.core.base.BaseController;
import com.adinnet.core.base.Result;
import com.patient.api.common.cache.CacheStatistics;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Api(tags = "缓存监控")
@RestController
@RequestMapping("/api/admin/cache")
public class CacheMonitorController extends BaseController {
    
    @Autowired
    private CacheStatistics cacheStatistics;
    
    @ApiOperation("获取缓存统计")
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("hitCount", cacheStatistics.getHitCount().get());
        stats.put("missCount", cacheStatistics.getMissCount().get());
        stats.put("hitRate", cacheStatistics.getHitRate());
        
        return Result.success(stats);
    }
    
    @ApiOperation("重置缓存统计")
    @PostMapping("/statistics/reset")
    public Result<Void> resetStatistics() {
        cacheStatistics.reset();
        return Result.success();
    }
}
```

**验收标准:**

- [ ] CacheStatistics类创建完成
- [ ] 缓存命中率统计正确
- [ ] 缓存监控接口正常工作
- [ ] 统计数据准确
- [ ] 代码编译通过

---

## 集成测试

### 测试用例1: 验证缓存命中

**步骤:**
1. 第一次查询药品详情
2. 第二次查询同一药品详情
3. 检查缓存统计

**预期结果:**
- 第一次查询从数据库获取
- 第二次查询从缓存获取
- 缓存命中率增加

### 测试用例2: 验证缓存更新

**步骤:**
1. 查询药品详情（缓存）
2. 更新药品信息
3. 再次查询药品详情

**预期结果:**
- 更新后缓存被清除
- 再次查询获取最新数据

### 测试用例3: 验证缓存预热

**步骤:**
1. 重启应用
2. 检查日志
3. 查询预热的数据

**预期结果:**
- 预热日志正常输出
- 预热时间 < 30秒
- 预热的数据可以从缓存获取

### 测试用例4: 验证缓存命中率

**步骤:**
1. 模拟100次请求
2. 查看缓存统计

**预期结果:**
- 缓存命中率 > 90%

---

## 注意事项

### 1. 缓存一致性

- 数据更新时必须清除相关缓存
- 使用事务保证数据库和缓存的一致性
- 缓存清除失败应记录日志

### 2. 缓存过期时间

- 根据数据特点设置合理的过期时间
- 添加随机值防止缓存雪崩
- 热点数据可以设置较长过期时间

### 3. 缓存Key设计

- 使用统一的命名规范
- Key应包含必要的参数
- 避免Key过长

### 4. 性能优化

- 批量操作时使用批量缓存
- 避免缓存大对象
- 合理使用缓存预热

### 5. 错误处理

- 缓存操作失败不应影响主流程
- 记录详细的错误日志
- Redis不可用时降级到数据库查询

---

## 验证清单

### 功能验证

- [ ] 缓存服务组件正常工作
- [ ] 缓存预热功能正常
- [ ] 缓存更新策略正确执行
- [ ] 缓存监控功能正常

### 性能验证

- [ ] 缓存命中率 > 90%
- [ ] 缓存响应时间 < 50ms
- [ ] 缓存预热时间 < 30秒
- [ ] 系统响应时间提升 > 50%

### 可用性验证

- [ ] Redis不可用时系统正常降级
- [ ] 缓存失败不影响主流程
- [ ] 缓存更新失败有日志记录

### 代码质量验证

- [ ] 代码编译通过
- [ ] 单元测试通过
- [ ] 代码符合规范
- [ ] 没有代码坏味道

---

**文档创建日期:** 2026-01-23  
**创建人员:** Kiro AI Assistant  
**状态:** 待执行
