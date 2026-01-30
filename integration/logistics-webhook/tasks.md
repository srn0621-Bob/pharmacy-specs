# Implementation Plan: Logistics Webhook

## Overview

本实现计划将物流信息接收接口分解为可执行的编码任务。接口部署在 `adinnet-admin` 模块中，使用 Java + Spring Boot + MyBatis 技术栈。

## Tasks

- [x] 1. 创建数据库表和 SQL 脚本
  - [x] 1.1 创建 t_logistics_webhook_log 日志表 SQL 脚本
    - 在 `internet-hospital/sql/` 目录下创建 `t_logistics_webhook_log.sql`
    - 包含表结构、索引、注释
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. 创建数据模型类
  - [x] 2.1 创建请求模型 OrderShippedEvent 及相关类
    - 创建 `OrderShippedEvent.java` - 发货事件主体
    - 创建 `EventData.java` - 事件数据
    - 创建 `EventItem.java` - 商品项
    - 创建 `WebhookHeaders.java` - 请求头封装
    - 位置: `com.adinnet.admin.system.model.logistics`
    - _Requirements: 1.2, 1.5_

  - [x] 2.2 创建响应模型 WebhookResponse
    - 创建 `WebhookResponse.java` - 响应主体
    - 创建 `WebhookResponseData.java` - 响应数据
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.3 创建日志实体类 LogisticsWebhookLog
    - 创建 `LogisticsWebhookLog.java` - 日志实体
    - 包含所有日志表字段的映射
    - _Requirements: 4.1, 4.2_

- [x] 3. 创建数据访问层 (Mapper)
  - [x] 3.1 创建 LogisticsWebhookLogMapper
    - 创建 `LogisticsWebhookLogMapper.java` 接口
    - 创建 `LogisticsWebhookLogMapper.xml` SQL 映射文件
    - 实现 insert、updateById、selectByEventId 方法
    - _Requirements: 4.1, 4.4, 6.2_

  - [x] 3.2 扩展 DrugOrderMapper 添加物流更新方法
    - 在现有 Mapper 中添加 updateLogisticsInfo 方法
    - 在 XML 中添加对应的 SQL 语句
    - 添加 countByOrderNum 方法用于检查订单是否存在
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. 创建服务层
  - [x] 4.1 创建 LogisticsWebhookLogService 日志服务
    - 创建 `LogisticsWebhookLogService.java` 接口
    - 创建 `LogisticsWebhookLogServiceImpl.java` 实现类
    - 实现 createLog、updateLog、findByEventId 方法
    - _Requirements: 4.1, 4.4, 4.5, 4.6_

  - [x] 4.2 创建 LogisticsWebhookService 业务服务
    - 创建 `LogisticsWebhookService.java` 接口
    - 创建 `LogisticsWebhookServiceImpl.java` 实现类
    - 实现 processShippedEvent、checkIdempotency、verifySignature 方法
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 6.1, 6.3, 7.1, 7.2_

  - [ ]* 4.3 编写 Service 层单元测试
    - 测试幂等性检查逻辑
    - 测试订单更新逻辑
    - 测试异常处理
    - _Requirements: 3.2, 6.1, 6.3_

- [x] 5. 创建控制器层
  - [x] 5.1 创建 LogisticsController
    - 创建 `LogisticsController.java`
    - 实现 `/api/v1/logistics/webhook` POST 端点
    - 实现请求头验证
    - 实现请求体解析和验证
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

  - [ ]* 5.2 编写 Controller 层单元测试
    - 测试请求头验证
    - 测试请求体验证
    - 测试响应格式
    - _Requirements: 1.3, 1.4, 2.1, 5.1_

- [x] 6. Checkpoint - 基础功能验证
  - 确保所有代码编译通过
  - 确保基本的请求处理流程正常
  - 如有问题请询问用户

- [ ] 7. 实现属性测试
  - [ ]* 7.1 编写 Property 1 测试: Input Validation Completeness
    - **Property 1: Input Validation Completeness**
    - 生成随机的缺失字段组合，验证返回 400
    - **Validates: Requirements 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4**

  - [ ]* 7.2 编写 Property 2 测试: Order Update Completeness
    - **Property 2: Order Update Completeness**
    - 生成随机物流信息，验证数据库更新正确
    - **Validates: Requirements 3.3, 3.4, 3.5**

  - [ ]* 7.3 编写 Property 3 测试: Request Logging Completeness
    - **Property 3: Request Logging Completeness**
    - 生成随机请求，验证日志记录完整
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.6**

  - [ ]* 7.4 编写 Property 4 测试: Idempotency Guarantee
    - **Property 4: Idempotency Guarantee**
    - 发送相同 event_id 多次，验证幂等性
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [ ]* 7.5 编写 Property 5 测试: Response Format Consistency
    - **Property 5: Response Format Consistency**
    - 生成各种请求场景，验证响应格式一致
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [-] 8. 集成和配置
  - [x] 8.1 添加配置项
    - 在 application.properties 中添加签名验证开关配置
    - 添加签名密钥配置（可选）
    - _Requirements: 7.1, 7.4_

  - [x] 8.2 添加 Swagger/API 文档注解
    - ⚠️ 跳过：adinnet-admin 模块未配置 Swagger 依赖
    - 已在代码中添加完整的 JavaDoc 注释作为替代
    - _Requirements: 1.1_

- [x] 9. Final Checkpoint - 完整功能验证
  - ✅ 所有代码编译通过（无诊断错误）
  - ✅ API 端点 `/api/v1/logistics/webhook` 已创建
  - ✅ 数据库表 SQL 脚本已准备
  - ✅ 配置项已添加到 application-dev.properties
  - ⚠️ Swagger 注解跳过（模块未配置依赖），已使用 JavaDoc 替代

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 本实现基于现有的 adinnet-admin 模块架构
- 使用 MyBatis 作为 ORM 框架
- 日志表设计参考了现有的 t_pharmacy_api_call_log 表
- 属性测试使用 jqwik 框架（如果项目中已配置）
