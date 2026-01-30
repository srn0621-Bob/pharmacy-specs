# 实施计划 - 药品搜索功能

## 概述

本文档描述药品搜索功能的实施任务列表。主要工作是验证现有搜索接口,补充搜索历史和热门搜索功能。

---

## 任务列表

- [ ] 1. 验证现有搜索接口
  - [ ] 1.1 检查DrugMallController
    - 确认 `searchDrugs()` 方法存在
    - 确认接口路径: `/api/v1/mall/drugs/search`
    - 确认支持keyword参数
    - 确认支持分页参数
    - _Requirements: 1.1-1.6_
  
  - [ ] 1.2 测试搜索功能
    - 测试按名称搜索
    - 测试按编码搜索
    - 测试按厂家搜索
    - 测试模糊匹配
    - 测试分页功能
    - _Requirements: 1.1-1.6_
  
  - [ ] 1.3 检查Mapper实现
    - 确认SQL支持多字段搜索
    - 确认SQL包含status=1过滤
    - 确认使用了索引
    - _Requirements: 1.1-1.6_

- [ ] 2. 优化搜索算法
  - [ ] 2.1 实现相关性排序
    - 添加match_score计算
    - 按匹配度和销量排序
    - 更新Mapper SQL
    - _Requirements: 2.1-2.3_
  
  - [ ] 2.2 添加排序参数支持
    - 支持sortBy参数(sales, price)
    - 更新Controller和Service
    - _Requirements: 2.3_
  
  - [ ]* 2.3 测试排序功能
    - 测试相关性排序
    - 测试销量排序
    - 测试价格排序
    - _Requirements: 2.1-2.3_

- [ ] 3. 实现搜索历史功能
  - [ ] 3.1 创建SearchHistory模型
    - 创建文件: `SearchHistory.java`
    - 添加字段: userId, keyword, searchTime
    - _Requirements: 5.1-5.5_
  
  - [ ] 3.2 实现保存搜索历史
    - 在DrugSearchService添加方法
    - 使用Redis List存储
    - 保持最多10条记录
    - _Requirements: 5.1-5.5_
  
  - [ ] 3.3 实现获取搜索历史
    - 添加getSearchHistory()方法
    - 按时间倒序返回
    - _Requirements: 5.2_
  
  - [ ] 3.4 实现清空搜索历史
    - 添加clearSearchHistory()方法
    - 删除Redis中的记录
    - _Requirements: 5.3_
  
  - [ ] 3.5 在Controller添加接口
    - GET /api/v1/mall/drugs/search/history
    - DELETE /api/v1/mall/drugs/search/history
    - _Requirements: 5.1-5.5_
  
  - [ ]* 3.6 测试搜索历史
    - 测试保存历史
    - 测试获取历史
    - 测试清空历史
    - 测试重复关键词
    - _Requirements: 5.1-5.5_

- [ ] 4. 实现热门搜索功能
  - [ ] 4.1 创建HotSearch模型
    - 创建文件: `HotSearch.java`
    - 添加字段: keyword, searchCount, rank
    - _Requirements: 6.1-6.4_
  
  - [ ] 4.2 实现热门搜索统计
    - 使用Redis ZSet存储
    - 每次搜索增加计数
    - _Requirements: 6.1-6.4_
  
  - [ ] 4.3 实现获取热门搜索
    - 添加getHotSearches()方法
    - 返回Top 10
    - 添加默认热门词
    - _Requirements: 6.1-6.4_
  
  - [ ] 4.4 在Controller添加接口
    - GET /api/v1/mall/drugs/search/hot
    - _Requirements: 6.1-6.4_
  
  - [ ]* 4.5 测试热门搜索
    - 测试统计功能
    - 测试排序正确
    - 测试缓存更新
    - _Requirements: 6.1-6.4_

- [ ] 5. 性能优化
  - [ ] 5.1 创建数据库索引
    - 创建idx_status_name索引
    - 创建idx_status_sku索引
    - 创建idx_status_manufacturer索引
    - _Requirements: 7.1-7.4_
  
  - [ ] 5.2 添加搜索结果缓存
    - 使用@Cacheable注解
    - 缓存热门搜索结果
    - 设置5分钟过期
    - _Requirements: 7.3_
  
  - [ ] 5.3 优化SQL查询
    - 避免全表扫描
    - 限制返回字段
    - 使用EXPLAIN分析
    - _Requirements: 7.1-7.4_

- [ ] 6. 安全加固
  - [ ] 6.1 实现SQL注入防护
    - 过滤特殊字符
    - 使用参数化查询
    - _Requirements: 安全要求_
  
  - [ ] 6.2 添加参数验证
    - 验证关键词非空
    - 验证关键词长度<=50
    - 验证分页参数
    - _Requirements: 8.1-8.4_
  
  - [ ] 6.3 添加频率限制
    - 限制每用户每分钟搜索次数
    - 使用Redis计数器
    - _Requirements: 安全要求_

- [ ] 7. 测试和验收
  - [ ] 7.1 单元测试
    - 测试搜索功能
    - 测试搜索历史
    - 测试热门搜索
    - _Requirements: 所有需求_
  
  - [ ] 7.2 性能测试
    - 测试响应时间<1秒
    - 测试并发1000请求
    - _Requirements: 7.1-7.4_
  
  - [ ] 7.3 集成测试
    - 测试完整搜索流程
    - 测试与其他功能集成
    - _Requirements: 所有需求_

- [ ] 8. 文档更新
  - [ ] 8.1 更新API文档
    - 添加搜索历史接口
    - 添加热门搜索接口
    - _Requirements: 所有需求_
  
  - [ ] 8.2 更新实施文档
    - 记录实现细节
    - 记录性能优化
    - _Requirements: 所有需求_

---

## 预计工作量

| 任务阶段 | 预计时间 |
|---------|---------|
| 验证现有接口 | 30分钟 |
| 优化搜索算法 | 1小时 |
| 实现搜索历史 | 1小时 |
| 实现热门搜索 | 1小时 |
| 性能优化 | 1小时 |
| 安全加固 | 30分钟 |
| 测试和验收 | 1小时 |
| 文档更新 | 30分钟 |
| **总计** | **6.5小时** |

---

## 参考文档

- [需求文档](./requirements.md)
- [设计文档](./design.md)
- [API实现状态](../patient-drug-mall/API_IMPLEMENTATION_STATUS.md)
