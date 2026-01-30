# 需求文档: 患者端药房商城UI - 结算页面

## 简介

本文档描述患者端药房商城结算页面的功能需求。

## 术语表

- **Checkout_System**: 结算系统
- **Order_System**: 订单系统
- **Payment_System**: 支付系统

## 需求

### 需求 1: 收货地址选择

**用户故事**: 作为患者,我想选择收货地址,以便将药品送到指定地点。

#### 验收标准

1. WHEN 用户进入结算页 THEN THE Checkout_System SHALL 展示默认收货地址
2. WHEN 用户点击地址区域 THEN THE Checkout_System SHALL 跳转到地址选择页面
3. WHEN 用户选择新地址 THEN THE Checkout_System SHALL 更新显示的地址信息
4. WHEN 没有收货地址 THEN THE Checkout_System SHALL 提示用户添加地址

### 需求 2: 商品信息展示

**用户故事**: 作为患者,我想查看要购买的商品列表,以便确认订单内容。

#### 验收标准

1. WHEN 用户进入结算页 THEN THE Checkout_System SHALL 展示所有待结算商品
2. WHEN 展示商品 THEN THE Checkout_System SHALL 显示图片、名称、规格、价格、数量
3. WHEN 商品列表较长 THEN THE Checkout_System SHALL 支持滚动查看

### 需求 3: 价格明细展示

**用户故事**: 作为患者,我想查看价格明细,以便了解费用构成。

#### 验收标准

1. WHEN 用户查看价格明细 THEN THE Checkout_System SHALL 展示商品总价、运费、订单总价
2. WHEN 满足包邮条件 THEN THE Checkout_System SHALL 显示运费为0
3. WHEN 不满足包邮条件 THEN THE Checkout_System SHALL 显示运费6元

### 需求 4: 支付方式选择

**用户故事**: 作为患者,我想选择支付方式,以便使用偏好的支付渠道。

#### 验收标准

1. WHEN 用户查看支付方式 THEN THE Checkout_System SHALL 展示微信支付和支付宝支付选项
2. WHEN 用户选择支付方式 THEN THE Checkout_System SHALL 更新选中状态
3. WHEN 未选择支付方式 THEN THE Checkout_System SHALL 默认选中微信支付

### 需求 5: 提交订单

**用户故事**: 作为患者,我想提交订单,以便完成购买流程。

#### 验收标准

1. WHEN 用户点击"提交订单"按钮 THEN THE Checkout_System SHALL 验证地址和支付方式
2. WHEN 验证通过 THEN THE Order_System SHALL 创建订单
3. WHEN 订单创建成功 THEN THE Checkout_System SHALL 跳转到支付页面
4. WHEN 订单创建失败 THEN THE Checkout_System SHALL 显示错误提示

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
