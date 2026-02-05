# 项目结构

## 工作区组织

```
workspace/
├── internet-hospital/          # Java后端服务 (Git独立仓库)
├── mshlwyy_patient/           # Android患者端 (Git独立仓库)
├── mshlwyy_doctor/            # Android医生端 (Git独立仓库)
├── api-audit-tool/            # API审计工具
├── .kiro/                     # Kiro配置和规范文档
└── README.md
```

## 后端项目结构 (internet-hospital)

### 模块划分

```
internet-hospital/
├── adinnet-admin/             # 管理后台模块 (端口: 8091)
│   ├── src/main/java/com/adinnet/admin/
│   │   ├── common/            # 公共组件
│   │   │   ├── config/        # 配置类 (Shiro、拦截器等)
│   │   │   ├── shiro/         # Shiro安全框架
│   │   │   ├── utils/         # 工具类
│   │   │   └── exception/     # 异常处理
│   │   └── system/            # 系统模块
│   │       ├── controller/    # 控制器层
│   │       ├── service/       # 服务层
│   │       ├── mapper/        # 数据访问层
│   │       └── model/         # 实体类
│   └── src/main/resources/
│       ├── application.properties
│       ├── application-dev.properties
│       ├── application-test.properties
│       ├── application-prod.properties
│       ├── xml/               # MyBatis XML映射文件
│       └── static/            # 静态资源
│
├── adinnet-patient-api/       # 患者端API模块 (端口: 8092)
│   ├── src/main/java/com/patient/api/
│   │   ├── app/               # 应用模块
│   │   │   ├── controller/    # API控制器
│   │   │   ├── service/       # 业务服务
│   │   │   │   ├── impl/      # 服务实现
│   │   │   │   └── pharmacy/  # 药房相关服务
│   │   │   ├── mapper/        # 数据访问
│   │   │   │   └── pharmacy/  # 药房相关Mapper
│   │   │   └── model/         # 数据模型
│   │   │       └── pharmacy/  # 药房相关模型
│   │   └── common/            # 公共组件
│   │       ├── config/        # 配置类
│   │       ├── pharmacy/      # 药房集成组件
│   │       └── utils/         # 工具类
│   └── src/main/resources/
│       ├── application.properties
│       └── xml/
│           └── pharmacy/      # 药房相关XML
│
├── adinnet-doctor-api/        # 医生端API模块 (端口: 8093)
│   ├── src/main/java/com/doctor/api/
│   │   ├── app/               # 应用模块
│   │   │   ├── controller/    # API控制器
│   │   │   ├── service/       # 业务服务
│   │   │   │   └── impl/      # 服务实现
│   │   │   ├── mapper/        # 数据访问
│   │   │   ├── model/         # 数据模型
│   │   │   │   ├── pharmacy/  # 药房相关模型
│   │   │   │   └── internal/  # 内部模型
│   │   │   ├── util/          # 工具类
│   │   │   └── exception/     # 异常定义
│   │   └── common/            # 公共组件
│   │       └── config/        # 配置类
│   └── src/main/resources/
│       ├── application.properties
│       └── xml/               # MyBatis XML
│
├── adinnet-job/               # 定时任务模块
│   ├── src/main/java/com/adinnet/job/
│   │   ├── task/              # 定时任务类
│   │   ├── service/           # 业务服务
│   │   └── mapper/            # 数据访问
│   ├── sh_files/              # Shell脚本
│   └── docs/                  # 文档
│
├── adinnet-core/              # 核心模块 (公共配置)
│   └── src/main/java/com/adinnet/core/
│       ├── config/            # 全局配置
│       ├── base/              # 基础类
│       └── utils/             # 核心工具类
│
├── adinnet-common/            # 公共模块
│   └── src/main/java/com/adinnet/common/
│       ├── constants/         # 常量定义
│       ├── utils/             # 工具类
│       ├── model/             # 公共模型
│       └── exception/         # 异常定义
│
├── sql/                       # 数据库脚本
│   ├── 20220829192218.sql     # 完整建表脚本
│   ├── alter_*.sql            # 增量更新脚本
│   ├── d_*.sql                # 字典数据
│   └── t_*.sql                # 表结构
│
├── docs/                      # 项目文档
└── pom.xml                    # Maven父POM
```

### 标准包结构

#### Controller层
```
controller/
├── PatientUserController.java      # 患者用户相关
├── OrderController.java            # 订单相关
├── DrugController.java             # 药品相关
└── ...
```

#### Service层
```
service/
├── PatientUserService.java         # 接口定义
└── impl/
    └── PatientUserServiceImpl.java # 实现类
```

#### Mapper层
```
mapper/
├── PatientUserMapper.java          # Mapper接口
└── xml/
    └── PatientUserMapper.xml       # MyBatis XML
```

#### Model层
```
model/
├── PatientUser.java                # 实体类
├── request/                        # 请求DTO
│   └── LoginRequest.java
└── response/                       # 响应DTO
    └── LoginResponse.java
```

## Android项目结构

### 患者端 (mshlwyy_patient)

```
mshlwyy_patient/
├── app/                           # 主应用模块
│   ├── src/main/
│   │   ├── java/com/adinnet/demo/
│   │   │   ├── activity/          # Activity
│   │   │   │   ├── login/         # 登录相关
│   │   │   │   ├── main/          # 主页相关
│   │   │   │   ├── order/         # 订单相关
│   │   │   │   └── mall/          # 商城相关
│   │   │   ├── fragment/          # Fragment
│   │   │   ├── adapter/           # RecyclerView适配器
│   │   │   ├── model/             # 数据模型
│   │   │   │   ├── bean/          # 实体类
│   │   │   │   └── response/      # API响应
│   │   │   ├── api/               # Retrofit接口定义
│   │   │   │   ├── ApiService.java
│   │   │   │   └── RetrofitClient.java
│   │   │   ├── utils/             # 工具类
│   │   │   ├── widget/            # 自定义控件
│   │   │   └── MyApplication.java
│   │   ├── res/                   # 资源文件
│   │   │   ├── layout/            # 布局文件
│   │   │   ├── drawable/          # 图片资源
│   │   │   ├── values/            # 值资源
│   │   │   └── xml/               # XML配置
│   │   └── AndroidManifest.xml
│   ├── libs/                      # 第三方库
│   └── build.gradle               # 构建配置
│
├── android-common/                # 公共模块
│   └── src/main/java/
│       └── com/adinnet/common/
│
├── tuikit/                        # 腾讯IM模块
│   ├── libs/
│   │   ├── imsdk-5.0.10.aar
│   │   └── tuikit-5.0.10.aar
│   └── src/main/
│
├── hbanner/                       # Banner组件
├── imcore/                        # IM核心
├── plugin/                        # Gradle插件
├── build.gradle                   # 根构建配置
└── settings.gradle                # 模块配置
```

### 医生端 (mshlwyy_doctor)

结构与患者端类似，但功能模块不同：
- 问诊管理
- 患者管理
- 排班管理
- 收益管理

## 规范文档结构 (.kiro)

```
.kiro/
├── steering/                      # Steering规则
│   ├── general.md                 # 通用规则
│   ├── product.md                 # 产品概述
│   ├── tech.md                    # 技术栈
│   └── structure.md               # 项目结构
│
└── specs/                         # 功能规范
    ├── api-farmacy-interface/     # 药房接口集成
    ├── logistics-api-migration/   # 物流API迁移
    ├── logistics-webhook/         # 物流回调
    ├── prescription-audit-webhook/# 处方审核回调
    ├── patient-pharmacy-order-push/# 患者端订单推送
    └── patient-drug-mall/         # 患者端药品商城
```

## 文件命名约定

### Java文件
- **Controller**: `{功能}Controller.java`
- **Service接口**: `{功能}Service.java`
- **Service实现**: `{功能}ServiceImpl.java`
- **Mapper**: `{功能}Mapper.java`
- **Entity**: `{表名对应的实体}.java`
- **DTO**: `{功能}Request.java` / `{功能}Response.java`

### Android文件
- **Activity**: `{功能}Activity.java`
- **Fragment**: `{功能}Fragment.java`
- **Adapter**: `{功能}Adapter.java`
- **Layout**: `activity_{功能}.xml` / `fragment_{功能}.xml`
- **Item Layout**: `item_{功能}.xml`

### 配置文件
- **Properties**: `application-{环境}.properties`
- **XML Mapper**: `{Mapper名称}Mapper.xml`
- **Shell脚本**: `{任务名称}.sh`

## 关键目录说明

### /sql
存放所有数据库相关脚本：
- 完整建表脚本
- 增量更新脚本
- 数据字典脚本
- 索引优化脚本

### /docs
存放项目文档：
- 技术方案文档
- API文档
- 问题排查文档
- 实施总结文档

### /logs
运行时日志目录：
- `{module}_info.{date}.log` - 信息日志
- `{module}_error.{date}.log` - 错误日志

### /sh_files
定时任务Shell脚本：
- 每个任务对应一个.sh文件
- 包含Java启动命令和参数配置
