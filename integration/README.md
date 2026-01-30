# 第三方集成规范

本目录包含与第三方系统集成相关的技术规范文档。

## 📋 规范列表

### 药房系统集成
- **api-farmacy-interface** - 药房接口集成核心实现(11 个文档)
  - 包含架构设计、实现总结、触发点实现等完整文档
- **api-to-pharmacy** - 提供给药房的 API 文档(4 个文档)
  - 药品更新、物流回调、处方审核等 API 文档
- **patient-pharmacy-order-push** - 订单推送到药房系统

### 处方审核
- **prescription-audit-webhook** - 处方审核回调接口(5 个文档)
  - 包含实现指南和原始图片处理

### 物流集成
- **logistics-api-migration** - 物流 API 迁移到快递100(23 个文档)
  - 包含签名计算、字段映射、调试日志等完整实现
- **logistics-webhook** - 物流状态回调接口
- **logistics-webhook-appsecret** - 物流回调鉴权机制(14 个文档)
  - 包含部署指南、集成指南、Shiro 集成修复等

### API 审计与映射
- **api-compatibility-audit** - API 兼容性审计
- **api-field-mapping** - API 字段映射关系
- **doc-pharmacy-api** - 药房 API 文档化与日志实现(4 个文档)
