# 需求文档: 患者端药房商城UI - 药品详情页

## 简介

本文档描述患者端药房商城药品详情页的功能需求。药品详情页是用户了解药品信息、做出购买决策的关键页面,需要展示完整的药品信息,并提供便捷的购买入口。

## 术语表

- **Drug_Detail_System**: 药品详情展示系统
- **Cart_System**: 购物车系统
- **Checkout_System**: 结算系统
- **Image_Loader**: 图片加载器
- **Presenter**: MVP 架构中的 Presenter 层
- **View**: MVP 架构中的 View 层

## 需求

### 需求 1: 药品基本信息展示

**用户故事**: 作为患者,我想查看药品的基本信息,以便了解药品的名称、价格、规格等关键信息。

#### 验收标准

1. WHEN 用户进入药品详情页 THEN THE Drug_Detail_System SHALL 展示药品名称、品牌、价格、原价、规格、生产厂家
2. WHEN 药品有折扣 THEN THE Drug_Detail_System SHALL 同时显示原价和现价,原价使用删除线样式
3. WHEN 药品有标签 THEN THE Drug_Detail_System SHALL 在药品名称下方展示标签列表
4. WHEN 药品有销量数据 THEN THE Drug_Detail_System SHALL 显示销量信息
5. WHEN 药品库存不足 THEN THE Drug_Detail_System SHALL 显示库存不足提示

### 需求 2: 药品图片展示

**用户故事**: 作为患者,我想查看药品的多张图片,以便更全面地了解药品外观。

#### 验收标准

1. WHEN 用户进入药品详情页 THEN THE Drug_Detail_System SHALL 在顶部展示药品图片轮播
2. WHEN 药品有多张图片 THEN THE Drug_Detail_System SHALL 支持左右滑动切换图片
3. WHEN 图片加载失败 THEN THE Image_Loader SHALL 显示默认占位图
4. WHEN 用户点击图片 THEN THE Drug_Detail_System SHALL 进入全屏查看模式
5. WHEN 在全屏模式 THEN THE Drug_Detail_System SHALL 支持缩放和滑动浏览

### 需求 3: 药品说明书展示

**用户故事**: 作为患者,我想查看药品的详细说明书,以便了解药品的用法用量、注意事项等信息。

#### 验收标准

1. WHEN 用户滚动到说明书区域 THEN THE Drug_Detail_System SHALL 展示药品说明书内容
2. WHEN 说明书内容较长 THEN THE Drug_Detail_System SHALL 支持展开/收起功能
3. WHEN 说明书包含 HTML 格式 THEN THE Drug_Detail_System SHALL 正确渲染 HTML 内容
4. WHEN 说明书为空 THEN THE Drug_Detail_System SHALL 显示"暂无说明书"提示

### 需求 4: 相关推荐展示

**用户故事**: 作为患者,我想查看相关推荐药品,以便发现其他可能需要的药品。

#### 验收标准

1. WHEN 用户滚动到推荐区域 THEN THE Drug_Detail_System SHALL 展示相关推荐药品列表
2. WHEN 推荐列表有数据 THEN THE Drug_Detail_System SHALL 展示至少3个推荐药品
3. WHEN 用户点击推荐药品 THEN THE Drug_Detail_System SHALL 跳转到该药品的详情页
4. WHEN 推荐列表为空 THEN THE Drug_Detail_System SHALL 隐藏推荐区域
5. WHEN 推荐药品加载失败 THEN THE Drug_Detail_System SHALL 显示加载失败提示

### 需求 5: 加入购物车功能

**用户故事**: 作为患者,我想将药品加入购物车,以便稍后一起结算。

#### 验收标准

1. WHEN 用户点击"加入购物车"按钮 THEN THE Drug_Detail_System SHALL 弹出数量选择弹窗
2. WHEN 用户选择数量并确认 THEN THE Cart_System SHALL 将药品添加到购物车
3. WHEN 添加成功 THEN THE Drug_Detail_System SHALL 显示成功提示并更新购物车角标
4. WHEN 药品已在购物车 THEN THE Cart_System SHALL 增加该药品的数量
5. WHEN 库存不足 THEN THE Drug_Detail_System SHALL 禁用"加入购物车"按钮并提示库存不足
6. WHEN 添加失败 THEN THE Drug_Detail_System SHALL 显示错误提示

### 需求 6: 立即购买功能

**用户故事**: 作为患者,我想直接购买药品,以便快速完成下单。

#### 验收标准

1. WHEN 用户点击"立即购买"按钮 THEN THE Drug_Detail_System SHALL 弹出数量选择弹窗
2. WHEN 用户选择数量并确认 THEN THE Drug_Detail_System SHALL 跳转到结算页面
3. WHEN 跳转到结算页 THEN THE Checkout_System SHALL 预填充选中的药品和数量
4. WHEN 库存不足 THEN THE Drug_Detail_System SHALL 禁用"立即购买"按钮并提示库存不足
5. WHEN 用户未登录 THEN THE Drug_Detail_System SHALL 先跳转到登录页

### 需求 7: 数量选择弹窗

**用户故事**: 作为患者,我想选择购买数量,以便一次购买多件药品。

#### 验收标准

1. WHEN 弹窗显示 THEN THE Drug_Detail_System SHALL 展示药品图片、名称、价格和数量选择器
2. WHEN 用户点击"+"按钮 THEN THE Drug_Detail_System SHALL 增加数量(最大999)
3. WHEN 用户点击"-"按钮 THEN THE Drug_Detail_System SHALL 减少数量(最小1)
4. WHEN 用户手动输入数量 THEN THE Drug_Detail_System SHALL 验证输入范围(1-999)
5. WHEN 数量超过库存 THEN THE Drug_Detail_System SHALL 限制最大数量为库存数量
6. WHEN 用户点击确认 THEN THE Drug_Detail_System SHALL 执行对应操作(加入购物车或立即购买)
7. WHEN 用户点击取消或遮罩 THEN THE Drug_Detail_System SHALL 关闭弹窗

### 需求 8: 页面加载和错误处理

**用户故事**: 作为患者,我希望页面加载流畅,并在出错时有清晰的提示。

#### 验收标准

1. WHEN 页面开始加载 THEN THE Drug_Detail_System SHALL 显示加载动画
2. WHEN 数据加载成功 THEN THE Drug_Detail_System SHALL 隐藏加载动画并展示内容
3. WHEN 网络请求失败 THEN THE Drug_Detail_System SHALL 显示错误提示和重试按钮
4. WHEN 药品不存在 THEN THE Drug_Detail_System SHALL 显示"药品不存在"提示
5. WHEN 用户点击重试 THEN THE Drug_Detail_System SHALL 重新加载数据

### 需求 9: 页面导航

**用户故事**: 作为患者,我想方便地返回上一页或跳转到购物车。

#### 验收标准

1. WHEN 用户点击返回按钮 THEN THE Drug_Detail_System SHALL 返回上一页
2. WHEN 用户点击购物车图标 THEN THE Drug_Detail_System SHALL 跳转到购物车页面
3. WHEN 购物车有商品 THEN THE Drug_Detail_System SHALL 在购物车图标上显示数量角标
4. WHEN 从首页进入详情页 THEN THE Drug_Detail_System SHALL 接收药品ID参数

## 非功能性需求

### 性能需求

1. 页面首次加载时间应小于 2 秒
2. 图片加载应使用渐进式加载
3. 列表滚动应流畅,帧率保持在 60fps
4. 图片应使用缓存机制,避免重复加载

### 兼容性需求

1. 支持 Android 4.4 (API 19) 及以上版本
2. 适配不同屏幕尺寸(手机、平板)
3. 支持横竖屏切换

### 可访问性需求

1. 所有可点击元素应有足够的点击区域(最小 48dp)
2. 文字颜色对比度应符合 WCAG 2.0 AA 标准
3. 图片应有替代文本描述

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
