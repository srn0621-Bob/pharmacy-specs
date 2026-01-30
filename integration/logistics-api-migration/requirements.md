# 需求文档 - 物流API迁移到快递100

## 简介

本文档定义了将互联网医院系统的物流查询服务从易药购迁移到快递100的需求。系统需要调用快递100的实时查询接口获取物流信息，同时保持现有的API返回格式不变，确保Android客户端无需修改。

## 术语表

- **System**: 互联网医院后端系统
- **Kuaidi100_API**: 快递100物流查询API服务
- **LogisticsEntity**: 物流信息实体类，包含processNo、processTime、processRemark字段
- **Customer**: 快递100授权码，用于API认证
- **Sign**: 快递100签名，用于API请求验证
- **OrderNum**: 订单号/快递单号

## 需求

### 需求 1: 配置快递100认证参数

**用户故事**: 作为系统管理员，我需要在配置文件中管理快递100的认证参数，以便系统能够安全地调用快递100 API。

#### 验收标准

1. WHEN 系统启动时 THEN System SHALL 从application-dev.properties文件中读取kuaidi100.customer配置项
2. WHEN 系统启动时 THEN System SHALL 从application-dev.properties文件中读取kuaidi100.sign配置项
3. WHEN 系统启动时 THEN System SHALL 从application-dev.properties文件中读取kuaidi100.url配置项
4. THE System SHALL 将快递100配置参数注入到配置类中供服务层使用

### 需求 2: 调用快递100实时查询接口

**用户故事**: 作为后端开发者，我需要实现快递100 API调用逻辑，以便从快递100获取物流跟踪信息。

#### 验收标准

1. WHEN 调用物流查询服务时 THEN System SHALL 向http://poll.kuaidi100.com/poll/query.do发送POST请求
2. WHEN 构建请求时 THEN System SHALL 使用application/x-www-form-urlencoded作为Content-Type
3. WHEN 构建请求参数时 THEN System SHALL 包含param参数，格式为JSON字符串{"com":"快递公司编码","num":"快递单号","resultv2":"1"}
4. WHEN 构建请求参数时 THEN System SHALL 包含customer参数，值从配置文件读取
5. WHEN 构建请求参数时 THEN System SHALL 包含sign参数，值从配置文件读取
6. WHEN 快递100返回成功响应时 THEN System SHALL 解析返回的JSON数据
7. IF 快递100返回错误响应 THEN System SHALL 记录错误日志并返回空列表

### 需求 3: 数据格式转换

**用户故事**: 作为系统架构师，我需要将快递100的返回数据转换为系统现有的LogisticsEntity格式，以便保持API兼容性。

#### 验收标准

1. WHEN 接收到快递100响应数据时 THEN System SHALL 提取data数组中的物流轨迹信息
2. WHEN 转换物流数据时 THEN System SHALL 将快递100的context字段映射到LogisticsEntity的processRemark字段
3. WHEN 转换物流数据时 THEN System SHALL 将快递100的ftime字段映射到LogisticsEntity的processTime字段
4. WHEN 转换物流数据时 THEN System SHALL 为每条物流记录生成递增的processNo编号
5. WHEN 物流数据为空时 THEN System SHALL 返回空列表而不是null
6. THE System SHALL 保持物流记录的时间倒序排列（最新的在前）

### 需求 4: 快递公司编码映射

**用户故事**: 作为业务分析师，我需要系统能够识别不同的快递公司，以便正确调用快递100 API。

#### 验收标准

1. THE System SHALL 支持韵达快递（编码：yunda）
2. THE System SHALL 支持顺丰快递（编码：shunfeng）
3. THE System SHALL 支持圆通快递（编码：yuantong）
4. THE System SHALL 支持中通快递（编码：zhongtong）
5. THE System SHALL 支持申通快递（编码：shentong）
6. THE System SHALL 支持京东快递（编码：jd）
7. WHEN 无法识别快递公司时 THEN System SHALL 使用默认编码或返回错误提示

### 需求 5: 保持现有API接口不变

**用户故事**: 作为Android开发者，我需要后端API接口保持不变，以便客户端无需修改即可使用新的物流服务。

#### 验收标准

1. THE System SHALL 保持POST /api/v1/prescription/drug/viewLogistics接口路径不变
2. THE System SHALL 保持请求参数格式{"orderNum": "订单号"}不变
3. THE System SHALL 保持响应格式{"code": 0, "data": [...]}不变
4. THE System SHALL 保持LogisticsEntity数据结构（processNo、processTime、processRemark）不变
5. WHEN Android客户端调用物流接口时 THEN System SHALL 返回与之前相同格式的数据

### 需求 6: 错误处理和日志记录

**用户故事**: 作为运维工程师，我需要系统记录详细的日志信息，以便排查物流查询问题。

#### 验收标准

1. WHEN 调用快递100 API失败时 THEN System SHALL 记录错误日志，包含请求参数和错误信息
2. WHEN 快递100返回非成功状态码时 THEN System SHALL 记录响应内容到日志
3. WHEN 数据转换失败时 THEN System SHALL 记录异常堆栈信息
4. WHEN 订单号不存在时 THEN System SHALL 返回明确的错误提示
5. IF 网络超时 THEN System SHALL 记录超时日志并返回友好的错误信息

### 需求 7: 配置快递公司编码

**用户故事**: 作为系统管理员，我需要能够配置订单使用的快递公司，以便系统能够正确查询物流信息。

#### 验收标准

1. THE System SHALL 在数据库订单表中存储快递公司编码字段
2. WHEN 查询物流信息时 THEN System SHALL 从订单记录中读取快递公司编码
3. IF 订单未配置快递公司编码 THEN System SHALL 使用默认快递公司编码（yunda）
4. THE System SHALL 支持通过管理后台配置订单的快递公司
