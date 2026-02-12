# 闪购 API 调试指南

## 问题现象

- SQL 查询返回 4 条符合条件的药品
- API 返回空数组：`{"code":200,"message":"操作成功","data":[]}`

## 可能原因

1. **服务未重启** - 代码修改后未重新部署
2. **推荐药品查询问题** - `selectRecommendedDrugs()` 没有返回这 4 条药品
3. **筛选逻辑问题** - 筛选条件过滤掉了所有药品

## 诊断步骤

### 步骤 1: 检查服务是否重启

```bash
# 查看服务进程启动时间
ps aux | grep adinnet-patient-api

# 查看 JAR 文件修改时间
ls -lh /path/to/adinnet-patient-api.jar

# 如果启动时间早于代码修改时间，说明服务未重启
```

### 步骤 2: 查看服务日志

```bash
# 查看最新的闪购相关日志
tail -200 /path/to/logs/patient_info.log | grep -i "flash\|推荐药品"

# 查看错误日志
tail -200 /path/to/logs/patient_error.log | grep -A 10 "flash"

# 实时监控日志
tail -f /path/to/logs/patient_info.log | grep --line-buffered "flash\|推荐药品"
```

### 步骤 3: 测试推荐药品 API

```bash
# 测试推荐药品 API，看是否返回这 4 条药品
curl -X GET "http://111.229.245.238:8092/api/v1/mall/drugs/recommended?limit=20"
```

**预期结果**：应该包含 ID 为 5116, 5114, 5115, 5113 的药品

### 步骤 4: 检查数据库中推荐药品的排序

```sql
-- 查看推荐药品的排序（按 create_time DESC）
SELECT 
    id,
    name,
    CAST(price AS DECIMAL(10,2)) as price,
    CAST(original_price AS DECIMAL(10,2)) as original_price,
    quantity,
    status,
    create_time
FROM t_drug 
WHERE status = 1 
ORDER BY create_time DESC 
LIMIT 20;
```

**关键问题**：这 4 条闪购药品是否在前 20 条推荐药品中？

### 步骤 5: 检查这 4 条药品的详细信息

```sql
-- 查看这 4 条药品的完整信息
SELECT 
    id,
    name,
    CAST(price AS DECIMAL(10,2)) as price,
    CAST(original_price AS DECIMAL(10,2)) as original_price,
    quantity,
    status,
    create_time,
    pic_position
FROM t_drug 
WHERE id IN (5116, 5114, 5115, 5113);
```

**检查点**：
- `status` 是否为 1
- `quantity` 是否 > 0
- `price` 是否 < `original_price`
- `pic_position` 是否为有效的 JSON 或 URL

## 重新部署步骤

如果确认服务未重启，请执行以下步骤：

### 方案 1: Maven 打包部署

```bash
# 1. 进入项目目录
cd /path/to/internet-hospital-mall

# 2. 重新编译打包（跳过测试）
mvn clean package -DskipTests -pl adinnet-patient-api -am

# 3. 停止旧服务
# 根据你的启动方式停止服务，例如：
# kill -9 $(ps aux | grep adinnet-patient-api | grep -v grep | awk '{print $2}')

# 4. 启动新服务
cd adinnet-patient-api/target
java -jar adinnet-patient-api-1.0-SNAPSHOT.jar --spring.profiles.active=prod

# 或者使用 nohup 后台运行
nohup java -jar adinnet-patient-api-1.0-SNAPSHOT.jar --spring.profiles.active=prod > /dev/null 2>&1 &
```

### 方案 2: 只编译不打包（快速验证）

```bash
# 1. 只编译
cd /path/to/internet-hospital-mall/adinnet-patient-api
mvn clean compile -DskipTests

# 2. 重启服务（如果使用 Spring Boot DevTools 会自动重启）
```

## 验证步骤

### 1. 验证服务启动成功

```bash
# 检查服务是否启动
curl http://111.229.245.238:8092/actuator/health

# 或者检查端口是否监听
netstat -tlnp | grep 8092
```

### 2. 验证闪购 API

```bash
# 调用闪购 API
curl -X GET "http://111.229.245.238:8092/api/v1/mall/drugs/flash-sale?limit=10"

# 预期结果：应该返回 4 条药品数据
```

### 3. 查看日志确认

```bash
# 查看最新日志
tail -50 /path/to/logs/patient_info.log

# 应该看到类似的日志：
# "从数据库查询推荐药品成功，数量: 20"
# "查询闪购药品列表成功，数量: 4"
```

## 常见问题排查

### 问题 1: 推荐药品 API 返回空

**原因**: `selectRecommendedDrugs()` 查询条件可能有问题

**解决方案**:
```sql
-- 检查是否有 status = 1 的药品
SELECT COUNT(*) FROM t_drug WHERE status = 1;

-- 如果为 0，需要更新数据
UPDATE t_drug SET status = 1 WHERE id IN (5116, 5114, 5115, 5113);
```

### 问题 2: 筛选条件过滤掉所有药品

**原因**: `original_price` 为 NULL 或 0

**解决方案**:
```sql
-- 检查 original_price
SELECT id, name, price, original_price 
FROM t_drug 
WHERE id IN (5116, 5114, 5115, 5113);

-- 如果 original_price 为 NULL，需要更新
UPDATE t_drug 
SET original_price = 44.00 
WHERE id = 5116;

UPDATE t_drug 
SET original_price = 22.00 
WHERE id = 5114;

UPDATE t_drug 
SET original_price = 44.00 
WHERE id = 5115;

UPDATE t_drug 
SET original_price = 18.00 
WHERE id = 5113;
```

### 问题 3: 图片解析失败

**原因**: `pic_position` 字段格式不正确

**解决方案**:
```sql
-- 检查 pic_position 格式
SELECT id, name, pic_position 
FROM t_drug 
WHERE id IN (5116, 5114, 5115, 5113);

-- 如果为空或格式错误，需要更新
-- 格式应该是 JSON 数组或单个 URL
```

## 调试日志增强

如果问题依然存在，可以临时增加调试日志：

在 `DrugMallServiceImpl.getFlashSaleDrugs()` 方法中添加：

```java
// 在筛选前添加
log.info("开始筛选闪购药品，推荐药品数量: {}", recommendedDrugs.size());
for (DrugDTO drug : recommendedDrugs) {
    log.debug("药品 ID: {}, 名称: {}, 价格: {}, 原价: {}, 库存: {}", 
        drug.getId(), drug.getName(), drug.getPrice(), 
        drug.getOriginalPrice(), drug.getQuantity());
}

// 在筛选后添加
log.info("筛选完成，闪购药品数量: {}", drugs.size());
```

## 总结

最可能的原因是**服务未重启**。请先确认服务是否重新部署，然后查看日志确认推荐药品查询是否返回这 4 条药品。
