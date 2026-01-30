# 设计文档 - 药品搜索功能

## 文档信息

**功能名称:** 药品搜索功能  
**项目:** 互联网医院 - 患者端药品商城  
**版本:** v1.0  
**创建日期:** 2026-01-23  

---

## 简介

本文档描述药品搜索功能的技术设计,包括搜索算法、索引优化、缓存策略和性能优化方案。

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
│ DrugSearchService│
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│ Mapper │ │ Redis  │
└───┬────┘ └────────┘
    ↓
┌────────┐
│ t_drug │
└────────┘
```

---

## 搜索算法设计

### 搜索匹配规则

**优先级排序:**
1. 药品名称完全匹配 (权重: 100)
2. 药品名称前缀匹配 (权重: 80)
3. 药品名称包含关键词 (权重: 60)
4. 药品编码匹配 (权重: 90)
5. 厂家名称匹配 (权重: 40)

**SQL实现:**
```sql
SELECT *,
    CASE
        WHEN name = #{keyword} THEN 100
        WHEN name LIKE CONCAT(#{keyword}, '%') THEN 80
        WHEN name LIKE CONCAT('%', #{keyword}, '%') THEN 60
        WHEN sku_code = #{keyword} THEN 90
        WHEN manufacturer LIKE CONCAT('%', #{keyword}, '%') THEN 40
        ELSE 0
    END AS match_score
FROM t_drug
WHERE status = 1
  AND (
    name LIKE CONCAT('%', #{keyword}, '%')
    OR sku_code = #{keyword}
    OR manufacturer LIKE CONCAT('%', #{keyword}, '%')
  )
ORDER BY match_score DESC, sales DESC
LIMIT #{offset}, #{pageSize}
```

---

## 数据模型

### 搜索历史模型

```java
@Data
public class SearchHistory {
    private Long userId;
    private String keyword;
    private LocalDateTime searchTime;
}
```

**Redis存储结构:**
```
Key: drug:search:history:{userId}
Type: List
Value: ["阿莫西林", "感冒药", ...]
TTL: 30天
```

### 热门搜索模型

```java
@Data
public class HotSearch {
    private String keyword;
    private Long searchCount;
    private Integer rank;
}
```

**Redis存储结构:**
```
Key: drug:search:hot
Type: ZSet
Score: searchCount
Member: keyword
TTL: 1小时
```

---

## API设计

### 1. 搜索药品接口

**Controller实现:**
```java
@GetMapping("/search")
@ApiOperation("搜索药品")
public ApiResponse<PageResult<DrugDTO>> searchDrugs(
        @RequestParam String keyword,
        @RequestParam(defaultValue = "1") Integer pageNum,
        @RequestParam(defaultValue = "20") Integer pageSize,
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) Long userId) {
    try {
        // 参数验证
        if (StringUtils.isEmpty(keyword)) {
            return ApiResponse.error(ErrorCode.INVALID_PARAM.getCode(), "请输入搜索关键词");
        }
        if (keyword.length() > 50) {
            return ApiResponse.error(ErrorCode.INVALID_PARAM.getCode(), "关键词过长");
        }
        
        // 保存搜索历史
        if (userId != null) {
            drugSearchService.saveSearchHistory(userId, keyword);
        }
        
        // 执行搜索
        PageResult<DrugDTO> result = drugSearchService.searchDrugs(
            keyword, pageNum, pageSize, sortBy
        );
        
        // 增加热门搜索计数
        drugSearchService.incrementHotSearch(keyword);
        
        return ApiResponse.success(result);
    } catch (BusinessException e) {
        log.error("搜索药品失败: {}", e.getMessage());
        return ApiResponse.error(e.getCode(), e.getMessage());
    } catch (Exception e) {
        log.error("搜索药品异常", e);
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "搜索失败");
    }
}
```

**Service实现:**
```java
@Override
public PageResult<DrugDTO> searchDrugs(String keyword, Integer pageNum, 
                                       Integer pageSize, String sortBy) {
    // 过滤特殊字符
    keyword = filterSpecialChars(keyword);
    
    // 设置分页
    PageHelper.startPage(pageNum, pageSize);
    
    // 执行搜索
    List<DrugDTO> drugs = drugMallMapper.searchDrugs(keyword, sortBy);
    
    // 解析图片
    drugs.forEach(this::enrichDrugWithImages);
    
    // 构建分页结果
    PageInfo<DrugDTO> pageInfo = new PageInfo<>(drugs);
    return PageResult.of(pageInfo);
}

/**
 * 过滤特殊字符,防止SQL注入
 */
private String filterSpecialChars(String keyword) {
    return keyword.replaceAll("[';\"\\\\]", "");
}
```

**Mapper实现:**
```java
@Select("<script>" +
    "SELECT *, " +
    "CASE " +
    "  WHEN name = #{keyword} THEN 100 " +
    "  WHEN name LIKE CONCAT(#{keyword}, '%') THEN 80 " +
    "  WHEN name LIKE CONCAT('%', #{keyword}, '%') THEN 60 " +
    "  WHEN sku_code = #{keyword} THEN 90 " +
    "  WHEN manufacturer LIKE CONCAT('%', #{keyword}, '%') THEN 40 " +
    "  ELSE 0 " +
    "END AS match_score " +
    "FROM t_drug " +
    "WHERE status = 1 " +
    "  AND (name LIKE CONCAT('%', #{keyword}, '%') " +
    "       OR sku_code = #{keyword} " +
    "       OR manufacturer LIKE CONCAT('%', #{keyword}, '%')) " +
    "ORDER BY match_score DESC, " +
    "<choose>" +
    "  <when test='sortBy == \"price\"'>price ASC</when>" +
    "  <otherwise>sales DESC</otherwise>" +
    "</choose>" +
    "</script>")
List<DrugDTO> searchDrugs(@Param("keyword") String keyword, 
                          @Param("sortBy") String sortBy);
```

---

### 2. 搜索历史接口

**Service实现:**
```java
@Override
public void saveSearchHistory(Long userId, String keyword) {
    String key = "drug:search:history:" + userId;
    
    // 移除旧记录(如果存在)
    redisTemplate.opsForList().remove(key, 0, keyword);
    
    // 添加到列表头部
    redisTemplate.opsForList().leftPush(key, keyword);
    
    // 保持最多10条记录
    redisTemplate.opsForList().trim(key, 0, 9);
    
    // 设置过期时间30天
    redisTemplate.expire(key, 30, TimeUnit.DAYS);
}

@Override
public List<SearchHistory> getSearchHistory(Long userId) {
    String key = "drug:search:history:" + userId;
    List<String> keywords = redisTemplate.opsForList().range(key, 0, 9);
    
    return keywords.stream()
        .map(keyword -> {
            SearchHistory history = new SearchHistory();
            history.setUserId(userId);
            history.setKeyword(keyword);
            return history;
        })
        .collect(Collectors.toList());
}

@Override
public void clearSearchHistory(Long userId) {
    String key = "drug:search:history:" + userId;
    redisTemplate.delete(key);
}
```

---

### 3. 热门搜索接口

**Service实现:**
```java
@Override
public void incrementHotSearch(String keyword) {
    String key = "drug:search:hot";
    redisTemplate.opsForZSet().incrementScore(key, keyword, 1);
    redisTemplate.expire(key, 1, TimeUnit.HOURS);
}

@Override
@Cacheable(value = "drug:search:hot", key = "'list'")
public List<HotSearch> getHotSearches() {
    String key = "drug:search:hot";
    Set<ZSetOperations.TypedTuple<String>> tuples = 
        redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, 9);
    
    if (tuples == null || tuples.isEmpty()) {
        return getDefaultHotSearches();
    }
    
    AtomicInteger rank = new AtomicInteger(1);
    return tuples.stream()
        .map(tuple -> {
            HotSearch hot = new HotSearch();
            hot.setKeyword(tuple.getValue());
            hot.setSearchCount(tuple.getScore().longValue());
            hot.setRank(rank.getAndIncrement());
            return hot;
        })
        .collect(Collectors.toList());
}

/**
 * 默认热门搜索词
 */
private List<HotSearch> getDefaultHotSearches() {
    return Arrays.asList(
        new HotSearch("感冒药", 1000L, 1),
        new HotSearch("退烧药", 800L, 2),
        new HotSearch("止咳药", 600L, 3),
        new HotSearch("消炎药", 500L, 4),
        new HotSearch("维生素", 400L, 5)
    );
}
```

---

## 性能优化

### 1. 数据库索引优化

**全文索引:**
```sql
-- 创建全文索引(MySQL 5.7+)
ALTER TABLE t_drug ADD FULLTEXT INDEX idx_fulltext_name (name);

-- 使用全文索引搜索
SELECT * FROM t_drug 
WHERE MATCH(name) AGAINST(#{keyword} IN NATURAL LANGUAGE MODE)
  AND status = 1
ORDER BY sales DESC;
```

**复合索引:**
```sql
-- 创建复合索引
CREATE INDEX idx_status_name ON t_drug(status, name);
CREATE INDEX idx_status_sku ON t_drug(status, sku_code);
CREATE INDEX idx_status_manufacturer ON t_drug(status, manufacturer);
```

### 2. 缓存策略

**热门搜索结果缓存:**
```java
@Cacheable(value = "drug:search:result", 
           key = "#keyword + ':' + #pageNum + ':' + #pageSize",
           condition = "#keyword.length() <= 10")
public PageResult<DrugDTO> searchDrugs(String keyword, Integer pageNum, Integer pageSize) {
    // 搜索逻辑
}
```

**缓存配置:**
```properties
# 搜索结果缓存5分钟
spring.cache.redis.time-to-live=300000
```

### 3. 查询优化

**避免全表扫描:**
```sql
-- 不推荐: 前缀通配符
SELECT * FROM t_drug WHERE name LIKE '%阿莫西林%';

-- 推荐: 后缀通配符
SELECT * FROM t_drug WHERE name LIKE '阿莫西林%';
```

**限制返回字段:**
```sql
-- 只查询必要字段
SELECT id, name, price, sales, pic_position, manufacturer
FROM t_drug
WHERE ...
```

---

## 正确性属性

### Property 1: 搜索结果准确性
**描述:** 搜索结果必须包含关键词

**形式化表达:**
```
FOR ALL drug IN searchDrugs(keyword):
  drug.name.contains(keyword) 
  OR drug.skuCode.equals(keyword)
  OR drug.manufacturer.contains(keyword)
```

### Property 2: 搜索结果唯一性
**描述:** 搜索结果不包含重复药品

**形式化表达:**
```
FOR ALL result IN searchDrugs(keyword):
  result.list.distinct_by(drugId)
```

### Property 3: 搜索历史有序性
**描述:** 搜索历史按时间倒序排列

**形式化表达:**
```
FOR ALL history IN getSearchHistory(userId):
  FOR i IN 0..history.size()-2:
    history[i].searchTime >= history[i+1].searchTime
```

---

## 错误处理

### 异常类型

1. **关键词为空**
```java
if (StringUtils.isEmpty(keyword)) {
    throw new BusinessException(ErrorCode.INVALID_PARAM, "请输入搜索关键词");
}
```

2. **关键词过长**
```java
if (keyword.length() > 50) {
    throw new BusinessException(ErrorCode.INVALID_PARAM, "关键词过长,最多50个字符");
}
```

3. **SQL注入防护**
```java
private String filterSpecialChars(String keyword) {
    // 过滤特殊字符
    return keyword.replaceAll("[';\"\\\\]", "");
}
```

---

## 测试策略

### 单元测试

```java
@Test
public void testSearchDrugs() {
    PageResult<DrugDTO> result = drugSearchService.searchDrugs("阿莫西林", 1, 20, null);
    
    assertNotNull(result);
    assertTrue(result.getTotal() > 0);
    result.getList().forEach(drug -> {
        assertTrue(
            drug.getDrugName().contains("阿莫西林") ||
            drug.getSkuCode().equals("阿莫西林") ||
            drug.getManufacturer().contains("阿莫西林")
        );
    });
}

@Test
public void testSearchHistory() {
    drugSearchService.saveSearchHistory(1001L, "感冒药");
    drugSearchService.saveSearchHistory(1001L, "退烧药");
    
    List<SearchHistory> history = drugSearchService.getSearchHistory(1001L);
    
    assertEquals(2, history.size());
    assertEquals("退烧药", history.get(0).getKeyword());
    assertEquals("感冒药", history.get(1).getKeyword());
}
```

---

## 参考文档

- [需求文档](./requirements.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
- [MySQL全文索引文档](https://dev.mysql.com/doc/refman/8.0/en/fulltext-search.html)
