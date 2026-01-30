# Spec 12: 药品推荐功能 - 设计文档

## 文档信息

**Spec编号:** Spec 12  
**功能名称:** 药品推荐功能  
**所属阶段:** 阶段六 - 优化功能  
**创建日期:** 2026-01-23

---

## 1. 系统架构

### 1.1 架构图

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
│  │  DrugRecommendController     │  │
│  │  - getHomeRecommend()        │  │
│  │  - getRelatedRecommend()     │  │
│  │  - getHotRecommend()         │  │
│  └────────────┬─────────────────┘  │
│               ↓                     │
│  ┌──────────────────────────────┐  │
│  │  DrugRecommendService        │  │
│  │  - getHotSales()             │  │
│  │  - getNewArrivals()          │  │
│  │  - getCategoryRecommends()   │  │
│  │  - getRelatedDrugs()         │  │
│  └────────────┬─────────────────┘  │
│               ↓                     │
│  ┌──────────────────────────────┐  │
│  │  DrugMapper                  │  │
│  │  - selectHotSales()          │  │
│  │  - selectNewArrivals()       │  │
│  │  - selectByCategoryId()      │  │
│  └────────────┬─────────────────┘  │
└───────────────┼─────────────────────┘
                ↓
       ┌────────┴────────┐
       │                 │
       ↓                 ↓
┌─────────────┐   ┌─────────────┐
│   MySQL     │   │    Redis    │
│  (t_drug)   │   │   (缓存)     │
└─────────────┘   └─────────────┘
```

### 1.2 模块职责

| 模块 | 职责 |
|------|------|
| DrugRecommendController | 接收推荐请求，参数验证 |
| DrugRecommendService | 推荐业务逻辑，缓存管理 |
| DrugMapper | 数据库查询 |
| Redis | 推荐结果缓存 |

---

## 2. 数据模型设计

### 2.1 核心实体

#### RecommendDrugDTO（推荐药品）

```java
package com.patient.api.app.mall.model.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.math.BigDecimal;

@Data
@ApiModel("推荐药品")
public class RecommendDrugDTO {
    
    @ApiModelProperty("药品ID")
    private Long drugId;
    
    @ApiModelProperty("药品名称")
    private String drugName;
    
    @ApiModelProperty("药品图片")
    private String drugImage;
    
    @ApiModelProperty("价格")
    private BigDecimal price;
    
    @ApiModelProperty("销量")
    private Integer sales;
    
    @ApiModelProperty("是否包邮")
    private Boolean isFreeShipping;
    
    @ApiModelProperty("上架时间")
    private String createTime;
}
```

#### HomeRecommendDTO（首页推荐）

```java
package com.patient.api.app.mall.model.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.util.List;

@Data
@ApiModel("首页推荐")
public class HomeRecommendDTO {
    
    @ApiModelProperty("热销药品")
    private List<RecommendDrugDTO> hotSales;
    
    @ApiModelProperty("新品推荐")
    private List<RecommendDrugDTO> newArrivals;
    
    @ApiModelProperty("分类推荐")
    private List<CategoryRecommendDTO> categoryRecommends;
}
```

#### CategoryRecommendDTO（分类推荐）

```java
package com.patient.api.app.mall.model.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.util.List;

@Data
@ApiModel("分类推荐")
public class CategoryRecommendDTO {
    
    @ApiModelProperty("分类ID")
    private Long categoryId;
    
    @ApiModelProperty("分类名称")
    private String categoryName;
    
    @ApiModelProperty("推荐药品列表")
    private List<RecommendDrugDTO> drugs;
}
```

### 2.2 Redis缓存Key设计

```
首页推荐缓存Key: mall:recommend:home
相关推荐缓存Key: mall:recommend:related:{drugId}
热销推荐缓存Key: mall:recommend:hot
过期时间: 30分钟
数据格式: JSON字符串
```

---

## 3. 核心流程设计

### 3.1 首页推荐流程

```
开始
  ↓
检查Redis缓存
  ↓
缓存命中？
  ├─ 是 → 返回缓存数据 → 结束
  └─ 否 ↓
查询热销药品（Top 10，按销量降序）
  ↓
查询新品药品（7天内上架，Top 10，按时间降序）
  ↓
查询快捷分类列表
  ↓
遍历每个分类
  ↓
查询该分类热销药品（Top 3）
  ↓
组装首页推荐数据
  ↓
存入Redis缓存（30分钟）
  ↓
返回推荐数据
  ↓
结束
```

### 3.2 相关推荐流程

```
开始
  ↓
检查Redis缓存
  ↓
缓存命中？
  ├─ 是 → 返回缓存数据 → 结束
  └─ 否 ↓
查询药品详情（获取分类ID）
  ↓
查询同分类热销药品（Top 6，排除当前药品）
  ↓
存入Redis缓存（30分钟）
  ↓
返回推荐数据
  ↓
结束
```

---

## 4. API详细设计

### 4.1 Controller层

```java
package com.patient.api.app.mall.controller;

import com.adinnet.core.base.BaseController;
import com.adinnet.core.base.Result;
import com.patient.api.app.mall.model.dto.HomeRecommendDTO;
import com.patient.api.app.mall.model.dto.RecommendDrugDTO;
import com.patient.api.app.mall.service.DrugRecommendService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 药品推荐控制器
 */
@Api(tags = "药品商城-药品推荐")
@RestController
@RequestMapping("/api/patient/mall/drug/recommend")
public class DrugRecommendController extends BaseController {
    
    @Autowired
    private DrugRecommendService drugRecommendService;
    
    /**
     * 获取首页推荐
     */
    @ApiOperation("获取首页推荐")
    @GetMapping("/home")
    public Result<HomeRecommendDTO> getHomeRecommend() {
        HomeRecommendDTO recommend = drugRecommendService.getHomeRecommend();
        return Result.success(recommend);
    }
    
    /**
     * 获取药品详情页相关推荐
     */
    @ApiOperation("获取相关推荐")
    @GetMapping("/related/{drugId}")
    public Result<Map<String, List<RecommendDrugDTO>>> getRelatedRecommend(
            @ApiParam("药品ID") @PathVariable Long drugId) {
        
        List<RecommendDrugDTO> relatedDrugs = drugRecommendService.getRelatedDrugs(drugId);
        return Result.success(Map.of("relatedDrugs", relatedDrugs));
    }
    
    /**
     * 获取热销药品推荐
     */
    @ApiOperation("获取热销推荐")
    @GetMapping("/hot")
    public Result<Map<String, List<RecommendDrugDTO>>> getHotRecommend(
            @ApiParam("返回数量") @RequestParam(defaultValue = "10") Integer limit) {
        
        // 限制最大返回数量
        if (limit > 20) {
            limit = 20;
        }
        
        List<RecommendDrugDTO> hotDrugs = drugRecommendService.getHotSales(limit);
        return Result.success(Map.of("hotDrugs", hotDrugs));
    }
}
```

### 4.2 Service层

```java
package com.patient.api.app.mall.service.impl;

import com.alibaba.fastjson.JSON;
import com.patient.api.app.mall.mapper.DrugMapper;
import com.patient.api.app.mall.model.Drug;
import com.patient.api.app.mall.model.dto.CategoryRecommendDTO;
import com.patient.api.app.mall.model.dto.HomeRecommendDTO;
import com.patient.api.app.mall.model.dto.RecommendDrugDTO;
import com.patient.api.app.mall.service.DrugRecommendService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 药品推荐服务实现
 */
@Slf4j
@Service
public class DrugRecommendServiceImpl implements DrugRecommendService {
    
    private static final String HOME_RECOMMEND_CACHE_KEY = "mall:recommend:home";
    private static final String RELATED_RECOMMEND_CACHE_KEY_PREFIX = "mall:recommend:related:";
    private static final String HOT_RECOMMEND_CACHE_KEY = "mall:recommend:hot";
    private static final long CACHE_EXPIRE_MINUTES = 30;
    
    @Autowired
    private DrugMapper drugMapper;
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Override
    public HomeRecommendDTO getHomeRecommend() {
        // 1. 检查缓存
        String cachedData = redisTemplate.opsForValue().get(HOME_RECOMMEND_CACHE_KEY);
        if (StringUtils.isNotEmpty(cachedData)) {
            log.info("首页推荐缓存命中");
            return JSON.parseObject(cachedData, HomeRecommendDTO.class);
        }
        
        // 2. 查询热销药品
        List<RecommendDrugDTO> hotSales = getHotSales(10);
        
        // 3. 查询新品药品
        List<RecommendDrugDTO> newArrivals = getNewArrivals(10);
        
        // 4. 查询分类推荐
        List<CategoryRecommendDTO> categoryRecommends = getCategoryRecommends();
        
        // 5. 组装数据
        HomeRecommendDTO dto = new HomeRecommendDTO();
        dto.setHotSales(hotSales);
        dto.setNewArrivals(newArrivals);
        dto.setCategoryRecommends(categoryRecommends);
        
        // 6. 存入缓存
        redisTemplate.opsForValue().set(
            HOME_RECOMMEND_CACHE_KEY,
            JSON.toJSONString(dto),
            CACHE_EXPIRE_MINUTES,
            TimeUnit.MINUTES
        );
        
        return dto;
    }
    
    @Override
    public List<RecommendDrugDTO> getHotSales(Integer limit) {
        // 查询热销药品（按销量降序）
        List<Drug> drugs = drugMapper.selectHotSales(limit);
        return convertToDTOList(drugs);
    }
    
    @Override
    public List<RecommendDrugDTO> getNewArrivals(Integer limit) {
        // 查询7天内上架的新品（按时间降序）
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Drug> drugs = drugMapper.selectNewArrivals(sevenDaysAgo, limit);
        return convertToDTOList(drugs);
    }
    
    @Override
    public List<CategoryRecommendDTO> getCategoryRecommends() {
        // 查询快捷分类列表
        List<Category> categories = drugMapper.selectQuickCategories();
        
        List<CategoryRecommendDTO> result = new ArrayList<>();
        for (Category category : categories) {
            // 查询该分类的热销药品（Top 3）
            List<Drug> drugs = drugMapper.selectByCategoryId(category.getId(), 3);
            
            if (!drugs.isEmpty()) {
                CategoryRecommendDTO dto = new CategoryRecommendDTO();
                dto.setCategoryId(category.getId());
                dto.setCategoryName(category.getName());
                dto.setDrugs(convertToDTOList(drugs));
                result.add(dto);
            }
        }
        
        return result;
    }
    
    @Override
    public List<RecommendDrugDTO> getRelatedDrugs(Long drugId) {
        // 1. 检查缓存
        String cacheKey = RELATED_RECOMMEND_CACHE_KEY_PREFIX + drugId;
        String cachedData = redisTemplate.opsForValue().get(cacheKey);
        if (StringUtils.isNotEmpty(cachedData)) {
            log.info("相关推荐缓存命中: drugId={}", drugId);
            return JSON.parseArray(cachedData, RecommendDrugDTO.class);
        }
        
        // 2. 查询药品详情（获取分类ID）
        Drug drug = drugMapper.selectById(drugId);
        if (drug == null) {
            return new ArrayList<>();
        }
        
        // 3. 查询同分类热销药品（排除当前药品）
        List<Drug> drugs = drugMapper.selectByCategoryIdExclude(
            drug.getCategoryId(), 
            drugId, 
            6
        );
        
        List<RecommendDrugDTO> result = convertToDTOList(drugs);
        
        // 4. 存入缓存
        redisTemplate.opsForValue().set(
            cacheKey,
            JSON.toJSONString(result),
            CACHE_EXPIRE_MINUTES,
            TimeUnit.MINUTES
        );
        
        return result;
    }
    
    /**
     * 转换为DTO列表
     */
    private List<RecommendDrugDTO> convertToDTOList(List<Drug> drugs) {
        return drugs.stream().map(drug -> {
            RecommendDrugDTO dto = new RecommendDrugDTO();
            BeanUtils.copyProperties(drug, dto);
            
            // 解析第一张图片作为展示图
            if (StringUtils.isNotEmpty(drug.getPicPosition())) {
                List<String> images = JSON.parseArray(drug.getPicPosition(), String.class);
                if (!images.isEmpty()) {
                    dto.setDrugImage(images.get(0));
                }
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
}
```

### 4.3 Mapper层

```java
package com.patient.api.app.mall.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.patient.api.app.mall.model.Drug;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 药品Mapper
 */
public interface DrugMapper extends BaseMapper<Drug> {
    
    /**
     * 查询热销药品
     */
    List<Drug> selectHotSales(@Param("limit") Integer limit);
    
    /**
     * 查询新品药品
     */
    List<Drug> selectNewArrivals(
        @Param("startTime") LocalDateTime startTime,
        @Param("limit") Integer limit
    );
    
    /**
     * 按分类查询药品
     */
    List<Drug> selectByCategoryId(
        @Param("categoryId") Long categoryId,
        @Param("limit") Integer limit
    );
    
    /**
     * 按分类查询药品（排除指定药品）
     */
    List<Drug> selectByCategoryIdExclude(
        @Param("categoryId") Long categoryId,
        @Param("excludeDrugId") Long excludeDrugId,
        @Param("limit") Integer limit
    );
}
```

### 4.4 Mapper XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.patient.api.app.mall.mapper.DrugMapper">
    
    <!-- 查询热销药品 -->
    <select id="selectHotSales" resultType="com.patient.api.app.mall.model.Drug">
        SELECT 
            id, drug_name, pic_position, price, sales, is_free_shipping
        FROM t_drug
        WHERE status = 1
          AND stock > 0
          AND pic_position IS NOT NULL
          AND pic_position != ''
        ORDER BY sales DESC
        LIMIT #{limit}
    </select>
    
    <!-- 查询新品药品 -->
    <select id="selectNewArrivals" resultType="com.patient.api.app.mall.model.Drug">
        SELECT 
            id, drug_name, pic_position, price, sales, create_time
        FROM t_drug
        WHERE status = 1
          AND stock > 0
          AND pic_position IS NOT NULL
          AND pic_position != ''
          AND create_time >= #{startTime}
        ORDER BY create_time DESC
        LIMIT #{limit}
    </select>
    
    <!-- 按分类查询药品 -->
    <select id="selectByCategoryId" resultType="com.patient.api.app.mall.model.Drug">
        SELECT 
            id, drug_name, pic_position, price, sales, is_free_shipping
        FROM t_drug
        WHERE status = 1
          AND stock > 0
          AND pic_position IS NOT NULL
          AND pic_position != ''
          AND category_id = #{categoryId}
        ORDER BY sales DESC
        LIMIT #{limit}
    </select>
    
    <!-- 按分类查询药品（排除指定药品） -->
    <select id="selectByCategoryIdExclude" resultType="com.patient.api.app.mall.model.Drug">
        SELECT 
            id, drug_name, pic_position, price, sales, is_free_shipping
        FROM t_drug
        WHERE status = 1
          AND stock > 0
          AND pic_position IS NOT NULL
          AND pic_position != ''
          AND category_id = #{categoryId}
          AND id != #{excludeDrugId}
        ORDER BY sales DESC
        LIMIT #{limit}
    </select>
    
</mapper>
```

---

## 5. 正确性属性（Property-Based Testing）

### 5.1 核心不变量

1. **数据质量不变量**: 推荐的药品必须是上架状态、有库存、有图片
2. **排序不变量**: 热销推荐按销量降序，新品推荐按时间降序
3. **去重不变量**: 相关推荐不包含当前查看的药品
4. **缓存一致性**: 缓存数据与实时查询数据应保持一致

### 5.2 测试属性

```java
// Property 1: 数据质量
∀ drug ∈ recommendList: 
  drug.status = 1 ∧ drug.stock > 0 ∧ drug.picPosition ≠ null

// Property 2: 热销排序
∀ i, j ∈ hotSalesList: 
  i < j ⇒ hotSalesList[i].sales ≥ hotSalesList[j].sales

// Property 3: 新品排序
∀ i, j ∈ newArrivalsList: 
  i < j ⇒ newArrivalsList[i].createTime ≥ newArrivalsList[j].createTime

// Property 4: 相关推荐去重
∀ drug ∈ relatedDrugs(drugId): 
  drug.id ≠ drugId
```

---

## 6. 错误处理策略

### 6.1 异常分类

| 异常类型 | 处理策略 | 用户提示 |
|---------|---------|---------|
| 数据库查询失败 | 返回空列表 | 正常显示（不显示推荐） |
| Redis异常 | 跳过缓存，直接查询 | 正常显示 |
| 数据为空 | 返回空列表 | 显示"暂无推荐" |

### 6.2 降级策略

```java
/**
 * 推荐查询降级处理
 */
private List<RecommendDrugDTO> fallbackRecommend() {
    // 返回空列表，不影响主流程
    return new ArrayList<>();
}
```

---

## 7. 性能优化方案

### 7.1 缓存策略

- Redis缓存推荐结果，30分钟过期
- 不同场景使用不同缓存Key
- 缓存Key设计：
  - 首页推荐: `mall:recommend:home`
  - 相关推荐: `mall:recommend:related:{drugId}`
  - 热销推荐: `mall:recommend:hot`

### 7.2 数据库优化

- 使用索引加速查询：
  - `idx_sales` - 热销查询
  - `idx_create_time` - 新品查询
  - `idx_category_id` - 分类查询
- 限制查询数量（LIMIT）
- 只查询必要字段

### 7.3 并发控制

- 使用Redis分布式锁防止缓存击穿
- 锁超时时间: 5秒

---

## 8. 测试策略

### 8.1 单元测试

```java
@Test
public void testGetHotSales() {
    // 测试热销推荐
    List<RecommendDrugDTO> result = drugRecommendService.getHotSales(10);
    assertNotNull(result);
    assertTrue(result.size() <= 10);
    // 验证排序
    for (int i = 0; i < result.size() - 1; i++) {
        assertTrue(result.get(i).getSales() >= result.get(i + 1).getSales());
    }
}

@Test
public void testGetNewArrivals() {
    // 测试新品推荐
    List<RecommendDrugDTO> result = drugRecommendService.getNewArrivals(10);
    assertNotNull(result);
    // 验证都是7天内的药品
    LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
    for (RecommendDrugDTO drug : result) {
        assertTrue(drug.getCreateTime().isAfter(sevenDaysAgo));
    }
}

@Test
public void testGetRelatedDrugs() {
    // 测试相关推荐
    Long drugId = 1L;
    List<RecommendDrugDTO> result = drugRecommendService.getRelatedDrugs(drugId);
    assertNotNull(result);
    // 验证不包含当前药品
    for (RecommendDrugDTO drug : result) {
        assertNotEquals(drugId, drug.getDrugId());
    }
}
```

### 8.2 集成测试

- 测试完整的推荐流程
- 测试缓存功能
- 测试并发场景

### 8.3 性能测试

- 测试500个用户并发请求
- 测试缓存命中率
- 测试响应时间

---

**文档创建日期:** 2026-01-23  
**创建人员:** Kiro AI Assistant  
**状态:** 待评审
