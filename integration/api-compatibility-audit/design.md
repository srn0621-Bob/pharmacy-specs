# Design Document - API Compatibility Audit System

## Overview

本设计文档描述了一个自动化的API兼容性审计系统，用于全面检查互联网医院系统的前后端API一致性。系统将扫描Android患者端应用（mshlwyy_patient-mall）和Java后端服务（internet-hospital-mall），识别API不匹配问题，并提供具体的解决方案。

该系统采用静态代码分析方法，通过解析Retrofit接口定义和Spring MVC Controller注解，构建完整的API清单，然后进行多维度的兼容性检查。

## Architecture

系统采用分层架构设计：

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│              (Report Generator & Formatter)              │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    Business Logic Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   API        │  │  Compatibility│  │  Solution    │  │
│  │   Matcher    │  │  Validator    │  │  Generator   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    Data Access Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Frontend    │  │   Backend    │  │   Model      │  │
│  │  Scanner     │  │   Scanner    │  │   Analyzer   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                      File System                         │
│         (Source Code Files & Generated Reports)          │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Frontend Scanner (前端扫描器)

**职责**: 扫描Android应用代码，提取Retrofit API接口定义

**输入**:
- 前端项目路径: `mshlwyy_patient-mall/app/src/main/java`
- 扫描模式: 包含/排除模式

**输出**:
- 前端API清单 (FrontendApiInventory)

**关键方法**:
```java
class FrontendScanner {
    List<ApiEndpoint> scanRetrofitServices(String projectPath);
    ApiEndpoint parseRetrofitMethod(Method method);
    List<Parameter> extractRequestParameters(Method method);
    ResponseType extractResponseType(Method method);
}
```

### 2. Backend Scanner (后端扫描器)

**职责**: 扫描Java后端代码，提取Spring MVC Controller定义

**输入**:
- 后端项目路径: `internet-hospital-mall/adinnet-patient-api/src/main/java`
- 扫描模式: 包含/排除模式

**输出**:
- 后端API清单 (BackendApiInventory)

**关键方法**:
```java
class BackendScanner {
    List<ApiEndpoint> scanControllers(String projectPath);
    ApiEndpoint parseControllerMethod(Method method);
    List<Parameter> extractRequestParameters(Method method);
    ResponseType extractResponseType(Method method);
}
```

### 3. API Matcher (API匹配器)

**职责**: 对比前后端API清单，识别匹配和不匹配的端点

**输入**:
- 前端API清单
- 后端API清单

**输出**:
- 匹配结果 (MatchingResult)
  - 完全匹配的API列表
  - 前端存在但后端缺失的API列表
  - 路径相似但不完全匹配的API列表
  - HTTP方法不匹配的API列表

**关键方法**:
```java
class ApiMatcher {
    MatchingResult matchApis(FrontendApiInventory frontend, BackendApiInventory backend);
    boolean isExactMatch(ApiEndpoint frontend, ApiEndpoint backend);
    double calculateSimilarity(String path1, String path2);
    List<ApiEndpoint> findSimilarEndpoints(ApiEndpoint target, List<ApiEndpoint> candidates);
}
```

### 4. Compatibility Validator (兼容性验证器)

**职责**: 对匹配的API进行深度兼容性检查

**输入**:
- 匹配的API对 (前端+后端)

**输出**:
- 兼容性问题列表 (CompatibilityIssue)

**关键方法**:
```java
class CompatibilityValidator {
    List<CompatibilityIssue> validateRequestFormat(ApiEndpoint frontend, ApiEndpoint backend);
    List<CompatibilityIssue> validateResponseFormat(ApiEndpoint frontend, ApiEndpoint backend);
    List<CompatibilityIssue> validateParameterTypes(List<Parameter> frontend, List<Parameter> backend);
    List<CompatibilityIssue> validateErrorHandling(ApiEndpoint backend);
    List<CompatibilityIssue> validateAuthentication(ApiEndpoint backend);
}
```

### 5. Model Analyzer (模型分析器)

**职责**: 分析和对比请求/响应数据模型

**输入**:
- 前端数据模型类
- 后端数据模型类

**输出**:
- 模型差异报告 (ModelDifference)

**关键方法**:
```java
class ModelAnalyzer {
    ModelDifference compareModels(Class<?> frontendModel, Class<?> backendModel);
    List<FieldDifference> compareFields(List<Field> frontend, List<Field> backend);
    boolean areTypesCompatible(Type frontendType, Type backendType);
}
```

### 6. Solution Generator (解决方案生成器)

**职责**: 为识别的问题生成具体的解决方案

**输入**:
- 兼容性问题列表

**输出**:
- 解决方案列表 (Solution)

**关键方法**:
```java
class SolutionGenerator {
    Solution generateSolution(CompatibilityIssue issue);
    String generateBackendImplementation(ApiEndpoint frontendApi);
    String generateModelAlignment(ModelDifference difference);
    String generateFixSuggestion(CompatibilityIssue issue);
}
```

### 7. Report Generator (报告生成器)

**职责**: 生成全面的审计报告

**输入**:
- 匹配结果
- 兼容性问题列表
- 解决方案列表

**输出**:
- Markdown格式的审计报告

**关键方法**:
```java
class ReportGenerator {
    String generateExecutiveSummary(AuditResult result);
    String generateDetailedReport(AuditResult result);
    String generateIssueTable(List<CompatibilityIssue> issues);
    String generateSolutionSection(List<Solution> solutions);
}
```

## Data Models

### ApiEndpoint (API端点)
```java
class ApiEndpoint {
    String url;                    // API路径，如 "/api/v1/mall/drugs/{drugId}"
    HttpMethod method;             // HTTP方法: GET, POST, PUT, DELETE
    String moduleName;             // 模块名称，如 "药品商城"
    List<Parameter> parameters;    // 请求参数列表
    ResponseType responseType;     // 响应类型
    String sourceFile;             // 源文件路径
    int lineNumber;                // 行号
    boolean requiresAuth;          // 是否需要认证
}
```

### Parameter (参数)
```java
class Parameter {
    String name;                   // 参数名称
    ParameterType type;            // 参数类型: PATH, QUERY, BODY, HEADER
    String dataType;               // 数据类型，如 "Long", "String", "DrugDTO"
    boolean required;              // 是否必填
    String defaultValue;           // 默认值
}
```

### CompatibilityIssue (兼容性问题)
```java
class CompatibilityIssue {
    String issueId;                // 问题ID
    IssueType type;                // 问题类型
    IssueSeverity severity;        // 严重程度: HIGH, MEDIUM, LOW
    String title;                  // 问题标题
    String description;            // 问题描述
    ApiEndpoint frontendApi;       // 前端API
    ApiEndpoint backendApi;        // 后端API (可能为null)
    String impact;                 // 影响分析
    List<String> affectedFeatures; // 受影响的功能
}
```

### IssueType (问题类型枚举)
```java
enum IssueType {
    MISSING_BACKEND_API,           // 后端API缺失
    PATH_MISMATCH,                 // 路径不匹配
    METHOD_MISMATCH,               // HTTP方法不匹配
    REQUEST_FORMAT_INCOMPATIBLE,   // 请求格式不兼容
    RESPONSE_FORMAT_INCOMPATIBLE,  // 响应格式不兼容
    MISSING_PARAMETER,             // 缺少参数
    PARAMETER_TYPE_MISMATCH,       // 参数类型不匹配
    MISSING_ERROR_HANDLING,        // 缺少错误处理
    MISSING_AUTHENTICATION,        // 缺少认证检查
    MISSING_VALIDATION,            // 缺少数据验证
    INCORRECT_STATUS_CODE          // 错误的状态码
}
```

### Solution (解决方案)
```java
class Solution {
    String solutionId;             // 解决方案ID
    CompatibilityIssue issue;      // 关联的问题
    String approach;               // 解决方法
    String codeTemplate;           // 代码模板
    List<String> steps;            // 实施步骤
    int estimatedEffort;           // 预估工作量(小时)
    Priority priority;             // 优先级
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API扫描完整性
*For any* API Service接口文件或Controller文件，扫描器应该能够提取所有带有HTTP注解的方法，并且提取的API数量应该等于文件中实际定义的API方法数量
**Validates: Requirements 1.1, 2.1**

### Property 2: URL路径匹配一致性
*For any* 前端API和后端API，如果它们的URL路径完全相同且HTTP方法相同，则匹配器应该将它们标记为完全匹配
**Validates: Requirements 3.1**

### Property 3: 缺失API检测完整性
*For any* 前端API，如果在后端API清单中找不到相同URL路径和HTTP方法的API，则应该被标记为"缺失实现"问题
**Validates: Requirements 3.2**

### Property 4: 参数类型兼容性验证
*For any* 匹配的前后端API对，如果前端发送的参数类型与后端接收的参数类型不兼容，则应该被标记为"参数类型不匹配"问题
**Validates: Requirements 4.1**

### Property 5: 响应格式一致性验证
*For any* 匹配的前后端API对，如果后端返回的响应结构与前端期望的响应结构不一致，则应该被标记为"响应格式不兼容"问题
**Validates: Requirements 4.2**

### Property 6: 问题严重程度分级正确性
*For any* 识别的兼容性问题，其严重程度应该根据影响范围正确分级：导致功能完全不可用的为HIGH，导致部分功能异常的为MEDIUM，不影响核心功能的为LOW
**Validates: Requirements 7.3**

### Property 7: 解决方案生成完整性
*For any* 识别的兼容性问题，系统应该生成至少一个可行的解决方案，包含问题描述、解决方法和实施步骤
**Validates: Requirements 6.1, 6.2**

## Error Handling

### 1. 文件访问错误
- **场景**: 无法读取源代码文件
- **处理**: 记录错误日志，跳过该文件，继续扫描其他文件
- **用户反馈**: 在报告中列出无法访问的文件

### 2. 代码解析错误
- **场景**: 源代码语法错误或无法解析
- **处理**: 记录错误位置，尝试继续解析其他部分
- **用户反馈**: 在报告中标注解析失败的文件和行号

### 3. 类型推断失败
- **场景**: 无法确定参数或响应的数据类型
- **处理**: 标记为"未知类型"，继续处理
- **用户反馈**: 在报告中提示需要手动检查

### 4. 匹配歧义
- **场景**: 一个前端API可能匹配多个后端API
- **处理**: 列出所有可能的匹配，按相似度排序
- **用户反馈**: 在报告中提供所有候选匹配供用户选择

### 5. 空结果
- **场景**: 扫描未发现任何API或问题
- **处理**: 验证扫描路径是否正确
- **用户反馈**: 提示用户检查项目路径配置

## Testing Strategy

### Unit Testing

**测试范围**:
- 每个组件的核心方法
- 边界条件和异常情况
- 数据模型的序列化/反序列化

**关键测试用例**:
1. FrontendScanner能否正确解析Retrofit注解
2. BackendScanner能否正确解析Spring MVC注解
3. ApiMatcher能否正确计算URL相似度
4. CompatibilityValidator能否识别类型不匹配
5. ReportGenerator能否生成格式正确的Markdown

### Property-Based Testing

使用**JUnit 5 + jqwik**作为属性测试框架，每个测试运行至少100次迭代。

**Property Test 1: API扫描完整性**
```java
@Property
@Label("Feature: api-compatibility-audit, Property 1: API扫描完整性")
void scannerShouldExtractAllApiMethods(@ForAll("apiServiceFiles") File serviceFile) {
    // 生成包含随机数量API方法的测试文件
    // 扫描文件
    List<ApiEndpoint> endpoints = scanner.scan(serviceFile);
    // 验证提取的API数量等于实际定义的数量
    int expectedCount = countApiMethodsInFile(serviceFile);
    assertEquals(expectedCount, endpoints.size());
}
```

**Property Test 2: URL路径匹配一致性**
```java
@Property
@Label("Feature: api-compatibility-audit, Property 2: URL路径匹配一致性")
void matcherShouldIdentifyExactMatches(
    @ForAll("apiEndpoints") ApiEndpoint frontend,
    @ForAll("apiEndpoints") ApiEndpoint backend) {
    
    // 如果URL和方法相同
    if (frontend.getUrl().equals(backend.getUrl()) && 
        frontend.getMethod().equals(backend.getMethod())) {
        // 应该被标记为完全匹配
        assertTrue(matcher.isExactMatch(frontend, backend));
    }
}
```

**Property Test 3: 缺失API检测完整性**
```java
@Property
@Label("Feature: api-compatibility-audit, Property 3: 缺失API检测完整性")
void matcherShouldDetectMissingApis(
    @ForAll("apiEndpoints") ApiEndpoint frontendApi,
    @ForAll("apiEndpointLists") List<ApiEndpoint> backendApis) {
    
    // 确保后端列表不包含该API
    backendApis.removeIf(api -> 
        api.getUrl().equals(frontendApi.getUrl()) && 
        api.getMethod().equals(frontendApi.getMethod()));
    
    // 执行匹配
    MatchingResult result = matcher.match(
        Arrays.asList(frontendApi), backendApis);
    
    // 应该被标记为缺失
    assertTrue(result.getMissingBackendApis().contains(frontendApi));
}
```

**Property Test 4: 参数类型兼容性验证**
```java
@Property
@Label("Feature: api-compatibility-audit, Property 4: 参数类型兼容性验证")
void validatorShouldDetectParameterTypeMismatch(
    @ForAll("parameters") Parameter frontendParam,
    @ForAll("parameters") Parameter backendParam) {
    
    // 如果参数名相同但类型不同
    if (frontendParam.getName().equals(backendParam.getName()) &&
        !frontendParam.getDataType().equals(backendParam.getDataType())) {
        
        // 应该被标记为类型不匹配
        List<CompatibilityIssue> issues = validator.validateParameterTypes(
            Arrays.asList(frontendParam), Arrays.asList(backendParam));
        
        assertTrue(issues.stream().anyMatch(
            issue -> issue.getType() == IssueType.PARAMETER_TYPE_MISMATCH));
    }
}
```

**Property Test 5: 响应格式一致性验证**
```java
@Property
@Label("Feature: api-compatibility-audit, Property 5: 响应格式一致性验证")
void validatorShouldDetectResponseFormatMismatch(
    @ForAll("responseTypes") ResponseType frontendResponse,
    @ForAll("responseTypes") ResponseType backendResponse) {
    
    // 如果响应结构不一致
    if (!areResponseStructuresCompatible(frontendResponse, backendResponse)) {
        
        ApiEndpoint frontend = createApiWithResponse(frontendResponse);
        ApiEndpoint backend = createApiWithResponse(backendResponse);
        
        // 应该被标记为响应格式不兼容
        List<CompatibilityIssue> issues = 
            validator.validateResponseFormat(frontend, backend);
        
        assertTrue(issues.stream().anyMatch(
            issue -> issue.getType() == IssueType.RESPONSE_FORMAT_INCOMPATIBLE));
    }
}
```

**Property Test 6: 问题严重程度分级正确性**
```java
@Property
@Label("Feature: api-compatibility-audit, Property 6: 问题严重程度分级正确性")
void issuesShouldHaveCorrectSeverity(@ForAll("compatibilityIssues") CompatibilityIssue issue) {
    // 验证严重程度分级逻辑
    if (issue.getType() == IssueType.MISSING_BACKEND_API) {
        // 缺失API应该是HIGH
        assertEquals(IssueSeverity.HIGH, issue.getSeverity());
    } else if (issue.getType() == IssueType.PARAMETER_TYPE_MISMATCH) {
        // 参数类型不匹配应该是MEDIUM或HIGH
        assertTrue(issue.getSeverity() == IssueSeverity.HIGH || 
                   issue.getSeverity() == IssueSeverity.MEDIUM);
    }
}
```

**Property Test 7: 解决方案生成完整性**
```java
@Property
@Label("Feature: api-compatibility-audit, Property 7: 解决方案生成完整性")
void solutionGeneratorShouldProvideCompleteSolutions(
    @ForAll("compatibilityIssues") CompatibilityIssue issue) {
    
    // 生成解决方案
    Solution solution = solutionGenerator.generateSolution(issue);
    
    // 验证解决方案完整性
    assertNotNull(solution);
    assertNotNull(solution.getApproach());
    assertFalse(solution.getSteps().isEmpty());
    assertTrue(solution.getEstimatedEffort() > 0);
}
```

### Integration Testing

**测试场景**:
1. 端到端测试：从扫描到生成报告的完整流程
2. 使用真实的项目代码片段进行测试
3. 验证生成的报告格式和内容

## Implementation Notes

### 常见API实现问题模式

基于对现有代码的分析，以下是需要重点检查的常见问题：

#### 1. URL路径不一致
- **前端**: `mall/drugs/{drugId}`
- **后端**: `/api/v1/mall/drugs/{drugId}`
- **问题**: 前端可能缺少`/api/v1`前缀
- **检测**: 标准化URL路径后再比较

#### 2. 参数位置不匹配
- **前端**: `@Query("userId") Long userId`
- **后端**: `@PathVariable Long userId`
- **问题**: 参数传递方式不同
- **检测**: 比较参数类型(PATH vs QUERY vs BODY)

#### 3. 响应包装不一致
- **前端期望**: `BaseResponse<Drug>`
- **后端返回**: `ApiResponse<DrugDTO>`
- **问题**: 响应包装类不同
- **检测**: 检查泛型类型和字段结构

#### 4. 数据模型字段不匹配
- **前端**: `Drug.quantity`
- **后端**: `DrugDTO.stock`
- **问题**: 字段名称不同
- **检测**: 比较模型类的字段名和类型

#### 5. 缺少错误处理
- **问题**: 后端未捕获异常或返回标准错误格式
- **检测**: 检查Controller方法是否有try-catch块

#### 6. 缺少认证检查
- **问题**: 需要认证的API未验证用户身份
- **检测**: 检查是否有@RequiresAuthentication或手动验证

#### 7. 缺少参数验证
- **问题**: 后端未验证必填参数或参数范围
- **检测**: 检查是否使用@Valid或手动验证

#### 8. HTTP状态码使用不当
- **问题**: 所有响应都返回200，即使是错误情况
- **检测**: 检查是否根据业务逻辑返回适当的状态码

### 扫描策略

1. **增量扫描**: 支持只扫描变更的文件
2. **并行处理**: 使用多线程加速扫描过程
3. **缓存机制**: 缓存已扫描的结果，避免重复解析
4. **配置化**: 支持通过配置文件自定义扫描规则

### 报告格式

生成的Markdown报告应包含以下部分：

1. **执行摘要**
   - 扫描统计（API总数、匹配数、问题数）
   - 问题分布（按类型、严重程度）
   - 关键发现

2. **详细问题列表**
   - 按模块分组
   - 每个问题包含：标题、描述、影响、优先级

3. **解决方案**
   - 每个问题的具体修复建议
   - 代码示例
   - 实施步骤

4. **附录**
   - 完整的API清单
   - 数据模型对比表
   - 术语表
