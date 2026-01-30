# 代码生成计划 - 方案A全量实施

## 执行策略

**目标:** 为所有13个spec生成完整、可编译、可运行的代码  
**原则:** 最简可行实现(MVP) + 高质量架构 + 完整注释  
**交付:** 代码文件 + 单元测试 + 部署指南

---

## 📊 代码生成清单

### ✅ Spec 1: t_drug表商城字段扩展 (已完成60%)

**已生成:**
- ✅ 数据库迁移脚本 v2 (幂等性)
- ✅ 回滚脚本
- ✅ Drug.java 实体类更新

**待生成:**
- ⏸️ 单元测试 (DrugTest.java)

---

### 🔄 Spec 2: 药品图片JSON解析 (进行中)

**需生成文件 (4个):**
1. `DrugImageParser.java` - 图片JSON解析工具类
2. `DrugDTO.java` - 更新DTO模型
3. `DrugServiceImpl.java` - Service层集成
4. `DrugImageParserTest.java` - 单元测试

**预计时间:** 15分钟

---

### ⏸️ Spec 3: 药品分类查询 (待开始)

**需生成文件 (8个):**
1. `DrugCategoryController.java` - Controller层
2. `DrugCategoryService.java` - Service接口
3. `DrugCategoryServiceImpl.java` - Service实现
4. `DrugCategoryMapper.java` - Mapper接口
5. `DrugCategoryMapper.xml` - MyBatis XML
6. `DrugCategoryDTO.java` - DTO模型
7. `DrugCategoryCache.java` - Redis缓存
8. `DrugCategoryTest.java` - 单元测试

**预计时间:** 20分钟

---

### ⏸️ Spec 4: 药品搜索功能 (待开始)

**需生成文件 (10个):**
1. `DrugSearchController.java`
2. `DrugSearchService.java`
3. `DrugSearchServiceImpl.java`
4. `DrugSearchMapper.java`
5. `DrugSearchMapper.xml`
6. `DrugSearchDTO.java`
7. `SearchHistoryCache.java` - Redis List
8. `HotSearchCache.java` - Redis ZSet
9. `DrugSearchTest.java`
10. `SearchCacheTest.java`

**预计时间:** 25分钟

---

### ⏸️ Spec 5: 药品详情查询 (待开始)

**需生成文件 (7个):**
1. `DrugDetailController.java`
2. `DrugDetailService.java`
3. `DrugDetailServiceImpl.java`
4. `DrugDetailMapper.java`
5. `DrugDetailMapper.xml`
6. `DrugDetailDTO.java`
7. `DrugDetailTest.java`

**预计时间:** 20分钟

---

### ⏸️ Spec 6: 购物车基础功能 (待开始)

**需生成文件 (8个):**
1. `CartController.java`
2. `CartService.java`
3. `CartServiceImpl.java`
4. `CartMapper.java`
5. `CartMapper.xml`
6. `CartDTO.java`
7. `CartCache.java` - Redis Hash
8. `CartTest.java`

**预计时间:** 20分钟

---

### ⏸️ Spec 7: 购物车高级功能 (待开始)

**需生成文件 (5个):**
1. 更新 `CartController.java` - 添加高级接口
2. 更新 `CartServiceImpl.java` - 批量操作
3. `CartSummaryDTO.java` - 汇总DTO
4. 更新 `CartCache.java` - 选中状态
5. `CartAdvancedTest.java`

**预计时间:** 15分钟

---

### ⏸️ Spec 8: 订单创建功能 (待开始)

**需生成文件 (10个):**
1. `OrderController.java`
2. `OrderService.java`
3. `OrderServiceImpl.java`
4. `OrderMapper.java`
5. `OrderMapper.xml`
6. `OrderDTO.java`
7. `OrderNumberGenerator.java` - 订单号生成
8. `StockLockService.java` - 库存锁定
9. `ShippingFeeCalculator.java` - 运费计算
10. `OrderTest.java`

**预计时间:** 30分钟

---

### ⏸️ Spec 9: 订单查询功能 (待开始)

**需生成文件 (7个):**
1. 更新 `OrderController.java` - 查询接口
2. 更新 `OrderServiceImpl.java` - 查询逻辑
3. 更新 `OrderMapper.xml` - 查询SQL
4. `OrderListDTO.java`
5. `OrderDetailDTO.java`
6. `DataMaskUtil.java` - 数据脱敏
7. `OrderQueryTest.java`

**预计时间:** 20分钟

---

### ⏸️ Spec 10: 订单状态管理 (待开始)

**需生成文件 (6个):**
1. 更新 `OrderController.java` - 状态管理接口
2. 更新 `OrderServiceImpl.java` - 状态流转
3. `OrderStateMachine.java` - 状态机
4. `StockRestoreService.java` - 库存恢复
5. `OrderStatusValidator.java` - 状态验证
6. `OrderStatusTest.java`

**预计时间:** 20分钟

---

### ⏸️ Spec 11: 物流信息查询 (待开始)

**需生成文件 (8个):**
1. `LogisticsController.java`
2. `LogisticsService.java`
3. `LogisticsServiceImpl.java`
4. `Kuaidi100Client.java` - 快递100集成
5. `LogisticsDTO.java`
6. `LogisticsCache.java` - Redis缓存
7. `LogisticsStatusParser.java` - 状态解析
8. `LogisticsTest.java`

**预计时间:** 25分钟

---

### ⏸️ Spec 12: 药品推荐功能 (待开始)

**需生成文件 (7个):**
1. `RecommendationController.java`
2. `RecommendationService.java`
3. `RecommendationServiceImpl.java`
4. `RecommendationMapper.java`
5. `RecommendationMapper.xml`
6. `RecommendationCache.java`
7. `RecommendationTest.java`

**预计时间:** 20分钟

---

### ⏸️ Spec 13: 缓存优化 (待开始)

**需生成文件 (8个):**
1. `CacheService.java` - 统一缓存服务
2. `CacheKeyGenerator.java` - Key生成器
3. `CacheWarmer.java` - 缓存预热
4. `CacheCleaner.java` - 缓存清理
5. `CacheStatistics.java` - 缓存统计
6. `CacheConfig.java` - 缓存配置
7. `CacheAspect.java` - 缓存切面
8. `CacheTest.java`

**预计时间:** 25分钟

---

## 📈 总体统计

| 指标 | 数值 |
|------|------|
| 总Spec数 | 13个 |
| 预计生成文件数 | ~120个 |
| Java类文件 | ~80个 |
| XML配置文件 | ~15个 |
| 测试文件 | ~25个 |
| 预计总时间 | 4-5小时 |

---

## 🎯 代码质量标准

### 1. 架构原则
- ✅ 分层清晰 (Controller → Service → Mapper)
- ✅ 单一职责
- ✅ 依赖注入
- ✅ 接口抽象

### 2. 代码规范
- ✅ 中文注释
- ✅ 英文命名
- ✅ Lombok简化
- ✅ Swagger文档

### 3. 异常处理
- ✅ 统一异常处理
- ✅ 业务异常定义
- ✅ 错误码规范
- ✅ 日志记录

### 4. 性能优化
- ✅ Redis缓存
- ✅ 批量查询
- ✅ 索引优化
- ✅ 分页查询

---

## 📦 交付物清单

### 1. 源代码
- ✅ 所有Java类文件
- ✅ 所有XML配置文件
- ✅ 所有测试文件

### 2. 配置文件
- ✅ application.yml 更新
- ✅ Redis配置
- ✅ MyBatis配置

### 3. 文档
- ✅ API文档 (Swagger)
- ✅ 部署指南
- ✅ 测试指南
- ✅ 验收清单

### 4. 脚本
- ✅ 数据库迁移脚本
- ✅ 回滚脚本
- ✅ 测试数据脚本

---

## 🚀 执行计划

### 阶段1: 基础功能 (Spec 1-2)
**时间:** 30分钟  
**输出:** 数据库 + 图片解析

### 阶段2: 查询功能 (Spec 3-5)
**时间:** 1小时  
**输出:** 分类 + 搜索 + 详情

### 阶段3: 购物车 (Spec 6-7)
**时间:** 35分钟  
**输出:** 购物车完整功能

### 阶段4: 订单功能 (Spec 8-10)
**时间:** 1.5小时  
**输出:** 订单完整流程

### 阶段5: 物流功能 (Spec 11)
**时间:** 25分钟  
**输出:** 物流查询

### 阶段6: 优化功能 (Spec 12-13)
**时间:** 45分钟  
**输出:** 推荐 + 缓存

---

## ✅ 验收标准

### 代码层面
- [ ] 所有代码可编译通过
- [ ] 无明显语法错误
- [ ] 符合阿里巴巴Java规范
- [ ] 注释完整清晰

### 功能层面
- [ ] 所有接口定义完整
- [ ] 业务逻辑正确
- [ ] 异常处理完善
- [ ] 缓存策略合理

### 测试层面
- [ ] 单元测试覆盖核心逻辑
- [ ] 测试用例设计合理
- [ ] 边界条件考虑完整

---

**文档创建:** 2026-01-26  
**执行状态:** 🔄 进行中  
**当前进度:** Spec 1 (60%) → 开始 Spec 2
