# 实施计划 - 药品图片JSON解析功能

## 概述

本文档描述药品图片JSON解析功能的实施任务列表。按照从底层到上层的顺序实现,确保功能的完整性和可测试性。

---

## 任务列表

- [ ] 1. 创建DrugImageParser工具类
  - [ ] 1.1 创建工具类文件
    - 创建文件: `DrugImageParser.java`
    - 位置: `com.patient.api.app.mall.util`
    - 添加类注释和Lombok注解
    - _Requirements: 3.1_
  
  - [ ] 1.2 实现parseImages方法
    - 实现JSON解析逻辑
    - 处理空值情况(null, "", "[]")
    - 添加异常捕获(JsonSyntaxException)
    - 记录日志(debug, warn, error)
    - _Requirements: 1.1-1.4, 5.1-5.2_
  
  - [ ] 1.3 实现isValidImageUrl方法
    - 验证URL非空
    - 验证HTTP/HTTPS协议
    - 添加日志记录
    - _Requirements: 3.5, 5.3_
  
  - [ ]* 1.4 编写单元测试
    - 测试有效JSON解析
    - 测试空值处理
    - 测试无效JSON处理
    - 测试URL过滤
    - 测试性能(1000次解析<100ms)
    - _Requirements: 1.1-1.6, 6.1-6.2_

- [ ] 2. 更新DrugDTO模型
  - [ ] 2.1 添加drugImages字段
    - 在DrugDTO中添加 `List<String> drugImages`
    - 初始化为空列表: `= new ArrayList<>()`
    - 添加Getter和Setter方法(Lombok自动生成)
    - _Requirements: 2.1, 2.4_
  
  - [ ] 2.2 添加字段注释
    - 为drugImages添加中文注释
    - 说明字段用途和数据来源
    - _Requirements: 2.1_
  
  - [ ] 2.3 验证模型兼容性
    - 确认保留picPosition字段
    - 确认不影响现有字段
    - _Requirements: 2.2_

- [ ] 3. 更新DrugMallService
  - [ ] 3.1 添加enrichDrugWithImages私有方法
    - 创建私有方法: `enrichDrugWithImages(DrugDTO drug)`
    - 调用DrugImageParser.parseImages()
    - 设置drug.setDrugImages()
    - 添加debug日志
    - _Requirements: 3.1-3.2_
  
  - [ ] 3.2 更新getDrugDetail方法
    - 在返回前调用enrichDrugWithImages()
    - 添加空值检查
    - _Requirements: 3.2_
  
  - [ ] 3.3 更新getRecommendedDrugs方法
    - 使用forEach批量调用enrichDrugWithImages()
    - 添加批量处理日志
    - _Requirements: 3.2_
  
  - [ ] 3.4 更新searchDrugs方法
    - 在返回前批量解析图片
    - _Requirements: 3.2_
  
  - [ ] 3.5 更新getDrugsByCategory方法
    - 在返回前批量解析图片
    - _Requirements: 3.2_
  
  - [ ]* 3.6 编写Service层单元测试
    - 测试getDrugDetail包含图片
    - 测试getRecommendedDrugs包含图片
    - 使用Mock验证解析方法调用
    - _Requirements: 3.1-3.5_

- [ ] 4. 验证API响应格式
  - [ ] 4.1 测试药品详情接口
    - 请求: `GET /api/v1/mall/drugs/{drugId}`
    - 验证响应包含drugImages字段
    - 验证drugImages是数组格式
    - 验证空值返回空数组[]
    - _Requirements: 4.1-4.3_
  
  - [ ] 4.2 测试推荐药品接口
    - 请求: `GET /api/v1/mall/drugs/recommended`
    - 验证所有药品包含drugImages
    - 验证图片URL格式
    - _Requirements: 4.1-4.4_
  
  - [ ] 4.3 测试搜索接口
    - 请求: `GET /api/v1/mall/drugs/search?keyword=xxx`
    - 验证搜索结果包含drugImages
    - _Requirements: 4.1-4.4_
  
  - [ ] 4.4 测试分类查询接口
    - 请求: `GET /api/v1/mall/drugs/category/{categoryId}`
    - 验证分类药品包含drugImages
    - _Requirements: 4.1-4.4_

- [ ] 5. 错误处理验证
  - [ ] 5.1 测试无效JSON处理
    - 在数据库中插入无效JSON数据
    - 调用API验证返回空数组
    - 检查日志记录警告信息
    - 清理测试数据
    - _Requirements: 5.1-5.2_
  
  - [ ] 5.2 测试空值处理
    - 测试pic_position为NULL的药品
    - 测试pic_position为空字符串的药品
    - 验证返回空数组不影响其他字段
    - _Requirements: 1.2-1.3, 5.4_
  
  - [ ] 5.3 测试无效URL过滤
    - 插入包含无效URL的JSON
    - 验证无效URL被过滤
    - 验证有效URL保留
    - _Requirements: 5.3_

- [ ] 6. 性能测试
  - [ ] 6.1 单个药品解析性能
    - 测试单次解析时间<10ms
    - 使用JMH或简单计时
    - _Requirements: 6.1_
  
  - [ ] 6.2 批量解析性能
    - 测试100个药品解析时间<1秒
    - 记录平均解析时间
    - _Requirements: 6.2_
  
  - [ ] 6.3 并发解析测试
    - 模拟10个并发请求
    - 验证无线程安全问题
    - _Requirements: 6.3_

- [ ] 7. Checkpoint - 功能验收
  - 确认所有单元测试通过
  - 确认所有API测试通过
  - 确认错误处理正常
  - 确认性能满足要求
  - 询问用户是否继续集成测试

- [ ] 8. 集成测试
  - [ ] 8.1 编写Controller集成测试
    - 使用MockMvc测试API
    - 验证JSON响应格式
    - 验证drugImages字段存在
    - _Requirements: 4.1-4.4_
  
  - [ ] 8.2 端到端测试
    - 启动完整应用
    - 使用Postman或curl测试
    - 验证真实数据库数据
    - _Requirements: 所有需求_

- [ ] 9. 代码审查和优化
  - [ ] 9.1 代码审查
    - 检查代码规范
    - 检查注释完整性
    - 检查异常处理
    - _Requirements: 非功能性需求_
  
  - [ ] 9.2 性能优化(可选)
    - 评估是否需要缓存
    - 评估是否需要并行处理
    - _Requirements: 6.3-6.4_
  
  - [ ] 9.3 日志优化
    - 调整日志级别
    - 优化日志内容
    - _Requirements: 5.2_

- [ ] 10. 文档更新
  - [ ] 10.1 更新API文档
    - 在Swagger中添加drugImages字段说明
    - 更新响应示例
    - _Requirements: 4.1-4.4_
  
  - [ ] 10.2 更新开发文档
    - 记录实现细节
    - 记录遇到的问题和解决方案
    - _Requirements: 非功能性需求_

- [ ] 11. Final Checkpoint - 完成验收
  - 确认所有任务完成
  - 确认所有测试通过
  - 确认文档更新完成
  - 提交代码审查

---

## 代码示例

### 1. DrugImageParser.java

```java
package com.patient.api.app.mall.util;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

/**
 * 药品图片JSON解析工具类
 * 
 * @author Kiro
 * @date 2026-01-23
 */
@Slf4j
public class DrugImageParser {
    
    private static final Gson gson = new Gson();
    private static final Type STRING_LIST_TYPE = new TypeToken<List<String>>(){}.getType();
    
    /**
     * 解析图片JSON字符串为URL列表
     * 
     * @param picPosition JSON格式的图片位置字符串
     * @return 图片URL列表,解析失败返回空列表
     */
    public static List<String> parseImages(String picPosition) {
        // TODO: 实现解析逻辑
        return new ArrayList<>();
    }
    
    /**
     * 验证图片URL是否有效
     * 
     * @param url 图片URL
     * @return true=有效, false=无效
     */
    private static boolean isValidImageUrl(String url) {
        // TODO: 实现验证逻辑
        return false;
    }
}
```

### 2. DrugDTO更新

```java
@Data
public class DrugDTO {
    // ... 现有字段
    
    /**
     * 药品图片列表(解析自pic_position字段)
     */
    private List<String> drugImages = new ArrayList<>();
}
```

### 3. DrugMallServiceImpl更新

```java
@Service
public class DrugMallServiceImpl implements DrugMallService {
    
    @Override
    public DrugDTO getDrugDetail(Long drugId) {
        DrugDTO drug = drugMallMapper.selectById(drugId);
        if (drug != null) {
            enrichDrugWithImages(drug);
        }
        return drug;
    }
    
    /**
     * 为药品对象填充解析后的图片列表
     * 
     * @param drug 药品对象
     */
    private void enrichDrugWithImages(DrugDTO drug) {
        List<String> images = DrugImageParser.parseImages(drug.getPicPosition());
        drug.setDrugImages(images);
        log.debug("药品[{}]解析到{}张图片", drug.getId(), images.size());
    }
}
```

---

## 测试用例

### 单元测试示例

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class DrugImageParserTest {
    
    @Test
    public void testParseValidJson() {
        String json = "[\"http://img1.jpg\",\"http://img2.jpg\"]";
        List<String> result = DrugImageParser.parseImages(json);
        
        assertEquals(2, result.size());
        assertEquals("http://img1.jpg", result.get(0));
        assertEquals("http://img2.jpg", result.get(1));
    }
    
    @Test
    public void testParseNull() {
        List<String> result = DrugImageParser.parseImages(null);
        assertEquals(0, result.size());
    }
    
    @Test
    public void testParseInvalidJson() {
        String json = "not a json";
        List<String> result = DrugImageParser.parseImages(json);
        assertEquals(0, result.size());
    }
}
```

### API测试示例

```bash
# 测试药品详情接口
curl -X GET "http://localhost:8092/api/v1/mall/drugs/1001" \
  -H "Authorization: Bearer {token}"

# 期望响应包含drugImages字段
{
  "code": 200,
  "data": {
    "id": 1001,
    "drugImages": ["http://img1.jpg", "http://img2.jpg"]
  }
}
```

---

## 预计工作量

| 任务阶段 | 预计时间 |
|---------|---------|
| 创建工具类和单元测试 | 1小时 |
| 更新模型和Service | 1小时 |
| API测试和验证 | 30分钟 |
| 错误处理和性能测试 | 30分钟 |
| 集成测试 | 30分钟 |
| 代码审查和文档 | 30分钟 |
| **总计** | **4小时** |

---

## 注意事项

### 开发注意事项

1. **JSON库选择:** 项目使用Gson,确保依赖已添加
2. **空值处理:** 必须处理null、空字符串、空数组三种情况
3. **异常捕获:** 不能让JSON解析异常影响其他功能
4. **日志级别:** 正常情况用DEBUG,异常情况用WARN/ERROR
5. **向后兼容:** 保留picPosition字段,不影响旧版本

### 测试注意事项

1. **测试数据:** 准备多种格式的测试数据
2. **边界测试:** 测试空值、单个图片、多个图片
3. **性能测试:** 确保批量解析性能满足要求
4. **并发测试:** 验证线程安全性

### 部署注意事项

1. **依赖检查:** 确认Gson依赖存在
2. **日志配置:** 确认日志级别配置正确
3. **监控:** 关注解析失败的日志
4. **回滚:** 如有问题可以快速回滚(只是代码变更,无数据库变更)

---

## 参考文档

- [需求文档](./requirements.md)
- [设计文档](./design.md)
- [Gson用户指南](https://github.com/google/gson/blob/master/UserGuide.md)
- [父级任务文档](../patient-drug-mall/tasks.md)
