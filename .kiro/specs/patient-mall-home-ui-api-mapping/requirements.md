# 患者端药品商城首页 UI-API 映射需求文档

## 引言

本文档专注于患者端药品商城首页（MallHomeFragment）的 UI 元素、用户交互事件和后端 API 的对应关系分析。通过可视化的方式展示页面元素与 API 的映射关系，为前后端开发提供清晰的接口规范。

## 术语表

- **MallHomeFragment**: 药品商城首页 Fragment
- **API**: Application Programming Interface，应用程序接口
- **DTO**: Data Transfer Object，数据传输对象
- **MVP**: Model-View-Presenter 架构模式
- **SwipeRefreshLayout**: Android 下拉刷新组件
- **RecyclerView**: Android 列表组件
- **HBanner**: 轮播图组件

## 需求概述

### 需求 1: 页面结构分析

**用户故事**: 作为开发人员，我需要清晰了解商城首页的页面结构，以便准确实现 UI 和 API 对接。

#### 验收标准

1. WHEN 开发人员查看需求文档 THEN 系统 SHALL 提供完整的页面结构树形图
2. WHEN 开发人员查看页面元素 THEN 系统 SHALL 标注每个元素的类型、ID 和功能
3. WHEN 开发人员查看布局层级 THEN 系统 SHALL 展示从根布局到叶子节点的完整层级关系
4. WHEN 开发人员查看组件说明 THEN 系统 SHALL 提供每个组件的用途和配置参数

### 需求 2: UI 元素与 API 映射

**用户故事**: 作为前端开发人员，我需要知道每个 UI 元素对应哪个后端 API，以便正确调用接口获取数据。

#### 验收标准

1. WHEN 前端开发查看 UI 元素 THEN 系统 SHALL 标注该元素需要调用的 API 端点
2. WHEN 前端开发查看 API 映射 THEN 系统 SHALL 提供 API 的请求方法、路径和参数
3. WHEN 前端开发查看数据流向 THEN 系统 SHALL 展示从 API 响应到 UI 渲染的完整流程
4. WHEN 前端开发查看数据模型 THEN 系统 SHALL 提供前后端数据模型的字段对照表


### 需求 3: 用户交互事件分析

**用户故事**: 作为前端开发人员，我需要了解用户在首页的所有交互行为及其触发的 API 调用，以便实现完整的交互逻辑。

#### 验收标准

1. WHEN 用户执行交互操作 THEN 系统 SHALL 记录该操作触发的事件类型
2. WHEN 交互事件触发 THEN 系统 SHALL 调用对应的 API 接口
3. WHEN API 调用完成 THEN 系统 SHALL 更新相关 UI 元素的显示状态
4. WHEN 交互失败 THEN 系统 SHALL 显示友好的错误提示信息

### 需求 4: API 实现状态检查

**用户故事**: 作为后端开发人员，我需要知道哪些 API 已实现、哪些需要新增或调整，以便合理安排开发任务。

#### 验收标准

1. WHEN 后端开发查看 API 清单 THEN 系统 SHALL 标注每个 API 的实现状态（已实现/缺失/需调整）
2. WHEN 后端开发查看缺失 API THEN 系统 SHALL 提供该 API 的详细规格说明
3. WHEN 后端开发查看需调整 API THEN 系统 SHALL 说明调整原因和具体调整方案
4. WHEN 后端开发查看 API 优先级 THEN 系统 SHALL 按照 P0/P1/P2 标注开发优先级

### 需求 5: 数据模型一致性验证

**用户故事**: 作为测试人员，我需要验证前后端数据模型的一致性，以便确保数据传输的正确性。

#### 验收标准

1. WHEN 测试人员查看数据模型 THEN 系统 SHALL 提供前后端字段的完整对照表
2. WHEN 测试人员发现字段不一致 THEN 系统 SHALL 标注不一致的字段和差异说明
3. WHEN 测试人员验证数据类型 THEN 系统 SHALL 确保前后端字段类型完全匹配
4. WHEN 测试人员验证必填字段 THEN 系统 SHALL 标注哪些字段是必填的

### 需求 6: 可视化页面流程图

**用户故事**: 作为产品经理，我需要通过可视化流程图了解用户在首页的完整操作流程，以便优化用户体验。

#### 验收标准

1. WHEN 产品经理查看流程图 THEN 系统 SHALL 展示用户从进入首页到完成操作的完整路径
2. WHEN 产品经理查看交互节点 THEN 系统 SHALL 标注每个交互点的触发条件和结果
3. WHEN 产品经理查看数据流向 THEN 系统 SHALL 用箭头表示数据从 API 到 UI 的流动方向
4. WHEN 产品经理查看异常分支 THEN 系统 SHALL 展示错误处理和重试逻辑


### 需求 7: API 性能和缓存策略

**用户故事**: 作为架构师，我需要了解首页 API 的性能要求和缓存策略，以便优化系统响应速度。

#### 验收标准

1. WHEN 用户首次进入首页 THEN 系统 SHALL 在 2 秒内完成所有数据加载
2. WHEN 用户下拉刷新 THEN 系统 SHALL 在 1 秒内返回最新数据
3. WHEN 系统调用轮播图 API THEN 系统 SHALL 使用 Redis 缓存，缓存时间 30 分钟
4. WHEN 系统调用推荐药品 API THEN 系统 SHALL 使用 Redis 缓存，缓存时间 10 分钟
5. WHEN 缓存失效 THEN 系统 SHALL 自动从数据库重新加载数据并更新缓存

### 需求 8: 错误处理和用户提示

**用户故事**: 作为用户，当首页加载失败时，我需要看到清晰的错误提示和重试选项，以便继续使用应用。

#### 验收标准

1. WHEN API 调用失败 THEN 系统 SHALL 显示友好的错误提示信息
2. WHEN 网络连接失败 THEN 系统 SHALL 提示"网络连接失败，请检查网络设置"
3. WHEN 服务器错误 THEN 系统 SHALL 提示"服务器繁忙，请稍后重试"
4. WHEN 数据为空 THEN 系统 SHALL 显示空状态页面和引导文案
5. WHEN 用户点击重试 THEN 系统 SHALL 重新调用失败的 API 接口

### 需求 9: 埋点和数据统计

**用户故事**: 作为数据分析师，我需要收集用户在首页的行为数据，以便分析用户偏好和优化推荐算法。

#### 验收标准

1. WHEN 用户进入首页 THEN 系统 SHALL 记录页面访问事件（pv）
2. WHEN 用户点击轮播图 THEN 系统 SHALL 记录轮播图点击事件和图片 ID
3. WHEN 用户点击快捷入口 THEN 系统 SHALL 记录入口类型和点击时间
4. WHEN 用户点击药品卡片 THEN 系统 SHALL 记录药品 ID、位置和来源（闪购/推荐）
5. WHEN 用户点击搜索框 THEN 系统 SHALL 记录搜索入口点击事件

### 需求 10: 国际化和多语言支持

**用户故事**: 作为国际化负责人，我需要确保首页支持多语言切换，以便服务不同地区的用户。

#### 验收标准

1. WHEN 系统检测用户语言设置 THEN 系统 SHALL 自动加载对应语言的文案
2. WHEN 用户切换语言 THEN 系统 SHALL 重新加载首页并显示新语言的内容
3. WHEN 系统调用 API THEN 系统 SHALL 在请求头中传递语言参数（Accept-Language）
4. WHEN API 返回数据 THEN 系统 SHALL 确保返回的文案与用户语言设置一致
