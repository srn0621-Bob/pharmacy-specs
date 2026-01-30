# 实施计划 - 药品分类查询功能

## 概述

本文档描述药品分类查询功能的实施任务列表。主要工作是验证现有API实现,补充快捷分类接口,并确保功能完整性。

---

## 任务列表

- [ ] 1. 验证现有分类接口
  - [ ] 1.1 检查DrugMallController
    - 确认 `getCategories()` 方法存在
    - 确认接口路径: `/api/v1/mall/drugs/categories`
    - 确认返回数据格式
    - _Requirements: 1.1-1.5_
  
  - [ ] 1.2 测试分类列表接口
    - 使用Postman或curl测试接口
    - 验证返回所有分类
    - 验证按sortOrder排序
    - 验证响应格式正确
    - _Requirements: 1.1-1.5_
  
  - [ ] 1.3 检查分类数据来源
    - 确认是硬编码还是数据库查询
    - 如果是硬编码,记录分类定义位置
    - 如果是数据库,检查表结构
    - _Requirements: 1.1_

- [ ] 2. 实现快捷分类接口
  - [ ] 2.1 创建QuickCategoryDTO模型
    - 创建文件: `QuickCategoryDTO.java`
    - 位置: `com.patient.api.app.mall.model`
    - 添加字段: categoryId, categoryName, categoryIcon, iconResId, sortOrder, isHot
    - 添加Lombok注解
    - _Requirements: 2.1-2.5_
  
  - [ ] 2.2 在DrugMallService添加方法
    - 添加接口方法: `List<QuickCategoryDTO> getQuickCategories()`
    - 添加方法注释
    - _Requirements: 2.1-2.5_
  
  - [ ] 2.3 实现Service方法
    - 在DrugMallServiceImpl实现方法
    - 过滤isQuickCategory=true的分类
    - 限制返回数量<=10
    - 按sortOrder排序
    - 添加@Cacheable注解
    - _Requirements: 2.1-2.5_
  
  - [ ] 2.4 在DrugMallController添加接口
    - 添加方法: `getQuickCategories()`
    - 路径: `GET /api/v1/mall/drugs/quick-categories`
    - 添加@ApiOperation注解
    - 添加异常处理
    - 添加日志记录
    - _Requirements: 2.1-2.5_
  
  - [ ]* 2.5 编写单元测试
    - 测试返回数量<=10
    - 测试所有分类isQuickCategory=true
    - 测试排序正确
    - _Requirements: 2.1-2.5_

- [ ] 3. 验证按分类查询药品接口
  - [ ] 3.1 检查现有实现
    - 确认 `getDrugsByCategory()` 方法存在
    - 确认接口路径: `/api/v1/mall/drugs/category/{categoryId}`
    - 确认支持分页参数
    - _Requirements: 3.1-3.6_
  
  - [ ] 3.2 测试分类查询接口
    - 测试有效分类ID
    - 测试无效分类ID
    - 测试分页功能
    - 验证只返回status=1的药品
    - 验证药品属于指定分类
    - _Requirements: 3.1-3.6_
  
  - [ ] 3.3 检查Mapper实现
    - 确认SQL查询包含category_id过滤
    - 确认SQL查询包含status=1过滤
    - 确认使用了索引
    - _Requirements: 3.1-3.6_

- [ ] 4. 实现分类药品数量统计
  - [ ] 4.1 添加统计方法
    - 在DrugMallService添加: `Long countDrugsByCategory(Long categoryId)`
    - 在DrugMallServiceImpl实现方法
    - 添加@Cacheable注解
    - _Requirements: 4.1-4.4_
  
  - [ ] 4.2 在Mapper添加统计查询
    - 添加方法: `Long countByCategory(@Param("categoryId") Long categoryId)`
    - SQL: `SELECT COUNT(*) FROM t_drug WHERE category_id = ? AND status = 1`
    - _Requirements: 4.1-4.3_
  
  - [ ] 4.3 更新分类列表接口
    - 在返回分类时添加drugCount字段
    - 调用countDrugsByCategory()获取数量
    - _Requirements: 4.1-4.4_
  
  - [ ]* 4.4 测试统计功能
    - 测试统计数量正确
    - 测试只统计status=1的药品
    - 测试缓存生效
    - _Requirements: 4.1-4.4_

- [ ] 5. 配置缓存策略
  - [ ] 5.1 配置Redis缓存
    - 检查application.properties缓存配置
    - 设置缓存过期时间为1小时
    - 配置缓存Key前缀
    - _Requirements: 5.1-5.4_
  
  - [ ] 5.2 添加缓存注解
    - 在getCategories()添加@Cacheable
    - 在getQuickCategories()添加@Cacheable
    - 在countDrugsByCategory()添加@Cacheable
    - _Requirements: 5.1-5.4_
  
  - [ ] 5.3 实现缓存刷新接口
    - 添加方法: `refreshCategoryCache()`
    - 添加@CacheEvict注解
    - 在Controller添加刷新接口
    - _Requirements: 5.4_
  
  - [ ]* 5.4 测试缓存功能
    - 测试缓存生效
    - 测试缓存过期
    - 测试手动刷新
    - _Requirements: 5.1-5.4_

- [ ] 6. 错误处理完善
  - [ ] 6.1 添加分类验证
    - 实现categoryExists()方法
    - 在查询前验证分类ID
    - 分类不存在返回404错误
    - _Requirements: 6.1-6.4_
  
  - [ ] 6.2 添加参数验证
    - 验证categoryId非空且>0
    - 验证pageNum>=1
    - 验证pageSize在1-100之间
    - _Requirements: 6.3_
  
  - [ ] 6.3 完善异常处理
    - 捕获BusinessException
    - 捕获数据库异常
    - 记录错误日志
    - 返回友好错误信息
    - _Requirements: 6.1-6.4_
  
  - [ ]* 6.4 测试错误场景
    - 测试无效分类ID
    - 测试无效分页参数
    - 测试数据库异常
    - _Requirements: 6.1-6.4_

- [ ] 7. Checkpoint - 功能验收
  - 确认所有接口实现完成
  - 确认所有单元测试通过
  - 确认缓存功能正常
  - 确认错误处理完善
  - 询问用户是否继续性能测试

- [ ] 8. 性能优化
  - [ ] 8.1 检查数据库索引
    - 确认idx_category_id索引存在
    - 使用EXPLAIN分析查询计划
    - 验证索引被使用
    - _Requirements: 性能要求_
  
  - [ ] 8.2 优化查询SQL
    - 使用覆盖索引
    - 避免SELECT *
    - 只查询必要字段
    - _Requirements: 性能要求_
  
  - [ ] 8.3 实现定时统计任务(可选)
    - 创建定时任务类
    - 每30分钟更新分类药品数量
    - 存储到Redis
    - _Requirements: 4.4_

- [ ] 9. 性能测试
  - [ ] 9.1 测试分类列表查询性能
    - 测试响应时间<500ms
    - 测试并发1000请求
    - 记录性能指标
    - _Requirements: 性能要求_
  
  - [ ] 9.2 测试分类药品查询性能
    - 测试响应时间<1秒
    - 测试分页查询性能
    - 测试缓存命中率
    - _Requirements: 性能要求_
  
  - [ ] 9.3 压力测试
    - 使用JMeter或ab工具
    - 模拟高并发场景
    - 监控系统资源
    - _Requirements: 性能要求_

- [ ] 10. 集成测试
  - [ ] 10.1 端到端测试
    - 测试完整查询流程
    - 测试分类->药品->详情
    - 验证数据一致性
    - _Requirements: 所有需求_
  
  - [ ] 10.2 兼容性测试
    - 测试与图片解析功能集成
    - 测试与购物车功能集成
    - 测试与订单功能集成
    - _Requirements: 兼容性要求_

- [ ] 11. 文档更新
  - [ ] 11.1 更新API文档
    - 在Swagger添加快捷分类接口
    - 更新接口说明和示例
    - _Requirements: 所有需求_
  
  - [ ] 11.2 更新实施文档
    - 记录实现细节
    - 记录遇到的问题
    - 记录性能优化方案
    - _Requirements: 所有需求_

- [ ] 12. Final Checkpoint - 完成验收
  - 确认所有任务完成
  - 确认所有测试通过
  - 确认性能满足要求
  - 确认文档更新完成
  - 提交代码审查

---

## 代码示例

### 1. QuickCategoryDTO.java

```java
package com.patient.api.app.mall.model;

import lombok.Data;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 快捷分类DTO
 * 
 * @author Kiro
 * @date 2026-01-23
 */
@Data
@ApiModel("快捷分类")
public class QuickCategoryDTO {
    
    @ApiModelProperty("分类ID")
    private Long categoryId;
    
    @ApiModelProperty("分类名称")
    private String categoryName;
    
    @ApiModelProperty("分类图标URL")
    private String categoryIcon;
    
    @ApiModelProperty("Android本地资源ID")
    private String iconResId;
    
    @ApiModelProperty("排序")
    private Integer sortOrder;
    
    @ApiModelProperty("是否热门")
    private Boolean isHot;
}
```

### 2. DrugMallController添加快捷分类接口

```java
@GetMapping("/quick-categories")
@ApiOperation("获取快捷分类列表")
public ApiResponse<List<QuickCategoryDTO>> getQuickCategories() {
    try {
        log.info("获取快捷分类列表");
        List<QuickCategoryDTO> categories = drugMallService.getQuickCategories();
        log.info("获取快捷分类列表成功,数量: {}", categories.size());
        return ApiResponse.success(categories);
    } catch (Exception e) {
        log.error("获取快捷分类列表失败", e);
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "获取快捷分类列表失败");
    }
}
```

### 3. DrugMallServiceImpl实现

```java
@Override
@Cacheable(value = "drug:categories", key = "'quick'")
public List<QuickCategoryDTO> getQuickCategories() {
    log.debug("查询快捷分类列表");
    
    // 从硬编码分类中过滤快捷分类
    List<QuickCategoryDTO> quickCategories = CATEGORIES.stream()
        .filter(DrugCategory::getIsQuickCategory)
        .limit(10)
        .map(this::toQuickCategoryDTO)
        .collect(Collectors.toList());
    
    log.debug("快捷分类数量: {}", quickCategories.size());
    return quickCategories;
}

/**
 * 转换为快捷分类DTO
 */
private QuickCategoryDTO toQuickCategoryDTO(DrugCategory category) {
    QuickCategoryDTO dto = new QuickCategoryDTO();
    dto.setCategoryId(category.getCategoryId());
    dto.setCategoryName(category.getCategoryName());
    dto.setCategoryIcon(category.getCategoryIcon());
    dto.setIconResId(category.getIconResId());
    dto.setSortOrder(category.getSortOrder());
    dto.setIsHot(category.getSortOrder() <= 5);  // 前5个标记为热门
    return dto;
}
```

### 4. 分类药品数量统计

```java
// Mapper接口
@Select("SELECT COUNT(*) FROM t_drug WHERE category_id = #{categoryId} AND status = 1")
Long countByCategory(@Param("categoryId") Long categoryId);

// Service实现
@Override
@Cacheable(value = "drug:category:count", key = "#categoryId")
public Long countDrugsByCategory(Long categoryId) {
    log.debug("统计分类药品数量: categoryId={}", categoryId);
    Long count = drugMallMapper.countByCategory(categoryId);
    log.debug("分类[{}]药品数量: {}", categoryId, count);
    return count;
}
```

### 5. 缓存刷新接口

```java
// Controller
@PostMapping("/categories/cache/refresh")
@ApiOperation("刷新分类缓存")
public ApiResponse<Boolean> refreshCategoryCache() {
    try {
        log.info("刷新分类缓存");
        drugMallService.refreshCategoryCache();
        return ApiResponse.success(true);
    } catch (Exception e) {
        log.error("刷新分类缓存失败", e);
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "刷新缓存失败");
    }
}

// Service实现
@Override
@CacheEvict(value = {"drug:categories", "drug:category:count"}, allEntries = true)
public void refreshCategoryCache() {
    log.info("分类缓存已刷新");
}
```

---

## 测试用例

### 单元测试

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class DrugCategoryQueryTest {
    
    @Autowired
    private DrugMallService drugMallService;
    
    @Test
    public void testGetCategories() {
        List<DrugCategoryDTO> categories = drugMallService.getCategories();
        
        assertNotNull(categories);
        assertTrue(categories.size() >= 8);
        
        // 验证排序
        for (int i = 1; i < categories.size(); i++) {
            assertTrue(categories.get(i-1).getSortOrder() <= categories.get(i).getSortOrder());
        }
    }
    
    @Test
    public void testGetQuickCategories() {
        List<QuickCategoryDTO> categories = drugMallService.getQuickCategories();
        
        assertNotNull(categories);
        assertTrue(categories.size() <= 10);
        
        // 验证都是快捷分类
        categories.forEach(cat -> {
            assertNotNull(cat.getIconResId());
        });
    }
    
    @Test
    public void testGetDrugsByCategory() {
        PageResult<DrugDTO> result = drugMallService.getDrugsByCategory(1L, 1, 20);
        
        assertNotNull(result);
        assertTrue(result.getTotal() >= 0);
        
        // 验证药品属于该分类
        result.getList().forEach(drug -> {
            assertEquals(1L, drug.getCategoryId());
            assertEquals(1, drug.getStatus());
        });
    }
    
    @Test
    public void testCountDrugsByCategory() {
        Long count = drugMallService.countDrugsByCategory(1L);
        
        assertNotNull(count);
        assertTrue(count >= 0);
    }
    
    @Test(expected = BusinessException.class)
    public void testGetDrugsByInvalidCategory() {
        drugMallService.getDrugsByCategory(999L, 1, 20);
    }
}
```

### API测试

```bash
# 1. 测试获取分类列表
curl -X GET "http://localhost:8092/api/v1/mall/drugs/categories" \
  -H "Authorization: Bearer {token}"

# 期望响应
{
  "code": 200,
  "data": [
    {
      "categoryId": 1,
      "categoryName": "为你推荐",
      "sortOrder": 1,
      "drugCount": 120
    }
  ]
}

# 2. 测试获取快捷分类
curl -X GET "http://localhost:8092/api/v1/mall/drugs/quick-categories" \
  -H "Authorization: Bearer {token}"

# 期望响应
{
  "code": 200,
  "data": [
    {
      "categoryId": 1,
      "categoryName": "隐形美瞳",
      "iconResId": "ic_category_lenses",
      "isHot": true
    }
  ]
}

# 3. 测试按分类查询药品
curl -X GET "http://localhost:8092/api/v1/mall/drugs/category/1?pageNum=1&pageSize=20" \
  -H "Authorization: Bearer {token}"

# 期望响应
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 50,
    "pageNum": 1,
    "pageSize": 20
  }
}

# 4. 测试无效分类ID
curl -X GET "http://localhost:8092/api/v1/mall/drugs/category/999?pageNum=1&pageSize=20" \
  -H "Authorization: Bearer {token}"

# 期望响应
{
  "code": 404,
  "message": "分类不存在"
}
```

---

## 预计工作量

| 任务阶段 | 预计时间 |
|---------|---------|
| 验证现有接口 | 30分钟 |
| 实现快捷分类接口 | 1小时 |
| 验证分类查询接口 | 30分钟 |
| 实现数量统计 | 30分钟 |
| 配置缓存策略 | 30分钟 |
| 错误处理完善 | 30分钟 |
| 性能优化和测试 | 1小时 |
| 集成测试和文档 | 30分钟 |
| **总计** | **5小时** |

---

## 注意事项

### 开发注意事项

1. **分类数据来源:** 优先使用硬编码,简单快速
2. **缓存策略:** 分类数据变化不频繁,可以长时间缓存
3. **性能优化:** 确保使用了category_id索引
4. **错误处理:** 分类不存在时返回友好提示
5. **向后兼容:** 不影响现有接口

### 测试注意事项

1. **边界测试:** 测试空分类、大量药品的分类
2. **性能测试:** 确保查询响应时间满足要求
3. **缓存测试:** 验证缓存生效和刷新
4. **并发测试:** 验证高并发下的稳定性

### 部署注意事项

1. **配置检查:** 确认Redis缓存配置正确
2. **索引检查:** 确认category_id索引存在
3. **监控:** 关注分类查询的性能指标
4. **回滚:** 如有问题可以快速回滚

---

## 参考文档

- [需求文档](./requirements.md)
- [设计文档](./design.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
- [DrugMallController](../../../internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/mall/controller/DrugMallController.java)
