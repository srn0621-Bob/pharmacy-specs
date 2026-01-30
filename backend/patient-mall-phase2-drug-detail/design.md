# 设计文档 - 药品详情查询功能

## 文档信息

**功能名称:** 药品详情查询功能  
**项目:** 互联网医院 - 患者端药品商城  
**版本:** v1.0  
**创建日期:** 2026-01-23  

---

## 简介

本文档描述药品详情查询功能的技术设计,包括数据模型、API设计、缓存策略和性能优化方案。

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
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────────┐
│ Mapper │ │ ImageParser│
└───┬────┘ └────────────┘
    ↓
┌────────┐
│ t_drug │
└────────┘
```

---

## 数据模型

### DrugDTO完整模型

```java
@Data
@ApiModel("药品详情")
public class DrugDTO {
    // 基本信息
    @ApiModelProperty("药品ID")
    private Long drugId;
    
    @ApiModelProperty("药品名称")
    private String drugName;
    
    @ApiModelProperty("药品编码")
    private String drugCode;
    
    @ApiModelProperty("规格")
    private String specification;
    
    @ApiModelProperty("单位")
    private String unit;
    
    // 图片信息
    @ApiModelProperty("图片位置JSON")
    private String picPosition;
    
    @ApiModelProperty("药品图片列表")
    private List<String> drugImages = new ArrayList<>();
    
    // 价格和库存
    @ApiModelProperty("当前价格")
    private BigDecimal price;
    
    @ApiModelProperty("原价")
    private BigDecimal originalPrice;
    
    @ApiModelProperty("折扣")
    private BigDecimal discount;
    
    @ApiModelProperty("库存数量")
    private Integer quantity;
    
    @ApiModelProperty("库存状态")
    private String stockStatus;
    
    // 商城扩展信息
    @ApiModelProperty("销量")
    private Integer sales;
    
    @ApiModelProperty("加购数量")
    private Integer addToCartCount;
    
    @ApiModelProperty("是否包邮")
    private Boolean isFreeShipping;
    
    @ApiModelProperty("是否价保")
    private Boolean hasPriceGuarantee;
    
    @ApiModelProperty("价保天数")
    private Integer priceGuaranteeDays;
    
    @ApiModelProperty("是否推荐")
    private Boolean isRecommended;
    
    // 分类信息
    @ApiModelProperty("分类ID")
    private Long categoryId;
    
    @ApiModelProperty("分类名称")
    private String categoryName;
    
    // 厂家信息
    @ApiModelProperty("生产厂家")
    private String manufacturer;
    
    @ApiModelProperty("批准文号")
    private String approvalNumber;
    
    // 药品说明
    @ApiModelProperty("成分")
    private String ingredients;
    
    @ApiModelProperty("适应症")
    private String indications;
    
    @ApiModelProperty("用法用量")
    private String dosage;
    
    @ApiModelProperty("不良反应")
    private String adverseReactions;
    
    @ApiModelProperty("禁忌")
    private String contraindications;
    
    @ApiModelProperty("注意事项")
    private String precautions;
    
    @ApiModelProperty("贮藏方法")
    private String storage;
    
    // 状态
    @ApiModelProperty("状态 1=启用 0=禁用")
    private Integer status;
}
```

---

## API设计

### 1. 获取药品详情

**接口:** `GET /api/v1/mall/drugs/{drugId}`

**Controller实现:**
```java
@GetMapping("/{drugId}")
@ApiOperation("获取药品详情")
public ApiResponse<DrugDTO> getDrugDetail(@PathVariable Long drugId) {
    try {
        // 参数验证
        if (drugId == null || drugId <= 0) {
            return ApiResponse.error(ErrorCode.INVALID_PARAM.getCode(), "药品ID无效");
        }
        
        // 查询药品详情
        DrugDTO drug = drugMallService.getDrugDetail(drugId);
        
        // 药品不存在
        if (drug == null) {
            return ApiResponse.error(ErrorCode.NOT_FOUND.getCode(), "药品不存在");
        }
        
        // 药品已下架
        if (drug.getStatus() == 0) {
            return ApiResponse.error(ErrorCode.FORBIDDEN.getCode(), "药品已下架");
        }
        
        return ApiResponse.success(drug);
    } catch (BusinessException e) {
        log.error("获取药品详情失败: drugId={}, error={}", drugId, e.getMessage());
        return ApiResponse.error(e.getCode(), e.getMessage());
    } catch (Exception e) {
        log.error("获取药品详情异常: drugId={}", drugId, e);
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "查询失败");
    }
}
```

**Service实现:**
```java
@Override
@Cacheable(value = "drug:detail", key = "#drugId", unless = "#result == null")
public DrugDTO getDrugDetail(Long drugId) {
    log.debug("查询药品详情: drugId={}", drugId);
    
    // 查询药品基本信息
    DrugDTO drug = drugMallMapper.selectById(drugId);
    
    if (drug == null) {
        log.warn("药品不存在: drugId={}", drugId);
        return null;
    }
    
    // 解析图片
    enrichDrugWithImages(drug);
    
    // 计算折扣
    calculateDiscount(drug);
    
    // 设置库存状态
    setStockStatus(drug);
    
    log.debug("药品详情查询成功: drugId={}, name={}", drugId, drug.getDrugName());
    return drug;
}

/**
 * 计算折扣
 */
private void calculateDiscount(DrugDTO drug) {
    if (drug.getOriginalPrice() != null && drug.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0) {
        BigDecimal discount = drug.getPrice()
            .divide(drug.getOriginalPrice(), 2, RoundingMode.HALF_UP);
        drug.setDiscount(discount);
    }
}

/**
 * 设置库存状态
 */
private void setStockStatus(DrugDTO drug) {
    if (drug.getQuantity() == null || drug.getQuantity() <= 0) {
        drug.setStockStatus("缺货");
    } else if (drug.getQuantity() < 10) {
        drug.setStockStatus("库存紧张");
    } else {
        drug.setStockStatus("有货");
    }
}
```

**Mapper实现:**
```java
@Select("SELECT * FROM t_drug WHERE id = #{drugId}")
@Results({
    @Result(property = "drugId", column = "id"),
    @Result(property = "drugName", column = "name"),
    @Result(property = "drugCode", column = "sku_code"),
    @Result(property = "picPosition", column = "pic_position"),
    // ... 其他字段映射
})
DrugDTO selectById(@Param("drugId") Long drugId);
```

---

### 2. 获取药品库存

**接口:** `GET /api/v1/mall/drugs/{drugId}/stock`

**Service实现:**
```java
@Override
public StockInfo getStock(Long drugId) {
    DrugDTO drug = drugMallMapper.selectById(drugId);
    
    if (drug == null) {
        throw new BusinessException(ErrorCode.NOT_FOUND, "药品不存在");
    }
    
    StockInfo stock = new StockInfo();
    stock.setDrugId(drugId);
    stock.setQuantity(drug.getQuantity());
    stock.setStockStatus(drug.getQuantity() > 0 ? "有货" : "缺货");
    
    return stock;
}
```

---

### 3. 获取相关推荐

**接口:** `GET /api/v1/mall/drugs/{drugId}/related`

**Service实现:**
```java
@Override
public List<DrugDTO> getRelatedDrugs(Long drugId, Integer limit) {
    // 获取当前药品信息
    DrugDTO currentDrug = drugMallMapper.selectById(drugId);
    
    if (currentDrug == null) {
        return Collections.emptyList();
    }
    
    // 查询相关药品
    List<DrugDTO> relatedDrugs = drugMallMapper.selectRelatedDrugs(
        currentDrug.getCategoryId(),
        currentDrug.getManufacturer(),
        drugId,
        limit
    );
    
    // 解析图片
    relatedDrugs.forEach(this::enrichDrugWithImages);
    
    return relatedDrugs;
}
```

**Mapper实现:**
```java
@Select("<script>" +
    "SELECT * FROM t_drug " +
    "WHERE status = 1 " +
    "  AND id != #{drugId} " +
    "  AND (" +
    "    category_id = #{categoryId} " +
    "    OR manufacturer = #{manufacturer}" +
    "  ) " +
    "ORDER BY " +
    "  CASE WHEN manufacturer = #{manufacturer} THEN 1 ELSE 2 END, " +
    "  sales DESC " +
    "LIMIT #{limit}" +
    "</script>")
List<DrugDTO> selectRelatedDrugs(
    @Param("categoryId") Long categoryId,
    @Param("manufacturer") String manufacturer,
    @Param("drugId") Long drugId,
    @Param("limit") Integer limit
);
```

---

## 缓存策略

### Redis缓存设计

**缓存Key设计:**
```
drug:detail:{drugId}              # 药品详情
drug:stock:{drugId}               # 库存信息
drug:related:{drugId}:{limit}     # 相关推荐
```

**缓存配置:**
```java
@Configuration
public class DrugCacheConfig {
    
    @Bean
    public RedisCacheConfiguration drugDetailCacheConfig() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))  // 5分钟过期
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()
                )
            );
    }
}
```

**缓存更新策略:**
```java
// 药品信息更新时清除缓存
@CacheEvict(value = {"drug:detail", "drug:stock", "drug:related"}, 
            key = "#drugId", 
            allEntries = false)
public void updateDrug(Long drugId, DrugDTO drug) {
    drugMallMapper.updateById(drugId, drug);
}
```

---

## 性能优化

### 1. 数据库查询优化

**使用主键索引:**
```sql
-- 主键查询,性能最优
SELECT * FROM t_drug WHERE id = ?;
```

**避免N+1查询:**
```java
// 不推荐: 循环查询
for (Long drugId : drugIds) {
    DrugDTO drug = getDrugDetail(drugId);
}

// 推荐: 批量查询
List<DrugDTO> drugs = drugMallMapper.selectByIds(drugIds);
```

### 2. 字段按需查询

**详情页查询所有字段:**
```sql
SELECT * FROM t_drug WHERE id = ?;
```

**列表页只查询必要字段:**
```sql
SELECT id, name, price, sales, pic_position 
FROM t_drug 
WHERE ...;
```

### 3. 缓存预热

**热门药品预加载:**
```java
@PostConstruct
public void preloadHotDrugs() {
    List<Long> hotDrugIds = getHotDrugIds();
    hotDrugIds.forEach(drugId -> {
        DrugDTO drug = getDrugDetail(drugId);
        // 自动缓存到Redis
    });
}
```

---

## 正确性属性

### Property 1: 数据完整性
**描述:** 返回的药品详情必须包含所有必需字段

**形式化表达:**
```
FOR ALL drug IN getDrugDetail(drugId):
  drug.drugId != null
  AND drug.drugName != null
  AND drug.price != null
  AND drug.quantity != null
```

### Property 2: 图片解析正确性
**描述:** 图片列表必须正确解析

**形式化表达:**
```
FOR ALL drug IN getDrugDetail(drugId):
  IF drug.picPosition != null
  THEN drug.drugImages.size() > 0
```

### Property 3: 库存状态一致性
**描述:** 库存状态必须与库存数量一致

**形式化表达:**
```
FOR ALL drug IN getDrugDetail(drugId):
  (drug.quantity <= 0 AND drug.stockStatus == "缺货")
  OR (drug.quantity > 0 AND drug.stockStatus != "缺货")
```

---

## 错误处理

### 异常类型

1. **药品ID无效**
```java
if (drugId == null || drugId <= 0) {
    throw new BusinessException(ErrorCode.INVALID_PARAM, "药品ID无效");
}
```

2. **药品不存在**
```java
if (drug == null) {
    throw new BusinessException(ErrorCode.NOT_FOUND, "药品不存在");
}
```

3. **药品已下架**
```java
if (drug.getStatus() == 0) {
    throw new BusinessException(ErrorCode.FORBIDDEN, "药品已下架");
}
```

---

## 测试策略

### 单元测试

```java
@Test
public void testGetDrugDetail() {
    DrugDTO drug = drugMallService.getDrugDetail(1001L);
    
    assertNotNull(drug);
    assertEquals(1001L, drug.getDrugId());
    assertNotNull(drug.getDrugName());
    assertNotNull(drug.getDrugImages());
    assertTrue(drug.getDrugImages().size() > 0);
}

@Test
public void testGetDrugDetailNotFound() {
    DrugDTO drug = drugMallService.getDrugDetail(999999L);
    assertNull(drug);
}

@Test
public void testStockStatus() {
    DrugDTO drug = drugMallService.getDrugDetail(1001L);
    
    if (drug.getQuantity() <= 0) {
        assertEquals("缺货", drug.getStockStatus());
    } else {
        assertNotEquals("缺货", drug.getStockStatus());
    }
}
```

---

## 参考文档

- [需求文档](./requirements.md)
- [图片解析设计](../patient-mall-phase1-image-parser/design.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
