# 设计文档 - 药品图片URL处理功能

## 文档信息

**功能名称:** 药品图片URL处理功能  
**项目:** 互联网医院 - 患者端药品商城  
**版本:** v1.2  
**创建日期:** 2026-01-23  
**更新日期:** 2026-01-23  

---

## 简介

本文档描述药品图片URL处理功能的设计方案。

**重要说明:** t_drug表的pic_position字段存储的是**单个图片URL字符串**(非JSON格式),例如:
```
https://internet-hospital-cm.oss-cn-beijing.aliyuncs.com/files/2026012312085517b8fed7b545445ba26b5131a95cbf72.jpg
```

本功能需要将这个单个URL字符串转换为List<String>格式,以便前端统一处理图片列表。

---

## 系统架构

```
┌─────────────────────────────────────────┐
│         Controller Layer                │
│  - DrugMallController                   │
│    └─ getDrugDetail()                   │
│    └─ getRecommendedDrugs()             │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Service Layer                   │
│  - DrugMallServiceImpl                  │
│    └─ getDrugDetail()                   │
│    └─ enrichDrugWithImages() ← 新增方法 │
│                                         │
│  - DrugImageParser (工具类)             │
│    └─ parseImages() ← 新增方法          │
│    └─ isValidImageUrl() ← 新增方法      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Mapper Layer                    │
│  - DrugMallMapper                       │
│    └─ selectById()                      │
│    └─ selectRecommended()               │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Database                        │
│  - t_drug                               │
│    └─ pic_position (VARCHAR字段)        │
│       存储单个图片URL字符串              │
└─────────────────────────────────────────┘
```

---

## 数据模型设计

### DrugDTO扩展

```java
package com.patient.api.app.mall.model;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

/**
 * 药品数据传输对象
 */
@Data
public class DrugDTO {
    // 现有字段
    private Long id;
    private String name;
    private String skuCode;
    private String picPosition;  // 原始URL字段,保留用于兼容性
    private String size;
    private BigDecimal price;
    private Integer quantity;
    private String manufacturers;
    private String approvalNumber;
    private String content;
    private Integer status;
    
    // 商城扩展字段
    private Integer sales;
    private Integer addToCartCount;
    private Boolean isFreeShipping;
    private Boolean hasPriceGuarantee;
    private Integer priceGuaranteeDays;
    private Boolean isRecommended;
    private BigDecimal originalPrice;
    private Long categoryId;
    
    // 新增: 解析后的图片列表
    private List<String> drugImages = new ArrayList<>();
    
    private Date createTime;
    private Date updateTime;
}
```

---

## 组件设计

### 1. 图片URL处理工具类

```java
package com.patient.api.app.mall.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 药品图片URL处理工具类
 * 
 * 功能说明:
 * - pic_position字段存储的是单个图片URL字符串(非JSON格式)
 * - 本工具类将单个URL字符串转换为List<String>格式
 * - 处理空值和无效URL的情况
 */
@Slf4j
public class DrugImageParser {
    
    /**
     * 将单个图片URL字符串转换为URL列表
     * 
     * 处理逻辑:
     * 1. 如果URL为空或null,返回空列表
     * 2. 验证URL格式(必须是HTTP/HTTPS协议)
     * 3. 如果URL有效,返回包含该URL的单元素列表
     * 4. 如果URL无效,返回空列表
     * 
     * @param picPosition 图片URL字符串(单个URL,非JSON)
     * @return 图片URL列表,如果URL无效返回空列表
     */
    public static List<String> parseImages(String picPosition) {
        // 处理空值情况
        if (!StringUtils.hasText(picPosition)) {
            log.debug("图片位置字段为空,返回空列表");
            return new ArrayList<>();
        }
        
        // 去除首尾空格
        String url = picPosition.trim();
        
        // 验证URL格式
        if (isValidImageUrl(url)) {
            log.debug("成功解析图片URL: {}", url);
            return Collections.singletonList(url);
        } else {
            log.warn("无效的图片URL,返回空列表. 原始数据: {}", picPosition);
            return new ArrayList<>();
        }
    }
    
    /**
     * 验证图片URL是否有效
     * 
     * 验证规则:
     * - URL不能为空
     * - URL必须以http://或https://开头
     * 
     * @param url 图片URL
     * @return true=有效, false=无效
     */
    private static boolean isValidImageUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return false;
        }
        
        // 检查是否是HTTP/HTTPS协议
        String lowerUrl = url.toLowerCase();
        if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
            log.debug("URL不是HTTP/HTTPS协议: {}", url);
            return false;
        }
        
        return true;
    }
}
```

### 2. Service层实现

```java
package com.patient.api.app.mall.service.impl;

import com.patient.api.app.mall.mapper.DrugMallMapper;
import com.patient.api.app.mall.model.DrugDTO;
import com.patient.api.app.mall.service.DrugMallService;
import com.patient.api.app.mall.util.DrugImageParser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 药品商城服务实现
 */
@Slf4j
@Service
public class DrugMallServiceImpl implements DrugMallService {
    
    @Autowired
    private DrugMallMapper drugMallMapper;
    
    /**
     * 获取药品详情
     */
    @Override
    public DrugDTO getDrugDetail(Long drugId) {
        log.info("查询药品详情, drugId: {}", drugId);
        
        // 从数据库查询药品信息
        DrugDTO drug = drugMallMapper.selectById(drugId);
        
        if (drug == null) {
            log.warn("药品不存在, drugId: {}", drugId);
            return null;
        }
        
        // 处理图片URL: 将单个URL字符串转换为List
        enrichDrugWithImages(drug);
        
        return drug;
    }
    
    /**
     * 获取推荐药品列表
     */
    @Override
    public List<DrugDTO> getRecommendedDrugs(Integer limit) {
        log.info("查询推荐药品列表, limit: {}", limit);
        
        // 从数据库查询推荐药品
        List<DrugDTO> drugs = drugMallMapper.selectRecommended(limit);
        
        // 批量处理图片URL: 将每个药品的单个URL转换为List
        drugs.forEach(this::enrichDrugWithImages);
        
        log.info("查询到{}个推荐药品", drugs.size());
        return drugs;
    }
    
    /**
     * 为药品对象填充图片列表
     * 
     * 处理逻辑:
     * 1. 从drug.picPosition获取单个URL字符串
     * 2. 调用DrugImageParser.parseImages()转换为List<String>
     * 3. 将结果设置到drug.drugImages字段
     * 
     * @param drug 药品对象
     */
    private void enrichDrugWithImages(DrugDTO drug) {
        if (drug == null) {
            return;
        }
        
        // 将单个URL字符串转换为列表
        List<String> images = DrugImageParser.parseImages(drug.getPicPosition());
        drug.setDrugImages(images);
        
        log.debug("药品[{}]处理图片URL完成,图片数量: {}", drug.getId(), images.size());
    }
}
```

---

## 接口设计

### API响应示例

**请求:**
```
GET /api/v1/mall/drugs/1001
```

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1001,
    "name": "阿莫西林胶囊",
    "skuCode": "YP001",
    "picPosition": "https://internet-hospital-cm.oss-cn-beijing.aliyuncs.com/files/2026012312085517b8fed7b545445ba26b5131a95cbf72.jpg",
    "drugImages": [
      "https://internet-hospital-cm.oss-cn-beijing.aliyuncs.com/files/2026012312085517b8fed7b545445ba26b5131a95cbf72.jpg"
    ],
    "size": "0.25g*24粒",
    "price": 15.50,
    "quantity": 100,
    "manufacturers": "XX制药有限公司",
    "sales": 1234,
    "isFreeShipping": true,
    "isRecommended": true
  }
}
```

---

## 正确性属性

*属性(Property)是一个关于系统行为的特征或规则,应该在所有有效执行中保持为真。属性是人类可读规范和机器可验证正确性保证之间的桥梁。*

### Property 1: URL转换正确性
**描述:** *对于任意*有效的URL字符串,必须正确转换为包含该URL的单元素List<String>

**形式化表达:**
```
FOR ALL valid_url WHERE isValidImageUrl(valid_url) == true:
  WHEN result = parseImages(valid_url)
  THEN result IS List<String>
  AND result.size() == 1
  AND result.get(0) == valid_url.trim()
```

**验证:** Requirements 1.1

**测试策略:** 单元测试
```java
@Test
public void testParseValidUrl() {
    String url = "https://example.com/drug.jpg";
    List<String> result = DrugImageParser.parseImages(url);
    
    assertEquals(1, result.size());
    assertEquals(url, result.get(0));
}
```

---

### Property 2: 空值处理正确性
**描述:** *对于任意*空值输入(null、空字符串、纯空格),必须返回空列表而不抛出异常

**形式化表达:**
```
FOR ALL invalid_input IN {null, "", "   ", "\t", "\n"}:
  WHEN result = parseImages(invalid_input)
  THEN result IS empty_list
  AND result.size() == 0
  AND no_exception_thrown()
```

**验证:** Requirements 1.2, 1.3

**测试策略:** 单元测试
```java
@Test
public void testParseNullOrEmpty() {
    assertEquals(0, DrugImageParser.parseImages(null).size());
    assertEquals(0, DrugImageParser.parseImages("").size());
    assertEquals(0, DrugImageParser.parseImages("   ").size());
    assertEquals(0, DrugImageParser.parseImages("\t").size());
}
```

---

### Property 3: URL验证正确性
**描述:** *对于任意*URL字符串,只有HTTP/HTTPS协议的URL才会被接受

**形式化表达:**
```
FOR ALL url:
  WHEN result = parseImages(url)
  THEN IF url.toLowerCase().startsWith("http://") OR url.toLowerCase().startsWith("https://")
    THEN result.size() == 1
    ELSE result.size() == 0
```

**验证:** Requirements 1.4, 1.5

**测试策略:** 单元测试
```java
@Test
public void testFilterInvalidUrls() {
    // 有效URL - HTTP/HTTPS协议
    assertEquals(1, DrugImageParser.parseImages("http://valid.jpg").size());
    assertEquals(1, DrugImageParser.parseImages("https://valid.jpg").size());
    assertEquals(1, DrugImageParser.parseImages("HTTP://VALID.JPG").size()); // 大小写不敏感
    
    // 无效URL - 其他协议或格式
    assertEquals(0, DrugImageParser.parseImages("ftp://invalid.jpg").size());
    assertEquals(0, DrugImageParser.parseImages("file:///local/path.jpg").size());
    assertEquals(0, DrugImageParser.parseImages("invalid").size());
    assertEquals(0, DrugImageParser.parseImages("/local/path.jpg").size());
    assertEquals(0, DrugImageParser.parseImages("www.example.com/image.jpg").size());
}
```

---

### Property 4: URL保留原样
**描述:** *对于任意*有效URL,转换后的URL必须与原始URL完全一致(除去首尾空格)

**形式化表达:**
```
FOR ALL valid_url WHERE isValidImageUrl(valid_url.trim()) == true:
  WHEN result = parseImages(valid_url)
  THEN result.get(0) == valid_url.trim()
  AND result.get(0).equals(valid_url.trim()) // 完全相等,不做任何修改
```

**验证:** Requirements 1.6

**测试策略:** 单元测试
```java
@Test
public void testUrlPreservation() {
    String url = "https://example.com/path/to/image.jpg?param=value";
    List<String> result = DrugImageParser.parseImages(url);
    
    assertEquals(url, result.get(0)); // URL完全保留
    
    // 测试带空格的情况
    String urlWithSpaces = "  https://example.com/image.jpg  ";
    result = DrugImageParser.parseImages(urlWithSpaces);
    assertEquals(urlWithSpaces.trim(), result.get(0));
}
```

---

### Property 5: 性能要求
**描述:** *对于任意*单个药品,URL处理必须在5ms内完成;*对于任意*100个药品的批量处理,必须在500ms内完成

**形式化表达:**
```
FOR ALL single_drug:
  WHEN start_time = now()
  AND parseImages(drug.picPosition)
  AND end_time = now()
  THEN (end_time - start_time) < 5ms

FOR ALL drug_list WHERE size == 100:
  WHEN start_time = now()
  AND batch_parseImages(drug_list)
  AND end_time = now()
  THEN (end_time - start_time) < 500ms
```

**验证:** Requirements 6.1, 6.2

**测试策略:** 性能测试
```java
@Test
public void testParsePerformance() {
    String url = "https://example.com/drug.jpg";
    
    // 测试单次处理性能
    long start = System.nanoTime();
    DrugImageParser.parseImages(url);
    long duration = (System.nanoTime() - start) / 1_000_000; // 转换为毫秒
    assertTrue("单次处理应在5ms内完成", duration < 5);
    
    // 测试批量处理性能(1000次模拟100个药品的10倍)
    start = System.currentTimeMillis();
    for (int i = 0; i < 1000; i++) {
        DrugImageParser.parseImages(url);
    }
    duration = System.currentTimeMillis() - start;
    assertTrue("1000次处理应在50ms内完成", duration < 50);
}
```

---

### Property 6: 幂等性
**描述:** *对于任意*URL字符串,多次调用parseImages()必须返回相同的结果

**形式化表达:**
```
FOR ALL url:
  WHEN result1 = parseImages(url)
  AND result2 = parseImages(url)
  THEN result1.equals(result2)
  AND result1.size() == result2.size()
  AND (result1.isEmpty() OR result1.get(0).equals(result2.get(0)))
```

**验证:** Requirements 6.3

**测试策略:** 单元测试
```java
@Test
public void testIdempotence() {
    String url = "https://example.com/drug.jpg";
    
    List<String> result1 = DrugImageParser.parseImages(url);
    List<String> result2 = DrugImageParser.parseImages(url);
    
    assertEquals(result1.size(), result2.size());
    if (!result1.isEmpty()) {
        assertEquals(result1.get(0), result2.get(0));
    }
    
    // 测试空值的幂等性
    result1 = DrugImageParser.parseImages(null);
    result2 = DrugImageParser.parseImages(null);
    assertEquals(0, result1.size());
    assertEquals(0, result2.size());
}
```

---

## 错误处理策略

### 异常分类

1. **空值情况**
   - NULL: 返回空列表
   - 空字符串 "": 返回空列表
   - 纯空格 "   ": 返回空列表
   - 制表符/换行符: 返回空列表

2. **URL格式错误**
   - 非HTTP/HTTPS协议: 返回空列表,记录警告日志
   - 相对路径: 返回空列表,记录警告日志
   - 无效字符串: 返回空列表,记录警告日志
   - **不抛出异常,不影响其他字段**

### 日志策略

```java
// DEBUG级别: 正常处理信息
log.debug("成功解析图片URL: {}", url);
log.debug("图片位置字段为空,返回空列表");

// WARN级别: 可恢复的错误
log.warn("无效的图片URL,返回空列表. 原始数据: {}", picPosition);
log.warn("URL不是HTTP/HTTPS协议: {}", url);
```

### 错误处理原则

1. **优雅降级:** 遇到错误返回空列表,不影响其他功能
2. **不抛异常:** 所有错误情况都通过返回空列表处理
3. **记录日志:** WARN级别记录异常数据,便于排查问题
4. **保持兼容:** 确保API响应格式一致(空列表而非null)

---

## 测试策略

### 单元测试

**测试DrugImageParser:**
```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class DrugImageParserTest {
    
    @Test
    public void testParseValidHttpUrl() {
        // 测试有效的HTTP URL
        String url = "http://example.com/drug.jpg";
        List<String> result = DrugImageParser.parseImages(url);
        assertEquals(1, result.size());
        assertEquals(url, result.get(0));
    }
    
    @Test
    public void testParseValidHttpsUrl() {
        // 测试有效的HTTPS URL
        String url = "https://internet-hospital-cm.oss-cn-beijing.aliyuncs.com/files/xxx.jpg";
        List<String> result = DrugImageParser.parseImages(url);
        assertEquals(1, result.size());
        assertEquals(url, result.get(0));
    }
    
    @Test
    public void testParseNullValue() {
        // 测试NULL值
        List<String> result = DrugImageParser.parseImages(null);
        assertNotNull(result);
        assertEquals(0, result.size());
    }
    
    @Test
    public void testParseEmptyString() {
        // 测试空字符串
        assertEquals(0, DrugImageParser.parseImages("").size());
        assertEquals(0, DrugImageParser.parseImages("   ").size());
        assertEquals(0, DrugImageParser.parseImages("\t").size());
    }
    
    @Test
    public void testParseInvalidProtocol() {
        // 测试无效协议
        assertEquals(0, DrugImageParser.parseImages("ftp://invalid.jpg").size());
        assertEquals(0, DrugImageParser.parseImages("file:///local/path.jpg").size());
    }
    
    @Test
    public void testParseRelativePath() {
        // 测试相对路径
        assertEquals(0, DrugImageParser.parseImages("/local/path.jpg").size());
        assertEquals(0, DrugImageParser.parseImages("../images/drug.jpg").size());
    }
    
    @Test
    public void testParseInvalidString() {
        // 测试无效字符串
        assertEquals(0, DrugImageParser.parseImages("not a url").size());
        assertEquals(0, DrugImageParser.parseImages("www.example.com").size());
    }
    
    @Test
    public void testUrlWithSpaces() {
        // 测试带空格的URL
        String url = "  https://example.com/drug.jpg  ";
        List<String> result = DrugImageParser.parseImages(url);
        assertEquals(1, result.size());
        assertEquals(url.trim(), result.get(0));
    }
    
    @Test
    public void testCaseInsensitiveProtocol() {
        // 测试协议大小写不敏感
        assertEquals(1, DrugImageParser.parseImages("HTTP://example.com/drug.jpg").size());
        assertEquals(1, DrugImageParser.parseImages("HTTPS://example.com/drug.jpg").size());
        assertEquals(1, DrugImageParser.parseImages("HtTpS://example.com/drug.jpg").size());
    }
    
    @Test
    public void testUrlPreservation() {
        // 测试URL完整性保留
        String url = "https://example.com/path/to/image.jpg?param=value&foo=bar";
        List<String> result = DrugImageParser.parseImages(url);
        assertEquals(url, result.get(0)); // URL应完全保留
    }
    
    @Test
    public void testParsePerformance() {
        // 测试解析性能
        String url = "https://example.com/drug.jpg";
        
        long start = System.currentTimeMillis();
        for (int i = 0; i < 1000; i++) {
            DrugImageParser.parseImages(url);
        }
        long duration = System.currentTimeMillis() - start;
        
        assertTrue("1000次处理应在50ms内完成", duration < 50);
    }
    
    @Test
    public void testIdempotence() {
        // 测试幂等性
        String url = "https://example.com/drug.jpg";
        
        List<String> result1 = DrugImageParser.parseImages(url);
        List<String> result2 = DrugImageParser.parseImages(url);
        
        assertEquals(result1.size(), result2.size());
        if (!result1.isEmpty()) {
            assertEquals(result1.get(0), result2.get(0));
        }
    }
}
```

**测试DrugMallService:**
```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class DrugMallServiceTest {
    
    @Autowired
    private DrugMallService drugMallService;
    
    @Test
    public void testGetDrugDetailWithImages() {
        // 测试获取药品详情包含图片列表
        DrugDTO drug = drugMallService.getDrugDetail(1001L);
        assertNotNull(drug);
        assertNotNull(drug.getDrugImages());
        assertTrue(drug.getDrugImages() instanceof List);
    }
    
    @Test
    public void testGetDrugDetailWithValidUrl() {
        // 测试有效URL的药品
        DrugDTO drug = drugMallService.getDrugDetail(1001L);
        if (drug != null && drug.getPicPosition() != null) {
            assertTrue(drug.getDrugImages().size() > 0);
        }
    }
    
    @Test
    public void testGetDrugDetailWithNullUrl() {
        // 测试URL为空的药品
        DrugDTO drug = drugMallService.getDrugDetail(1002L);
        if (drug != null && drug.getPicPosition() == null) {
            assertEquals(0, drug.getDrugImages().size());
        }
    }
    
    @Test
    public void testGetRecommendedDrugsWithImages() {
        // 测试推荐药品包含图片列表
        List<DrugDTO> drugs = drugMallService.getRecommendedDrugs(10);
        assertTrue(drugs.size() > 0);
        drugs.forEach(drug -> {
            assertNotNull(drug.getDrugImages());
            assertTrue(drug.getDrugImages() instanceof List);
        });
    }
    
    @Test
    public void testBatchProcessingPerformance() {
        // 测试批量处理性能
        long start = System.currentTimeMillis();
        List<DrugDTO> drugs = drugMallService.getRecommendedDrugs(100);
        long duration = System.currentTimeMillis() - start;
        
        assertTrue("查询100个药品应在500ms内完成", duration < 500);
    }
}
```

### 集成测试

**测试API接口:**
```java
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class DrugMallControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    public void testGetDrugDetailApi() throws Exception {
        // 测试药品详情API返回drugImages字段
        mockMvc.perform(get("/api/v1/mall/drugs/1001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.drugImages").isArray())
            .andExpect(jsonPath("$.data.picPosition").exists());
    }
    
    @Test
    public void testGetDrugDetailWithValidImage() throws Exception {
        // 测试有效图片URL的响应
        mockMvc.perform(get("/api/v1/mall/drugs/1001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.drugImages[0]").exists())
            .andExpect(jsonPath("$.data.drugImages[0]").value(startsWith("http")));
    }
    
    @Test
    public void testGetDrugDetailWithNullImage() throws Exception {
        // 测试图片为空的响应
        mockMvc.perform(get("/api/v1/mall/drugs/1002"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.drugImages").isArray())
            .andExpect(jsonPath("$.data.drugImages").isEmpty());
    }
    
    @Test
    public void testGetRecommendedDrugsApi() throws Exception {
        // 测试推荐药品API
        mockMvc.perform(get("/api/v1/mall/drugs/recommended?limit=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data[0].drugImages").isArray());
    }
}
```

---

## 性能优化

### 简单字符串处理

由于pic_position存储的是单个URL字符串(非JSON),处理逻辑非常简单:

```java
// 无需JSON解析库
// 无需复杂的字符串操作
// 只需简单的验证和包装

public static List<String> parseImages(String picPosition) {
    if (!StringUtils.hasText(picPosition)) {
        return new ArrayList<>();
    }
    
    String url = picPosition.trim();
    if (isValidImageUrl(url)) {
        return Collections.singletonList(url); // O(1)操作
    }
    
    return new ArrayList<>();
}
```

### 性能特点

1. **时间复杂度:** O(1) - 常数时间
2. **空间复杂度:** O(1) - 只创建单元素列表
3. **无需缓存:** 处理速度极快,无需额外缓存
4. **无需并行:** 单次处理在微秒级完成

### 批量处理优化

对于批量查询,串行处理即可满足性能要求:

```java
public List<DrugDTO> getRecommendedDrugs(Integer limit) {
    List<DrugDTO> drugs = drugMallMapper.selectRecommended(limit);
    
    // 串行处理即可,每个药品处理时间<1ms
    drugs.forEach(this::enrichDrugWithImages);
    
    return drugs;
}
```

**性能分析:**
- 单个药品处理: <1ms
- 100个药品批量处理: <100ms (远低于500ms要求)
- 无需并行处理或缓存优化

---

## 部署注意事项

### 依赖检查

**无需额外依赖!**

本功能只使用Spring框架自带的工具类:
- `org.springframework.util.StringUtils` - 字符串工具
- `java.util.Collections` - 集合工具
- `java.util.ArrayList` - 列表实现

**无需添加Gson或其他JSON库依赖**

### 配置检查

无需额外配置,开箱即用。

### 兼容性

- **向后兼容:** 保留picPosition字段,旧版本客户端不受影响
- **向前兼容:** drugImages字段为新增,旧版本客户端可以忽略
- **数据库兼容:** 无需修改t_drug表结构
- **API兼容:** 响应格式保持一致,只是新增字段

---

## 参考文档

- [需求文档](./requirements.md)
- [任务列表](./tasks.md)
- [父级设计文档](../patient-drug-mall/design.md)
- [t_drug表结构](../../../internet-hospital/sql/t_drug.sql)
