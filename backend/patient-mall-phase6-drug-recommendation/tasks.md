# Spec 12: 药品推荐功能 - 任务列表

## 文档信息

**Spec编号:** Spec 12  
**功能名称:** 药品推荐功能  
**所属阶段:** 阶段六 - 优化功能  
**创建日期:** 2026-01-23  
**预计工作量:** 2-3小时

---

## 任务概览

| 任务ID | 任务名称 | 预计工时 | 依赖 | 优先级 |
|--------|---------|---------|------|--------|
| T12.1 | 创建数据模型 | 0.5小时 | 无 | P0 |
| T12.2 | 实现Mapper查询方法 | 0.5小时 | T12.1 | P0 |
| T12.3 | 实现DrugRecommendService | 1小时 | T12.2 | P0 |
| T12.4 | 实现Controller接口 | 0.5小时 | T12.3 | P0 |
| T12.5 | 编写单元测试 | 0.5小时 | T12.4 | P1 |

**总计:** 2.5-3小时

---

## 任务详情

### T12.1 创建数据模型

**目标:** 创建推荐相关的DTO类

**实施步骤:**

1. 创建RecommendDrugDTO类
2. 创建HomeRecommendDTO类
3. 创建CategoryRecommendDTO类
4. 添加Swagger注解

**代码示例:**

```java
// 文件: com/patient/api/app/mall/model/dto/RecommendDrugDTO.java
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

**验收标准:**

- [ ] RecommendDrugDTO类创建完成
- [ ] HomeRecommendDTO类创建完成
- [ ] CategoryRecommendDTO类创建完成
- [ ] 所有字段都有注释和Swagger注解
- [ ] 代码编译通过

---

### T12.2 实现Mapper查询方法

**目标:** 实现推荐所需的数据库查询方法

**实施步骤:**

1. 在DrugMapper接口添加查询方法
2. 在DrugMapper.xml实现SQL查询
3. 添加必要的索引

**代码示例:**

```java
// 文件: com/patient/api/app/mall/mapper/DrugMapper.java
package com.patient.api.app.mall.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.patient.api.app.mall.model.Drug;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;

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

```xml
<!-- 文件: resources/xml/DrugMapper.xml -->
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
```

**验收标准:**

- [ ] Mapper接口方法添加完成
- [ ] Mapper XML实现完成
- [ ] SQL查询正确
- [ ] 使用了合适的索引
- [ ] 代码编译通过

---

### T12.3 实现DrugRecommendService

**目标:** 实现推荐业务逻辑

**实施步骤:**

1. 创建DrugRecommendService接口
2. 创建DrugRecommendServiceImpl实现类
3. 实现getHomeRecommend方法
4. 实现getRelatedDrugs方法
5. 实现getHotSales方法
6. 实现Redis缓存逻辑

**代码示例:**

```java
// 文件: com/patient/api/app/mall/service/DrugRecommendService.java
package com.patient.api.app.mall.service;

import com.patient.api.app.mall.model.dto.CategoryRecommendDTO;
import com.patient.api.app.mall.model.dto.HomeRecommendDTO;
import com.patient.api.app.mall.model.dto.RecommendDrugDTO;
import java.util.List;

public interface DrugRecommendService {
    
    /**
     * 获取首页推荐
     */
    HomeRecommendDTO getHomeRecommend();
    
    /**
     * 获取热销药品
     */
    List<RecommendDrugDTO> getHotSales(Integer limit);
    
    /**
     * 获取新品药品
     */
    List<RecommendDrugDTO> getNewArrivals(Integer limit);
    
    /**
     * 获取分类推荐
     */
    List<CategoryRecommendDTO> getCategoryRecommends();
    
    /**
     * 获取相关药品
     */
    List<RecommendDrugDTO> getRelatedDrugs(Long drugId);
}
```

**验收标准:**

- [ ] DrugRecommendService接口创建完成
- [ ] DrugRecommendServiceImpl实现完成
- [ ] 所有推荐方法实现正确
- [ ] 缓存逻辑正确
- [ ] 数据转换正确
- [ ] 异常处理完善
- [ ] 代码编译通过

---

### T12.4 实现Controller接口

**目标:** 实现推荐的Controller接口

**实施步骤:**

1. 创建DrugRecommendController类
2. 实现getHomeRecommend方法
3. 实现getRelatedRecommend方法
4. 实现getHotRecommend方法
5. 添加Swagger注解

**代码示例:**

```java
// 文件: com/patient/api/app/mall/controller/DrugRecommendController.java
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

@Api(tags = "药品商城-药品推荐")
@RestController
@RequestMapping("/api/patient/mall/drug/recommend")
public class DrugRecommendController extends BaseController {
    
    @Autowired
    private DrugRecommendService drugRecommendService;
    
    @ApiOperation("获取首页推荐")
    @GetMapping("/home")
    public Result<HomeRecommendDTO> getHomeRecommend() {
        HomeRecommendDTO recommend = drugRecommendService.getHomeRecommend();
        return Result.success(recommend);
    }
    
    @ApiOperation("获取相关推荐")
    @GetMapping("/related/{drugId}")
    public Result<Map<String, List<RecommendDrugDTO>>> getRelatedRecommend(
            @ApiParam("药品ID") @PathVariable Long drugId) {
        
        List<RecommendDrugDTO> relatedDrugs = drugRecommendService.getRelatedDrugs(drugId);
        return Result.success(Map.of("relatedDrugs", relatedDrugs));
    }
    
    @ApiOperation("获取热销推荐")
    @GetMapping("/hot")
    public Result<Map<String, List<RecommendDrugDTO>>> getHotRecommend(
            @ApiParam("返回数量") @RequestParam(defaultValue = "10") Integer limit) {
        
        if (limit > 20) {
            limit = 20;
        }
        
        List<RecommendDrugDTO> hotDrugs = drugRecommendService.getHotSales(limit);
        return Result.success(Map.of("hotDrugs", hotDrugs));
    }
}
```

**验收标准:**

- [ ] Controller类创建完成
- [ ] 所有接口方法实现完成
- [ ] Swagger注解添加完成
- [ ] 参数验证正确
- [ ] 返回结果格式正确
- [ ] 代码编译通过

---

### T12.5 编写单元测试

**目标:** 编写单元测试用例

**实施步骤:**

1. 创建DrugRecommendServiceTest测试类
2. 测试热销推荐
3. 测试新品推荐
4. 测试相关推荐
5. 测试缓存功能

**代码示例:**

```java
// 文件: test/java/com/patient/api/app/mall/service/DrugRecommendServiceTest.java
package com.patient.api.app.mall.service;

import com.patient.api.app.mall.model.dto.HomeRecommendDTO;
import com.patient.api.app.mall.model.dto.RecommendDrugDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class DrugRecommendServiceTest {
    
    @Autowired
    private DrugRecommendService drugRecommendService;
    
    @Test
    public void testGetHotSales() {
        // 测试热销推荐
        List<RecommendDrugDTO> result = drugRecommendService.getHotSales(10);
        
        assertNotNull(result);
        assertTrue(result.size() <= 10);
        
        // 验证排序（销量降序）
        for (int i = 0; i < result.size() - 1; i++) {
            assertTrue(result.get(i).getSales() >= result.get(i + 1).getSales());
        }
        
        // 验证数据质量
        for (RecommendDrugDTO drug : result) {
            assertNotNull(drug.getDrugId());
            assertNotNull(drug.getDrugName());
            assertNotNull(drug.getDrugImage());
            assertTrue(drug.getSales() >= 0);
        }
    }
    
    @Test
    public void testGetHomeRecommend() {
        // 测试首页推荐
        HomeRecommendDTO result = drugRecommendService.getHomeRecommend();
        
        assertNotNull(result);
        assertNotNull(result.getHotSales());
        assertNotNull(result.getNewArrivals());
        assertNotNull(result.getCategoryRecommends());
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
}
```

**验收标准:**

- [ ] 测试类创建完成
- [ ] 至少3个测试用例
- [ ] 所有测试用例通过
- [ ] 测试覆盖率 > 80%

---

## 集成测试

### 测试用例1: 查看首页推荐

**请求:**
```
GET /api/patient/mall/drug/recommend/home
```

**预期响应:**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "hotSales": [...],
    "newArrivals": [...],
    "categoryRecommends": [...]
  }
}
```

### 测试用例2: 查看相关推荐

**请求:**
```
GET /api/patient/mall/drug/recommend/related/1
```

**预期响应:**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "relatedDrugs": [...]
  }
}
```

### 测试用例3: 查看热销推荐

**请求:**
```
GET /api/patient/mall/drug/recommend/hot?limit=5
```

**预期响应:**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "hotDrugs": [...]
  }
}
```

### 测试用例4: 验证缓存功能

**步骤:**
1. 第一次请求首页推荐（记录响应时间）
2. 30分钟内再次请求（记录响应时间）
3. 对比两次响应时间

**预期结果:**
- 第一次查询: 响应时间 < 1秒
- 第二次查询: 响应时间 < 200ms
- 两次返回数据一致

---

## 注意事项

### 1. 数据质量

- 只推荐上架状态的药品（status = 1）
- 只推荐有库存的药品（stock > 0）
- 只推荐有图片的药品（pic_position不为空）

### 2. 性能优化

- 必须使用Redis缓存推荐结果
- 缓存过期时间设置为30分钟
- 使用合适的数据库索引

### 3. 排序规则

- 热销推荐：按销量降序
- 新品推荐：按上架时间降序
- 分类推荐：按销量降序

### 4. 错误处理

- 推荐查询失败不应影响主流程
- 返回空列表而不是抛出异常
- 记录详细的错误日志

### 5. 代码规范

- 所有注释使用中文
- 变量名、方法名使用英文
- 遵循阿里巴巴Java开发手册
- 函数长度不超过50行

---

## 验证清单

### 功能验证

- [ ] 首页能展示热销药品推荐
- [ ] 首页能展示新品推荐
- [ ] 首页能展示分类推荐
- [ ] 药品详情页能展示相关推荐
- [ ] 热销推荐接口正常工作
- [ ] 推荐列表按规则正确排序

### 性能验证

- [ ] 首次查询响应时间 < 1秒
- [ ] 缓存命中响应时间 < 200ms
- [ ] 缓存命中率 > 90%
- [ ] 支持500个用户并发请求

### 数据质量验证

- [ ] 只推荐上架状态的药品
- [ ] 只推荐有库存的药品
- [ ] 推荐药品都有图片
- [ ] 推荐列表不包含重复药品

### 代码质量验证

- [ ] 代码编译通过
- [ ] 单元测试通过
- [ ] 代码符合规范
- [ ] 没有代码坏味道

---

**文档创建日期:** 2026-01-23  
**创建人员:** Kiro AI Assistant  
**状态:** 待执行
