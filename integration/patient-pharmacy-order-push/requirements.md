# Requirements Document

## Introduction

本文档定义了在 **adinnet-patient-api** 模块中实现药房订单推送功能的需求。该功能将复制 doctor-api 中已实现的药房订单推送逻辑到 patient-api 模块，使患者端应用也能够在处方审核提交时自动将订单推送到外部药房系统。

**背景说明**: 药房订单推送功能已在 doctor-api 模块中实现，现需要在 patient-api 模块中添加相同的功能，以支持患者端的处方订单推送场景。doctor-api 中的现有实现将保留不变。

**关键触发点**: 药房订单推送在处方提交审核时触发（状态从 `SIGN` 变为 `WAIT`），这允许药房在审核过程中开始准备药品，减少整体配送时间。

## Glossary

- **System**: adinnet-patient-api 模块中的药房订单集成服务
- **Patient API Module**: adinnet-patient-api Spring Boot 应用模块
- **Pharmacy API**: 外部处方中心系统 API 端点
- **Prescription Entity**: 内部处方记录 (HosPrescription)
- **Drug Entity**: 内部药品信息记录 (Drug)
- **Patient Entity**: 内部患者用户记录 (PatientUser)
- **Doctor Entity**: 内部医生用户记录 (DoctorUser)
- **Currency Unit**: 元 (Yuan) 用于内部存储，分 (Fen) 用于药房 API
- **Order Number**: 处方订单的唯一标识符 (order_num, P-前缀)
- **Prescription Status**: 处方的当前状态 (NOTSIGN, SIGN, WAIT, PASS, REJECT)

## Requirements

### Requirement 1: 药房订单推送服务

**User Story:** 作为系统管理员，我希望 patient-api 模块能够自动将处方订单推送到药房系统，以便药房可以在审核过程中开始准备药品。

#### Acceptance Criteria

1. WHEN the System receives a pharmacy order push request THEN the System SHALL retrieve the complete prescription information from the database
2. WHEN retrieving prescription information THEN the System SHALL join data from Prescription Entity, Drug Entity, Patient Entity, and Doctor Entity tables
3. WHEN the prescription data is retrieved THEN the System SHALL validate that all required fields are present
4. IF any required field is missing THEN the System SHALL log an error and return a failure result
5. WHEN all required data is available THEN the System SHALL proceed to data transformation
6. WHEN the order push is triggered THEN the System SHALL execute it synchronously with comprehensive error handling

### Requirement 2: 数据字段映射

**User Story:** 作为数据集成开发人员，我希望系统能够正确地将内部数据字段映射到药房 API 字段，以便药房系统接收格式正确的订单信息。

#### Acceptance Criteria

1. WHEN mapping order information THEN the System SHALL map Prescription Entity order_num to pharmacy API order_id field
2. WHEN mapping order information THEN the System SHALL map Prescription Entity total_price to pharmacy API order_price_fen field
3. WHEN mapping order information THEN the System SHALL map Prescription Entity total_price to pharmacy API order_origin_price_fen field
4. WHEN mapping order information THEN the System SHALL set pharmacy API order_express_fen field to zero
5. WHEN mapping contact information THEN the System SHALL map Prescription Entity name, mobile, province, city, district, and address fields to corresponding pharmacy API contact_info fields
6. WHEN mapping prescription information THEN the System SHALL map Prescription Entity prescription_num, img, name, sex, age, mobile, medical_certificate, and depart_name fields to corresponding pharmacy API pres_info fields
7. WHEN mapping doctor information THEN the System SHALL retrieve Doctor Entity name and hospital_name through doctor_user_id relationship
8. WHEN mapping patient birthday THEN the System SHALL retrieve Patient Entity birth_day through patient_user_id relationship
9. WHEN mapping drug information THEN the System SHALL retrieve Drug Entity msh_id through drug_id relationship for each prescription drug

### Requirement 3: 数据类型转换

**User Story:** 作为数据集成开发人员，我希望系统能够执行必要的数据类型转换，以便药房 API 接收正确格式的数据。

#### Acceptance Criteria

1. WHEN converting currency amounts THEN the System SHALL multiply Yuan values by 100 to convert to Fen
2. WHEN converting currency amounts THEN the System SHALL ensure the result is an integer value
3. WHEN converting sex field THEN the System SHALL convert internal value "1" to pharmacy API value "m"
4. WHEN converting sex field THEN the System SHALL convert internal value "0" to pharmacy API value "f"
5. WHEN converting drug quantity THEN the System SHALL convert string values to integer values
6. WHEN converting birthday format THEN the System SHALL ensure the format is YYYY-MM-DD
7. IF a conversion fails THEN the System SHALL log the error with the field name and original value

### Requirement 4: 可选字段处理

**User Story:** 作为系统管理员，我希望系统能够适当处理可选字段，以便即使某些非关键信息不可用时也能处理订单。

#### Acceptance Criteria

1. WHEN optional prescription fields are unavailable THEN the System SHALL set them to null or empty string
2. WHEN patient information is incomplete in Prescription Entity THEN the System SHALL attempt to retrieve from Patient Entity
3. WHEN patient birthday is unavailable THEN the System SHALL set birthday field to null
4. WHEN doctor information is unavailable THEN the System SHALL set doctor_name and hospital fields to null
5. WHEN prescription image URL is unavailable THEN the System SHALL set pres_img_url field to null

### Requirement 5: 药房 API 通信

**User Story:** 作为系统管理员，我希望系统能够向药房 API 发送格式正确的请求，以便在药房系统中成功创建订单。

#### Acceptance Criteria

1. WHEN sending pharmacy API request THEN the System SHALL use POST method
2. WHEN sending pharmacy API request THEN the System SHALL include app_secret_key in the URL query parameter
3. WHEN sending pharmacy API request THEN the System SHALL format the request body with order_info, goods_list, contact_info, and pres_info sections
4. WHEN sending pharmacy API request THEN the System SHALL set appropriate HTTP headers including Content-Type
5. WHEN the pharmacy API returns error_code 0 THEN the System SHALL mark the order as successfully pushed
6. WHEN the pharmacy API returns error_code 1 THEN the System SHALL log the error_msg and mark the order as failed
7. IF the pharmacy API request times out THEN the System SHALL retry the request up to 3 times
8. IF all retry attempts fail THEN the System SHALL log the failure and return error result

### Requirement 6: 数据库查询优化

**User Story:** 作为数据库管理员，我希望系统使用优化的查询，以便订单数据检索不会影响系统性能。

#### Acceptance Criteria

1. WHEN retrieving order data THEN the System SHALL use separate queries for order main information and drug list
2. WHEN retrieving order main information THEN the System SHALL execute a single query joining Prescription Entity, Patient Entity, and Doctor Entity
3. WHEN retrieving drug list THEN the System SHALL execute a separate query joining Prescription Drug Entity and Drug Entity
4. WHEN executing database queries THEN the System SHALL use indexed fields for join conditions

### Requirement 7: 日志记录

**User Story:** 作为系统管理员，我希望系统记录所有集成活动，以便我可以监控和排查订单处理问题。

#### Acceptance Criteria

1. WHEN processing an order THEN the System SHALL log the order number and processing start time
2. WHEN data transformation occurs THEN the System SHALL log the transformation details for audit purposes
3. WHEN sending pharmacy API request THEN the System SHALL log the request payload
4. WHEN receiving pharmacy API response THEN the System SHALL log the response payload
5. WHEN an error occurs THEN the System SHALL log the error with stack trace and context information
6. WHEN order processing completes THEN the System SHALL log the completion status and duration

### Requirement 8: 模块架构

**User Story:** 作为系统架构师，我希望药房集成服务在 patient-api 模块中实现，以便它可以直接访问患者和处方服务并保持架构一致性。

#### Acceptance Criteria

1. WHEN implementing the pharmacy integration THEN the System SHALL be deployed in the adinnet-patient-api module
2. WHEN implementing service classes THEN the System SHALL place them in the com.patient.api.app.service.pharmacy package
3. WHEN implementing mapper classes THEN the System SHALL place them in the com.patient.api.app.mapper.pharmacy package
4. WHEN implementing model classes THEN the System SHALL place them in the com.patient.api.app.model.pharmacy package
5. WHEN implementing utility classes THEN the System SHALL place them in the com.patient.api.common.pharmacy package
6. WHEN implementing configuration classes THEN the System SHALL place them in the com.patient.api.common.config package

### Requirement 9: 配置管理

**User Story:** 作为系统管理员，我希望系统能够从外部加载配置参数，以便我可以在不修改代码的情况下修改设置。

#### Acceptance Criteria

1. WHEN the System starts THEN the System SHALL load pharmacy API URL from configuration
2. WHEN the System starts THEN the System SHALL load app_secret_key from configuration
3. WHEN the System starts THEN the System SHALL load retry count and timeout values from configuration
4. IF configuration values are missing THEN the System SHALL use sensible default values and log a warning

### Requirement 10: 错误处理与容错

**User Story:** 作为系统管理员，我希望药房订单推送失败不会影响主业务流程，以便系统具有良好的容错性。

#### Acceptance Criteria

1. WHEN the pharmacy order push fails THEN the System SHALL log the error and return failure result
2. WHEN the pharmacy order push throws an exception THEN the System SHALL catch the exception and return failure result
3. WHEN the pharmacy order push succeeds THEN the System SHALL log the success with order details
4. WHEN the pharmacy order push fails THEN the System SHALL log the failure with error details

