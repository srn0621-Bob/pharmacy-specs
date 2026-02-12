# 下一步执行指南

## 📋 当前状态

根据 API 验证报告，我们已经完成：
- ✅ 任务 1.1: 验证推荐药品 API
- ✅ 任务 1.3: 验证首页聚合 API
- ✅ 创建 API 验证报告和执行总结

## 🎯 待执行任务（按优先级）

### 🔴 高优先级 - 需要人工确认

#### 任务 1.4: 执行数据库迁移 ⚠️

**风险等级**: 🔴 高风险（不可逆操作）  
**预计工时**: 30分钟  
**状态**: ⏸️ 暂停，等待人工确认

**为什么需要人工确认？**
1. 数据库修改操作不可逆
2. 可能影响生产环境
3. 需要先备份数据库
4. 应该先在测试环境验证

**执行步骤**:

```bash
# ==================== 步骤 1: 备份数据库（必须） ====================
# 在执行任何数据库修改前，必须先备份
mysqldump -u root -p internet_hospital > backup_$(date +%Y%m%d_%H%M%S).sql

# 验证备份文件
ls -lh backup_*.sql

# ==================== 步骤 2: 检查迁移脚本 ====================
# 查看脚本内容，确认要添加的字段
cat internet-hospital-mall/sql/alter_t_drug_add_mall_fields.sql

# ==================== 步骤 3: 在测试环境执行（推荐） ====================
# 如果有测试环境，先在测试环境验证
mysql -u root -p internet_hospital_test < internet-hospital-mall/sql/alter_t_drug_add_mall_fields.sql

# 验证测试环境字段
mysql -u root -p internet_hospital_test -e "DESC t_drug;"

# ==================== 步骤 4: 在生产环境执行 ====================
# 确认测试环境无误后，在生产环境执行
mysql -u root -p internet_hospital < internet-hospital-mall/sql/alter_t_drug_add_mall_fields.sql

# ==================== 步骤 5: 验证字段添加成功 ====================
mysql -u root -p internet_hospital -e "DESC t_drug;" | grep -E "sales|original_price|is_recommended|category_id"

# 预期输出应包含以下字段：
# sales                | int          | YES  |     | 0
# original_price       | decimal(16,2)| YES  |     | NULL
# is_recommended       | tinyint(1)   | YES  |     | 0
# category_id          | bigint       | YES  | MUL | NULL
# add_to_cart_count    | int          | YES  |     | 0
# is_free_shipping     | tinyint(1)   | YES  |     | 1
# has_price_guarantee  | tinyint(1)   | YES  |     | 1
# price_guarantee_days | int          | YES  |     | 7
# has_installment      | tinyint(1)   | YES  |     | 0
# installment_info     | varchar(100) | YES  |     | NULL
# is_new               | tinyint(1)   | YES  |     | 0

# ==================== 步骤 6: 初始化数据（可选） ====================
# 为现有药品设置合适的默认值
mysql -u root -p internet_hospital <<EOF
-- 设置推荐药品（根据销量或其他业务规则）
UPDATE t_drug SET is_recommended = 1 WHERE id IN (1, 2, 3, 4, 5);

-- 设置原价（用于闪购折扣计算）
UPDATE t_drug SET original_price = price * 1.2 WHERE id IN (1, 2, 3);

-- 设置新品标识
UPDATE t_drug SET is_new = 1 WHERE create_time > DATE_SUB(NOW(), INTERVAL 30 DAY);
EOF
```

**验收标准**:
- [ ] 数据库已备份
- [ ] 所有字段添加成功
- [ ] 索引创建成功
- [ ] 现有数据未受影响
- [ ] 应用启动正常

**回滚方案**（如果出现问题）:
```bash
# 方案 1: 从备份恢复
mysql -u root -p internet_hospital < backup_YYYYMMDD_HHMMSS.sql

# 方案 2: 手动删除字段
mysql -u root -p internet_hospital <<EOF
ALTER TABLE t_drug DROP COLUMN sales;
ALTER TABLE t_drug DROP COLUMN add_to_cart_count;
ALTER TABLE t_drug DROP COLUMN is_free_shipping;
ALTER TABLE t_drug DROP COLUMN has_price_guarantee;
ALTER TABLE t_drug DROP COLUMN price_guarantee_days;
ALTER TABLE t_drug DROP COLUMN has_installment;
ALTER TABLE t_drug DROP COLUMN installment_info;
ALTER TABLE t_drug DROP COLUMN is_new;
ALTER TABLE t_drug DROP COLUMN is_recommended;
ALTER TABLE t_drug DROP COLUMN original_price;
ALTER TABLE t_drug DROP COLUMN category_id;
EOF
```

---

### 🟡 中优先级 - 可以自动执行

#### 任务 1.5: 添加图片 JSON 解析

**风险等级**: 🟡 中风险（代码修改）  
**预计工时**: 2小时  
**状态**: ✅ 已准备好执行

**需要修改的文件**:
1. `DrugDTO.java` - 添加 `drugImages` 字段
2. `DrugMallServiceImpl.java` - 添加 `parseDrugImages` 方法

**实现方案**:

**文件 1: DrugDTO.java**
```java
// 在 DrugDTO 类中添加新字段（在 picPosition 字段后面）

@ApiModelProperty(value = "药品图片列表（解析后）")
private List<String> drugImages;
```

**文件 2: DrugMallServiceImpl.java**
```java
// 添加导入
import com.alibaba.fastjson.JSON;
import java.util.Collections;

// 在类中添加私有方法
/**
 * 解析药品图片JSON
 * 
 * @param picPosition 图片JSON字符串，格式: ["url1", "url2", ...]
 * @return 图片URL列表
 */
private List<String> parseDrugImages(String picPosition) {
    if (StringUtils.isEmpty(picPosition)) {
        return Collections.emptyList();
    }
    try {
        return JSON.parseArray(picPosition, String.class);
    } catch (Exception e) {
        log.error("解析药品图片失败: {}", picPosition, e);
        return Collections.emptyList();
    }
}

// 在 getRecommendedDrugs 方法中调用（在返回前）
@Override
public List<DrugDTO> getRecommendedDrugs(Integer limit) {
    // ... 现有代码 ...
    
    // 解析图片JSON
    if (!CollectionUtils.isEmpty(drugs)) {
        for (DrugDTO drug : drugs) {
            if (!StringUtils.isEmpty(drug.getPicPosition())) {
                List<String> images = parseDrugImages(drug.getPicPosition());
                drug.setDrugImages(images);
                // 设置第一张图片为主图
                if (!images.isEmpty()) {
                    drug.setImageUrl(images.get(0));
                }
            }
        }
    }
    
    return drugs;
}

// 在 getDrugDetail 方法中也调用（在返回前）
@Override
public DrugDTO getDrugDetail(Long drugId) {
    // ... 现有代码 ...
    
    // 解析图片JSON
    if (!StringUtils.isEmpty(drug.getPicPosition())) {
        List<String> images = parseDrugImages(drug.getPicPosition());
        drug.setDrugImages(images);
        if (!images.isEmpty()) {
            drug.setImageUrl(images.get(0));
        }
    }
    
    return drug;
}
```

**验收标准**:
- [ ] `parseDrugImages` 方法添加成功
- [ ] `DrugDTO` 添加 `drugImages` 字段
- [ ] `getRecommendedDrugs` 方法调用解析方法
- [ ] `getDrugDetail` 方法调用解析方法
- [ ] 异常情况返回空列表
- [ ] 日志记录解析错误
- [ ] 编译通过，无语法错误

**测试方法**:
```bash
# 1. 编译项目
cd internet-hospital-mall/adinnet-patient-api
mvn clean compile

# 2. 启动服务
mvn spring-boot:run

# 3. 测试 API
curl -X GET "http://localhost:8092/api/v1/mall/drugs/recommended?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. 检查响应中是否包含 drugImages 字段
# 预期响应:
{
  "code": 200,
  "data": [
    {
      "id": 1001,
      "name": "阿莫西林胶囊",
      "picPosition": "[\"url1\", \"url2\"]",
      "drugImages": ["url1", "url2"],  # 新增字段
      "imageUrl": "url1"                # 主图
    }
  ]
}
```

---

#### 任务 1.2: 实现闪购药品筛选逻辑

**风险等级**: 🟢 低风险（纯业务逻辑）  
**预计工时**: 2小时  
**状态**: ✅ 已准备好执行

**实现方案**: 在 Service 层添加闪购药品方法

**文件: DrugMallService.java（接口）**
```java
/**
 * 获取闪购药品列表
 * 
 * @param limit 返回数量限制
 * @return 闪购药品列表
 */
List<DrugDTO> getFlashSaleDrugs(Integer limit);
```

**文件: DrugMallServiceImpl.java（实现）**
```java
@Override
public List<DrugDTO> getFlashSaleDrugs(Integer limit) {
    if (limit == null || limit <= 0) {
        limit = 10; // 默认10个
    }

    String cacheKey = CacheConstants.FLASH_SALE_DRUGS + ":" + limit;
    
    // 先从缓存获取
    List<DrugDTO> drugs = cacheUtil.getList(cacheKey, DrugDTO.class);
    if (!CollectionUtils.isEmpty(drugs)) {
        log.debug("从缓存获取闪购药品列表，数量: {}", drugs.size());
        return drugs;
    }

    // 缓存未命中，从推荐药品中筛选
    List<DrugDTO> recommendedDrugs = getRecommendedDrugs(limit * 2);
    
    // 筛选有折扣的药品
    drugs = recommendedDrugs.stream()
        .filter(drug -> {
            // 必须有原价
            if (drug.getOriginalPrice() == null) {
                return false;
            }
            // 必须有库存
            if (drug.getQuantity() == null || drug.getQuantity() <= 0) {
                return false;
            }
            // 价格必须低于原价（有折扣）
            return drug.getPrice().compareTo(drug.getOriginalPrice()) < 0;
        })
        .limit(limit)
        .collect(Collectors.toList());
    
    if (!CollectionUtils.isEmpty(drugs)) {
        // 存入缓存，缓存10分钟
        cacheUtil.setList(cacheKey, drugs, CacheConstants.CACHE_EXPIRE_10MIN);
        log.info("查询闪购药品列表成功，数量: {}", drugs.size());
    }

    return drugs;
}
```

**文件: CacheConstants.java（添加常量）**
```java
/**
 * 闪购药品缓存key前缀
 */
public static final String FLASH_SALE_DRUGS = "mall:flash_sale_drugs";
```

**文件: DrugMallController.java（添加接口）**
```java
/**
 * 获取闪购药品列表
 */
@GetMapping("/drugs/flash-sale")
@ApiOperation(value = "获取闪购药品列表", notes = "返回有折扣且有库存的药品")
public ApiResponse<List<DrugDTO>> getFlashSaleDrugs(
    @RequestParam(value = "limit", required = false, defaultValue = "10") 
    @ApiParam(value = "返回数量限制，默认10，最大50") 
    Integer limit) {
    
    // 参数验证
    if (limit > 50) {
        limit = 50;
    }
    
    List<DrugDTO> drugs = drugMallService.getFlashSaleDrugs(limit);
    return ApiResponse.success(drugs);
}
```

**验收标准**:
- [ ] 接口方法添加成功
- [ ] 实现类方法添加成功
- [ ] Controller 接口添加成功
- [ ] 缓存常量添加成功
- [ ] 筛选逻辑正确（有折扣 + 有库存）
- [ ] 缓存机制正常工作
- [ ] 编译通过，无语法错误

**测试方法**:
```bash
# 1. 编译项目
cd internet-hospital-mall/adinnet-patient-api
mvn clean compile

# 2. 启动服务
mvn spring-boot:run

# 3. 测试闪购 API
curl -X GET "http://localhost:8092/api/v1/mall/drugs/flash-sale?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. 验证返回的药品都有折扣
# 预期: 所有药品的 price < originalPrice
```

---

## 📊 执行顺序建议

### 方案 1: 保守方案（推荐）

```
1. 任务 1.5: 添加图片 JSON 解析（2小时）
   ↓
2. 任务 1.2: 实现闪购药品筛选（2小时）
   ↓
3. 测试和验证（1小时）
   ↓
4. 等待人工确认数据库迁移
   ↓
5. 任务 1.4: 执行数据库迁移（30分钟）
```

**优点**:
- 先执行低风险任务
- 数据库迁移最后执行，有充分时间准备
- 即使数据库迁移失败，前端功能也能部分工作

### 方案 2: 激进方案（不推荐）

```
1. 任务 1.4: 执行数据库迁移（30分钟）
   ↓
2. 任务 1.5: 添加图片 JSON 解析（2小时）
   ↓
3. 任务 1.2: 实现闪购药品筛选（2小时）
```

**缺点**:
- 数据库迁移失败会阻塞后续任务
- 风险较高

---

## ✅ 执行检查清单

### 执行前检查
- [ ] 代码已提交到 Git
- [ ] 数据库已备份（如果要执行迁移）
- [ ] 测试环境可用
- [ ] 有回滚方案

### 执行中检查
- [ ] 每个任务完成后编译通过
- [ ] 每个任务完成后运行测试
- [ ] 每个任务完成后提交代码
- [ ] 记录执行日志

### 执行后检查
- [ ] 所有测试通过
- [ ] API 响应正常
- [ ] 日志无错误
- [ ] 更新 CHANGELOG.md
- [ ] 更新任务状态

---

## 🚨 风险提示

1. **数据库迁移风险**
   - ⚠️ 必须先备份
   - ⚠️ 先在测试环境验证
   - ⚠️ 在业务低峰期执行
   - ⚠️ 准备好回滚方案

2. **代码修改风险**
   - ⚠️ 修改前先提交现有代码
   - ⚠️ 每次修改后立即测试
   - ⚠️ 使用 Git 分支隔离变更

3. **性能风险**
   - ⚠️ 闪购筛选可能影响性能
   - ⚠️ 图片解析可能增加响应时间
   - ⚠️ 需要监控 API 响应时间

---

## 📞 需要帮助？

如果在执行过程中遇到问题：

1. **数据库问题**: 立即停止，检查备份，联系 DBA
2. **编译错误**: 检查依赖，查看错误日志
3. **运行时错误**: 查看应用日志，检查配置
4. **性能问题**: 使用 Profiler 分析，优化查询

---

**文档创建时间**: 2026-02-10T00:30:00+08:00  
**负责人**: Kiro AI Assistant  
**执行模式**: 渐进式、安全优先

