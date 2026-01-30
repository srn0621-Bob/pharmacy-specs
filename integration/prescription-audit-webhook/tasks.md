# Implementation Plan: Prescription Audit Webhook

## Overview

本实现计划将处方审核结果Webhook功能分解为可执行的编码任务。实现遵循现有logistics/webhook的架构模式，使用Java/Spring Boot技术栈。

## Tasks

- [x] 1. 创建数据库表和SQL脚本
  - [x] 1.1 创建t_prescription_audit_webhook_log表SQL脚本
    - 在`internet-hospital/sql/`目录下创建`t_prescription_audit_webhook_log.sql`
    - 包含表结构定义和索引
    - _Requirements: 8.1-8.5_

- [x] 2. 创建数据模型类
  - [x] 2.1 创建PrescriptionAuditEvent事件模型
    - 在`com.adinnet.admin.system.model.prescription`包下创建
    - 包含id、type、timestamp、data字段
    - 使用Lombok @Data注解
    - _Requirements: 1.2_
  - [x] 2.2 创建PrescriptionAuditData数据模型
    - 包含presNo、orderId、recipeUrl、status、msg字段
    - 使用@JsonProperty注解处理下划线命名
    - _Requirements: 1.2_
  - [x] 2.3 创建AuditStatusMapper状态映射工具类
    - 实现mapStatus方法：1→"PASS"，2→"REJECT"
    - 处理无效状态值抛出异常
    - _Requirements: 3.3, 3.4_
  - [x] 2.4 创建PrescriptionAuditWebhookLog日志实体类
    - 包含所有日志字段
    - 定义处理状态常量
    - _Requirements: 7.1-7.12_

- [x] 3. 创建日志Mapper层
  - [x] 3.1 创建PrescriptionAuditWebhookLogMapper接口
    - 定义selectByEventId方法
    - 定义insertLog方法
    - 定义updateLog方法
    - _Requirements: 7.1, 8.2_
  - [x] 3.2 创建PrescriptionAuditWebhookLogMapper.xml
    - 实现所有SQL语句
    - _Requirements: 7.1-7.12_

- [x] 4. 扩展处方Mapper层
  - [x] 4.1 在HosPrescriptionMapper中添加查询方法
    - 添加selectByPrescriptionNum方法
    - 根据prescription_num字段查询处方记录
    - _Requirements: 2.1_
  - [x] 4.2 在HosPrescriptionMapper中添加更新方法
    - 添加updateAuditInfo方法
    - 更新img、check_time、check_status、check_content、check_return、check_pharmaceutist字段
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1_
  - [x] 4.3 在HosPrescriptionMapper.xml中添加SQL语句
    - 实现selectByPrescriptionNum的SQL
    - 实现updateAuditInfo的SQL
    - _Requirements: 2.1, 3.1-3.6, 4.1_

- [x] 5. 创建日志Service层
  - [x] 5.1 创建PrescriptionAuditWebhookLogService接口
    - 定义createLog、findByEventId、updateLog方法
    - _Requirements: 7.1_
  - [x] 5.2 创建PrescriptionAuditWebhookLogServiceImpl实现类
    - 实现日志的创建、查询、更新
    - _Requirements: 7.1-7.12_

- [x] 6. 创建业务Service层
  - [x] 6.1 创建PrescriptionAuditWebhookService接口
    - 定义processAuditEvent方法
    - 定义isEventProcessed方法（幂等性检查）
    - _Requirements: 1.1, 5.1_
  - [x] 6.2 创建PrescriptionAuditWebhookServiceImpl实现类
    - 实现幂等性检查逻辑（基于日志表）
    - 实现处方记录查找逻辑
    - 实现字段更新逻辑
    - 集成日志记录
    - _Requirements: 2.1, 2.2, 3.1-3.6, 4.1, 5.1, 7.1-7.12_

- [x] 7. 创建Controller层
  - [x] 7.1 创建PrescriptionAuditController控制器
    - 定义POST /api/v1/prescription/audit/webhook端点
    - 实现请求头验证（X-App-Event、X-App-Timestamp、X-App-Signature）
    - 实现请求体解析
    - 调用Service处理事件
    - 返回标准响应格式
    - _Requirements: 1.1-1.5, 6.1-6.4_

- [x] 8. 创建异常处理类
  - [x] 8.1 创建PrescriptionNotFoundException异常类
    - 用于处方记录不存在的情况
    - _Requirements: 2.2, 6.2_
  - [x] 8.2 创建InvalidStatusException异常类
    - 用于状态值无效的情况
    - _Requirements: 6.3_

- [x] 9. Checkpoint - 编译验证
  - 确保所有代码编译通过
  - 检查依赖注入配置正确
  - 如有问题请询问用户

- [ ]* 10. 编写单元测试
  - [ ]* 10.1 编写AuditStatusMapper单元测试
    - 测试status=1返回"PASS"
    - 测试status=2返回"REJECT"
    - 测试无效状态抛出异常
    - _Requirements: 3.3, 3.4_
  - [ ]* 10.2 编写PrescriptionAuditWebhookServiceImpl单元测试
    - 测试处方记录查找
    - 测试字段更新逻辑
    - 测试幂等性处理
    - 测试日志记录
    - _Requirements: 2.1, 3.1-3.6, 5.1, 7.1-7.12_
  - [ ]* 10.3 编写PrescriptionAuditController单元测试
    - 测试请求头验证
    - 测试成功响应格式
    - 测试错误响应格式
    - _Requirements: 1.3-1.5, 6.1-6.3_

- [ ]* 11. 编写属性测试
  - [ ]* 11.1 编写状态映射属性测试
    - **Property 3: Status Mapping Correctness**
    - **Validates: Requirements 3.3, 3.4**
  - [ ]* 11.2 编写字段更新完整性属性测试
    - **Property 4: Field Update Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.5, 3.6, 4.1**
  - [ ]* 11.3 编写幂等性属性测试
    - **Property 5: Idempotency**
    - **Validates: Requirements 5.1**

- [x] 12. Final Checkpoint - 功能验证
  - 确保所有测试通过
  - 验证端点可正常访问
  - 验证日志记录正确
  - 如有问题请询问用户

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- 实现参考现有的LogisticsController和LogisticsWebhookServiceImpl
