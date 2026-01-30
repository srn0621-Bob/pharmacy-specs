# 设计文档 - 药品分类查询功能

## 文档信息

**功能名称:** 药品分类查询功能  
**项目:** 互联网医院 - 患者端药品商城  
**版本:** v1.0  
**创建日期:** 2026-01-23  

---

## 简介

本文档描述药品分类查询功能的技术设计,包括分类数据结构、API设计、缓存策略和性能优化方案。

---

## 系统架构

### 组件关系图

```
┌─────────────────┐
│  Android客户端   │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│ DrugMallController│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ DrugMallService  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  DrugMallMapper  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   t_drug表      │
└─────────────────┘
```

---

## 数据模型

### 分类数据结构

#### 方案一: 硬编码分类 (推荐)

**优点:**
- 实现简单快速
- 无需数据库查询
- 性能最优
- 易于维护

**缺点:**
- 修改需要重新部署
- 不支持动态配置

**实现:**
```java
public class DrugCategory {
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private Integer sortOrder;
    private Boolean isQuickCategory;
    private String iconResId;  // Android本地资源ID
}
```

**分类定义:**
```java
private static final List<DrugCategory> CATEGORIES = Arrays.asList(
    new DrugCategory(1L, "为你推荐", "http://...", 1, true, "ic_recommend"),
    new DrugCategory(2L, "隐形美瞳", "http://...", 2, true, "ic_lenses"),
    new DrugCategory(3L, "医疗器械", "http://...", 3, true, "ic_medical"),
    new DrugCategory(4L, "中西药品", "http://...", 4, true, "ic_medicine"),
    new DrugCategory(5L, "营养保健", "http://...", 5, true, "ic_health"),
    new DrugCategory(6L, "美妆个护", "http://...", 6, true, "ic_beauty"),
    new DrugCategory(7L, "母婴用品", "http://...", 7, true, "ic_baby"),
    new DrugCategory(8L, "成人用品", "http://...", 8, true, "ic_adult"),
    new DrugCategory(9L, "家用医疗", "http://...", 9, false, "ic_home"),
    new DrugCategory(10L, "其他分类", "http://...", 10, false, "ic_other")
);
```

#### 方案二: 数据库存储 (可选)

**表结构:**
```sql
CREATE TABLE d_drug_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL COMMENT '分类名称',
    category_icon VARCHAR(255) COMMENT '分类图标URL',
    icon_res_id VARCHAR(50) COMMENT 'Android资源ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_quick_category TINYINT(1) DEFAULT 0 COMMENT '是否快捷分类',
    status TINYINT(1) DEFAULT 1 COMMENT '状态 1=启用 0=禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '药品分类表';
```

---

## API设计

### 1. 获取分类列表

**接口:** `GET /api/v1/mall/drugs/categories`

**Controller实现:**
```java
@GetMapping("/categories")
@ApiOperation("获取药品分类列表")
public ApiResponse<List<DrugCategoryDTO>> getCategories() {
    try {
        List<DrugCategoryDTO> categories = drugMallService.getCategories();
        return ApiResponse.success(categories);
    } catch (Exception e) {
        log.error("获取分类列表失败", e);
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "获取分类列表失败");
    }
}
```

**Service实现:**
```java
@Override
@Cacheable(value = "drug:categories", key = "'all'")
public List<DrugCategoryDTO> getCategories() {
    // 方案一: 返回硬编码分类
    return CATEGORIES.stream()
        .map(this::toCategoryDTO)
        .collect(Collectors.toList());
    
    // 方案二: 从数据库查询
    // return drugCategoryMapper.selectList(
    //     new QueryWrapper<DrugCategory>()
    //         .eq("status", 1)
    //         .orderByAsc("sort_order")
    // );
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "categoryId": 1,
      "categoryName": "为你推荐",
      "categoryIcon": "http://example.com/icons/recommend.png",
      "sortOrder": 1,
      "drugCount": 120
    }
  ]
}
```

---

### 2. 获取快捷分类

**接口:** `GET /api/v1/mall/drugs/quick-categories`

**Controller实现:**
```java
@GetMapping("/quick-categories")
@ApiOperation("获取快捷分类列表")
public ApiResponse<List<QuickCategoryDTO>> getQuickCategories() {
    try {
        List<QuickCategoryDTO> categories = drugMallService.getQuickCategories();
        return ApiResponse.success(categories);
    } catch (Exception e) {
        log.error("获取快捷分类列表失败", e);
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "获取快捷分类列表失败");
    }
}
```

**Service实现:**
```java
@Override
@Cacheable(value = "drug:categories", key = "'quick'")
public List<QuickCategoryDTO> getQuickCategories() {
    return CATEGORIES.stream()
        .filter(DrugCategory::getIsQuickCategory)
        .limit(10)
        .map(this::toQuickCategoryDTO)
        .collect(Collectors.toList());
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "categoryId": 1,
      "categoryName": "隐形美瞳",
      "categoryIcon": "http://example.com/icons/lenses.png",
      "iconResId": "ic_category_lenses",
      "sortOrder": 1,
      "isHot": true
    }
  ]
}
```

---

### 3. 按分类查询药品

**接口:** `GET /api/v1/mall/drugs/category/{categoryId}`

**参数:**
- `categoryId`: 分类ID (路径参数)
- `pageNum`: 页码 (查询参数,默认1)
- `pageSize`: 每页数量 (查询参数,默认20)

**Controller实现:**
```java
@GetMapping("/category/{categoryId}")
@ApiOperation("按分类查询药品")
public ApiResponse<PageResult<DrugDTO>> getDrugsByCategory(
        @PathVariable Long categoryId,
        @RequestParam(defaultValue = "1") Integer pageNum,
        @RequestParam(defaultValue = "20") Integer pageSize) {
    try {
        // 验证分类是否存在
        if (!drugMallService.categoryExists(categoryId)) {
            return ApiResponse.error(ErrorCode.NOT_FOUND.getCode(), "分类不存在");
        }
        
        PageResult<DrugDTO> result = drugMallService.getDrugsByCategory(
            categoryId, pageNum, pageSize
        );
        return ApiResponse.success(result);
    } catch (BusinessException e) {
        log.error("按分类查询药品失败: {}", e.getMessage());
        return ApiResponse.error(e.getCode(), e.getMessage());
    } catch (Exception e) {
        log.error("按分类查询药品异常", e);
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "查询失败");
    }
}
```

**Service实现:**
```java
@Override
public PageResult<DrugDTO> getDrugsByCategory(Long categoryId, Integer pageNum, Integer pageSize) {
    // 设置分页
    PageHelper.startPage(pageNum, pageSize);
    
    // 查询药品
    List<DrugDTO> drugs = drugMallMapper.selectByCategory(categoryId);
    
    // 解析图片
    drugs.forEach(this::enrichDrugWithImages);
    
    // 构建分页结果
    PageInfo<DrugDTO> pageInfo = new PageInfo<>(drugs);
    return PageResult.of(pageInfo);
}
```

**Mapper实现:**
```java
@Select("SELECT * FROM t_drug WHERE category_id = #{categoryId} AND status = 1 ORDER BY sales DESC")
List<DrugDTO> selectByCategory(@Param("categoryId") Long categoryId);
```

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "drugId": 1001,
        "drugName": "阿莫西林胶囊",
        "drugImages": ["http://img1.jpg"],
        "price": 15.50,
        "sales": 1200
      }
    ],
    "total": 50,
    "pageNum": 1,
    "pageSize": 20,
    "pages": 3
  }
}
```

---

## 缓存策略

### Redis缓存设计

**缓存Key设计:**
```
drug:categories:all          # 所有分类列表
drug:categories:quick        # 快捷分类列表
drug:category:{id}:count     # 分类药品数量
drug:category:{id}:page:{num}:{size}  # 分类药品分页数据
```

**缓存配置:**
```java
@Configuration
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))  // 1小时过期
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()
                )
            );
        
        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .build();
    }
}
```

**缓存刷新:**
```java
@CacheEvict(value = "drug:categories", allEntries = true)
public void refreshCategoryCache() {
    log.info("分类缓存已刷新");
}
```

---

## 性能优化

### 1. 分类数量统计优化

**方案一: 实时统计 (简单但慢)**
```java
public Long countDrugsByCategory(Long categoryId) {
    return drugMallMapper.countByCategory(categoryId);
}
```

**方案二: 缓存统计 (推荐)**
```java
@Cacheable(value = "drug:category:count", key = "#categoryId")
public Long countDrugsByCategory(Long categoryId) {
    return drugMallMapper.countByCategory(categoryId);
}
```

**方案三: 定时更新 (最优)**
```java
@Scheduled(cron = "0 */30 * * * ?")  // 每30分钟更新
public void updateCategoryDrugCount() {
    CATEGORIES.forEach(category -> {
        Long count = drugMallMapper.countByCategory(category.getCategoryId());
        redisTemplate.opsForValue().set(
            "drug:category:" + category.getCategoryId() + ":count",
            count,
            1, TimeUnit.HOURS
        );
    });
}
```

### 2. 分页查询优化

**索引优化:**
```sql
-- 分类查询索引
CREATE INDEX idx_category_status ON t_drug(category_id, status);

-- 分类+销量排序索引
CREATE INDEX idx_category_sales ON t_drug(category_id, sales DESC);
```

**查询优化:**
```sql
-- 使用覆盖索引
SELECT id, name, price, sales, pic_position 
FROM t_drug 
WHERE category_id = ? AND status = 1 
ORDER BY sales DESC 
LIMIT ?, ?;
```

---

## 正确性属性

### Property 1: 分类列表完整性
**描述:** 返回的分类列表必须包含所有启用的分类

**形式化表达:**
```
FOR ALL category_query:
  WHEN getCategories()
  THEN result.size() >= 8
  AND all_categories_have_valid_id()
  AND all_categories_sorted_by_order()
```

### Property 2: 快捷分类数量限制
**描述:** 快捷分类列表不超过10个

**形式化表达:**
```
FOR ALL quick_category_query:
  WHEN getQuickCategories()
  THEN result.size() <= 10
  AND all_categories_are_quick()
```

### Property 3: 分类药品过滤正确性
**描述:** 按分类查询只返回该分类且启用的药品

**形式化表达:**
```
FOR ALL drug IN getDrugsByCategory(categoryId):
  drug.categoryId == categoryId
  AND drug.status == 1
```

---

## 错误处理

### 异常类型

1. **分类不存在异常**
```java
if (!categoryExists(categoryId)) {
    throw new BusinessException(ErrorCode.NOT_FOUND, "分类不存在");
}
```

2. **参数验证异常**
```java
if (categoryId == null || categoryId <= 0) {
    throw new BusinessException(ErrorCode.INVALID_PARAM, "分类ID无效");
}
```

3. **数据库查询异常**
```java
try {
    return drugMallMapper.selectByCategory(categoryId);
} catch (Exception e) {
    log.error("查询分类药品失败: categoryId={}", categoryId, e);
    throw new BusinessException(ErrorCode.DB_ERROR, "查询失败");
}
```

---

## 测试策略

### 单元测试

```java
@Test
public void testGetCategories() {
    List<DrugCategoryDTO> categories = drugMallService.getCategories();
    
    assertNotNull(categories);
    assertTrue(categories.size() >= 8);
    assertEquals(1L, categories.get(0).getCategoryId());
}

@Test
public void testGetQuickCategories() {
    List<QuickCategoryDTO> categories = drugMallService.getQuickCategories();
    
    assertNotNull(categories);
    assertTrue(categories.size() <= 10);
    assertTrue(categories.stream().allMatch(QuickCategoryDTO::getIsQuickCategory));
}

@Test
public void testGetDrugsByCategory() {
    PageResult<DrugDTO> result = drugMallService.getDrugsByCategory(1L, 1, 20);
    
    assertNotNull(result);
    assertTrue(result.getTotal() >= 0);
    result.getList().forEach(drug -> {
        assertEquals(1L, drug.getCategoryId());
        assertEquals(1, drug.getStatus());
    });
}
```

### 集成测试

```java
@Test
public void testCategoryQueryFlow() {
    // 1. 获取分类列表
    List<DrugCategoryDTO> categories = drugMallService.getCategories();
    assertTrue(categories.size() > 0);
    
    // 2. 选择第一个分类
    Long categoryId = categories.get(0).getCategoryId();
    
    // 3. 查询该分类的药品
    PageResult<DrugDTO> drugs = drugMallService.getDrugsByCategory(categoryId, 1, 20);
    assertNotNull(drugs);
    
    // 4. 验证药品属于该分类
    drugs.getList().forEach(drug -> 
        assertEquals(categoryId, drug.getCategoryId())
    );
}
```

---

## 部署说明

### 配置项

```properties
# 分类缓存配置
spring.cache.redis.time-to-live=3600000  # 1小时
spring.cache.redis.key-prefix=drug:

# 分页配置
pagehelper.reasonable=true
pagehelper.support-methods-arguments=true
```

### 监控指标

- 分类查询QPS
- 分类药品查询响应时间
- 缓存命中率
- 慢查询日志

---

## 参考文档

- [需求文档](./requirements.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
- [DrugMallController](../../../internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/mall/controller/DrugMallController.java)
