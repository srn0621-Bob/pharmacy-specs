# 实施计划 - t_drug表商城字段扩展

## 概述

本文档描述t_drug表商城字段扩展的实施任务列表。所有任务按顺序执行,确保数据库迁移的安全性和可靠性。

---

## 任务列表

- [ ] 1. 准备迁移环境
  - 验证数据库版本(MySQL 8.0+)
  - 检查磁盘空间(至少预留2GB)
  - 确认数据库连接权限
  - _Requirements: 非功能性需求 - 安全要求_

- [ ] 2. 备份现有数据
  - [ ] 2.1 导出t_drug表结构
    - 执行命令: `mysqldump -u root -p --no-data internet_hospital t_drug > t_drug_structure.sql`
    - _Requirements: 3.1_
  
  - [ ] 2.2 导出t_drug表数据
    - 执行命令: `mysqldump -u root -p internet_hospital t_drug > t_drug_backup_$(date +%Y%m%d_%H%M%S).sql`
    - 验证备份文件大小和完整性
    - _Requirements: 3.1_
  
  - [ ] 2.3 记录迁移前数据统计
    - 记录表行数: `SELECT COUNT(*) FROM t_drug;`
    - 记录表大小: `SELECT table_rows, data_length, index_length FROM information_schema.TABLES WHERE table_name='t_drug';`
    - _Requirements: 3.2_

- [ ] 3. 验证迁移脚本
  - [ ] 3.1 检查脚本语法
    - 使用MySQL客户端检查SQL语法
    - 确认所有字段定义正确
    - _Requirements: 1.1-1.8_
  
  - [ ] 3.2 验证幂等性逻辑
    - 确认使用IF NOT EXISTS检查
    - 确认可重复执行
    - _Requirements: 4.1-4.3_

- [ ] 4. 测试环境迁移
  - [ ] 4.1 在测试环境执行迁移
    - 执行命令: `mysql -u root -p internet_hospital < alter_t_drug_add_mall_fields.sql`
    - 记录执行时间
    - _Requirements: 1.1-1.8, 2.1-2.3_
  
  - [ ] 4.2 验证字段添加
    - 执行: `DESC t_drug;`
    - 确认8个新字段存在
    - 验证字段类型和默认值
    - _Requirements: 1.1-1.8_
  
  - [ ] 4.3 验证索引创建
    - 执行: `SHOW INDEX FROM t_drug;`
    - 确认3个新索引存在
    - _Requirements: 2.1-2.3_
  
  - [ ] 4.4 验证数据完整性
    - 对比迁移前后行数
    - 抽查现有字段数据
    - _Requirements: 3.1-3.2_
  
  - [ ] 4.5 测试查询性能
    - 测试按分类查询: `EXPLAIN SELECT * FROM t_drug WHERE category_id = 1;`
    - 测试推荐查询: `EXPLAIN SELECT * FROM t_drug WHERE is_recommended = 1;`
    - 测试销量排序: `EXPLAIN SELECT * FROM t_drug ORDER BY sales DESC LIMIT 10;`
    - _Requirements: 2.4_

- [ ] 5. 测试幂等性
  - [ ] 5.1 重复执行迁移脚本
    - 再次执行: `mysql -u root -p internet_hospital < alter_t_drug_add_mall_fields.sql`
    - 确认无错误
    - _Requirements: 4.1-4.2_
  
  - [ ] 5.2 验证最终状态
    - 确认字段数量正确
    - 确认索引数量正确
    - 确认数据完整
    - _Requirements: 4.3_

- [ ] 6. 应用兼容性测试
  - [ ] 6.1 启动患者端API服务
    - 启动adinnet-patient-api
    - 检查启动日志无错误
    - _Requirements: 3.3_
  
  - [ ] 6.2 测试现有药品查询接口
    - 测试: `GET /api/v1/mall/drugs/recommended`
    - 测试: `GET /api/v1/mall/drugs/{drugId}`
    - 确认返回正常
    - _Requirements: 3.3_
  
  - [ ] 6.3 测试新字段查询
    - 插入测试数据(包含新字段)
    - 查询验证新字段值
    - 清理测试数据
    - _Requirements: 1.1-1.8_

- [ ] 7. Checkpoint - 测试环境验收
  - 确认所有测试通过
  - 确认无性能问题
  - 确认应用兼容
  - 询问用户是否继续生产环境部署

- [ ] 8. 生产环境部署准备
  - [ ] 8.1 制定部署计划
    - 确定部署时间窗口(凌晨2:00-3:00)
    - 准备回滚方案
    - 通知相关人员
    - _Requirements: 非功能性需求 - 性能要求_
  
  - [ ] 8.2 准备监控工具
    - 配置数据库监控
    - 配置应用监控
    - 准备告警通知
    - _Requirements: 非功能性需求 - 性能要求_

- [ ] 9. 生产环境迁移
  - [ ] 9.1 备份生产数据
    - 执行完整备份
    - 验证备份完整性
    - _Requirements: 3.1_
  
  - [ ] 9.2 执行迁移脚本
    - 执行: `mysql -u root -p internet_hospital < alter_t_drug_add_mall_fields.sql`
    - 记录执行时间
    - 监控数据库性能
    - _Requirements: 1.1-1.8, 2.1-2.3_
  
  - [ ] 9.3 验证迁移结果
    - 验证字段添加
    - 验证索引创建
    - 验证数据完整性
    - _Requirements: 3.1-3.3_
  
  - [ ] 9.4 重启应用服务
    - 重启adinnet-patient-api
    - 检查启动日志
    - _Requirements: 3.3_

- [ ] 10. 生产环境验证
  - [ ] 10.1 功能验证
    - 测试药品查询接口
    - 测试购物车接口
    - 测试订单接口
    - _Requirements: 3.3_
  
  - [ ] 10.2 性能监控
    - 监控API响应时间
    - 监控数据库查询性能
    - 监控错误日志
    - _Requirements: 非功能性需求 - 性能要求_
  
  - [ ] 10.3 数据验证
    - 抽查药品数据
    - 验证新字段默认值
    - _Requirements: 3.2-3.3_

- [ ] 11. 文档更新
  - [ ] 11.1 更新数据库文档
    - 更新t_drug表结构文档
    - 记录迁移历史
    - _Requirements: 4.4_
  
  - [ ] 11.2 更新部署文档
    - 记录部署时间和结果
    - 记录遇到的问题和解决方案
    - _Requirements: 4.4_

- [ ] 12. Final Checkpoint - 完成验收
  - 确认所有任务完成
  - 确认生产环境稳定运行
  - 归档备份文件和日志
  - 通知相关人员迁移完成

---

## 注意事项

### 执行前检查清单

- [ ] 已在测试环境充分验证
- [ ] 已完成数据备份
- [ ] 已准备回滚方案
- [ ] 已通知相关人员
- [ ] 已选择合适的时间窗口

### 回滚触发条件

如果出现以下情况,立即执行回滚:

1. 迁移执行时间超过10分钟
2. 数据完整性验证失败
3. 应用启动失败
4. 关键接口测试失败
5. 数据库性能严重下降

### 回滚步骤

```bash
# 1. 停止应用服务
systemctl stop adinnet-patient-api

# 2. 执行回滚脚本
mysql -u root -p internet_hospital < rollback_t_drug_mall_fields.sql

# 3. 恢复备份数据(如果需要)
mysql -u root -p internet_hospital < t_drug_backup_YYYYMMDD_HHMMSS.sql

# 4. 验证数据
mysql -u root -p internet_hospital -e "SELECT COUNT(*) FROM t_drug;"

# 5. 重启应用服务
systemctl start adinnet-patient-api
```

---

## 预计工作量

| 任务阶段 | 预计时间 |
|---------|---------|
| 准备和备份 | 30分钟 |
| 测试环境迁移和验证 | 1小时 |
| 生产环境部署 | 30分钟 |
| 验证和监控 | 30分钟 |
| 文档更新 | 30分钟 |
| **总计** | **3小时** |

---

## 参考文档

- [需求文档](./requirements.md)
- [设计文档](./design.md)
- [迁移脚本](../../../internet-hospital/sql/alter_t_drug_add_mall_fields.sql)
