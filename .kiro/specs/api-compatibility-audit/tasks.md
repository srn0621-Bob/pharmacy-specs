# Implementation Plan - API Compatibility Audit System

- [ ] 1. 设置项目结构和核心接口
  - 创建包结构：scanner, matcher, validator, generator, reporter
  - 定义核心数据模型类：ApiEndpoint, Parameter, CompatibilityIssue, Solution
  - 定义枚举类型：HttpMethod, ParameterType, IssueType, IssueSeverity, Priority
  - 设置日志框架和配置
  - _Requirements: 1.1, 2.1_

- [ ] 2. 实现前端API扫描器
  - 实现文件遍历逻辑，扫描所有Java文件
  - 实现Retrofit注解解析器（@GET, @POST, @PUT, @DELETE）
  - 提取URL路径和HTTP方法
  - 提取请求参数（@Path, @Query, @Body, @Header）
  - 提取响应类型（Observable泛型参数）
  - 处理路径变量和查询参数
  - _Requirements: 1.1, 1.2_

- [ ]* 2.1 编写属性测试：API扫描完整性
  - **Property 1: API扫描完整性**
  - **Validates: Requirements 1.1**

- [ ] 3. 实现后端API扫描器
  - 实现文件遍历逻辑，扫描所有Controller文件
  - 实现Spring MVC注解解析器（@RequestMapping, @GetMapping, @PostMapping, @PutMapping, @DeleteMapping）
  - 提取URL路径和HTTP方法（合并类级别和方法级别的路径）
  - 提取请求参数（@PathVariable, @RequestParam, @RequestBody）
  - 提取响应类型（方法返回类型）
  - 检测认证注解（@RequiresAuthentication或自定义注解）
  - _Requirements: 2.1, 2.2_

- [ ]* 3.1 编写属性测试：后端扫描准确性
  - 验证Spring MVC注解解析的正确性
  - _Requirements: 2.1_

- [ ] 4. 实现API清单生成和分类
  - 实现API清单数据结构（按模块分组）
  - 实现模块分类逻辑（根据URL路径自动分类）
  - 生成结构化的前端API清单
  - 生成结构化的后端API清单
  - 实现清单序列化（JSON格式）
  - _Requirements: 1.3, 1.4, 2.3, 2.4_

- [ ] 5. 实现API匹配器
  - 实现URL路径标准化（处理前缀、尾部斜杠等）
  - 实现精确匹配算法（URL + HTTP方法）
  - 实现URL相似度计算（Levenshtein距离或其他算法）
  - 识别前端存在但后端缺失的API
  - 识别路径相似但不完全匹配的API
  - 识别HTTP方法不匹配的API
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 5.1 编写属性测试：URL路径匹配一致性
  - **Property 2: URL路径匹配一致性**
  - **Validates: Requirements 3.1**

- [ ]* 5.2 编写属性测试：缺失API检测完整性
  - **Property 3: 缺失API检测完整性**
  - **Validates: Requirements 3.2**

- [ ] 6. 实现数据模型分析器
  - 实现Java类解析器（使用反射或AST）
  - 提取类的所有字段（名称、类型、注解）
  - 实现字段对比逻辑
  - 识别字段名称不匹配
  - 识别字段类型不兼容
  - 识别缺失字段
  - _Requirements: 4.1, 4.2_

- [ ] 7. 实现兼容性验证器
  - 实现请求参数验证（参数名称、类型、位置）
  - 实现响应格式验证（结构、字段、类型）
  - 实现必填字段验证
  - 检测缺少错误处理的API
  - 检测缺少认证检查的API
  - 检测缺少数据验证的API
  - 检测HTTP状态码使用不当
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 7.1 编写属性测试：参数类型兼容性验证
  - **Property 4: 参数类型兼容性验证**
  - **Validates: Requirements 4.1**

- [ ]* 7.2 编写属性测试：响应格式一致性验证
  - **Property 5: 响应格式一致性验证**
  - **Validates: Requirements 4.2**

- [ ] 8. 实现问题分类和优先级评估
  - 实现问题严重程度评估算法
  - 根据问题类型自动分配严重程度
  - 识别受影响的功能模块
  - 评估问题影响范围
  - 计算修复优先级
  - _Requirements: 3.5, 7.3_

- [ ]* 8.1 编写属性测试：问题严重程度分级正确性
  - **Property 6: 问题严重程度分级正确性**
  - **Validates: Requirements 7.3**

- [ ] 9. 实现解决方案生成器
  - 为"缺失后端API"生成完整的Controller实现模板
  - 为"路径不匹配"生成路径修正建议
  - 为"参数不匹配"生成参数对齐方案
  - 为"响应格式不兼容"生成数据模型对齐方案
  - 为"缺少错误处理"生成错误处理代码模板
  - 为"缺少认证"生成认证检查代码模板
  - 为每个解决方案生成实施步骤
  - 估算修复工作量
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 9.1 编写属性测试：解决方案生成完整性
  - **Property 7: 解决方案生成完整性**
  - **Validates: Requirements 6.1, 6.2**

- [ ] 10. 实现报告生成器
  - 实现执行摘要生成（统计数据、关键发现）
  - 实现问题列表生成（按模块分组）
  - 实现问题详情格式化（表格、代码块）
  - 实现解决方案部分生成
  - 实现API清单附录生成
  - 实现数据模型对比表生成
  - 生成Markdown格式的完整报告
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 10.1 编写单元测试：报告格式验证
  - 验证生成的Markdown格式正确
  - 验证所有必需部分都存在
  - _Requirements: 7.5_

- [ ] 11. 实现主流程编排
  - 创建主入口类（AuditExecutor）
  - 实现扫描阶段（前端+后端）
  - 实现匹配阶段
  - 实现验证阶段
  - 实现解决方案生成阶段
  - 实现报告生成阶段
  - 添加进度显示和日志输出
  - 实现错误处理和恢复机制
  - _Requirements: 所有需求_

- [ ] 12. 实现配置管理
  - 创建配置文件结构（YAML或JSON）
  - 实现配置加载器
  - 支持自定义扫描路径
  - 支持自定义包含/排除规则
  - 支持自定义问题严重程度规则
  - 支持报告输出路径配置
  - _Requirements: 所有需求_

- [ ] 13. 实现缓存和性能优化
  - 实现扫描结果缓存
  - 实现增量扫描（只扫描变更文件）
  - 实现并行扫描（多线程）
  - 优化大文件处理
  - 添加性能监控和统计
  - _Requirements: 所有需求_

- [ ] 14. 执行完整的系统测试
  - 使用真实项目代码进行端到端测试
  - 验证前端API扫描结果的准确性
  - 验证后端API扫描结果的准确性
  - 验证API匹配的准确性
  - 验证问题识别的准确性
  - 验证解决方案的可行性
  - 验证报告的完整性和可读性
  - _Requirements: 所有需求_

- [ ] 15. 生成实际项目的审计报告
  - 对mshlwyy_patient-mall和internet-hospital-mall执行完整审计
  - 生成药品商城模块的详细报告
  - 生成购物车模块的详细报告
  - 生成订单模块的详细报告
  - 生成用户认证模块的详细报告
  - 汇总所有模块的问题和解决方案
  - 生成最终的综合审计报告
  - _Requirements: 所有需求_

- [ ] 16. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

- [ ] 17. 创建使用文档
  - 编写快速开始指南
  - 编写配置说明
  - 编写报告解读指南
  - 编写常见问题FAQ
  - 提供使用示例
  - _Requirements: 所有需求_
