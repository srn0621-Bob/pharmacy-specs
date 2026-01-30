# 需求文档: 患者端药房商城UI - 购物车页面

## 简介

本文档描述患者端药房商城购物车页面的功能需求。购物车是用户管理待购买商品的核心页面,需要支持商品选择、数量修改、删除和结算等功能。

## 术语表

- **Cart_System**: 购物车系统
- **Cart_Manager**: 购物车管理器
- **Price_Calculator**: 价格计算器
- **Checkout_System**: 结算系统
- **Presenter**: MVP 架构中的 Presenter 层
- **View**: MVP 架构中的 View 层

## 需求

### 需求 1: 购物车列表展示

**用户故事**: 作为患者,我想查看购物车中的所有商品,以便了解待购买的商品列表。

#### 验收标准

1. WHEN 用户进入购物车页面 THEN THE Cart_System SHALL 展示购物车中所有商品的列表
2. WHEN 购物车有商品 THEN THE Cart_System SHALL 展示每个商品的图片、名称、规格、价格、数量
3. WHEN 购物车为空 THEN THE Cart_System SHALL 显示空状态页面和"去逛逛"按钮
4. WHEN 用户点击"去逛逛" THEN THE Cart_System SHALL 跳转到商城首页
5. WHEN 商品图片加载失败 THEN THE Cart_System SHALL 显示默认占位图

### 需求 2: 商品选中功能

**用户故事**: 作为患者,我想选择要结算的商品,以便只购买部分商品。

#### 验收标准

1. WHEN 用户点击商品复选框 THEN THE Cart_System SHALL 切换该商品的选中状态
2. WHEN 商品被选中 THEN THE Cart_System SHALL 更新总价计算
3. WHEN 用户点击"全选"复选框 THEN THE Cart_System SHALL 选中所有商品
4. WHEN 所有商品都被选中 THEN THE Cart_System SHALL 自动勾选"全选"复选框
5. WHEN 任意商品被取消选中 THEN THE Cart_System SHALL 自动取消"全选"复选框

### 需求 3: 数量修改功能

**用户故事**: 作为患者,我想修改商品的购买数量,以便调整购买量。

#### 验收标准

1. WHEN 用户点击"+"按钮 THEN THE Cart_System SHALL 增加商品数量(最大999)
2. WHEN 用户点击"-"按钮 THEN THE Cart_System SHALL 减少商品数量(最小1)
3. WHEN 数量为1时点击"-" THEN THE Cart_System SHALL 弹出删除确认对话框
4. WHEN 数量修改后 THEN THE Cart_System SHALL 立即更新小计和总价
5. WHEN 数量超过库存 THEN THE Cart_System SHALL 限制最大数量为库存数量并提示
6. WHEN 数量修改失败 THEN THE Cart_System SHALL 恢复原数量并显示错误提示

### 需求 4: 商品删除功能

**用户故事**: 作为患者,我想删除不需要的商品,以便清理购物车。

#### 验收标准

1. WHEN 用户左滑商品项 THEN THE Cart_System SHALL 显示删除按钮
2. WHEN 用户点击删除按钮 THEN THE Cart_System SHALL 弹出删除确认对话框
3. WHEN 用户确认删除 THEN THE Cart_System SHALL 从购物车中移除该商品
4. WHEN 删除成功 THEN THE Cart_System SHALL 更新列表和总价
5. WHEN 删除最后一个商品 THEN THE Cart_System SHALL 显示空状态页面

### 需求 5: 价格计算和展示

**用户故事**: 作为患者,我想查看购物车的总价,以便了解需要支付的金额。

#### 验收标准

1. WHEN 购物车有选中商品 THEN THE Cart_System SHALL 在底部显示总价
2. WHEN 商品数量或选中状态变化 THEN THE Price_Calculator SHALL 重新计算总价
3. WHEN 总价 >= 99元 THEN THE Cart_System SHALL 显示"包邮"提示
4. WHEN 总价 < 99元 THEN THE Cart_System SHALL 显示运费6元和"还差XX元包邮"提示
5. WHEN 没有选中商品 THEN THE Cart_System SHALL 显示总价为0并禁用结算按钮

### 需求 6: 结算功能

**用户故事**: 作为患者,我想结算选中的商品,以便完成购买。

#### 验收标准

1. WHEN 用户点击"去结算"按钮 THEN THE Cart_System SHALL 验证是否有选中商品
2. WHEN 有选中商品 THEN THE Cart_System SHALL 跳转到结算页面
3. WHEN 没有选中商品 THEN THE Cart_System SHALL 显示"请选择要结算的商品"提示
4. WHEN 跳转到结算页 THEN THE Checkout_System SHALL 接收选中商品的ID列表
5. WHEN 用户未登录 THEN THE Cart_System SHALL 先跳转到登录页

### 需求 7: 推荐商品展示

**用户故事**: 作为患者,我想在购物车页面看到推荐商品,以便发现其他可能需要的药品。

#### 验收标准

1. WHEN 购物车有商品 THEN THE Cart_System SHALL 在列表底部展示推荐商品
2. WHEN 推荐列表有数据 THEN THE Cart_System SHALL 展示至少3个推荐药品
3. WHEN 用户点击推荐药品 THEN THE Cart_System SHALL 跳转到该药品的详情页
4. WHEN 推荐列表为空 THEN THE Cart_System SHALL 隐藏推荐区域
5. WHEN 推荐药品加载失败 THEN THE Cart_System SHALL 忽略错误(不影响主流程)

### 需求 8: 购物车同步

**用户故事**: 作为患者,我希望购物车数据在本地和服务器之间保持同步。

#### 验收标准

1. WHEN 用户进入购物车页面 THEN THE Cart_System SHALL 从服务器加载最新购物车数据
2. WHEN 用户修改购物车 THEN THE Cart_System SHALL 同步更新到服务器
3. WHEN 网络不可用 THEN THE Cart_System SHALL 使用本地缓存数据
4. WHEN 网络恢复 THEN THE Cart_System SHALL 自动同步本地修改到服务器
5. WHEN 同步失败 THEN THE Cart_System SHALL 显示同步失败提示

### 需求 9: 页面刷新

**用户故事**: 作为患者,我想刷新购物车数据,以便获取最新的商品信息和价格。

#### 验收标准

1. WHEN 用户下拉页面 THEN THE Cart_System SHALL 触发刷新操作
2. WHEN 刷新开始 THEN THE Cart_System SHALL 显示刷新动画
3. WHEN 刷新成功 THEN THE Cart_System SHALL 更新购物车列表并隐藏动画
4. WHEN 刷新失败 THEN THE Cart_System SHALL 显示错误提示并隐藏动画
5. WHEN 刷新完成 THEN THE Cart_System SHALL 保持用户的选中状态

### 需求 10: 错误处理

**用户故事**: 作为患者,我希望在出错时有清晰的提示和恢复方式。

#### 验收标准

1. WHEN 加载购物车失败 THEN THE Cart_System SHALL 显示错误提示和重试按钮
2. WHEN 修改数量失败 THEN THE Cart_System SHALL 恢复原数量并提示错误
3. WHEN 删除商品失败 THEN THE Cart_System SHALL 保持商品在列表中并提示错误
4. WHEN 网络超时 THEN THE Cart_System SHALL 显示超时提示
5. WHEN 用户点击重试 THEN THE Cart_System SHALL 重新执行失败的操作

## 非功能性需求

### 性能需求

1. 购物车列表加载时间应小于 1 秒
2. 数量修改响应时间应小于 500ms
3. 列表滚动应流畅,帧率保持在 60fps
4. 价格计算应实时更新,延迟小于 100ms

### 兼容性需求

1. 支持 Android 4.4 (API 19) 及以上版本
2. 适配不同屏幕尺寸
3. 支持横竖屏切换

### 可访问性需求

1. 所有可点击元素应有足够的点击区域(最小 48dp)
2. 复选框应有清晰的选中/未选中状态
3. 价格信息应醒目易读

---

**文档版本:** 1.0  
**创建日期:** 2026-01-26  
**最后更新:** 2026-01-26
