# 药品商城代码模板与生成指南

## 文档说明

本文档为Spec 3-13提供详细的代码模板、文件清单和生成指南。
每个spec包含完整的文件路径、核心逻辑要点、依赖关系和代码模板。

**使用方式:**
1. 按需选择要实现的spec
2. 参考模板和要点生成代码
3. 复制粘贴模板并根据实际情况调整
4. 运行测试验证功能

---

## 📊 总体概览

| Spec | 功能 | 文件数 | 核心复杂度 | 预计时间 |
|------|------|--------|-----------|---------|
| Spec 3 | 药品分类查询 | 8 | ⭐⭐ | 20分钟 |
| Spec 4 | 药品搜索功能 | 10 | ⭐⭐⭐ | 25分钟 |
| Spec 5 | 药品详情查询 | 7 | ⭐⭐ | 20分钟 |
| Spec 6 | 购物车基础功能 | 8 | ⭐⭐⭐ | 20分钟 |
| Spec 7 | 购物车高级功能 | 5 | ⭐⭐ | 15分钟 |
| Spec 8 | 订单创建功能 | 10 | ⭐⭐⭐⭐ | 30分钟 |
| Spec 9 | 订单查询功能 | 7 | ⭐⭐ | 20分钟 |
| Spec 10 | 订单状态管理 | 6 | ⭐⭐⭐ | 20分钟 |
| Spec 11 | 物流信息查询 | 8 | ⭐⭐⭐ | 25分钟 |
| Spec 12 | 药品推荐功能 | 7 | ⭐⭐ | 20分钟 |
| Spec 13 | 缓存优化 | 8 | ⭐⭐⭐ | 25分钟 |

---

## Spec 3: 药品分类查询功能

### 文件清单

```
✅ DrugCategoryController.java      - 已生成
✅ DrugCategoryService.java         - 已生成  
✅ DrugCategoryServiceImpl.java     - 已生成
⏸️ DrugCategoryMapper.java          - 待生成
⏸️ DrugCategoryMapper.xml           - 待生成
⏸️ DrugCategory.java (实体类)       - 待生成
⏸️ DrugCategoryDTO.java             - 待生成
⏸️ DrugCategoryTest.java            - 待生成
```

### 核心逻辑要点

1. **分类列表查询**
   - 查询所有分类并按sort_order排序
   - 统计每个分类下的药品数量
   - Redis缓存30分钟

2. **快捷分类**
   - 按药品数量降序排序
   - 返回前N个热门分类
   - Redis缓存30分钟

3. **按分类查询药品**
   - 支持分页查询
   - 支持多种排序(销量/价格/时间)
   - 只返回上架且有库存的药品
   - Redis缓存5分钟

### 代码模板

#### 1. DrugCategoryMapper.java

```java
package com.patient.api.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.patient.api.app.model.DrugCategory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 药品分类Mapper
 */
@Mapper
public interface DrugCategoryMapper extends BaseMapper<DrugCategory> {
}
```

#### 2. DrugCategory.java (实体类)

```java
package com.patient.api.app.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

/**
 * 药品分类实体
 */
@Data
@TableName("t_drug_category")
public class DrugCategory {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /** 分类名称 */
    private String categoryName;
    
    /** 分类图标URL */
    private String icon;
    
    /** 排序顺序 */
    private Integer sortOrder;
    
    /** 药品数量(冗余字段,定时更新) */
    private Integer drugCount;
    
    /** 创建时间 */
    private Date createTime;
    
    /** 更新时间 */
    private Date updateTime;
}
```

#### 3. DrugCategoryDTO.java

```java
package com.patient.api.app.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 药品分类DTO
 */
@Data
@ApiModel(description = "药品分类信息")
public class DrugCategoryDTO {
    
    @ApiModelProperty(value = "分类ID")
    private Long id;
    
    @ApiModelProperty(value = "分类名称")
    private String name;
    
    @ApiModelProperty(value = "分类图标")
    private String icon;
    
    @ApiModelProperty(value = "排序顺序")
    private Integer sortOrder;
    
    @ApiModelProperty(value = "药品数量")
    private Long drugCount;
}
```

#### 4. DrugCategoryTest.java

```java
package com.patient.api.app.service;

import com.adinnet.core.JsonResult;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import javax.annotation.Resource;

import static org.junit.Assert.*;

/**
 * 药品分类Service测试
 */
@RunWith(SpringRunner.class)
@SpringBootTest
public class DrugCategoryTest {
    
    @Resource
    private DrugCategoryService drugCategoryService;
    
    @Test
    public void testGetCategoryList() {
        JsonResult result = drugCategoryService.getCategoryList();
        assertEquals(200, result.getCode().intValue());
        assertNotNull(result.getData());
    }
    
    @Test
    public void testGetQuickCategories() {
        JsonResult result = drugCategoryService.getQuickCategories(10);
        assertEquals(200, result.getCode().intValue());
        assertNotNull(result.getData());
    }
    
    @Test
    public void testGetDrugsByCategory() {
        JsonResult result = drugCategoryService.getDrugsByCategory(1L, 1, 20, "sales", "desc");
        assertEquals(200, result.getCode().intValue());
        assertNotNull(result.getData());
    }
}
```

### 数据库表结构

```sql
-- 药品分类表(如果不存在)
CREATE TABLE IF NOT EXISTS `t_drug_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `category_name` varchar(50) NOT NULL COMMENT '分类名称',
  `icon` varchar(255) DEFAULT NULL COMMENT '分类图标URL',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序顺序',
  `drug_count` int(11) DEFAULT 0 COMMENT '药品数量',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='药品分类表';
```

---

## Spec 4: 药品搜索功能

### 文件清单

```
⏸️ DrugSearchController.java        - 待生成
⏸️ DrugSearchService.java           - 待生成
⏸️ DrugSearchServiceImpl.java       - 待生成
⏸️ DrugSearchMapper.java            - 待生成
⏸️ DrugSearchMapper.xml             - 待生成
⏸️ DrugSearchDTO.java               - 待生成
⏸️ SearchHistoryCache.java          - 待生成 (Redis List)
⏸️ HotSearchCache.java              - 待生成 (Redis ZSet)
⏸️ DrugSearchTest.java              - 待生成
⏸️ SearchCacheTest.java             - 待生成
```

### 核心逻辑要点

1. **多条件搜索**
   - 支持按药品名称、编码、厂家搜索
   - 使用LIKE模糊匹配
   - 防SQL注入(使用PreparedStatement)
   - 相关性排序(名称完全匹配 > 名称包含 > 编码匹配 > 厂家匹配)

2. **搜索历史**
   - 使用Redis List存储
   - 每个用户最多保存20条
   - 按时间倒序排列
   - 支持清除历史

3. **热门搜索**
   - 使用Redis ZSet存储
   - 按搜索次数排序
   - 返回前10个热门关键词
   - 每次搜索增加计数

4. **搜索结果缓存**
   - 缓存常见搜索词的结果
   - 5分钟过期
   - Key格式: `drug:search:{keyword}:{page}:{limit}`

### 代码模板

#### 1. DrugSearchController.java

```java
package com.patient.api.app.controller;

import com.adinnet.core.JsonResult;
import com.patient.api.app.service.DrugSearchService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * 药品搜索Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/patient/drug/search")
@Api(tags = "药品搜索")
public class DrugSearchController {

    @Resource
    private DrugSearchService drugSearchService;

    /**
     * 搜索药品
     */
    @GetMapping
    @ApiOperation("搜索药品")
    public JsonResult searchDrugs(
            @ApiParam(value = "搜索关键词", required = true)
            @RequestParam String keyword,
            @ApiParam(value = "用户ID", required = true)
            @RequestParam Long userId,
            @ApiParam(value = "页码", example = "1")
            @RequestParam(defaultValue = "1") Integer page,
            @ApiParam(value = "每页数量", example = "20")
            @RequestParam(defaultValue = "20") Integer limit) {
        log.info("搜索药品, keyword={}, userId={}, page={}, limit={}", keyword, userId, page, limit);
        return drugSearchService.searchDrugs(keyword, userId, page, limit);
    }

    /**
     * 获取搜索历史
     */
    @GetMapping("/history")
    @ApiOperation("获取搜索历史")
    public JsonResult getSearchHistory(
            @ApiParam(value = "用户ID", required = true)
            @RequestParam Long userId,
            @ApiParam(value = "返回数量", example = "10")
            @RequestParam(defaultValue = "10") Integer limit) {
        log.info("获取搜索历史, userId={}, limit={}", userId, limit);
        return drugSearchService.getSearchHistory(userId, limit);
    }

    /**
     * 清除搜索历史
     */
    @DeleteMapping("/history")
    @ApiOperation("清除搜索历史")
    public JsonResult clearSearchHistory(
            @ApiParam(value = "用户ID", required = true)
            @RequestParam Long userId) {
        log.info("清除搜索历史, userId={}", userId);
        return drugSearchService.clearSearchHistory(userId);
    }

    /**
     * 获取热门搜索
     */
    @GetMapping("/hot")
    @ApiOperation("获取热门搜索")
    public JsonResult getHotSearches(
            @ApiParam(value = "返回数量", example = "10")
            @RequestParam(defaultValue = "10") Integer limit) {
        log.info("获取热门搜索, limit={}", limit);
        return drugSearchService.getHotSearches(limit);
    }
}
```

#### 2. DrugSearchService.java

```java
package com.patient.api.app.service;

import com.adinnet.core.JsonResult;

/**
 * 药品搜索Service接口
 */
public interface DrugSearchService {

    /**
     * 搜索药品
     */
    JsonResult searchDrugs(String keyword, Long userId, Integer page, Integer limit);

    /**
     * 获取搜索历史
     */
    JsonResult getSearchHistory(Long userId, Integer limit);

    /**
     * 清除搜索历史
     */
    JsonResult clearSearchHistory(Long userId);

    /**
     * 获取热门搜索
     */
    JsonResult getHotSearches(Integer limit);
}
```

#### 3. DrugSearchServiceImpl.java

```java
package com.patient.api.app.service.impl;

import com.adinnet.common.utils.DrugImageParser;
import com.adinnet.core.JsonResult;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.patient.api.app.mapper.DrugMapper;
import com.patient.api.app.model.Drug;
import com.patient.api.app.model.DrugDTO;
import com.patient.api.app.service.DrugSearchService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 药品搜索Service实现
 */
@Slf4j
@Service
public class DrugSearchServiceImpl implements DrugSearchService {

    @Resource
    private DrugMapper drugMapper;

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_KEY_SEARCH_RESULT = "drug:search:result:";
    private static final String CACHE_KEY_SEARCH_HISTORY = "drug:search:history:";
    private static final String CACHE_KEY_HOT_SEARCH = "drug:search:hot";
    private static final int MAX_HISTORY_SIZE = 20;
    private static final long CACHE_EXPIRE_MINUTES = 5;

    @Override
    public JsonResult searchDrugs(String keyword, Long userId, Integer page, Integer limit) {
        // 参数校验
        if (StringUtils.isBlank(keyword)) {
            return JsonResult.error("搜索关键词不能为空");
        }

        // 清理关键词(防SQL注入)
        keyword = keyword.trim();
        if (keyword.length() > 50) {
            keyword = keyword.substring(0, 50);
        }

        // 尝试从缓存获取
        String cacheKey = CACHE_KEY_SEARCH_RESULT + keyword + ":" + page + ":" + limit;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.debug("从缓存获取搜索结果");
            // 异步保存搜索历史和更新热搜
            saveSearchHistoryAsync(userId, keyword);
            return JsonResult.ok().putData(cached);
        }

        // 构建查询条件
        QueryWrapper<Drug> wrapper = new QueryWrapper<>();
        wrapper.and(w -> w
                .like("drug_name", keyword)
                .or().like("drug_code", keyword)
                .or().like("manufacturer", keyword))
                .eq("status", 1)
                .gt("stock", 0);

        // 相关性排序(简化版)
        wrapper.orderByDesc("CASE " +
                "WHEN drug_name = '" + keyword + "' THEN 3 " +
                "WHEN drug_name LIKE '%" + keyword + "%' THEN 2 " +
                "WHEN drug_code LIKE '%" + keyword + "%' THEN 1 " +
                "ELSE 0 END")
                .orderByDesc("sales");

        // 分页查询
        IPage<Drug> iPage = new Page<>(page, limit);
        IPage<Drug> drugPage = drugMapper.selectPage(iPage, wrapper);

        // 转换为DTO
        List<DrugDTO> drugDTOs = drugPage.getRecords().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("list", drugDTOs);
        result.put("total", drugPage.getTotal());
        result.put("page", page);
        result.put("limit", limit);
        result.put("keyword", keyword);

        // 缓存结果
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_EXPIRE_MINUTES, TimeUnit.MINUTES);

        // 保存搜索历史和更新热搜
        saveSearchHistory(userId, keyword);
        incrementHotSearch(keyword);

        return JsonResult.ok().putData(result);
    }

    @Override
    public JsonResult getSearchHistory(Long userId, Integer limit) {
        String key = CACHE_KEY_SEARCH_HISTORY + userId;
        List<Object> history = redisTemplate.opsForList().range(key, 0, limit - 1);
        return JsonResult.ok().putData(history);
    }

    @Override
    public JsonResult clearSearchHistory(Long userId) {
        String key = CACHE_KEY_SEARCH_HISTORY + userId;
        redisTemplate.delete(key);
        return JsonResult.ok();
    }

    @Override
    public JsonResult getHotSearches(Integer limit) {
        Set<ZSetOperations.TypedTuple<Object>> hotSearches = 
                redisTemplate.opsForZSet().reverseRangeWithScores(CACHE_KEY_HOT_SEARCH, 0, limit - 1);
        
        List<Map<String, Object>> result = new ArrayList<>();
        if (hotSearches != null) {
            for (ZSetOperations.TypedTuple<Object> tuple : hotSearches) {
                Map<String, Object> item = new HashMap<>();
                item.put("keyword", tuple.getValue());
                item.put("count", tuple.getScore().intValue());
                result.add(item);
            }
        }
        
        return JsonResult.ok().putData(result);
    }

    /**
     * 保存搜索历史
     */
    private void saveSearchHistory(Long userId, String keyword) {
        String key = CACHE_KEY_SEARCH_HISTORY + userId;
        
        // 移除已存在的相同关键词
        redisTemplate.opsForList().remove(key, 0, keyword);
        
        // 添加到列表头部
        redisTemplate.opsForList().leftPush(key, keyword);
        
        // 保持最多20条
        redisTemplate.opsForList().trim(key, 0, MAX_HISTORY_SIZE - 1);
        
        // 设置过期时间(30天)
        redisTemplate.expire(key, 30, TimeUnit.DAYS);
    }

    /**
     * 异步保存搜索历史
     */
    private void saveSearchHistoryAsync(Long userId, String keyword) {
        new Thread(() -> saveSearchHistory(userId, keyword)).start();
    }

    /**
     * 增加热搜计数
     */
    private void incrementHotSearch(String keyword) {
        redisTemplate.opsForZSet().incrementScore(CACHE_KEY_HOT_SEARCH, keyword, 1);
    }

    /**
     * 转换为DTO
     */
    private DrugDTO convertToDTO(Drug drug) {
        DrugDTO dto = new DrugDTO();
        BeanUtils.copyProperties(drug, dto);
        
        List<String> images = DrugImageParser.parseImageJson(drug.getPicPosition());
        dto.setDrugImages(images);
        dto.setFirstImageFromList();
        dto.setStockStatusByStock();
        dto.setDiscount(dto.calculateDiscount());
        
        return dto;
    }
}
```

---

## Spec 5: 药品详情查询功能

### 文件清单

```
⏸️ DrugDetailController.java        - 待生成
⏸️ DrugDetailService.java           - 待生成
⏸️ DrugDetailServiceImpl.java       - 待生成
⏸️ DrugDetailMapper.java            - 待生成
⏸️ DrugDetailMapper.xml             - 待生成
⏸️ DrugDetailDTO.java               - 待生成
⏸️ DrugDetailTest.java              - 待生成
```

### 核心逻辑要点

1. **药品详情查询**
   - 根据ID查询完整药品信息
   - 解析图片JSON
   - 计算折扣
   - 设置库存状态
   - Redis缓存30分钟

2. **相关推荐**
   - 同分类药品推荐
   - 按销量排序
   - 排除当前药品
   - 返回6个推荐
   - Redis缓存10分钟

### 代码模板

#### DrugDetailController.java

```java
package com.patient.api.app.controller;

import com.adinnet.core.JsonResult;
import com.patient.api.app.service.DrugDetailService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * 药品详情Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/patient/drug/detail")
@Api(tags = "药品详情")
public class DrugDetailController {

    @Resource
    private DrugDetailService drugDetailService;

    /**
     * 获取药品详情
     */
    @GetMapping("/{id}")
    @ApiOperation("获取药品详情")
    public JsonResult getDrugDetail(
            @ApiParam(value = "药品ID", required = true)
            @PathVariable Long id) {
        log.info("获取药品详情, id={}", id);
        return drugDetailService.getDrugDetail(id);
    }

    /**
     * 获取相关推荐
     */
    @GetMapping("/{id}/related")
    @ApiOperation("获取相关推荐")
    public JsonResult getRelatedDrugs(
            @ApiParam(value = "药品ID", required = true)
            @PathVariable Long id,
            @ApiParam(value = "返回数量", example = "6")
            @RequestParam(defaultValue = "6") Integer limit) {
        log.info("获取相关推荐, id={}, limit={}", id, limit);
        return drugDetailService.getRelatedDrugs(id, limit);
    }
}
```

---

## 📝 使用说明

### 快速开始

1. **选择要实现的Spec**
   ```bash
   # 例如实现Spec 3
   cd mshlwyy_phamacy_mall/internet-hospital
   ```

2. **复制模板代码**
   - 从本文档复制对应的代码模板
   - 粘贴到指定的文件路径
   - 根据实际情况调整包名和导入

3. **编译验证**
   ```bash
   mvn clean compile
   ```

4. **运行测试**
   ```bash
   mvn test -Dtest=DrugCategoryTest
   ```

### 注意事项

1. **包名统一**
   - Controller: `com.patient.api.app.controller`
   - Service: `com.patient.api.app.service`
   - Mapper: `com.patient.api.app.mapper`
   - Model: `com.patient.api.app.model`

2. **依赖注入**
   - 使用`@Resource`注解
   - 不使用`@Autowired`

3. **日志规范**
   - 使用`@Slf4j`注解
   - 关键操作记录INFO日志
   - 异常记录ERROR日志

4. **缓存Key规范**
   - 格式: `模块:功能:参数`
   - 例如: `drug:category:list`

5. **Redis过期时间**
   - 热数据: 30分钟
   - 温数据: 5-10分钟
   - 冷数据: 1-2分钟

---

**文档创建:** 2026-01-26  
**维护人员:** 开发团队  
**下一步:** 继续完善Spec 6-13的模板



## Spec 6: 购物车基础功能

### 文件清单

```
⏸️ CartController.java              - 待生成
⏸️ CartService.java                 - 待生成
⏸️ CartServiceImpl.java             - 待生成
⏸️ CartMapper.java                  - 待生成
⏸️ CartMapper.xml                   - 待生成
⏸️ Cart.java (实体类)                - 待生成
⏸️ CartDTO.java                     - 待生成
⏸️ CartTest.java                    - 待生成
```

### 核心逻辑要点

1. **添加到购物车**
   - 检查药品是否存在且有库存
   - 如果已存在则数量累加
   - 如果不存在则新增记录
   - 同步到Redis Hash
   - Key: `cart:{userId}`, Field: `{drugId}`, Value: `{quantity}`

2. **获取购物车列表**
   - 从Redis获取购物车数据
   - 批量查询药品详情
   - 计算小计金额
   - 检查库存状态

3. **更新数量**
   - 验证数量合法性(1-99)
   - 检查库存是否充足
   - 更新Redis和数据库

4. **删除商品**
   - 从Redis删除
   - 从数据库删除

5. **获取购物车数量**
   - 从Redis统计
   - 响应时间<100ms

### 代码模板

#### CartController.java

```java
package com.patient.api.app.controller;

import com.adinnet.core.JsonResult;
import com.patient.api.app.service.CartService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * 购物车Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/patient/cart")
@Api(tags = "购物车管理")
public class CartController {

    @Resource
    private CartService cartService;

    /**
     * 添加到购物车
     */
    @PostMapping("/add")
    @ApiOperation("添加到购物车")
    public JsonResult addToCart(
            @ApiParam(value = "用户ID", required = true)
            @RequestParam Long userId,
            @ApiParam(value = "药品ID", required = true)
            @RequestParam Long drugId,
            @ApiParam(value = "数量", required = true)
            @RequestParam Integer quantity) {
        log.info("添加到购物车, userId={}, drugId={}, quantity={}", userId, drugId, quantity);
        return cartService.addToCart(userId, drugId, quantity);
    }

    /**
     * 获取购物车列表
     */
    @GetMapping("/list")
    @ApiOperation("获取购物车列表")
    public JsonResult getCartList(
            @ApiParam(value = "用户ID", required = true)
            @RequestParam Long userId) {
        log.info("获取购物车列表, userId={}", userId);
        return cartService.getCartList(userId);
    }

    /**
     * 更新数量
     */
    @PutMapping("/quantity")
    @ApiOperation("更新数量")
    public JsonResult updateQuantity(
            @ApiParam(value = "用户ID", required = true)
            @RequestParam Long userId,
            @ApiParam(value = "药品ID", required = true)
            @RequestParam Long drugId,
            @ApiParam(value = "数量", required = true)
            @RequestParam Integer quantity) {
        log.info("更新购物车数量, userId={}, drugId={}, quantity={}", userId, drugId, quantity);
        return cartService.updateQuantity(userId, drugId, quantity);
    }

    /**
     * 删除商品
     */
    @DeleteMapping("/remove")
    @ApiOperation("删除商品")
    public JsonResult removeFromCart(
            @ApiParam(value = "用户ID", required = true)
            @RequestParam Long userId,
            @ApiParam(value = "药品ID", required = true)
            @RequestParam Long drugId) {
        log.info("从购物车删除, userId={}, drugId={}", userId, drugId);
        return cartService.removeFromCart(userId, drugId);
    }

    /**
     * 获取购物车数量
     */
    @GetMapping("/count")
    @ApiOperation("获取购物车数量")
    public JsonResult getCartCount(
            @ApiParam(value = "用户ID", required = true)
            @RequestParam Long userId) {
        log.info("获取购物车数量, userId={}", userId);
        return cartService.getCartCount(userId);
    }
}
```

#### Cart.java (实体类)

```java
package com.patient.api.app.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

/**
 * 购物车实体
 */
@Data
@TableName("t_cart")
public class Cart {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /** 用户ID */
    private Long userId;
    
    /** 药品ID */
    private Long drugId;
    
    /** 数量 */
    private Integer quantity;
    
    /** 是否选中: 0-未选中, 1-选中 */
    private Integer isSelected;
    
    /** 创建时间 */
    private Date createTime;
    
    /** 更新时间 */
    private Date updateTime;
}
```

### 数据库表结构

```sql
-- 购物车表
CREATE TABLE IF NOT EXISTS `t_cart` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `drug_id` bigint(20) NOT NULL COMMENT '药品ID',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT '数量',
  `is_selected` tinyint(1) DEFAULT 1 COMMENT '是否选中: 0-未选中, 1-选中',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_drug` (`user_id`, `drug_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';
```

---

## Spec 7: 购物车高级功能

### 文件清单

```
⏸️ 更新 CartController.java         - 添加高级接口
⏸️ 更新 CartServiceImpl.java        - 批量操作
⏸️ CartSummaryDTO.java              - 汇总DTO
⏸️ CartAdvancedTest.java            - 单元测试
```

### 核心逻辑要点

1. **选中/取消选中**
   - 更新is_selected字段
   - 同步Redis

2. **全选/取消全选**
   - 批量更新所有商品
   - 使用事务保证一致性

3. **批量删除**
   - 删除选中的商品
   - 批量操作优化性能

4. **清空购物车**
   - 删除用户所有购物车数据
   - 清除Redis缓存

5. **获取汇总信息**
   - 选中商品数量
   - 选中商品总金额
   - 优惠金额
   - 应付金额

### 代码模板

#### 新增Controller方法

```java
/**
 * 选中/取消选中
 */
@PutMapping("/select")
@ApiOperation("选中/取消选中")
public JsonResult toggleSelect(
        @RequestParam Long userId,
        @RequestParam Long drugId,
        @RequestParam Integer isSelected) {
    return cartService.toggleSelect(userId, drugId, isSelected);
}

/**
 * 全选/取消全选
 */
@PutMapping("/selectAll")
@ApiOperation("全选/取消全选")
public JsonResult selectAll(
        @RequestParam Long userId,
        @RequestParam Integer isSelected) {
    return cartService.selectAll(userId, isSelected);
}

/**
 * 批量删除
 */
@DeleteMapping("/batchRemove")
@ApiOperation("批量删除")
public JsonResult batchRemove(
        @RequestParam Long userId,
        @RequestParam List<Long> drugIds) {
    return cartService.batchRemove(userId, drugIds);
}

/**
 * 清空购物车
 */
@DeleteMapping("/clear")
@ApiOperation("清空购物车")
public JsonResult clearCart(@RequestParam Long userId) {
    return cartService.clearCart(userId);
}

/**
 * 获取汇总信息
 */
@GetMapping("/summary")
@ApiOperation("获取汇总信息")
public JsonResult getCartSummary(@RequestParam Long userId) {
    return cartService.getCartSummary(userId);
}
```

#### CartSummaryDTO.java

```java
package com.patient.api.app.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 购物车汇总DTO
 */
@Data
@ApiModel(description = "购物车汇总信息")
public class CartSummaryDTO {
    
    @ApiModelProperty(value = "选中商品数量")
    private Integer selectedCount;
    
    @ApiModelProperty(value = "选中商品总金额")
    private BigDecimal totalAmount;
    
    @ApiModelProperty(value = "优惠金额")
    private BigDecimal discountAmount;
    
    @ApiModelProperty(value = "运费")
    private BigDecimal shippingFee;
    
    @ApiModelProperty(value = "应付金额")
    private BigDecimal payableAmount;
    
    /**
     * 计算应付金额
     */
    public void calculatePayableAmount() {
        this.payableAmount = totalAmount
                .subtract(discountAmount)
                .add(shippingFee);
    }
}
```

---

## Spec 8: 订单创建功能

### 文件清单

```
⏸️ OrderController.java              - 待生成
⏸️ OrderService.java                 - 待生成
⏸️ OrderServiceImpl.java             - 待生成
⏸️ OrderMapper.java                  - 待生成
⏸️ OrderMapper.xml                   - 待生成
⏸️ Order.java (实体类)                - 待生成
⏸️ OrderItem.java (订单明细)          - 待生成
⏸️ OrderDTO.java                     - 待生成
⏸️ OrderNumberGenerator.java         - 订单号生成器
⏸️ StockLockService.java             - 库存锁定服务
⏸️ ShippingFeeCalculator.java        - 运费计算器
⏸️ OrderTest.java                    - 单元测试
```

### 核心逻辑要点

1. **订单号生成**
   - 格式: ORD + yyyyMMddHHmmss + 6位随机数
   - 保证全局唯一
   - 示例: ORD20260126153045123456

2. **库存验证和扣减**
   - 使用FOR UPDATE行锁
   - 防止超卖
   - 事务保证一致性

3. **订单金额计算**
   - 商品总额 = Σ(单价 × 数量)
   - 运费计算(包邮商品/满99包邮)
   - 订单总额 = 商品总额 + 运费

4. **订单创建流程**
   ```
   1. 生成订单号
   2. 验证购物车数据
   3. 锁定库存(FOR UPDATE)
   4. 验证库存充足
   5. 创建订单主表
   6. 创建订单明细表
   7. 扣减库存
   8. 清空购物车
   9. 提交事务
   ```

### 代码模板

#### OrderNumberGenerator.java

```java
package com.patient.api.app.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * 订单号生成器
 */
public class OrderNumberGenerator {
    
    private static final String PREFIX = "ORD";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final Random RANDOM = new Random();
    
    /**
     * 生成订单号
     * 格式: ORD + yyyyMMddHHmmss + 6位随机数
     * 
     * @return 订单号
     */
    public static String generate() {
        String timestamp = LocalDateTime.now().format(FORMATTER);
        String randomNum = String.format("%06d", RANDOM.nextInt(1000000));
        return PREFIX + timestamp + randomNum;
    }
}
```

#### StockLockService.java

```java
package com.patient.api.app.service;

import com.patient.api.app.model.Drug;
import com.patient.api.app.mapper.DrugMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * 库存锁定服务
 */
@Slf4j
@Service
public class StockLockService {
    
    @Resource
    private DrugMapper drugMapper;
    
    /**
     * 验证并锁定库存
     * 
     * @param items 商品列表 [{drugId, quantity}]
     * @return true-成功, false-失败
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean lockStock(List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            Long drugId = (Long) item.get("drugId");
            Integer quantity = (Integer) item.get("quantity");
            
            // 使用FOR UPDATE锁定行
            Drug drug = drugMapper.selectForUpdate(drugId);
            
            if (drug == null) {
                log.error("药品不存在, drugId={}", drugId);
                return false;
            }
            
            if (drug.getStock() < quantity) {
                log.error("库存不足, drugId={}, stock={}, need={}", 
                        drugId, drug.getStock(), quantity);
                return false;
            }
            
            // 扣减库存
            int updated = drugMapper.decreaseStock(drugId, quantity);
            if (updated == 0) {
                log.error("扣减库存失败, drugId={}", drugId);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 恢复库存(取消订单时)
     */
    @Transactional(rollbackFor = Exception.class)
    public void restoreStock(List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            Long drugId = (Long) item.get("drugId");
            Integer quantity = (Integer) item.get("quantity");
            
            drugMapper.increaseStock(drugId, quantity);
        }
    }
}
```

#### ShippingFeeCalculator.java

```java
package com.patient.api.app.util;

import com.patient.api.app.model.Drug;

import java.math.BigDecimal;
import java.util.List;

/**
 * 运费计算器
 */
public class ShippingFeeCalculator {
    
    /** 基础运费 */
    private static final BigDecimal BASE_FEE = new BigDecimal("10.00");
    
    /** 包邮门槛 */
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("99.00");
    
    /**
     * 计算运费
     * 
     * @param drugs 药品列表
     * @param totalAmount 商品总额
     * @return 运费
     */
    public static BigDecimal calculate(List<Drug> drugs, BigDecimal totalAmount) {
        // 检查是否有包邮商品
        boolean hasFreeShipping = drugs.stream()
                .anyMatch(drug -> drug.getIsFreeShipping() == 1);
        
        if (hasFreeShipping) {
            return BigDecimal.ZERO;
        }
        
        // 检查是否满足包邮门槛
        if (totalAmount.compareTo(FREE_SHIPPING_THRESHOLD) >= 0) {
            return BigDecimal.ZERO;
        }
        
        return BASE_FEE;
    }
}
```

---

## Spec 9-13 快速参考

### Spec 9: 订单查询功能

**核心文件:**
- OrderController (新增查询接口)
- OrderServiceImpl (查询逻辑)
- OrderListDTO, OrderDetailDTO
- DataMaskUtil (数据脱敏工具)

**关键逻辑:**
- 订单列表分页查询
- 按状态筛选
- 订单详情查询
- 手机号/姓名脱敏
- Redis缓存订单详情

---

### Spec 10: 订单状态管理

**核心文件:**
- OrderController (状态管理接口)
- OrderServiceImpl (状态流转)
- OrderStateMachine (状态机)
- StockRestoreService (库存恢复)
- OrderStatusValidator (状态验证)

**状态流转:**
```
待支付 → 待发货 → 待收货 → 已完成
   ↓        ↓
 已取消   已取消
```

---

### Spec 11: 物流信息查询

**核心文件:**
- LogisticsController
- LogisticsService
- Kuaidi100Client (快递100集成)
- LogisticsDTO
- LogisticsCache

**集成要点:**
- 快递100 API调用
- 物流轨迹解析
- 数据脱敏
- 降级处理

---

### Spec 12: 药品推荐功能

**核心文件:**
- RecommendationController
- RecommendationService
- RecommendationMapper

**推荐算法:**
- 热销推荐: 按销量降序
- 新品推荐: 按创建时间降序
- 分类推荐: 同分类热销
- 相关推荐: 同分类+价格相近

---

### Spec 13: 缓存优化

**核心文件:**
- CacheService (统一缓存服务)
- CacheKeyGenerator (Key生成器)
- CacheWarmer (缓存预热)
- CacheCleaner (缓存清理)
- CacheStatistics (缓存统计)
- CacheAspect (缓存切面)

**优化策略:**
- 防缓存穿透: 空值缓存
- 防缓存击穿: 互斥锁
- 防缓存雪崩: 随机过期时间

---

## 🎯 实施建议

### 推荐顺序

1. **先完成Spec 3** (分类查询)
   - 相对简单
   - 验证架构可行性
   - 建立开发模式

2. **再完成Spec 5** (详情查询)
   - 依赖Spec 2
   - 为购物车做准备

3. **然后Spec 6-7** (购物车)
   - 核心功能
   - 为订单做准备

4. **接着Spec 8-10** (订单)
   - 最复杂的部分
   - 需要充分测试

5. **最后Spec 4, 11-13** (搜索、物流、推荐、缓存)
   - 优化和增强功能
   - 可以逐步完善

### 质量检查清单

每完成一个spec,检查:

- [ ] 代码可编译通过
- [ ] 单元测试通过
- [ ] Swagger文档正确
- [ ] 日志输出完整
- [ ] 异常处理完善
- [ ] Redis缓存生效
- [ ] 性能满足要求
- [ ] 代码符合规范

---

**文档版本:** v1.0  
**最后更新:** 2026-01-26  
**维护团队:** 开发组

