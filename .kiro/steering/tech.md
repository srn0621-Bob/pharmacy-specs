# 技术栈

## 后端技术栈 (Java)

### 核心框架
- **Spring Boot**: 2.1.4.RELEASE
- **Spring MVC**: RESTful API开发
- **MyBatis Plus**: 3.0.7.1 (ORM框架)
- **MySQL**: 8.0 (关系型数据库)
- **Redis**: 缓存和会话管理
- **RabbitMQ**: 消息队列

### 安全认证
- **Apache Shiro**: 1.3.0 (权限认证框架)
- **JWT**: Token生成和验证

### 工具库
- **Lombok**: 简化Java代码
- **FastJSON**: JSON序列化
- **Hutool**: Java工具类库
- **Apache Commons**: 通用工具类

### 第三方SDK
- **微信支付SDK**: wxpay-sdk 0.0.2
- **支付宝SDK**: alipay-sdk-java 4.35.37.ALL
- **阿里云OSS**: aliyun-sdk-oss 3.8.0
- **阿里云内容检测**: aliyun-java-sdk-green 3.5.1

## 前端技术栈 (Android)

### 开发环境
- **Android SDK**: compileSdkVersion 28
- **Build Tools**: 28.0.3
- **Min SDK**: 19 (Android 4.4+)
- **Target SDK**: 28
- **Java**: 1.8

### 核心库
- **Retrofit**: 2.2.0 (网络请求)
- **OkHttp**: 3.10.0 (HTTP客户端)
- **RxJava**: 2.1.7 (响应式编程)
- **RxAndroid**: 2.0.1
- **Gson**: 2.8.5 (JSON解析)
- **ButterKnife**: 8.8.1 (视图绑定)

### UI组件
- **Support Library**: 28.0.0
- **RecyclerView**: 列表展示
- **CardView**: 卡片布局
- **Design**: Material Design组件
- **ImmersionBar**: 沉浸式状态栏
- **BaseRecyclerViewAdapterHelper**: 2.9.50
- **AgentWeb**: 4.0.2 (WebView封装)

### 第三方服务
- **腾讯IM**: tuikit-5.0.10 (即时通讯)
- **极光推送**: jpush 3.3.9
- **极光认证**: jverification 2.6.4 (一键登录)
- **高德地图**: location 4.6.0
- **友盟分享**: umeng-share 6.9.6
- **Bugly**: crashreport 2.2.0 (崩溃收集)

## 构建工具

### Maven (后端)
```bash
# 编译项目
mvn clean compile

# 打包项目
mvn clean package

# 跳过测试打包
mvn clean package -DskipTests

# 指定环境打包
mvn clean package -P dev    # 开发环境
mvn clean package -P test   # 测试环境
mvn clean package -P prod   # 生产环境

# 运行Spring Boot应用
mvn spring-boot:run
```

### Gradle (Android)
```bash
# 编译项目
./gradlew build

# 清理构建
./gradlew clean

# 构建Debug版本
./gradlew assembleDebug

# 构建Release版本
./gradlew assembleRelease

# 安装到设备
./gradlew installDebug
./gradlew installRelease
```

## 项目结构

### 后端模块结构
```
internet-hospital/
├── adinnet-admin/          # 管理后台 (端口: 8091)
├── adinnet-patient-api/    # 患者端API (端口: 8092)
├── adinnet-doctor-api/     # 医生端API (端口: 8093)
├── adinnet-job/            # 定时任务模块
├── adinnet-core/           # 核心模块 (公共配置)
├── adinnet-common/         # 公共模块 (工具类、常量)
└── sql/                    # 数据库脚本
```

### Android项目结构
```
app/
├── src/main/
│   ├── java/               # Java源代码
│   │   └── com.adinnet.demo/
│   │       ├── activity/   # Activity
│   │       ├── fragment/   # Fragment
│   │       ├── adapter/    # 适配器
│   │       ├── model/      # 数据模型
│   │       ├── api/        # API接口定义
│   │       ├── utils/      # 工具类
│   │       └── widget/     # 自定义控件
│   ├── res/                # 资源文件
│   └── AndroidManifest.xml
└── build.gradle            # 构建配置
```

## 开发环境配置

### 后端开发环境
- **JDK**: 1.8+
- **Maven**: 3.6+
- **MySQL**: 8.0+
- **Redis**: 3.0+
- **RabbitMQ**: 3.6+
- **IDE**: IntelliJ IDEA (推荐)

### Android开发环境
- **Android Studio**: 3.1+
- **JDK**: 1.8
- **Gradle**: 4.4+
- **Android SDK**: API 28

## 常用命令

### 数据库操作
```bash
# 导入数据库
mysql -u root -p internet_hospital < sql/20220829192218.sql

# 执行增量脚本
mysql -u root -p internet_hospital < sql/alter_xxx.sql
```

### 启动服务
```bash
# 启动管理后台
cd internet-hospital/adinnet-admin
mvn spring-boot:run

# 启动患者端API
cd internet-hospital/adinnet-patient-api
mvn spring-boot:run

# 启动医生端API
cd internet-hospital/adinnet-doctor-api
mvn spring-boot:run
```

### 日志查看
```bash
# 查看实时日志
tail -f logs/patient_info.log
tail -f logs/patient_error.log

# 查看指定日期日志
cat logs/patient_info.2026-01-22.log
```

## API文档

### Swagger访问地址
- 管理后台: http://localhost:8091/swagger-ui.html
- 患者端API: http://localhost:8092/swagger-ui.html
- 医生端API: http://localhost:8093/swagger-ui.html

## 环境配置

### 配置文件位置
- 开发环境: `src/main/resources/application-dev.properties`
- 测试环境: `src/main/resources/application-test.properties`
- 生产环境: `src/main/resources/application-prod.properties`

### 关键配置项
```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/internet_hospital
spring.datasource.username=root
spring.datasource.password=password

# Redis配置
spring.redis.host=127.0.0.1
spring.redis.port=6379

# RabbitMQ配置
spring.rabbitmq.host=127.0.0.1
spring.rabbitmq.port=5672

# 文件上传路径
local.real.path=/home/tim/internet-hospital/uploadFile/

# 日志路径
log.path=/tmp/logs/
```

## 代码规范

### 命名约定
- **类名**: 大驼峰 `PatientUserController`
- **方法名**: 小驼峰 `phoneLogin`
- **变量名**: 小驼峰 `patientUser`
- **常量名**: 全大写下划线 `PATIENT_LOGIN_KEY`
- **包名**: 全小写 `com.adinnet.patient`

### 注释规范
- 所有代码注释使用中文
- 类和方法必须添加注释说明
- 复杂业务逻辑添加行内注释
