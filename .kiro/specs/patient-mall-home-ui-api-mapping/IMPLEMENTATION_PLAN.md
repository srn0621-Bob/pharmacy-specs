# 患者端药品商城首页实施计划

## 📋 当前状态

根据 API_REUSE_ANALYSIS.md 和代码检查，现有后端 API 已实现 **90%** 功能：

### ✅ 已实现的 API
| API | 路径 | 状态 | 说明 |
|-----|------|------|------|
| 推荐药品 | `GET /api/v1/mall/drugs/recommended` | ✅ 已实现 | 可直接使用 |
| 药品分类 | `GET /api/v1/mall/drugs/categories` | ✅ 已实现 | 可直接使用 |
| 药品搜索 | `GET /api/v1/mall/drugs/search` | ✅ 已实现 | 可直接使用 |
| 药品详情 | `GET /api/v1/mall/drugs/{drugId}` | ✅ 已实现 | 可直接使用 |
| 首页聚合 | `POST /api/v1/homepage/list` | ✅ 已实现 | 返回轮播图和标签 |

### ⚠️ 需要调整的功能
| 功能 | 状态 | 解决方案 |
|------|------|----------|
| 闪购药品 | ⚠️ 无独立接口 | 复用推荐药品接口 + 筛选 |
| 商城扩展字段 | ⚠️ 未添加 | 执行数据库迁移脚本 |
| 图片 JSON 解析 | ⚠️ 未实现 | Service 层添加解析方法 |

---

## 🎯 实施计划（按优先级）

### 阶段 1: 后端验证和调整（1-2天）

#### 任务 1.1: 验证推荐药品 API ✅
**优先级**: P0（最高）  
**预计工时**: 1小时

**验证步骤**:
```bash
# 1. 启动后端服务
cd internet-hospital-mall/adinnet-patient-api
mvn spring-boot:run

# 2. 测试 API
curl -X GET "http://localhost:8092/api/v1/mall/drugs/recommended?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. 检查响应格式
# 预期响应:
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": "1001",
      "name": "阿莫西林胶囊",
      "spec": "0.25g*24粒",
      "price": 15.80,
      "imageUrl": "...",
      "sales": 1250,
      "stock": 500
    }
  ]
}
```

**验收标准**:
- [ ] API 能正常访问
- [ ] 返回数据格式正确
- [ ] limit 参数生效
- [ ] 返回的药品数量符合预期

---

#### 任务 1.2: 验证首页聚合 API ✅
**优先级**: P0（最高）  
**预计工时**: 1小时

**验证步骤**:
```bash
# 测试首页聚合 API
curl -X POST "http://localhost:8092/api/v1/homepage/list" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId": "123456"}'

# 预期响应:
{
  "code": 200,
  "msg": "success",
  "data": {
    "bannerResult": [...],  # 轮播图
    "tagList": [...]        # 热门标签
  }
}
```

**验收标准**:
- [ ] API 能正常访问
- [ ] 返回 bannerResult 字段
- [ ] 返回 tagList 字段
- [ ] 数据格式符合前端需求

---

#### 任务 1.3: 执行数据库迁移 ⚠️
**优先级**: P0（必须）  
**预计工时**: 30分钟

**执行步骤**:
```bash
# 1. 检查迁移脚本是否存在
ls internet-hospital-mall/sql/alter_t_drug_add_mall_fields.sql

# 2. 备份数据库
mysqldump -u root -p internet_hospital > backup_$(date +%Y%m%d).sql

# 3. 执行迁移脚本
mysql -u root -p internet_hospital < internet-hospital-mall/sql/alter_t_drug_add_mall_fields.sql

# 4. 验证字段添加成功
mysql -u root -p internet_hospital -e "DESC t_drug;"
```

**新增字段**:
- `sales` - 销量
- `original_price` - 原价
- `is_recommended` - 是否推荐
- `is_new` - 是否新品
- `is_free_shipping` - 是否包邮
- `category_id` - 商城分类ID

**验收标准**:
- [ ] 所有字段添加成功
- [ ] 字段类型正确
- [ ] 默认值设置正确
- [ ] 索引创建成功

---

#### 任务 1.4: 添加图片 JSON 解析 ⚠️
**优先级**: P1（重要）  
**预计工时**: 2小时

**实现步骤**:

1. **在 DrugMallServiceImpl 中添加解析方法**:
```java
/**
 * 解析药品图片JSON
 * 
 * @param picPosition 图片JSON字符串
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
```

2. **在 getRecommendedDrugs 方法中调用**:
```java
@Override
public List<DrugDTO> getRecommendedDrugs(Integer limit) {
    // ... 现有代码 ...
    
    // 解析图片JSON
    for (DrugDTO drug : drugs) {
        if (drug.getPicPosition() != null) {
            List<String> images = parseDrugImages(drug.getPicPosition());
            drug.setDrugImages(images);
        }
    }
    
    return drugs;
}
```

3. **更新 DrugDTO 模型**:
```java
public class DrugDTO {
    // ... 现有字段 ...
    
    /**
     * 药品图片列表（解析后）
     */
    private List<String> drugImages;
}
```

**验收标准**:
- [ ] 图片 JSON 能正确解析
- [ ] 返回的 drugImages 字段包含图片列表
- [ ] 异常情况返回空列表
- [ ] 日志记录解析错误

---

#### 任务 1.5: 实现闪购药品筛选逻辑 ⚠️
**优先级**: P1（重要）  
**预计工时**: 2小时

**方案 1: 前端筛选（推荐）**

在 MallHomePresenter 中实现：
```java
/**
 * 获取闪购药品
 */
private void loadFlashSaleDrugs() {
    // 1. 调用推荐药品 API
    apiService.getRecommendedDrugs(20)
        .subscribeOn(Schedulers.io())
        .observeOn(AndroidSchedulers.mainThread())
        .subscribe(response -> {
            if (response.isSuccess()) {
                List<Drug> allDrugs = response.getData();
                
                // 2. 筛选有折扣的药品
                List<Drug> flashSaleDrugs = allDrugs.stream()
                    .filter(drug -> drug.getOriginalPrice() != null 
                                 && drug.getPrice() < drug.getOriginalPrice()
                                 && drug.getStock() > 0)
                    .limit(10)
                    .collect(Collectors.toList());
                
                // 3. 显示闪购药品
                view.showFlashSaleDrugs(flashSaleDrugs);
            }
        });
}
```

**方案 2: Service 层筛选（可选）**

在 DrugMallServiceImpl 中添加：
```java
@Override
public List<DrugDTO> getFlashSaleDrugs(Integer limit) {
    // 1. 获取推荐药品
    List<DrugDTO> recommendedDrugs = getRecommendedDrugs(limit * 2);
    
    // 2. 筛选闪购药品
    return recommendedDrugs.stream()
        .filter(drug -> drug.getOriginalPrice() != null 
                     && drug.getPrice().compareTo(drug.getOriginalPrice()) < 0
                     && drug.getStock() > 0)
        .limit(limit)
        .collect(Collectors.toList());
}
```

**验收标准**:
- [ ] 能正确筛选有折扣的药品
- [ ] 只返回有库存的药品
- [ ] 数量限制生效
- [ ] 性能满足要求（< 500ms）

---

### 阶段 2: 前端集成（2-3天）

#### 任务 2.1: 定义前端 API 接口
**优先级**: P0  
**预计工时**: 2小时

在 `MallApiService.java` 中定义：
```java
public interface MallApiService {
    /**
     * 获取首页聚合数据
     */
    @POST("/api/v1/homepage/list")
    Observable<ApiResponse<HomeData>> getHomeData(@Body Map<String, Object> params);
    
    /**
     * 获取推荐药品
     */
    @GET("/api/v1/mall/drugs/recommended")
    Observable<ApiResponse<List<Drug>>> getRecommendedDrugs(@Query("limit") int limit);
}
```

---

#### 任务 2.2: 实现 Presenter 层
**优先级**: P0  
**预计工时**: 4小时

在 `MallHomePresenter.java` 中实现：
```java
public void loadHomeData() {
    view.showLoading();
    
    // 并发调用多个 API
    Observable.zip(
        apiService.getHomeData(params),
        apiService.getRecommendedDrugs(20),
        (homeData, recommendDrugs) -> {
            // 合并数据
            MallHomeData data = new MallHomeData();
            data.setBanners(homeData.getBannerResult());
            data.setTags(homeData.getTagList());
            data.setRecommendDrugs(recommendDrugs);
            
            // 筛选闪购药品
            List<Drug> flashSaleDrugs = filterFlashSaleDrugs(recommendDrugs);
            data.setFlashSaleDrugs(flashSaleDrugs);
            
            return data;
        }
    )
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(
        data -> {
            view.hideLoading();
            view.showHomeData(data);
        },
        error -> {
            view.hideLoading();
            view.showError(error.getMessage());
        }
    );
}
```

---

#### 任务 2.3: 更新 View 层
**优先级**: P0  
**预计工时**: 3小时

在 `MallHomeFragment.java` 中实现：
```java
@Override
public void showHomeData(MallHomeData data) {
    // 显示轮播图
    showBanners(data.getBanners());
    
    // 显示热门标签
    showTags(data.getTags());
    
    // 显示闪购药品
    showFlashSaleDrugs(data.getFlashSaleDrugs());
    
    // 显示推荐药品
    showRecommendDrugs(data.getRecommendDrugs());
}
```

---

### 阶段 3: 测试和优化（1-2天）

#### 任务 3.1: 集成测试
**优先级**: P1  
**预计工时**: 4小时

**测试场景**:
1. 首页加载流程
2. 下拉刷新流程
3. 点击跳转流程
4. 错误处理流程
5. 缓存机制测试

---

#### 任务 3.2: 性能优化
**优先级**: P1  
**预计工时**: 3小时

**优化项**:
1. 实现三级缓存（内存、磁盘、Redis）
2. 图片加载优化（Glide 配置）
3. 列表滚动优化（ViewHolder 复用）
4. API 并发调用优化

---

## 📊 总体时间估算

| 阶段 | 任务数 | 预计工时 | 状态 |
|------|--------|----------|------|
| 阶段 1: 后端验证和调整 | 5 | 1-2天 | ⏳ 进行中 |
| 阶段 2: 前端集成 | 3 | 2-3天 | ⏸️ 待开始 |
| 阶段 3: 测试和优化 | 2 | 1-2天 | ⏸️ 待开始 |
| **总计** | **10** | **4-7天** | - |

---

## ✅ 验收标准

### 功能验收
- [ ] 用户进入首页，2秒内看到完整内容
- [ ] 轮播图自动轮播，点击跳转正常
- [ ] 快捷入口点击跳转正常
- [ ] 闪购药品横向滚动正常
- [ ] 推荐药品2列网格显示正常
- [ ] 下拉刷新功能正常
- [ ] 网络错误时显示友好提示

### 性能验收
- [ ] 首页加载时间 < 2秒
- [ ] 列表滚动帧率 > 50fps
- [ ] 图片加载流畅，无卡顿
- [ ] 缓存命中率 > 80%

### 数据验收
- [ ] 推荐药品数据正确
- [ ] 闪购药品筛选正确
- [ ] 轮播图数据正确
- [ ] 热门标签数据正确

---

## 🚨 风险提示

1. **数据库迁移风险**
   - 必须先备份数据库
   - 在测试环境验证后再在生产环境执行

2. **API 响应时间**
   - 如果响应时间 > 2秒，需要优化数据库查询或增加缓存

3. **图片加载慢**
   - 如果图片较大，需要后端提供缩略图或前端压缩

4. **闪购筛选性能**
   - 如果推荐药品数量很大，前端筛选可能影响性能
   - 建议在 Service 层实现筛选逻辑

---

## 📝 下一步行动

### 立即执行（今天）
1. ✅ 启动后端服务
2. ✅ 验证推荐药品 API
3. ✅ 验证首页聚合 API
4. ⚠️ 执行数据库迁移

### 明天执行
1. 添加图片 JSON 解析
2. 实现闪购药品筛选逻辑
3. 开始前端集成

### 本周完成
1. 完成前端集成
2. 完成集成测试
3. 完成性能优化

---

**文档创建时间**: 2026-02-09T23:45:00+08:00  
**最后更新时间**: 2026-02-09T23:45:00+08:00  
**负责人**: Kiro AI Assistant
