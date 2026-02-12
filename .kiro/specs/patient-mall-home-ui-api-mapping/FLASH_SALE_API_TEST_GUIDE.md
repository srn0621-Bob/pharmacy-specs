# 闪购药品 API 测试指南

## 当前状态

根据日志检查，后端服务当前**未运行**。最后一次运行记录是 2026-02-09 22:12:38。

## 测试前准备

### 1. 启动后端服务

```bash
# 进入患者端 API 目录
cd internet-hospital-mall/adinnet-patient-api

# 启动服务（开发环境）
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 或者使用已编译的 JAR
java -jar target/adinnet-patient-api.jar --spring.profiles.active=dev
```

### 2. 确认服务启动成功

```bash
# 检查端口 8092 是否被监听
netstat -ano | findstr "8092"

# 访问健康检查接口（如果有）
curl http://localhost:8092/actuator/health

# 或访问 Swagger 文档
# 浏览器打开: http://localhost:8092/swagger-ui.html
```

## 闪购 API 测试

### API 端点信息

- **URL**: `GET /api/v1/mall/drugs/flash-sale`
- **端口**: 8092
- **参数**: 
  - `limit` (可选): 返回数量限制，默认 10，最大 50

### 测试用例

#### 用例 1: 基本调用（默认参数）

```bash
curl -X GET "http://localhost:8092/api/v1/mall/drugs/flash-sale" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "name": "药品名称",
      "price": 29.90,
      "originalPrice": 39.90,
      "imageUrl": "http://...",
      "stock": 100,
      "sales": 50
    }
  ]
}
```

#### 用例 2: 指定返回数量

```bash
curl -X GET "http://localhost:8092/api/v1/mall/drugs/flash-sale?limit=5" \
  -H "Content-Type: application/json"
```

#### 用例 3: 边界测试（最大数量）

```bash
curl -X GET "http://localhost:8092/api/v1/mall/drugs/flash-sale?limit=50" \
  -H "Content-Type: application/json"
```

#### 用例 4: 参数验证测试（超出范围）

```bash
# 应该返回参数错误
curl -X GET "http://localhost:8092/api/v1/mall/drugs/flash-sale?limit=100" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
{
  "code": 400,
  "message": "限制数量必须在1-50之间",
  "data": null
}
```

## 日志监控

### 实时查看日志

```bash
# Windows PowerShell
Get-Content -Path "internet-hospital-mall\adinnet-patient-api\log_path_IS_UNDEFINED\patient_info.2026-02-11.log" -Wait -Tail 50

# 或使用 tail 命令（如果安装了 Git Bash）
tail -f internet-hospital-mall/adinnet-patient-api/log_path_IS_UNDEFINED/patient_info.2026-02-11.log
```

### 搜索闪购相关日志

```bash
# 搜索闪购 API 调用记录
Get-Content -Path "internet-hospital-mall\adinnet-patient-api\log_path_IS_UNDEFINED\patient_info.2026-02-11.log" | Select-String -Pattern "flash-sale|flash_sale|闪购|getFlashSaleDrugs"

# 搜索错误日志
Get-Content -Path "internet-hospital-mall\adinnet-patient-api\log_path_IS_UNDEFINED\patient_error.2026-02-11.log" | Select-String -Pattern "flash-sale|flash_sale|闪购"
```

## 前端测试

### 1. 安装并启动 Android 应用

```bash
cd mshlwyy_patient-mall

# 安装到设备
./gradlew installDebug

# 或直接运行
./gradlew installDebug
adb shell am start -n com.adinnet.demo/.activity.MainActivity
```

### 2. 查看网络请求日志

使用 Android Studio 的 Logcat 或 Charles/Fiddler 抓包工具：

**搜索关键词**:
- `flash-sale`
- `/api/v1/mall/drugs/flash-sale`
- `MallHomePresenter`
- `getFlashSaleDrugs`

**预期日志**:
```
D/OkHttp: --> GET http://localhost:8092/api/v1/mall/drugs/flash-sale?limit=10
D/OkHttp: <-- 200 OK (123ms)
I/MallHomePresenter: 闪购药品加载成功，数量: 10
```

### 3. UI 验证

打开商城首页，检查：
- ✅ 轮播图正常显示
- ✅ 闪购专区显示药品（横向滚动列表）
- ✅ 推荐药品显示（2列网格）
- ✅ 下拉刷新功能正常

## 验证清单

### 后端验证

- [ ] 服务启动成功（端口 8092 监听）
- [ ] Swagger 文档可访问
- [ ] 闪购 API 返回 200 状态码
- [ ] 返回数据包含 originalPrice 字段
- [ ] 返回数据满足筛选条件（price < originalPrice）
- [ ] Redis 缓存生效（第二次请求更快）
- [ ] 参数验证正常（limit 范围检查）
- [ ] 日志记录完整

### 前端验证

- [ ] 应用编译成功
- [ ] 应用安装成功
- [ ] 商城首页加载成功
- [ ] 3 个 API 并发调用成功
- [ ] 闪购专区显示药品
- [ ] 药品数据正确（价格、图片、名称）
- [ ] 点击药品跳转详情页
- [ ] 下拉刷新功能正常

## 常见问题

### 问题 1: 服务启动失败 - Bean 冲突

**症状**: 
```
ConflictingBeanDefinitionException: 'cartController' conflicts with existing bean
```

**解决方案**: 
已在 2026-02-09 修复，确保使用最新代码：
- `MallCartController` (新版)
- `MallOrderController` (新版)
- `MallCartMapper` (新版)
- `MallOrderMapper` (新版)

### 问题 2: 闪购 API 返回空数组

**可能原因**:
1. 数据库中没有满足条件的药品（price < originalPrice）
2. 数据库迁移未执行（缺少 original_price 字段）

**解决方案**:
```bash
# 执行数据库迁移
mysql -u root -p internet_hospital < internet-hospital-mall/sql/alter_t_drug_add_mall_fields.sql

# 插入测试数据
mysql -u root -p internet_hospital -e "
UPDATE t_drug 
SET original_price = price * 1.5, 
    is_recommended = 1 
WHERE id IN (1, 2, 3, 4, 5);
"
```

### 问题 3: 前端无法连接后端

**可能原因**:
1. 后端服务未启动
2. 网络配置错误（IP 地址、端口）
3. 防火墙阻止连接

**解决方案**:
```java
// 检查 RetrofitClient 的 BASE_URL 配置
// mshlwyy_patient-mall/app/src/main/java/com/adinnet/demo/mall/api/RetrofitClient.java

private static final String BASE_URL = "http://10.0.2.2:8092/"; // Android 模拟器
// 或
private static final String BASE_URL = "http://192.168.1.100:8092/"; // 真机测试
```

### 问题 4: Redis 缓存未生效

**检查方法**:
```bash
# 连接 Redis
redis-cli

# 查看闪购缓存
KEYS mall:drug:flash_sale:*

# 查看缓存内容
GET mall:drug:flash_sale:10

# 查看缓存过期时间
TTL mall:drug:flash_sale:10
```

## 性能测试

### 并发测试

使用 Apache Bench 或 JMeter 进行压力测试：

```bash
# 100 个并发请求，总共 1000 次
ab -n 1000 -c 100 http://localhost:8092/api/v1/mall/drugs/flash-sale?limit=10
```

**预期结果**:
- 平均响应时间 < 100ms（有缓存）
- 成功率 100%
- 无错误日志

### 缓存效果测试

```bash
# 第一次请求（无缓存）
time curl http://localhost:8092/api/v1/mall/drugs/flash-sale?limit=10

# 第二次请求（有缓存）
time curl http://localhost:8092/api/v1/mall/drugs/flash-sale?limit=10
```

**预期结果**:
- 第一次: ~200ms（查询数据库）
- 第二次: ~20ms（从 Redis 读取）

## 下一步

1. ✅ 启动后端服务
2. ✅ 执行 API 测试用例
3. ✅ 验证日志记录
4. ✅ 安装并测试 Android 应用
5. ✅ 验证前端 UI 显示
6. ✅ 执行性能测试
7. ✅ 记录测试结果

## 测试报告模板

```markdown
# 闪购药品 API 测试报告

## 测试环境
- 后端服务: 已启动 / 未启动
- 端口: 8092
- 数据库: internet_hospital
- Redis: 已连接 / 未连接

## 测试结果

### 后端 API 测试
- [ ] 基本调用: 通过 / 失败
- [ ] 参数验证: 通过 / 失败
- [ ] 缓存机制: 通过 / 失败
- [ ] 性能测试: 通过 / 失败

### 前端集成测试
- [ ] 应用启动: 通过 / 失败
- [ ] API 调用: 通过 / 失败
- [ ] UI 显示: 通过 / 失败
- [ ] 用户交互: 通过 / 失败

## 问题记录
1. [问题描述]
2. [问题描述]

## 结论
- 整体状态: 通过 / 失败
- 建议: [改进建议]
```
