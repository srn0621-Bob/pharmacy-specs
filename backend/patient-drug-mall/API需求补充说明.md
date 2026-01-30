# 药品商城API需求补充说明

## 文档概述

本文档列出了基于新的商城首页布局设计,需要补充或修改的后端API接口。

---

## API现状检查

### ✅ 已实现的API

#### 1. 购物车相关API
- ✅ `GET /api/v1/mall/cart/{userId}/count` - 获取购物车商品数量
- ✅ `POST /api/v1/mall/cart/add` - 添加商品到购物车
- ✅ `GET /api/v1/mall/cart/{userId}` - 获取购物车列表
- ✅ `PUT /api/v1/mall/cart/update` - 更新购物车商品数量
- ✅ `DELETE /api/v1/mall/cart/{itemId}` - 删除购物车商品
- ✅ `POST /api/v1/mall/cart/batch-remove` - 批量删除购物车商品
- ✅ `PUT /api/v1/mall/cart/{itemId}/select` - 选中/取消选中商品
- ✅ `PUT /api/v1/mall/cart/batch-select` - 批量选中/取消选中
- ✅ `GET /api/v1/mall/cart/{userId}/summary` - 获取购物车汇总信息

#### 2. 药品相关API
- ✅ `GET /api/v1/mall/drugs/categories` - 获取药品分类列表
- ✅ `GET /api/v1/mall/drugs/recommended` - 获取推荐药品
- ✅ `GET /api/v1/mall/drugs/search` - 搜索药品
- ✅ `GET /api/v1/mall/drugs/{drugId}` - 获取药品详情
- ✅ `GET /api/v1/mall/drugs/{drugId}/stock` - 获取药品库存
- ✅ `GET /api/v1/mall/drugs/category/{categoryId}` - 根据分类获取药品列表
- ✅ `POST /api/v1/mall/drugs/stock/batch` - 批量获取药品库存

---

## 需要补充的API

### 1. 快捷分类API

**需求说明：**
商城首页顶部需要展示快捷分类（圆形图标横向滚动），这些分类是精选的热门分类，与左侧完整分类列表不同。

**新增API：**

```
GET /api/v1/mall/drugs/quick-categories
```

**功能：** 获取快捷分类列表（用于首页顶部横向滚动区域）

**请求参数：** 无

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "categoryId": 1,
      "categoryName": "隐形美瞳",
      "categoryIcon": "http://example.com/icons/lenses.png",
      "iconResId": "ic_category_lenses",  // 本地图标资源名称（可选）
      "sortOrder": 1,
      "isHot": true  // 是否热门
    },
    {
      "categoryId": 2,
      "categoryName": "家庭常备",
      "categoryIcon": "http://example.com/icons/family.png",
      "iconResId": "ic_category_family",
      "sortOrder": 2,
      "isHot": true
    },
    {
      "categoryId": 3,
      "categoryName": "男性健康",
      "categoryIcon": "http://example.com/icons/male.png",
      "iconResId": "ic_category_male",
      "sortOrder": 3,
      "isHot": false
    }
    // ... 最多返回8-10个快捷分类
  ]
}
```

**实现建议：**
- 在 `DrugMallController` 中添加此接口
- 在数据库分类表中添加 `is_quick_category` 字段标识快捷分类
- 或者创建单独的快捷分类配置表
- 按 `sortOrder` 排序返回

---

### 2. 药品销售信息增强

**需求说明：**
商城首页药品列表需要显示"超千十人加购"、"超5千十人已买"等销售信息，当前API返回的数据可能不够完整。

**需要修改的API：**

```
GET /api/v1/mall/drugs/recommended
GET /api/v1/mall/drugs/category/{categoryId}
```

**需要增加的响应字段：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "drugId": 1001,
      "drugName": "葡萄前列3盒护肝液",
      "drugImage": "http://...",
      "drugImages": ["http://...", "http://..."],  // 多张图片
      "specification": "10g*12袋",
      "price": 276.00,
      "originalPrice": 299.00,  // 原价（可选）
      "stock": 100,
      "sales": 5123,  // 已售数量
      "addToCartCount": 1234,  // 加购数量 ⚠️ 需要新增
      
      // 标签相关字段 ⚠️ 需要新增
      "isFreeShipping": true,  // 是否包邮
      "hasPriceGuarantee": true,  // 是否有价保
      "priceGuaranteeDays": 7,  // 价保天数
      "hasInstallment": false,  // 是否支持分期
      "installmentInfo": "分期免息 6期",  // 分期信息
      "soldCount": "500+",  // 已售数量文本（如"500+"）
      "isNew": false,  // 是否新品
      "isRecommended": true,  // 是否推荐
      
      // 促销信息 ⚠️ 需要新增
      "promotionTags": [
        {
          "tagType": "FREE_SHIPPING",  // 标签类型
          "tagText": "包邮",
          "tagColor": "#FF6B00",  // 标签颜色
          "backgroundColor": "#FFF5E6"  // 背景颜色
        },
        {
          "tagType": "PRICE_GUARANTEE",
          "tagText": "7天价保",
          "tagColor": "#4A90E2",
          "backgroundColor": "#E8F4FF"
        }
      ]
    }
  ]
}
```

**实现建议：**
- 在 `DrugDTO` 模型中添加上述字段
- 在 `DrugMallService` 中计算加购数量（从购物车表统计）
- 在数据库中添加促销标签配置表或在药品表中添加标签字段

---

### 3. 热门搜索关键词API

**需求说明：**
搜索页面需要显示热门搜索关键词。

**新增API：**

```
GET /api/v1/mall/drugs/hot-keywords
```

**功能：** 获取热门搜索关键词列表

**请求参数：**
- `limit`: Integer (可选，默认10，最多返回的关键词数量)

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    "板蓝根",
    "维生素C",
    "感冒药",
    "阿莫西林",
    "布洛芬",
    "999感冒灵",
    "云南白药",
    "创可贴",
    "体温计",
    "口罩"
  ]
}
```

**实现建议：**
- 在 `DrugMallController` 中添加此接口
- 创建搜索关键词统计表，记录用户搜索行为
- 定期统计热门关键词（可以用定时任务）
- 或者手动配置热门关键词

---

## 数据模型补充

### 1. 药品分类表 (d_drug_category)

**需要添加的字段：**

```sql
ALTER TABLE d_drug_category ADD COLUMN is_quick_category TINYINT(1) DEFAULT 0 COMMENT '是否快捷分类(0-否,1-是)';
ALTER TABLE d_drug_category ADD COLUMN category_icon VARCHAR(255) COMMENT '分类图标URL';
ALTER TABLE d_drug_category ADD COLUMN icon_res_id VARCHAR(50) COMMENT '本地图标资源ID';
ALTER TABLE d_drug_category ADD COLUMN is_hot TINYINT(1) DEFAULT 0 COMMENT '是否热门(0-否,1-是)';
```

### 2. 药品表 (t_drug - 现有表)

**需要添加的字段：**

```sql
-- 添加商城相关字段到现有t_drug表
ALTER TABLE t_drug ADD COLUMN sales INT DEFAULT 0 COMMENT '销量';
ALTER TABLE t_drug ADD COLUMN add_to_cart_count INT DEFAULT 0 COMMENT '加购数量';
ALTER TABLE t_drug ADD COLUMN is_free_shipping TINYINT(1) DEFAULT 1 COMMENT '是否包邮(0-否,1-是)';
ALTER TABLE t_drug ADD COLUMN has_price_guarantee TINYINT(1) DEFAULT 1 COMMENT '是否价保(0-否,1-是)';
ALTER TABLE t_drug ADD COLUMN price_guarantee_days INT DEFAULT 7 COMMENT '价保天数';
ALTER TABLE t_drug ADD COLUMN has_installment TINYINT(1) DEFAULT 0 COMMENT '是否支持分期(0-否,1-是)';
ALTER TABLE t_drug ADD COLUMN installment_info VARCHAR(100) COMMENT '分期信息';
ALTER TABLE t_drug ADD COLUMN is_new TINYINT(1) DEFAULT 0 COMMENT '是否新品(0-否,1-是)';
ALTER TABLE t_drug ADD COLUMN is_recommended TINYINT(1) DEFAULT 0 COMMENT '是否推荐(0-否,1-是)';
ALTER TABLE t_drug ADD COLUMN original_price DECIMAL(16,2) COMMENT '原价';
ALTER TABLE t_drug ADD COLUMN category_id BIGINT COMMENT '商城分类ID';
ALTER TABLE t_drug ADD INDEX idx_category_id (category_id);
ALTER TABLE t_drug ADD INDEX idx_is_recommended (is_recommended);
```

**现有t_drug表关键字段说明：**
- `id`: 主键ID
- `name`: 药品名称
- `sku_code`: 药品编号
- `pic_position`: 图片位置(JSON格式,需要解析)
- `size`: 药品规格
- `price`: 药品单价
- `quantity`: 库存数量
- `manufacturers`: 厂家
- `approval_number`: 批准文号
- `content`: 药品说明书(HTML格式)
- `status`: 状态(1:启用 0:停用)

### 3. 新增：促销标签表 (t_drug_promotion_tag)

```sql
CREATE TABLE t_drug_promotion_tag (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  drug_id BIGINT NOT NULL COMMENT '药品ID',
  tag_type VARCHAR(50) NOT NULL COMMENT '标签类型(FREE_SHIPPING,PRICE_GUARANTEE,INSTALLMENT,NEW,HOT等)',
  tag_text VARCHAR(50) NOT NULL COMMENT '标签文本',
  tag_color VARCHAR(20) COMMENT '标签颜色',
  background_color VARCHAR(20) COMMENT '背景颜色',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用(0-否,1-是)',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_drug_id (drug_id),
  INDEX idx_tag_type (tag_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='药品促销标签表';
```

### 4. 新增：热门搜索关键词表 (t_hot_search_keyword)

```sql
CREATE TABLE t_hot_search_keyword (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  keyword VARCHAR(100) NOT NULL COMMENT '搜索关键词',
  search_count INT DEFAULT 0 COMMENT '搜索次数',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_manual TINYINT(1) DEFAULT 0 COMMENT '是否手动配置(0-否,1-是)',
  is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用(0-否,1-是)',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_keyword (keyword),
  INDEX idx_search_count (search_count DESC),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='热门搜索关键词表';
```

### 5. 新增：搜索历史表 (t_search_history)

```sql
CREATE TABLE t_search_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  keyword VARCHAR(100) NOT NULL COMMENT '搜索关键词',
  search_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '搜索时间',
  INDEX idx_user_id (user_id),
  INDEX idx_keyword (keyword),
  INDEX idx_search_time (search_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户搜索历史表';
```

---

## 实施优先级

### 高优先级（必须实现）

1. ✅ **购物车数量API** - 已实现
2. ✅ **加入购物车API** - 已实现
3. ⚠️ **快捷分类API** - 需要新增
4. ⚠️ **药品销售信息增强** - 需要修改现有API

### 中优先级（建议实现）

5. ⚠️ **热门搜索关键词API** - 需要新增
6. ⚠️ **促销标签数据** - 需要新增数据表和字段

### 低优先级（可选实现）

7. 搜索历史记录功能
8. 药品加购数量实时统计

---

## 后端开发任务清单

### 任务1：实现快捷分类API

**文件修改：**
- `DrugMallController.java` - 添加 `getQuickCategories()` 方法
- `DrugMallService.java` - 添加业务逻辑
- `DrugCategoryMapper.java` - 添加数据查询方法
- `DrugCategoryMapper.xml` - 添加SQL查询

**SQL脚本：**
```sql
-- 添加快捷分类标识字段
ALTER TABLE d_drug_category ADD COLUMN is_quick_category TINYINT(1) DEFAULT 0 COMMENT '是否快捷分类';
ALTER TABLE d_drug_category ADD COLUMN category_icon VARCHAR(255) COMMENT '分类图标URL';

-- 初始化快捷分类数据
UPDATE d_drug_category SET is_quick_category = 1, category_icon = 'http://...' 
WHERE category_name IN ('隐形美瞳', '家庭常备', '男性健康', '感冒发热', '消化系统', '心脑血管', '皮肤用药', '妇科用药');
```

### 任务2：增强药品数据模型

**文件修改：**
- `DrugDTO.java` - 添加新字段
- `DrugMallService.java` - 修改查询逻辑
- `DrugMapper.xml` - 修改SQL查询(使用t_drug表)

**SQL脚本：**
```sql
-- 添加药品促销相关字段到现有t_drug表
ALTER TABLE t_drug ADD COLUMN sales INT DEFAULT 0 COMMENT '销量';
ALTER TABLE t_drug ADD COLUMN add_to_cart_count INT DEFAULT 0 COMMENT '加购数量';
ALTER TABLE t_drug ADD COLUMN is_free_shipping TINYINT(1) DEFAULT 1 COMMENT '是否包邮';
ALTER TABLE t_drug ADD COLUMN has_price_guarantee TINYINT(1) DEFAULT 1 COMMENT '是否价保';
ALTER TABLE t_drug ADD COLUMN price_guarantee_days INT DEFAULT 7 COMMENT '价保天数';
ALTER TABLE t_drug ADD COLUMN original_price DECIMAL(16,2) COMMENT '原价';
ALTER TABLE t_drug ADD COLUMN category_id BIGINT COMMENT '商城分类ID';
ALTER TABLE t_drug ADD INDEX idx_category_id (category_id);
ALTER TABLE t_drug ADD INDEX idx_is_recommended (is_recommended);

-- 创建促销标签表
CREATE TABLE t_drug_promotion_tag (...);
```

### 任务3：实现热门搜索关键词API

**文件修改：**
- `DrugMallController.java` - 添加 `getHotKeywords()` 方法
- `DrugMallService.java` - 添加业务逻辑
- 创建 `HotSearchKeywordMapper.java` 和 `HotSearchKeywordMapper.xml`

**SQL脚本：**
```sql
-- 创建热门搜索关键词表
CREATE TABLE t_hot_search_keyword (...);

-- 初始化热门关键词数据
INSERT INTO t_hot_search_keyword (keyword, sort_order, is_manual, is_enabled) VALUES
('板蓝根', 1, 1, 1),
('维生素C', 2, 1, 1),
('感冒药', 3, 1, 1);
```

---

## 前端适配说明

### API调用示例

```java
// 1. 获取快捷分类
mallApiService.getQuickCategories()
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(response -> {
        if (response.isSuccess()) {
            List<DrugCategory> quickCategories = response.getData();
            showQuickCategories(quickCategories);
        }
    });

// 2. 获取购物车数量
mallApiService.getCartItemCount(userId)
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(response -> {
        if (response.isSuccess()) {
            Integer count = response.getData();
            updateCartBadge(count);
        }
    });

// 3. 加入购物车
CartOperationDTO operation = new CartOperationDTO();
operation.setUserId(userId);
operation.setDrugId(drugId);
operation.setQuantity(1);

mallApiService.addToCart(operation)
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(response -> {
        if (response.isSuccess()) {
            CartSummary summary = response.getData();
            showToast("已加入购物车");
            updateCartBadge(summary.getTotalQuantity());
        }
    });
```

---

## 总结

### 已实现的功能
- ✅ 购物车完整功能（数量、添加、删除、更新等）
- ✅ 药品基础API（分类、推荐、搜索、详情等）

### 需要补充的功能
- ⚠️ 快捷分类API（高优先级）
- ⚠️ 药品销售信息增强（高优先级）
- ⚠️ 热门搜索关键词API（中优先级）
- ⚠️ 促销标签数据支持（中优先级）

### 预计开发工作量
- 快捷分类API：2小时
- 药品数据增强：4小时
- 热门搜索API：2小时
- 数据库脚本：1小时
- 测试和联调：2小时

**总计：约11小时（1.5个工作日）**
