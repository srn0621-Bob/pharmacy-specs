# 需求文档 - 药品图片处理功能

## 文档信息

**功能名称:** 药品图片处理功能  
**项目:** 互联网医院 - 患者端药品商城  
**版本:** v1.0  
**创建日期:** 2026-01-23  
**更新日期:** 2026-01-23  
**父级Spec:** patient-drug-mall

---

## 简介

实现t_drug表pic_position字段的处理功能,将单个图片URL转换为List<String>格式,为前端提供统一的图片列表接口。

**重要说明:** pic_position字段存储的是**单个图片URL字符串**,例如:
```
https://internet-hospital-cm.oss-cn-beijing.aliyuncs.com/files/2026012312085517b8fed7b545445ba26b5131a95cbf72.jpg
```

---

## 术语表 (Glossary)

- **pic_position**: t_drug表中存储单个图片URL的字段
- **DrugDTO**: 药品数据传输对象
- **Drug_Images**: 处理后的图片URL列表(List<String>)
- **Image_URL**: 阿里云OSS图片URL地址

---

## 需求

### Requirement 1: 图片URL转换功能

**User Story:** 作为开发人员,我需要将pic_position字段转换为List格式,以便为前端提供统一的图片列表接口

#### Acceptance Criteria

1. WHEN pic_position包含有效URL THEN THE System SHALL 转换为单元素List<String>
2. WHEN pic_position为空字符串 THEN THE System SHALL 返回空列表
3. WHEN pic_position为NULL THEN THE System SHALL 返回空列表
4. THE System SHALL 验证URL格式有效性(HTTP/HTTPS协议)
5. THE System SHALL 过滤无效的URL
6. THE System SHALL 保留原始URL不做修改

---

### Requirement 2: DrugDTO模型扩展

**User Story:** 作为开发人员,我需要在DrugDTO中添加drugImages字段,以便传递图片列表

#### Acceptance Criteria

1. THE System SHALL 在DrugDTO中添加drugImages字段(List<String>类型)
2. THE System SHALL 在DrugDTO中保留原始pic_position字段
3. WHEN 创建DrugDTO对象 THEN THE System SHALL 自动转换pic_position并填充drugImages
4. THE System SHALL 为drugImages字段添加Getter和Setter方法

---

### Requirement 3: Service层处理逻辑

**User Story:** 作为开发人员,我需要在Service层实现图片处理方法,以便统一处理图片数据

#### Acceptance Criteria

1. THE System SHALL 在DrugMallService中添加enrichDrugWithImages方法
2. WHEN 查询药品数据 THEN THE System SHALL 自动调用enrichDrugWithImages处理图片
3. THE System SHALL 验证URL格式(以http://或https://开头)
4. WHEN URL无效 THEN THE System SHALL 记录警告日志并返回空列表
5. THE System SHALL 不抛出异常影响其他功能

---

### Requirement 4: API响应格式

**User Story:** 作为前端开发人员,我需要API返回包含图片列表的数据,以便在界面上展示药品图片

#### Acceptance Criteria

1. WHEN 调用药品查询接口 THEN THE System SHALL 在响应中包含drugImages字段
2. THE System SHALL 返回JSON数组格式的图片列表
3. WHEN drugImages为空 THEN THE System SHALL 返回空数组[]而非null
4. THE System SHALL 确保图片URL是完整的HTTP/HTTPS地址

---

### Requirement 5: 错误处理

**User Story:** 作为系统管理员,我需要系统能够优雅处理图片处理错误,以便不影响其他功能

#### Acceptance Criteria

1. WHEN URL格式无效 THEN THE System SHALL 不抛出异常
2. WHEN URL格式无效 THEN THE System SHALL 记录警告日志包含原始数据
3. WHEN pic_position为空 THEN THE System SHALL 返回空列表
4. THE System SHALL 确保处理错误不影响药品数据的其他字段

---

### Requirement 6: 性能要求

**User Story:** 作为系统管理员,我需要图片处理功能高效执行,以便不影响API响应时间

#### Acceptance Criteria

1. WHEN 处理单个药品图片 THEN THE System SHALL 在5ms内完成
2. WHEN 批量处理100个药品图片 THEN THE System SHALL 在500ms内完成
3. THE System SHALL 避免重复处理同一药品的图片
4. THE System SHALL 使用简单的字符串操作,无需JSON解析

---

## 非功能性需求

### 兼容性要求

1. THE System SHALL 兼容现有的pic_position字段格式
2. THE System SHALL 支持空值和空字符串
3. THE System SHALL 向后兼容不包含drugImages字段的旧版本API

### 可维护性要求

1. THE System SHALL 将处理逻辑封装在独立方法中
2. THE System SHALL 提供清晰的代码注释(中文)
3. THE System SHALL 使用简单的字符串处理,无需第三方库

---

## 约束条件

1. 不能修改t_drug表的pic_position字段结构
2. 必须保持与现有API的兼容性
3. 处理逻辑必须在Service层实现
4. 无需使用JSON解析库,使用简单字符串处理即可

---

## 数据格式示例

### pic_position字段格式

**有效格式(单个URL):**
```
https://internet-hospital-cm.oss-cn-beijing.aliyuncs.com/files/2026012312085517b8fed7b545445ba26b5131a95cbf72.jpg
```

**空值情况:**
```
NULL
""
```

**无效格式(需要过滤):**
```
"not a url"
"ftp://invalid.com/image.jpg"
"/relative/path/image.jpg"
```

### API响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "drugId": 1001,
    "drugName": "阿莫西林胶囊",
    "price": 15.50,
    "picPosition": "https://internet-hospital-cm.oss-cn-beijing.aliyuncs.com/files/xxx.jpg",
    "drugImages": [
      "https://internet-hospital-cm.oss-cn-beijing.aliyuncs.com/files/xxx.jpg"
    ]
  }
}
```

**空值情况响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "drugId": 1002,
    "drugName": "布洛芬片",
    "price": 12.00,
    "picPosition": null,
    "drugImages": []
  }
}
```

---

## 验收标准

- [ ] DrugDTO包含drugImages字段
- [ ] Service层实现enrichDrugWithImages方法
- [ ] 能正确转换有效URL为单元素列表
- [ ] 能优雅处理空值和无效URL
- [ ] API响应包含drugImages字段
- [ ] 处理性能满足要求
- [ ] 所有单元测试通过
- [ ] 集成测试通过

---

## 参考文档

- [t_drug表结构](../../../internet-hospital/sql/t_drug.sql)
- [DrugMallService实现](../../../internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/app/mall/service/impl/DrugMallServiceImpl.java)
- [父级需求文档](../patient-drug-mall/requirements.md)
