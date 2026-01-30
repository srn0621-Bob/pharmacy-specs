# 快递100 API 日志示例

## 概述

本文档展示了快递100 API调用的详细日志输出格式，便于调试和问题排查。

## 日志级别

- **INFO**: 正常请求和响应信息
- **WARN**: 返回空数据等警告信息
- **ERROR**: API错误、网络异常等错误信息

## 成功场景日志

### 请求日志

```
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 请求开始 ==========
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求URL: http://poll.kuaidi100.com/poll/query.do
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求方法: POST
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - Content-Type: application/x-www-form-urlencoded
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求参数:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - param: {"com":"yunda","num":"YT1234567890","resultv2":"1"}
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - customer: 5727072A955414A4C8AC79D5F33DB7F6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - sign: A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 快递信息:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递公司编码: yunda
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递单号: YT1234567890
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
```

### 响应日志

```
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 响应开始 ==========
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 响应内容: {"message":"ok","state":"3","status":"200","condition":"F00","ischeck":"1","com":"yunda","nu":"YT1234567890","data":[{"context":"货物已完成配送，感谢您选择韵达快递","time":"2026-01-18 09:30:00","ftime":"2026-01-18 09:30:00","status":"签收","areaCode":"310000","areaName":"上海市"},{"context":"快递员正在派送中","time":"2026-01-18 08:00:00","ftime":"2026-01-18 08:00:00","status":"派件","areaCode":"310000","areaName":"上海市"}]}
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
```

### 成功日志

```
2026-01-18 10:00:00.789 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 查询成功 ==========
2026-01-18 10:00:00.789 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 物流轨迹数量: 2
2026-01-18 10:00:00.789 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
```

## 错误场景日志

### 场景1: API返回错误状态

```
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 请求开始 ==========
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求URL: http://poll.kuaidi100.com/poll/query.do
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求方法: POST
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - Content-Type: application/x-www-form-urlencoded
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求参数:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - param: {"com":"yunda","num":"INVALID123","resultv2":"1"}
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - customer: 5727072A955414A4C8AC79D5F33DB7F6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - sign: A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 快递信息:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递公司编码: yunda
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递单号: INVALID123
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 响应开始 ==========
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 响应内容: {"message":"单号不存在或已过期","state":"0","status":"408","condition":"","ischeck":"0","com":"yunda","nu":"INVALID123"}
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - ========== 快递100 API 返回错误 ==========
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 错误状态码: 408
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 错误消息: 单号不存在或已过期
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 完整响应: {"message":"单号不存在或已过期","state":"0","status":"408","condition":"","ischeck":"0","com":"yunda","nu":"INVALID123"}
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - ==========================================
```

### 场景2: 返回空数据

```
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 请求开始 ==========
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求URL: http://poll.kuaidi100.com/poll/query.do
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求方法: POST
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - Content-Type: application/x-www-form-urlencoded
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求参数:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - param: {"com":"yunda","num":"YT9999999999","resultv2":"1"}
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - customer: 5727072A955414A4C8AC79D5F33DB7F6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - sign: A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 快递信息:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递公司编码: yunda
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递单号: YT9999999999
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 响应开始 ==========
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 响应内容: {"message":"ok","state":"0","status":"200","condition":"","ischeck":"0","com":"yunda","nu":"YT9999999999","data":[]}
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] WARN  c.a.c.u.Kuaidi100Util - ========== 快递100 返回空数据 ==========
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] WARN  c.a.c.u.Kuaidi100Util - 快递公司编码: yunda
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] WARN  c.a.c.u.Kuaidi100Util - 快递单号: YT9999999999
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] WARN  c.a.c.u.Kuaidi100Util - 响应状态: 200
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] WARN  c.a.c.u.Kuaidi100Util - 响应消息: ok
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] WARN  c.a.c.u.Kuaidi100Util - ==========================================
```

### 场景3: 网络异常

```
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 请求开始 ==========
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求URL: http://poll.kuaidi100.com/poll/query.do
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求方法: POST
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - Content-Type: application/x-www-form-urlencoded
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求参数:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - param: {"com":"yunda","num":"YT1234567890","resultv2":"1"}
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - customer: 5727072A955414A4C8AC79D5F33DB7F6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - sign: A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 快递信息:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递公司编码: yunda
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递单号: YT1234567890
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
2026-01-18 10:00:15.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - ========== 快递100 API 网络异常 ==========
2026-01-18 10:00:15.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 异常类型: IOException
2026-01-18 10:00:15.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 快递公司编码: yunda
2026-01-18 10:00:15.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 快递单号: YT1234567890
2026-01-18 10:00:15.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 错误信息: Read timed out
2026-01-18 10:00:15.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 异常堆栈:
java.net.SocketTimeoutException: Read timed out
    at java.net.SocketInputStream.socketRead0(Native Method)
    at java.net.SocketInputStream.socketRead(SocketInputStream.java:116)
    ...
2026-01-18 10:00:15.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - ==========================================
```

### 场景4: 其他异常

```
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 请求开始 ==========
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求URL: http://poll.kuaidi100.com/poll/query.do
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求方法: POST
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - Content-Type: application/x-www-form-urlencoded
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 请求参数:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - param: {"com":"yunda","num":"YT1234567890","resultv2":"1"}
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - customer: 5727072A955414A4C8AC79D5F33DB7F6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - sign: A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 快递信息:
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递公司编码: yunda
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util -   - 快递单号: YT1234567890
2026-01-18 10:00:00.123 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ========== 快递100 API 响应开始 ==========
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - 响应内容: invalid json format
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] INFO  c.a.c.u.Kuaidi100Util - ==========================================
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - ========== 快递100 查询异常 ==========
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 异常类型: com.alibaba.fastjson.JSONException
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 快递公司编码: yunda
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 快递单号: YT1234567890
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 错误信息: syntax error, pos 0, line 1, column 1invalid json format
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - 异常堆栈:
com.alibaba.fastjson.JSONException: syntax error, pos 0, line 1, column 1invalid json format
    at com.alibaba.fastjson.parser.DefaultJSONParser.parse(DefaultJSONParser.java:1359)
    ...
2026-01-18 10:00:00.456 [http-nio-8092-exec-1] ERROR c.a.c.u.Kuaidi100Util - ==========================================
```

## 日志搜索关键字

### 查找所有快递100请求
```bash
grep "快递100 API 请求开始" logs/patient-api.log
```

### 查找成功的查询
```bash
grep "快递100 查询成功" logs/patient-api.log
```

### 查找错误
```bash
grep "快递100 API 返回错误" logs/patient-api.log
grep "快递100 API 网络异常" logs/patient-api.log
grep "快递100 查询异常" logs/patient-api.log
```

### 查找特定快递单号的日志
```bash
grep "YT1234567890" logs/patient-api.log
```

### 查找特定订单的完整调用链
```bash
grep "P20201111132349005" logs/patient-api.log
```

## 日志分析建议

### 1. 性能分析
通过请求开始和响应结束的时间戳，可以计算API响应时间：
- 正常响应时间: < 3秒
- 超时时间: 15秒（连接5秒 + 读取10秒）

### 2. 错误率监控
统计不同类型的错误：
- API返回错误（status != 200）
- 网络异常（IOException）
- 数据解析异常（JSONException）
- 空数据返回

### 3. 常见问题排查

**问题1: 签名验证失败**
- 检查日志中的 `param`、`customer`、`sign` 参数
- 验证签名计算是否正确

**问题2: 单号不存在**
- 检查 `快递单号` 是否正确
- 检查 `快递公司编码` 是否匹配

**问题3: 网络超时**
- 检查网络连接
- 检查快递100服务是否可用
- 考虑增加超时时间

## 日志配置建议

### logback-spring.xml

```xml
<!-- 快递100 API 日志单独输出 -->
<appender name="KUAIDI100" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/kuaidi100.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>logs/kuaidi100.%d{yyyy-MM-dd}.log</fileNamePattern>
        <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder>
        <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
    </encoder>
</appender>

<logger name="com.adinnet.common.utils.Kuaidi100Util" level="INFO" additivity="false">
    <appender-ref ref="KUAIDI100"/>
    <appender-ref ref="CONSOLE"/>
</logger>
```

## 相关文档

- [快递100集成文档](kuaidi100_logistics_integration_complete.md)
- [物流查询API分析](viewLogistics_api_analysis.md)
- [快速开始指南](kuaidi100_quick_start.md)
