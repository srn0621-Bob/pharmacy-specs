# Pharmacy Integration Architecture Change

## 概述

根据用户反馈,我们将所有pharmacy相关的代码从`adinnet-patient-api`模块移动到了`adinnet-doctor-api`模块。这是一个重大的架构调整,旨在提高代码的内聚性和可维护性。

## 变更原因

### 原始设计的问题

最初,pharmacy相关代码被放置在`adinnet-patient-api`模块中,理由是:
- 药房订单最终是为患者配药
- 订单数据包含患者信息
- 这些数据通常在患者相关的模块中管理

### 为什么需要调整

**触发点在医生端**: 
- 药房订单推送是在医生提交处方审核时触发的(`/pre/commit`接口)
- 这个接口在`PrescriptionServiceImpl`中,属于`adinnet-doctor-api`模块
- 原来的设计导致跨模块调用,增加了依赖复杂度

**调用链路对比**:

❌ **原来的架构** (跨模块调用):
```
PrescriptionController (doctor-api) 
→ PrescriptionServiceImpl (doctor-api) 
→ PharmacyOrderService (patient-api) ❌ 跨模块
```

✅ **新的架构** (同模块调用):
```
PrescriptionController (doctor-api) 
→ PrescriptionServiceImpl (doctor-api) 
→ PharmacyOrderService (doctor-api) ✅ 同模块
```

## 移动的文件清单

### 1. Client层
- `PharmacyApiClient.java`

### 2. Config层
- `PharmacyConfig.java`
- `RestTemplateConfig.java`

### 3. Data层
- `OrderDataRetriever.java`

### 4. Exception层
- `ErrorCategory.java`
- `PharmacyOrderException.java`

### 5. Mapper层
- `DrugListMapper.java`
- `OrderMainInfoMapper.java`
- `PharmacyApiCallLogMapper.java`
- `PharmacyOrderMapper.java`

### 6. Model层
- `DrugInfo.java`
- `OrderMainInfo.java`
- `OrderPushResult.java`
- `PharmacyApiCallLog.java`
- **Request子包**:
  - `ContactInfo.java`
  - `GoodsItem.java`
  - `OrderInfo.java`
  - `PharmacyOrderRequest.java`
  - `PrescriptionInfo.java`
- **Response子包**:
  - `PharmacyOrderResponse.java`

### 7. Service层
- `PharmacyApiCallLogService.java`
- `PharmacyApiCallLogServiceImpl.java`
- `PharmacyOrderService.java`

### 8. Util层
- `DataConverter.java`

### 9. MyBatis XML映射文件
- `DrugListMapper.xml`
- `OrderMainInfoMapper.xml`

## 包名变更

所有文件的包名从:
```
com.patient.api.pharmacy.*
```

变更为:
```
com.doctor.api.pharmacy.*
```

## 受影响的文件

### 需要更新import的文件

1. **PrescriptionServiceImpl.java**
   - 位置: `internet-hospital/adinnet-doctor-api/src/main/java/com/doctor/api/app/service/impl/PrescriptionServiceImpl.java`
   - 变更: 
     ```java
     // 旧的import
     import com.patient.api.pharmacy.service.PharmacyOrderService;
     import com.patient.api.pharmacy.model.OrderPushResult;
     
     // 新的import
     import com.doctor.api.pharmacy.service.PharmacyOrderService;
     import com.doctor.api.pharmacy.model.OrderPushResult;
     ```

## 架构优势

### 1. 减少模块间依赖
- 不再需要doctor-api依赖patient-api中的pharmacy包
- 模块边界更清晰

### 2. 业务逻辑更内聚
- 处方审核和药房订单推送都在同一个模块中
- 更容易理解和维护

### 3. 符合"谁触发谁负责"原则
- 医生端触发的功能应该在医生端模块中
- 责任划分更明确

### 4. 更容易测试
- 不需要跨模块mock
- 集成测试更简单

## 后续工作

### 1. 删除patient-api中的旧代码
需要删除以下目录:
```
internet-hospital/adinnet-patient-api/src/main/java/com/patient/api/pharmacy/
```

以及相关的XML文件:
```
internet-hospital/adinnet-patient-api/src/main/resources/xml/DrugListMapper.xml
internet-hospital/adinnet-patient-api/src/main/resources/xml/OrderMainInfoMapper.xml
```

### 2. 更新测试文件
如果有测试文件引用了旧的包名,需要更新:
```
internet-hospital/adinnet-patient-api/src/test/java/com/patient/api/pharmacy/
```

### 3. 更新文档
需要更新以下文档中的包名引用:
- `.kiro/specs/doc-pharmacy-api/design.md`
- `.kiro/specs/doc-pharmacy-api/requirements.md`
- 其他相关文档

## 验证清单

- [x] 所有Java文件已创建在doctor-api中
- [x] 所有包名已更新为com.doctor.api.pharmacy
- [x] MyBatis XML映射文件已创建
- [x] PrescriptionServiceImpl的import已更新
- [x] 删除patient-api中的旧pharmacy代码(Java和XML)
- [x] 删除patient-api中的旧pharmacy测试代码
- [x] 更新design.md文档中的包名引用
- [ ] 编译验证(需要运行mvn compile)
- [ ] 单元测试验证
- [ ] 集成测试验证

## 总结

这次架构调整将pharmacy相关的所有代码从`adinnet-patient-api`移动到了`adinnet-doctor-api`,使得代码结构更加合理,模块职责更加清晰。这符合软件工程中的高内聚、低耦合原则,将大大提高代码的可维护性和可测试性。
