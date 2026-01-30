# 需求文档 - 患者端药品商城

## 文档信息

**功能名称：** 患者端药品商城  
**项目：** 互联网医院 - 患者端Android应用  
**版本：** v1.0  
**创建日期：** 2026-01-22  

---

## 简介

患者端应用需要增加药品商城功能，允许患者在线浏览、搜索、购买非处方药品。该功能与现有的处方药品订单系统独立，是一个全新的商城模块。商城支持药品分类浏览、购物车管理、在线下单、支付和物流跟踪等完整的电商流程。

---

## 术语表 (Glossary)

- **System**: 患者端药品商城系统
- **Patient_User**: 患者用户
- **Drug**: 药品(对应数据库t_drug表)
- **Drug_Category**: 药品分类
- **Quick_Category**: 快捷分类（首页横向滚动展示的精选分类）
- **Shopping_Cart**: 购物车
- **Cart_Item**: 购物车商品项
- **Mall_Order**: 商城订单
- **Order_Item**: 订单商品项
- **Payment**: 支付
- **Shipping_Address**: 收货地址
- **Logistics**: 物流信息
- **Promotion_Tag**: 促销标签（如包邮、价保等）

---

## 需求

### Requirement 1: 药品分类浏览

**User Story:** 作为患者用户，我想浏览药品分类，以便快速找到我需要的药品类别

#### Acceptance Criteria

1. WHEN Patient_User 打开商城首页 THEN THE System SHALL 显示药品分类列表
2. WHEN Patient_User 点击某个分类 THEN THE System SHALL 显示该分类下的药品列表
3. THE System SHALL 在首页左侧显示至少12个常用分类
4. WHEN Patient_User 点击"全部"按钮 THEN THE System SHALL 展开显示所有分类
5. WHEN Patient_User 再次点击"收起"按钮 THEN THE System SHALL 收起只显示前12个分类
6. THE System SHALL 在首页顶部横向滚动区域显示快捷分类（圆形图标）
7. WHEN Patient_User 点击快捷分类 THEN THE System SHALL 跳转到对应分类的药品列表

---

### Requirement 2: 药品搜索

**User Story:** 作为患者用户，我想搜索药品，以便快速找到我需要的特定药品

#### Acceptance Criteria

1. WHEN Patient_User 点击搜索框 THEN THE System SHALL 跳转到搜索页面
2. WHEN Patient_User 输入搜索关键词并点击搜索 THEN THE System SHALL 显示匹配的药品列表
3. THE System SHALL 在搜索页面显示用户的搜索历史记录
4. THE System SHALL 在搜索页面显示热门搜索关键词
5. WHEN Patient_User 点击搜索历史或热门关键词 THEN THE System SHALL 自动填充搜索框并执行搜索
6. WHEN 搜索结果为空 THEN THE System SHALL 显示"未找到相关药品"提示
7. WHEN Patient_User 点击搜索结果中的药品 THEN THE System SHALL 跳转到药品详情页面

---

### Requirement 3: 药品详情查看

**User Story:** 作为患者用户，我想查看药品详细信息，以便了解药品的规格、价格、说明书等信息

#### Acceptance Criteria

1. WHEN Patient_User 点击药品 THEN THE System SHALL 显示药品详情页面
2. THE System SHALL 在详情页面显示药品图片、名称、价格、规格、库存信息
3. THE System SHALL 在详情页面显示药品的生产厂家、批准文号、有效期
4. THE System SHALL 在详情页面提供药品说明书查看功能
5. WHEN Patient_User 选择购买数量 THEN THE System SHALL 验证数量不超过库存
6. WHEN 库存为0 THEN THE System SHALL 禁用"加入购物车"和"立即购买"按钮
7. THE System SHALL 在详情页面显示购物车图标及商品数量角标

---

### Requirement 4: 购物车管理

**User Story:** 作为患者用户，我想管理购物车，以便添加、修改或删除商品

#### Acceptance Criteria

1. WHEN Patient_User 点击"加入购物车"按钮 THEN THE System SHALL 将药品添加到购物车
2. WHEN 药品成功添加到购物车 THEN THE System SHALL 更新购物车图标的数量角标
3. WHEN Patient_User 打开购物车页面 THEN THE System SHALL 显示所有购物车商品
4. WHEN Patient_User 修改购物车商品数量 THEN THE System SHALL 更新该商品的小计金额和购物车总金额
5. WHEN Patient_User 删除购物车商品 THEN THE System SHALL 从购物车中移除该商品
6. WHEN Patient_User 选中或取消选中商品 THEN THE System SHALL 更新结算金额
7. WHEN Patient_User 点击"全选" THEN THE System SHALL 选中所有购物车商品
8. WHEN Patient_User 点击"去结算" THEN THE System SHALL 跳转到订单确认页面
9. WHEN 购物车为空 THEN THE System SHALL 显示"购物车是空的"提示

---

### Requirement 5: 订单创建

**User Story:** 作为患者用户，我想创建订单，以便购买选中的药品

#### Acceptance Criteria

1. WHEN Patient_User 进入订单确认页面 THEN THE System SHALL 显示默认收货地址
2. WHEN Patient_User 没有收货地址 THEN THE System SHALL 提示添加收货地址
3. THE System SHALL 在订单确认页面显示商品清单、商品金额、运费和实付款
4. WHEN Patient_User 点击"提交订单" THEN THE System SHALL 创建订单并返回订单号
5. WHEN 订单创建成功 THEN THE System SHALL 跳转到支付页面
6. WHEN 订单创建失败 THEN THE System SHALL 显示失败原因
7. WHEN 订单创建成功 THEN THE System SHALL 清空购物车中已结算的商品

---

### Requirement 6: 订单支付

**User Story:** 作为患者用户，我想支付订单，以便完成购买流程

#### Acceptance Criteria

1. WHEN Patient_User 进入支付页面 THEN THE System SHALL 显示订单金额和支付方式选项
2. THE System SHALL 支持微信支付和支付宝支付
3. WHEN Patient_User 选择支付方式并确认支付 THEN THE System SHALL 调用第三方支付接口
4. WHEN 支付成功 THEN THE System SHALL 更新订单状态为"已支付"
5. WHEN 支付成功 THEN THE System SHALL 跳转到订单列表页面
6. WHEN 支付失败 THEN THE System SHALL 显示失败原因并允许重新支付
7. WHEN 订单超过30分钟未支付 THEN THE System SHALL 自动取消订单

---

### Requirement 7: 订单管理

**User Story:** 作为患者用户，我想查看和管理我的订单，以便了解订单状态和进行相应操作

#### Acceptance Criteria

1. WHEN Patient_User 打开订单列表页面 THEN THE System SHALL 显示用户的所有商城订单
2. THE System SHALL 支持按订单状态筛选（全部、待支付、待发货、待收货、已完成）
3. WHEN Patient_User 点击订单 THEN THE System SHALL 显示订单详情
4. WHEN 订单状态为"待支付" THEN THE System SHALL 显示"取消订单"和"立即支付"按钮
5. WHEN Patient_User 点击"取消订单" THEN THE System SHALL 取消订单并更新订单状态
6. WHEN 订单状态为"待收货" THEN THE System SHALL 显示"查看物流"和"确认收货"按钮
7. WHEN Patient_User 点击"确认收货" THEN THE System SHALL 更新订单状态为"已完成"
8. THE System SHALL 在订单详情页面显示订单状态流程（提交→支付→发货→完成）

---

### Requirement 8: 物流跟踪

**User Story:** 作为患者用户，我想查看物流信息，以便了解订单的配送进度

#### Acceptance Criteria

1. WHEN 订单状态为"已发货"或"待收货" THEN THE System SHALL 显示"查看物流"按钮
2. WHEN Patient_User 点击"查看物流" THEN THE System SHALL 显示物流跟踪信息
3. THE System SHALL 显示快递公司名称、快递单号和物流轨迹
4. THE System SHALL 按时间倒序显示物流轨迹
5. WHEN 物流信息查询失败 THEN THE System SHALL 显示"暂无物流信息"提示

---

### Requirement 9: 促销标签展示

**User Story:** 作为患者用户，我想看到药品的促销信息，以便了解优惠活动

#### Acceptance Criteria

1. WHEN 药品支持包邮 THEN THE System SHALL 在药品列表和详情页显示"包邮"标签
2. WHEN 药品支持价保 THEN THE System SHALL 显示"N天价保"标签
3. WHEN 药品支持分期 THEN THE System SHALL 显示分期信息标签
4. WHEN 药品是新品 THEN THE System SHALL 显示"新品"标签
5. THE System SHALL 在药品列表显示销售信息（如"超千十人加购"、"已售500+"）
6. THE System SHALL 支持同时显示多个促销标签

---

### Requirement 10: 购物车数量实时更新

**User Story:** 作为患者用户，我想实时看到购物车商品数量，以便了解购物车状态

#### Acceptance Criteria

1. WHEN Patient_User 添加商品到购物车 THEN THE System SHALL 立即更新购物车图标的数量角标
2. WHEN Patient_User 修改购物车商品数量 THEN THE System SHALL 立即更新数量角标
3. WHEN Patient_User 删除购物车商品 THEN THE System SHALL 立即更新数量角标
4. WHEN 购物车为空 THEN THE System SHALL 隐藏数量角标
5. THE System SHALL 在所有页面的购物车图标上显示实时数量

---

### Requirement 11: 数据持久化

**User Story:** 作为患者用户，我希望我的购物车数据能够保存，以便下次打开应用时继续购物

#### Acceptance Criteria

1. WHEN Patient_User 添加商品到购物车 THEN THE System SHALL 将数据保存到服务器
2. WHEN Patient_User 重新打开应用 THEN THE System SHALL 从服务器加载购物车数据
3. WHEN Patient_User 在不同设备登录 THEN THE System SHALL 同步购物车数据
4. WHEN 网络异常 THEN THE System SHALL 将购物车操作缓存到本地
5. WHEN 网络恢复 THEN THE System SHALL 自动同步本地缓存到服务器

---

### Requirement 12: 错误处理

**User Story:** 作为患者用户，当系统出现错误时，我希望能看到清晰的错误提示

#### Acceptance Criteria

1. WHEN API请求失败 THEN THE System SHALL 显示友好的错误提示信息
2. WHEN 网络连接失败 THEN THE System SHALL 显示"网络连接失败，请检查网络设置"
3. WHEN 库存不足 THEN THE System SHALL 显示"库存不足，请减少购买数量"
4. WHEN 订单创建失败 THEN THE System SHALL 显示具体失败原因
5. WHEN 支付失败 THEN THE System SHALL 显示失败原因并提供重试选项
6. THE System SHALL 记录所有错误日志用于问题排查

---

### Requirement 13: 性能要求

**User Story:** 作为患者用户，我希望应用响应迅速，提供流畅的使用体验

#### Acceptance Criteria

1. WHEN Patient_User 打开商城首页 THEN THE System SHALL 在2秒内加载完成
2. WHEN Patient_User 搜索药品 THEN THE System SHALL 在1秒内返回搜索结果
3. WHEN Patient_User 滚动药品列表 THEN THE System SHALL 流畅加载图片不卡顿
4. THE System SHALL 支持药品列表分页加载
5. THE System SHALL 缓存已加载的药品图片
6. WHEN 图片加载失败 THEN THE System SHALL 显示占位图

---

## 非功能性需求

### 安全性

1. THE System SHALL 使用HTTPS协议进行所有网络通信
2. THE System SHALL 验证用户登录状态后才允许访问购物车和订单功能
3. THE System SHALL 对敏感信息（如收货地址、手机号）进行脱敏显示

### 兼容性

1. THE System SHALL 支持Android 4.4及以上版本
2. THE System SHALL 适配不同屏幕尺寸的Android设备
3. THE System SHALL 与现有患者端应用无缝集成

### 可维护性

1. THE System SHALL 使用MVP架构模式
2. THE System SHALL 遵循项目现有的代码规范
3. THE System SHALL 提供详细的代码注释（中文）

---

## 约束条件

1. 商城功能与现有处方订单系统完全独立
2. 复用现有的支付、地址管理、物流查询等基础功能
3. 使用独立的数据表和API端点
4. 后端API基于Spring Boot 2.1.4开发
5. 前端使用Retrofit 2.2.0进行网络请求
6. 使用RxJava 2.1.7进行异步处理

---

## 参考文档

- [API需求补充说明](./API需求补充说明.md)
- [商城首页布局设计方案](./商城首页布局设计方案.md)
- [药品商城功能详细修改文档](./药品商城功能详细修改文档.md)
