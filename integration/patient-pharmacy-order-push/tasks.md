# Implementation Plan: Patient API 药房订单推送

## Overview

本实现计划将在 adinnet-patient-api 模块中添加药房订单推送功能。实现将复制 doctor-api 中已有的功能，使用相同的数据结构和业务逻辑，但放置在 patient-api 的包命名空间中。

## Tasks

- [x] 1. 创建数据模型类
  - [x] 1.1 创建内部数据模型
    - 在 `com.patient.api.app.model.pharmacy.internal` 包中创建 `OrderMainInfo.java`
    - 在 `com.patient.api.app.model.pharmacy.internal` 包中创建 `DrugInfo.java`
    - 在 `com.patient.api.app.model.pharmacy.internal` 包中创建 `OrderPushResult.java`
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 创建药房 API 请求模型
    - 在 `com.patient.api.app.model.pharmacy.request` 包中创建 `PharmacyOrderRequest.java`
    - 在 `com.patient.api.app.model.pharmacy.request` 包中创建 `OrderInfo.java`
    - 在 `com.patient.api.app.model.pharmacy.request` 包中创建 `GoodsItem.java`
    - 在 `com.patient.api.app.model.pharmacy.request` 包中创建 `ContactInfo.java`
    - 在 `com.patient.api.app.model.pharmacy.request` 包中创建 `PrescriptionInfo.java`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.3 创建药房 API 响应模型
    - 在 `com.patient.api.app.model.pharmacy.response` 包中创建 `PharmacyOrderResponse.java`
    - _Requirements: 5.5, 5.6_

- [x] 2. 创建工具类和配置类
  - [x] 2.1 创建数据转换工具类
    - 在 `com.patient.api.common.pharmacy` 包中创建 `DataConverter.java`
    - 实现 `convertYuanToFen()` 方法
    - 实现 `convertSex()` 方法
    - 实现 `convertQuantity()` 方法
    - 实现 `formatBirthday()` 方法
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 2.2 编写 DataConverter 属性测试
    - **Property 3: 货币转换正确性**
    - **Property 4: 性别代码转换**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 2.3 创建配置类
    - 在 `com.patient.api.common.config` 包中创建 `PharmacyConfig.java`
    - 配置 baseUrl, secretKey, retryCount, timeoutSeconds 属性
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 2.4 创建 RestTemplate 配置
    - 在 `com.patient.api.common.config` 包中创建 `RestTemplateConfig.java`
    - 配置连接超时和读取超时
    - _Requirements: 5.4_

  - [x] 2.5 创建 HTTP 客户端
    - 在 `com.patient.api.common.pharmacy` 包中创建 `PharmacyApiClient.java`
    - 实现 `sendOrder()` 方法，包含重试逻辑
    - 实现 `getApiUrl()` 方法
    - 实现 `buildApiUrl()` 私有方法
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7, 5.8_

- [x] 3. Checkpoint - 确保工具类编译通过
  - 确保所有工具类和配置类编译通过，如有问题请询问用户

- [x] 4. 创建 MyBatis Mapper
  - [x] 4.1 创建 Mapper 接口
    - 在 `com.patient.api.app.mapper.pharmacy` 包中创建 `OrderMainInfoMapper.java`
    - 在 `com.patient.api.app.mapper.pharmacy` 包中创建 `DrugListMapper.java`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 4.2 创建 MyBatis XML 映射文件
    - 在 `src/main/resources/xml/pharmacy/` 目录中创建 `OrderMainInfoMapper.xml`
    - 在 `src/main/resources/xml/pharmacy/` 目录中创建 `DrugListMapper.xml`
    - 使用 LEFT JOIN 连接 t_hos_pre_drug_order, t_hos_prescription, t_patient_user, t_doctor_user
    - 使用 INNER JOIN 连接 t_hos_prescription_drug, t_drug
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 5. 创建数据转换 Mapper
  - [x] 5.1 创建 PharmacyOrderMapper
    - 在 `com.patient.api.app.mapper.pharmacy` 包中创建 `PharmacyOrderMapper.java`
    - 实现 `mapToPharmacyOrder()` 方法
    - 实现 `buildOrderInfo()` 私有方法
    - 实现 `buildGoodsList()` 私有方法
    - 实现 `buildContactInfo()` 私有方法
    - 实现 `buildPrescriptionInfo()` 私有方法
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [ ]* 5.2 编写 PharmacyOrderMapper 属性测试
    - **Property 5: 字段映射完整性**
    - **Property 6: 可选字段处理**
    - **Validates: Requirements 2.1-2.9, 4.1-4.5**

- [x] 6. 创建服务层
  - [x] 6.1 创建服务接口
    - 在 `com.patient.api.app.service.pharmacy` 包中创建 `PharmacyOrderService.java`
    - 定义 `pushOrderToPharmacy(String orderNum)` 方法
    - _Requirements: 1.1_

  - [x] 6.2 创建服务实现
    - 在 `com.patient.api.app.service.pharmacy.impl` 包中创建 `PharmacyOrderServiceImpl.java`
    - 注入 OrderMainInfoMapper, DrugListMapper, PharmacyOrderMapper, PharmacyApiClient
    - 实现 `pushOrderToPharmacy()` 方法
    - 实现 `validateRequiredFields()` 私有方法
    - 添加完整的日志记录
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 6.3 编写 PharmacyOrderService 属性测试
    - **Property 1: 数据检索完整性**
    - **Property 2: 必填字段验证**
    - **Property 7: API 响应处理**
    - **Property 9: 错误容错**
    - **Validates: Requirements 1.1-1.6, 5.5, 5.6, 10.1-10.4**

- [x] 7. Checkpoint - 确保服务层编译通过
  - 确保所有服务类编译通过，如有问题请询问用户

- [x] 8. 更新配置文件
  - [x] 8.1 更新 application.properties
    - 添加 `pharmacy.api.base-url` 配置
    - 添加 `pharmacy.api.secret-key` 配置
    - 添加 `pharmacy.api.retry-count` 配置
    - 添加 `pharmacy.api.timeout-seconds` 配置
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 8.2 更新 MyBatis 配置
    - 确保 MyBatis 扫描 `com.patient.api.app.mapper.pharmacy` 包
    - 确保 XML 映射文件路径正确配置
    - _Requirements: 8.2, 8.3_

- [x] 9. Final Checkpoint - 确保所有代码编译通过
  - 运行 Maven 编译验证
  - 确保所有测试通过，如有问题请询问用户

## Notes

- 任务标记 `*` 的为可选任务，可以跳过以加快 MVP 开发
- 每个任务都引用了具体的需求以便追溯
- Checkpoint 任务确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
- 代码结构与 doctor-api 中的实现保持一致，便于维护

