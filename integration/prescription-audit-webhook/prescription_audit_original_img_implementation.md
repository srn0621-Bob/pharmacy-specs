# 处方审核Webhook日志原处方笺字段实现

## 实现概述

在 `t_prescription_audit_webhook_log` 表中添加 `original_img` 字段，用于保存处方审核webhook接收到之后、更新 `t_hos_prescription` 的 `img` 字段之前的原始处方笺图片地址。

## 实现时间
2026-01-17

## 修改文件清单

### 1. 数据库相关

#### 1.1 表结构定义
- **文件**: `internet-hospital/sql/t_prescription_audit_webhook_log.sql`
- **修改**: 在 `recipe_url` 字段后添加 `original_img` 字段定义
- **字段定义**: `original_img VARCHAR(500) DEFAULT NULL COMMENT '原处方笺图片地址（更新前的img字段值）'`

#### 1.2 数据库迁移脚本
- **文件**: `internet-hospital/sql/alter_t_prescription_audit_webhook_log_add_original_img.sql`
- **内容**: ALTER TABLE 语句，用于在现有数据库中添加新字段

### 2. Java 模型类

#### 2.1 实体类
- **文件**: `internet-hospital/adinnet-admin/src/main/java/com/adinnet/admin/system/model/prescription/PrescriptionAuditWebhookLog.java`
- **修改**: 添加 `originalImg` 属性及其注释

```java
/**
 * 原处方笺图片地址（更新前的img字段值）
 */
private String originalImg;
```

### 3. Mapper 层

#### 3.1 Mapper 接口
- **文件**: `internet-hospital/adinnet-admin/src/main/java/com/adinnet/admin/system/mapper/PrescriptionAuditWebhookLogMapper.java`
- **修改**: 添加 `updateOriginalImg` 方法

```java
/**
 * 更新日志记录中的原处方笺图片地址
 *
 * @param id 日志ID
 * @param originalImg 原处方笺图片地址
 * @return 影响行数
 */
int updateOriginalImg(@Param("id") Long id, @Param("originalImg") String originalImg);
```

#### 3.2 Mapper XML
- **文件**: `internet-hospital/adinnet-admin/src/main/resources/xml/PrescriptionAuditWebhookLogMapper.xml`
- **修改内容**:
  1. 在 `BaseResultMap` 中添加 `original_img` 字段映射
  2. 在 `Base_Column_List` 中添加 `original_img` 列
  3. 添加 `updateOriginalImg` 更新语句

```xml
<!-- 更新原处方笺图片地址 -->
<update id="updateOriginalImg">
    UPDATE t_prescription_audit_webhook_log
    SET original_img = #{originalImg}
    WHERE id = #{id}
</update>
```

### 4. Service 层

#### 4.1 Service 接口
- **文件**: `internet-hospital/adinnet-admin/src/main/java/com/adinnet/admin/system/service/PrescriptionAuditWebhookLogService.java`
- **修改**: 添加 `updateOriginalImg` 方法声明

```java
/**
 * 更新日志记录中的原处方笺图片地址
 *
 * @param logId 日志ID
 * @param originalImg 原处方笺图片地址
 */
void updateOriginalImg(Long logId, String originalImg);
```

#### 4.2 Service 实现类
- **文件**: `internet-hospital/adinnet-admin/src/main/java/com/adinnet/admin/system/service/impl/PrescriptionAuditWebhookLogServiceImpl.java`
- **修改**: 实现 `updateOriginalImg` 方法

```java
@Override
public void updateOriginalImg(Long logId, String originalImg) {
    try {
        logMapper.updateOriginalImg(logId, originalImg);
        logger.debug("Updated original_img for prescription audit webhook log, id: {}, originalImg: {}", logId, originalImg);
    } catch (Exception e) {
        logger.error("Failed to update original_img for prescription audit webhook log, id: {}", logId, e);
        // 不抛出异常，避免影响主流程
    }
}
```

### 5. 业务逻辑实现

#### 5.1 Webhook 处理服务
- **文件**: `internet-hospital/adinnet-admin/src/main/java/com/adinnet/admin/system/service/impl/PrescriptionAuditWebhookServiceImpl.java`
- **修改位置**: `processAuditEvent` 方法中，在步骤5（原步骤4之后）
- **实现逻辑**:

```java
// 5. 保存原处方笺图片地址到日志
String originalImg = prescription.getImg();
if (originalImg != null && !originalImg.isEmpty()) {
    logService.updateOriginalImg(logId, originalImg);
    logger.info("Saved original prescription image for log: {}, img: {}", logId, originalImg);
}
```

- **日志增强**: 在成功更新处方信息后，记录原始和新的图片地址

```java
logger.info("Successfully updated audit info for prescription: {}, status: {}, original_img: {}, new_img: {}", 
        presNo, checkStatus, originalImg, event.getData().getRecipeUrl());
```

## 执行流程

1. **接收 Webhook 请求**: 处方审核系统发送审核结果
2. **创建日志记录**: 记录请求基本信息（步骤2）
3. **验证请求**: 验证请求头和请求体（步骤3）
4. **查询处方**: 根据 `pres_no` 查询处方记录（步骤4）
5. **保存原处方笺**: 从查询到的处方记录中获取 `img` 字段，保存到日志表的 `original_img` 字段（步骤5，新增）
6. **映射审核状态**: 将外部状态映射为内部状态（步骤6）
7. **更新处方信息**: 更新处方的 `img`、`check_status` 等字段（步骤7）
8. **记录成功日志**: 记录处理成功，包含原始和新的图片地址

## 数据库迁移

执行以下 SQL 脚本添加新字段：

```sql
ALTER TABLE `t_prescription_audit_webhook_log`
ADD COLUMN `original_img` VARCHAR(500) DEFAULT NULL COMMENT '原处方笺图片地址（更新前的img字段值）' AFTER `recipe_url`;
```

## 测试要点

1. **正常流程测试**:
   - 发送处方审核webhook请求
   - 验证 `original_img` 字段是否正确保存了原始图片地址
   - 验证 `t_hos_prescription.img` 是否更新为新的图片地址

2. **边界情况测试**:
   - 原处方笺 `img` 为 NULL 的情况
   - 原处方笺 `img` 为空字符串的情况
   - 重试场景（幂等性）

3. **日志验证**:
   - 检查日志中是否记录了 `original_img` 和 `new_img`
   - 验证日志级别和内容是否符合预期

## 注意事项

1. **非阻塞设计**: `updateOriginalImg` 方法中的异常不会影响主流程，只记录错误日志
2. **空值处理**: 只有当 `originalImg` 不为 null 且不为空字符串时才更新
3. **事务一致性**: 整个处理过程在 `@Transactional` 注解保护下，确保数据一致性
4. **幂等性**: 重试时不会重复保存 `original_img`，因为日志记录已存在

## 相关需求

- 需求编号: 处方审核webhook日志增强
- 需求描述: 在更新处方图片之前保存原始图片地址，便于追溯和审计
