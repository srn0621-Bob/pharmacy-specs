# 后端 API 规范

本目录包含后端服务 API 相关的技术规范文档。

## 📋 规范列表

### Phase 1: 基础设施
- **patient-mall-phase1-db-extension** - 数据库扩展与表结构设计
  - 药品表、购物车表、订单表等核心表结构
- **patient-mall-phase1-image-parser** - 图片解析服务
  - 处方图片、药品图片解析与存储

### Phase 2: 药品浏览
- **patient-mall-phase2-category-query** - 药品分类查询 API
- **patient-mall-phase2-drug-detail** - 药品详情查询 API
- **patient-mall-phase2-drug-search** - 药品搜索功能 API

### Phase 3: 购物车
- **patient-mall-phase3-cart-basic** - 购物车基础功能
  - 添加、删除、修改数量等基本操作
- **patient-mall-phase3-cart-advanced** - 购物车高级功能
  - 批量操作、优惠计算、库存校验等

### Phase 4: 订单管理
- **patient-mall-phase4-order-create** - 订单创建 API
  - 订单生成、库存扣减、支付集成
- **patient-mall-phase4-order-query** - 订单查询 API
  - 订单列表、订单详情查询
- **patient-mall-phase4-order-status** - 订单状态管理 API
  - 订单状态流转、取消、退款等

### Phase 5: 物流
- **patient-mall-phase5-logistics-query** - 物流查询 API
  - 快递100 物流信息查询集成

### Phase 6: 优化
- **patient-mall-phase6-cache-optimization** - 缓存优化
  - Redis 缓存策略、热点数据缓存
- **patient-mall-phase6-drug-recommendation** - 药品推荐算法
  - 基于用户行为的药品推荐
