# 闪购 API 修复 - 部署步骤

## 问题修复
修复了 DrugMallMapper.xml 中的 XML 格式错误：
- 第 241 行：`d.price < d.original_price` 中的 `<` 符号未转义
- 第 240 行：`d.original_price > 0` 中的 `>` 符号未转义
- 第 242 行：`COALESCE(d.quantity, 0) > 0` 中的 `>` 符号未转义

## 修复内容
将 SQL 中的比较运算符转义为 XML 实体：
- `>` → `&gt;`
- `<` → `&lt;`

## 部署步骤

### 1. 上传编译后的文件到服务器
```bash
# 在本地执行（使用 SCP 或 FTP 工具）
scp target/adinnet-patient-api-1.0-SNAPSHOT.jar root@111.229.245.238:/home/tim/internet-hospital/adinnet-patient-api/
```

### 2. 登录服务器并重启服务
```bash
ssh root@111.229.245.238

cd /home/tim/internet-hospital/adinnet-patient-api
sh restart.sh
```

### 3. 等待服务启动（约 30-60 秒）
```bash
# 查看启动日志
tail -f logs/patient_info.log
```

### 4. 测试闪购 API
```bash
curl -X GET http://111.229.245.238:8092/api/v1/mall/drugs/flash-sale?limit=10
```

## 预期结果
API 应该返回 4 条闪购药品数据：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 5116,
      "name": "药品名称",
      "price": 折扣价,
      "originalPrice": 原价,
      ...
    },
    ...
  ],
  "success": true
}
```

## 验证 SQL
直接查询的 SQL（已修复 XML 转义问题）：
```sql
SELECT 
    d.id, d.name, d.price, d.original_price, d.quantity
FROM t_drug d
WHERE d.status = 1
  AND d.original_price IS NOT NULL
  AND d.original_price > 0
  AND d.price < d.original_price
  AND COALESCE(d.quantity, 0) > 0
ORDER BY (d.original_price - d.price) / d.original_price DESC
LIMIT 10;
```

这个查询应该返回 4 条记录（ID: 5116, 5114, 5115, 5113）。
