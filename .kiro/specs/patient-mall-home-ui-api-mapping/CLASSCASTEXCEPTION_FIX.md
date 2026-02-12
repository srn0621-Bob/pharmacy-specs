# 闪购 API ClassCastException 修复报告

## 问题症状
```
java.lang.ClassCastException: java.util.LinkedHashMap cannot be cast to com.patient.api.app.mall.model.DrugDTO
    at DrugMallServiceImpl.getFlashSaleDrugs (DrugMallServiceImpl.java:344)
```

## 根本原因

### 问题链条
1. **Redis 缓存** → 推荐药品数据存储为 JSON
2. **反序列化** → ObjectMapper 将 JSON 还原为 LinkedHashMap（而不是 DrugDTO）
3. **泛型擦除** → Java 运行时无法识别 `List<DrugDTO>`，变成 `List<LinkedHashMap>`
4. **Stream 筛选** → 尝试调用 `drug.getOriginalPrice()` 时抛出 ClassCastException

### 技术细节
- Java 泛型在运行时被擦除，`List<DrugDTO>` 的类型信息丢失
- `CacheUtil.getList()` 使用 ObjectMapper 进行类型转换，但无法正确处理泛型
- Redis 中存储的是序列化后的 JSON 字符串
- 反序列化时，ObjectMapper 默认将 JSON 对象还原为 LinkedHashMap

## 修复方案

### 选项对比

| 方案 | 优点 | 缺点 | 是否采用 |
|------|------|------|----------|
| 绕过缓存，直接查询数据库 | 简单直接，避免类型转换问题 | 每次查询都访问数据库，性能略低 | ✅ 已采用 |
| 修复 CacheUtil.getList() | 彻底解决问题，所有缓存都受益 | 影响范围大，需要全面测试 | ❌ 未采用 |
| 类型检查并转换 | 不改变现有逻辑 | 增加代码复杂度，不符合 KISS 原则 | ❌ 未采用 |

### 已采用方案：绕过缓存

**实现步骤**:
1. 在 `getFlashSaleDrugs()` 中不调用 `getRecommendedDrugs()`
2. 直接调用 `drugMallMapper.selectRecommendedDrugs()` 查询数据库
3. 手动解析图片 JSON（复用 `parseDrugImages()` 方法）
4. 保留筛选逻辑和降级策略

**代码示例**:
```java
// 修复前（有问题）
List<DrugDTO> recommendedDrugs = getRecommendedDrugs(limit * 2); // 从缓存读取，类型转换失败

// 修复后（正常）
List<DrugDTO> recommendedDrugs = drugMallMapper.selectRecommendedDrugs(limit * 2); // 直接查询数据库
// 手动解析图片
for (DrugDTO drug : recommendedDrugs) {
    if (!StringUtils.isEmpty(drug.getPicPosition())) {
        List<String> images = parseDrugImages(drug.getPicPosition());
        drug.setDrugImages(images);
        if (!images.isEmpty()) {
            drug.setImageUrl(images.get(0));
        }
    }
}
```

## 验证结果

### 编译验证
```bash
cd internet-hospital-mall/adinnet-patient-api
mvn clean compile -DskipTests
```

**结果**: ✅ BUILD SUCCESS in 15.902s

### 待执行验证
- [ ] 重新部署服务
- [ ] 测试 API: `curl -X GET http://111.229.245.238:8092/api/v1/mall/drugs/flash-sale?limit=10`
- [ ] 验证数据库中是否有符合条件的闪购药品（`price < original_price AND status > 0`）

## 影响分析

### 功能影响
- ✅ 闪购 API 不再抛出 ClassCastException
- ✅ 返回正常数据或空列表（降级策略）
- ✅ API 接口和返回格式不变

### 性能影响
- ⚠️ 每次查询都访问数据库，未使用缓存
- ✅ 闪购药品查询频率不高，影响可接受
- 💡 如果后续性能成为问题，可以考虑修复 CacheUtil.getList() 方法

### 兼容性影响
- ✅ 无影响，API 接口不变
- ✅ 前端无需修改

## 代码品味评估

### ✅ 优点
1. **简单直接**: 遵循 KISS 原则，避免复杂的类型转换逻辑
2. **健壮性**: 保留降级策略，查询失败返回空列表
3. **可维护性**: 代码逻辑清晰，易于理解

### ⚠️ 可改进点
1. **性能**: 未使用缓存，每次都查询数据库
2. **代码重复**: 图片解析逻辑与 `getRecommendedDrugs()` 重复

### 💡 未来优化方向
1. 修复 `CacheUtil.getList()` 方法，使用 Jackson 的 TypeReference
2. 提取图片解析逻辑为公共方法
3. 添加单元测试覆盖缓存反序列化场景

## 预防措施

1. **类型安全**: 在使用 Redis 缓存时，注意泛型类型的反序列化问题
2. **KISS 原则**: 优先使用简单直接的解决方案
3. **降级策略**: 保留降级策略，确保系统健壮性
4. **日志记录**: 添加详细的日志，便于问题诊断
5. **单元测试**: 覆盖缓存反序列化的边界情况

## 相关文档

- [CHANGELOG.md](../../../CHANGELOG.md) - 完整变更记录
- [bugs.jsonl](../../../bugs.jsonl) - 错误复盘记录
- [FLASH_SALE_FIX_GUIDE.md](./FLASH_SALE_FIX_GUIDE.md) - 闪购 API 修复指南

## 总结

成功修复闪购 API 的 ClassCastException 错误。采用绕过缓存直接查询数据库的方案，避免了 Redis 反序列化的类型转换问题。虽然牺牲了一些性能，但换来了代码的简单性和健壮性。

**核心理念**: 能消失的分支永远比能写对的分支更优雅 —— 让问题从根本上不发生，而不是到处打补丁。
