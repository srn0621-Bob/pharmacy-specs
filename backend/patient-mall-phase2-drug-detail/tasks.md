# 实施计划 - 药品详情查询功能

## 概述

本文档描述药品详情查询功能的实施任务列表。主要工作是验证现有详情接口,补充相关推荐功能,并确保数据完整性。

---

## 任务列表

- [ ] 1. 验证现有详情接口
  - [ ] 1.1 检查DrugMallController
    - 确认 `getDrugDetail()` 方法存在
    - 确认接口路径: `/api/v1/mall/drugs/{drugId}`
    - 确认返回DrugDTO模型
    - _Requirements: 1.1-1.6_
  
  - [ ] 1.2 测试详情查询功能
    - 测试有效药品ID
    - 测试无效药品ID
    - 测试已下架药品
    - 验证返回数据完整性
    - _Requirements: 1.1-1.6_
  
  - [ ] 1.3 检查DrugDTO模型
    - 确认包含所有基本字段
    - 确认包含商城扩展字段
    - 确认包含drugImages字段
    - _Requirements: 2.1-2.5_

- [ ] 2. 完善DrugDTO模型
  - [ ] 2.1 添加缺失字段
    - 添加discount字段(折扣)
    - 添加stockStatus字段(库存状态)
    - 添加categoryName字段(分类名称)
    - _Requirements: 3.1-3.6, 4.1-4.6_
  
  - [ ] 2.2 添加字段注释
    - 为所有字段添加@ApiModelProperty注解
    - 添加中文注释
    - _Requirements: 所有需求_
  
  - [ ]* 2.3 验证模型完整性
    - 确认所有必需字段存在
    - 确认字段类型正确
    - _Requirements: 所有需求_

- [ ] 3. 完善Service层逻辑
  - [ ] 3.1 添加折扣计算
    - 实现calculateDiscount()方法
    - 计算price/originalPrice
    - 保留2位小数
    - _Requirements: 3.3_
  
  - [ ] 3.2 添加库存状态设置
    - 实现setStockStatus()方法
    - quantity<=0: "缺货"
    - quantity<10: "库存紧张"
    - quantity>=10: "有货"
    - _Requirements: 3.5_
  
  - [ ] 3.3 集成图片解析
    - 调用enrichDrugWithImages()
    - 确保图片列表正确解析
    - _Requirements: 2.1-2.5_
  
  - [ ]* 3.4 测试Service逻辑
    - 测试折扣计算正确
    - 测试库存状态正确
    - 测试图片解析正常
    - _Requirements: 2.1-3.6_

- [ ] 4. 验证库存查询接口
  - [ ] 4.1 检查现有实现
    - 确认 `getStock()` 方法存在
    - 确认接口路径: `/api/v1/mall/drugs/{drugId}/stock`
    - _Requirements: 3.1-3.6_
  
  - [ ] 4.2 测试库存查询
    - 测试有效药品ID
    - 测试库存数量正确
    - 测试库存状态正确
    - _Requirements: 3.1-3.6_

- [ ] 5. 实现相关推荐功能
  - [ ] 5.1 在Service添加方法
    - 添加getRelatedDrugs()方法
    - 参数: drugId, limit
    - _Requirements: 6.1-6.5_
  
  - [ ] 5.2 实现推荐算法
    - 基于分类推荐
    - 优先同厂家药品
    - 按销量排序
    - 排除当前药品
    - 限制返回数量
    - _Requirements: 6.1-6.5_
  
  - [ ] 5.3 在Mapper添加查询
    - 添加selectRelatedDrugs()方法
    - SQL支持多条件查询
    - SQL支持排序和限制
    - _Requirements: 6.1-6.5_
  
  - [ ] 5.4 在Controller添加接口
    - GET /api/v1/mall/drugs/{drugId}/related
    - 支持limit参数(默认10)
    - _Requirements: 6.1-6.5_
  
  - [ ]* 5.5 测试推荐功能
    - 测试推荐结果相关性
    - 测试排除当前药品
    - 测试数量限制
    - _Requirements: 6.1-6.5_

- [ ] 6. 配置缓存策略
  - [ ] 6.1 添加详情缓存
    - 在getDrugDetail()添加@Cacheable
    - 缓存Key: drug:detail:{drugId}
    - 过期时间: 5分钟
    - _Requirements: 7.1-7.4_
  
  - [ ] 6.2 添加库存缓存
    - 在getStock()添加@Cacheable
    - 缓存Key: drug:stock:{drugId}
    - 过期时间: 1分钟
    - _Requirements: 7.1-7.4_
  
  - [ ] 6.3 添加推荐缓存
    - 在getRelatedDrugs()添加@Cacheable
    - 缓存Key: drug:related:{drugId}:{limit}
    - 过期时间: 10分钟
    - _Requirements: 7.1-7.4_
  
  - [ ]* 6.4 测试缓存功能
    - 测试缓存生效
    - 测试缓存过期
    - 测试缓存命中率
    - _Requirements: 7.1-7.4_

- [ ] 7. 错误处理完善
  - [ ] 7.1 添加参数验证
    - 验证drugId非空且>0
    - 验证limit在1-100之间
    - _Requirements: 8.1-8.5_
  
  - [ ] 7.2 完善异常处理
    - 捕获BusinessException
    - 捕获数据库异常
    - 记录错误日志
    - 返回友好错误信息
    - _Requirements: 8.1-8.5_
  
  - [ ]* 7.3 测试错误场景
    - 测试无效药品ID
    - 测试药品不存在
    - 测试药品已下架
    - 测试数据库异常
    - _Requirements: 8.1-8.5_

- [ ] 8. Checkpoint - 功能验收
  - 确认所有接口实现完成
  - 确认所有单元测试通过
  - 确认缓存功能正常
  - 确认错误处理完善
  - 询问用户是否继续性能测试

- [ ] 9. 性能优化
  - [ ] 9.1 优化数据库查询
    - 使用主键索引
    - 避免N+1查询
    - 字段按需查询
    - _Requirements: 7.1-7.4_
  
  - [ ] 9.2 实现缓存预热
    - 预加载热门药品详情
    - 在应用启动时执行
    - _Requirements: 7.3_
  
  - [ ] 9.3 批量查询优化
    - 实现批量获取详情接口
    - 使用IN查询
    - _Requirements: 7.1-7.4_

- [ ] 10. 性能测试
  - [ ] 10.1 测试查询性能
    - 测试响应时间<500ms
    - 测试并发1000请求
    - 记录性能指标
    - _Requirements: 7.1-7.4_
  
  - [ ] 10.2 测试缓存性能
    - 测试缓存命中率>80%
    - 测试缓存响应时间<50ms
    - _Requirements: 7.3_

- [ ] 11. 集成测试
  - [ ] 11.1 端到端测试
    - 测试完整查询流程
    - 测试详情->推荐->详情
    - 验证数据一致性
    - _Requirements: 所有需求_
  
  - [ ] 11.2 兼容性测试
    - 测试与图片解析集成
    - 测试与购物车集成
    - 测试与订单集成
    - _Requirements: 兼容性要求_

- [ ] 12. 文档更新
  - [ ] 12.1 更新API文档
    - 添加相关推荐接口
    - 更新响应示例
    - _Requirements: 所有需求_
  
  - [ ] 12.2 更新实施文档
    - 记录实现细节
    - 记录性能优化
    - _Requirements: 所有需求_

- [ ] 13. Final Checkpoint - 完成验收
  - 确认所有任务完成
  - 确认所有测试通过
  - 确认性能满足要求
  - 确认文档更新完成
  - 提交代码审查

---

## 代码示例

### 1. DrugDTO模型补充

```java
@Data
@ApiModel("药品详情")
public class DrugDTO {
    // ... 现有字段
    
    @ApiModelProperty("折扣(0-1之间)")
    private BigDecimal discount;
    
    @ApiModelProperty("库存状态: 有货/库存紧张/缺货")
    private String stockStatus;
    
    @ApiModelProperty("分类名称")
    private String categoryName;
}
```

### 2. Service层完善

```java
@Override
@Cacheable(value = "drug:detail", key = "#drugId", unless = "#result == null")
public DrugDTO getDrugDetail(Long drugId) {
    log.debug("查询药品详情: drugId={}", drugId);
    
    // 查询药品
    DrugDTO drug = drugMallMapper.selectById(drugId);
    
    if (drug == null) {
        return null;
    }
    
    // 解析图片
    enrichDrugWithImages(drug);
    
    // 计算折扣
    calculateDiscount(drug);
    
    // 设置库存状态
    setStockStatus(drug);
    
    return drug;
}

/**
 * 计算折扣
 */
private void calculateDiscount(DrugDTO drug) {
    if (drug.getOriginalPrice() != null && 
        drug.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0) {
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

### 3. 相关推荐实现

```java
// Controller
@GetMapping("/{drugId}/related")
@ApiOperation("获取相关推荐药品")
public ApiResponse<List<DrugDTO>> getRelatedDrugs(
        @PathVariable Long drugId,
        @RequestParam(defaultValue = "10") Integer limit) {
    try {
        if (limit > 100) {
            limit = 100;
        }
        
        List<DrugDTO> drugs = drugMallService.getRelatedDrugs(drugId, limit);
        return ApiResponse.success(drugs);
    } catch (Exception e) {
        log.error("获取相关推荐失败: drugId={}", drugId, e);
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR.getCode(), "查询失败");
    }
}

// Service
@Override
@Cacheable(value = "drug:related", key = "#drugId + ':' + #limit")
public List<DrugDTO> getRelatedDrugs(Long drugId, Integer limit) {
    // 获取当前药品
    DrugDTO currentDrug = drugMallMapper.selectById(drugId);
    
    if (currentDrug == null) {
        return Collections.emptyList();
    }
    
    // 查询相关药品
    List<DrugDTO> drugs = drugMallMapper.selectRelatedDrugs(
        currentDrug.getCategoryId(),
        currentDrug.getManufacturer(),
        drugId,
        limit
    );
    
    // 解析图片
    drugs.forEach(this::enrichDrugWithImages);
    
    return drugs;
}

// Mapper
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

## 测试用例

### 单元测试

```java
@Test
public void testGetDrugDetail() {
    DrugDTO drug = drugMallService.getDrugDetail(1001L);
    
    assertNotNull(drug);
    assertEquals(1001L, drug.getDrugId());
    assertNotNull(drug.getDrugImages());
    assertNotNull(drug.getStockStatus());
}

@Test
public void testCalculateDiscount() {
    DrugDTO drug = new DrugDTO();
    drug.setPrice(new BigDecimal("15.50"));
    drug.setOriginalPrice(new BigDecimal("20.00"));
    
    calculateDiscount(drug);
    
    assertEquals(new BigDecimal("0.78"), drug.getDiscount());
}

@Test
public void testGetRelatedDrugs() {
    List<DrugDTO> drugs = drugMallService.getRelatedDrugs(1001L, 10);
    
    assertNotNull(drugs);
    assertTrue(drugs.size() <= 10);
    drugs.forEach(drug -> assertNotEquals(1001L, drug.getDrugId()));
}
```

### API测试

```bash
# 测试获取药品详情
curl -X GET "http://localhost:8092/api/v1/mall/drugs/1001" \
  -H "Authorization: Bearer {token}"

# 测试获取相关推荐
curl -X GET "http://localhost:8092/api/v1/mall/drugs/1001/related?limit=10" \
  -H "Authorization: Bearer {token}"
```

---

## 预计工作量

| 任务阶段 | 预计时间 |
|---------|---------|
| 验证现有接口 | 30分钟 |
| 完善模型和Service | 1小时 |
| 实现相关推荐 | 1小时 |
| 配置缓存策略 | 30分钟 |
| 错误处理完善 | 30分钟 |
| 性能优化和测试 | 1小时 |
| 集成测试和文档 | 30分钟 |
| **总计** | **5小时** |

---

## 参考文档

- [需求文档](./requirements.md)
- [设计文档](./design.md)
- [图片解析任务](../patient-mall-phase1-image-parser/tasks.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
