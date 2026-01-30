# Implementation Plan: Pharmacy API Call Logging

## Overview

This implementation plan adds comprehensive API call logging to the existing pharmacy order integration in `internet-hospital/adinnet-doctor-api`. The pharmacy integration is already functional - this enhancement adds detailed logging of all API calls to a database table.

## Current Status

**COMPLETED**:
- ✅ Pharmacy integration implemented in `PharmacyOrderServiceImpl`
- ✅ Prescription audit triggers pharmacy order push via `/pre/commit` endpoint
- ✅ SQL table script created at `internet-hospital/sql/t_pharmacy_api_call_log.sql`
- ✅ PharmacyApiCallLog entity created
- ✅ PharmacyApiCallLogMapper created
- ✅ PharmacyApiCallLogService interface created
- ✅ PharmacyApiCallLogServiceImpl implementation created
- ✅ OrderMainInfo updated with prescriptionId field
- ✅ OrderMainInfoMapper.xml updated to include prescription_id
- ✅ PharmacyOrderServiceImpl updated with API call logging
- ✅ PharmacyApiClient updated with getApiUrl() method
- ✅ Project compiles successfully

**REMAINING**:
- ❌ Execute SQL script on development database
- ❌ Unit tests for PharmacyApiCallLogServiceImpl
- ❌ Integration tests for end-to-end logging
- ❌ Manual testing

## Tasks

- [ ] 1. Create database table for API call logging
  - [x] 1.1 SQL migration script already created
    - File: `internet-hospital/sql/t_pharmacy_api_call_log.sql`
    - _Requirements: 7.1, 7.2, 7.8, 8.1, 8.3_

  - [x] 1.2 Execute SQL script on development database
    - Run the SQL script to create `t_pharmacy_api_call_log` table
    - Verify table structure matches design
    - Verify indexes are created correctly
    - _Requirements: 7.8, 8.1, 8.3_

- [x] 2. Create entity class for API call log
  - [x] 2.1 Create PharmacyApiCallLog entity
    - Create `PharmacyApiCallLog.java` in `internet-hospital/adinnet-doctor-api/src/main/java/com/doctor/api/app/entity/` package
    - Add `@TableName("t_pharmacy_api_call_log")` annotation
    - Add `@TableId(type = IdType.AUTO)` for id field
    - Add all fields matching database schema: id, prescriptionId, orderNum, requestUrl, requestMethod, requestPayload, responsePayload, requestTime, responseTime, duration, httpStatusCode, callStatus, errorCode, errorMessage, exceptionType, exceptionMessage, createTime
    - Use `LocalDateTime` for timestamp fields
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

- [x] 3. Create mapper interface for API call log
  - [x] 3.1 Create PharmacyApiCallLogMapper interface
    - Create `PharmacyApiCallLogMapper.java` in `internet-hospital/adinnet-doctor-api/src/main/java/com/doctor/api/app/mapper/` package
    - Extend `BaseMapper<PharmacyApiCallLog>`
    - Add `@Mapper` annotation
    - No additional methods needed (MyBatis-Plus provides CRUD operations)
    - _Requirements: 7.1, 8.1_

- [x] 4. Create service interface for API call log
  - [x] 4.1 Create PharmacyApiCallLogService interface
    - Create `PharmacyApiCallLogService.java` in `internet-hospital/adinnet-doctor-api/src/main/java/com/doctor/api/app/service/` package
    - Define method: `PharmacyApiCallLog createLog(String prescriptionId, String orderNum, String requestUrl, String requestPayload)`
    - Define method: `void updateLogSuccess(String logId, String responsePayload, int httpStatusCode, long duration)`
    - Define method: `void updateLogFailure(String logId, String responsePayload, int httpStatusCode, String errorCode, String errorMessage, long duration)`
    - Define method: `void updateLogError(String logId, Exception exception, long duration)`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.10_

- [x] 5. Create service implementation for API call log
  - [x] 5.1 Create PharmacyApiCallLogServiceImpl class
    - Create `PharmacyApiCallLogServiceImpl.java` in `internet-hospital/adinnet-doctor-api/src/main/java/com/doctor/api/app/service/impl/` package
    - Add `@Service` annotation
    - Inject `PharmacyApiCallLogMapper` using `@Autowired`
    - Implement `createLog()` method:
      * Create new `PharmacyApiCallLog` object
      * Set prescriptionId, orderNum, requestUrl, requestMethod="POST", requestPayload
      * Set requestTime to `LocalDateTime.now()`
      * Set callStatus to "PENDING"
      * Call `mapper.insert(log)` to save to database
      * Return the created log object
    - Implement `updateLogSuccess()` method:
      * Create new `PharmacyApiCallLog` object with id
      * Set responsePayload, responseTime=`LocalDateTime.now()`, httpStatusCode, duration
      * Set callStatus to "SUCCESS"
      * Call `mapper.updateById(log)` to update database
    - Implement `updateLogFailure()` method:
      * Create new `PharmacyApiCallLog` object with id
      * Set responsePayload, responseTime, httpStatusCode, duration
      * Set callStatus to "FAILURE"
      * Set errorCode and errorMessage
      * Call `mapper.updateById(log)` to update database
    - Implement `updateLogError()` method:
      * Create new `PharmacyApiCallLog` object with id
      * Set responseTime, duration
      * Set callStatus to "ERROR"
      * Set exceptionType to `exception.getClass().getName()`
      * Set exceptionMessage to `exception.getMessage()`
      * Call `mapper.updateById(log)` to update database
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.10_

- [x] 6. Update PharmacyOrderServiceImpl to add logging
  - [x] 6.1 Add dependency injection for PharmacyApiCallLogService
    - Open `internet-hospital/adinnet-doctor-api/src/main/java/com/doctor/api/app/service/impl/PharmacyOrderServiceImpl.java`
    - Add `@Autowired private PharmacyApiCallLogService apiCallLogService;` field
    - _Requirements: 7.1_

  - [x] 6.2 Add prescription ID retrieval
    - In `pushOrderToPharmacy()` method, after retrieving `OrderMainInfo`
    - Add code to get prescription ID: `String prescriptionId = mainInfo.getPrescriptionId();`
    - Store prescriptionId in a variable for use in logging
    - _Requirements: 7.2_

  - [x] 6.3 Create API call log before sending request
    - After data transformation (creating `PharmacyOrderRequest`)
    - Get request URL from `PharmacyApiClient`: `String requestUrl = pharmacyApiClient.getApiUrl();`
    - Convert request to JSON: `String requestPayload = JSON.toJSONString(request);`
    - Create log: `PharmacyApiCallLog apiLog = apiCallLogService.createLog(prescriptionId, orderNum, requestUrl, requestPayload);`
    - Store apiLog in a variable for later updates
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 6.4 Update log after successful API call
    - After receiving `PharmacyOrderResponse` from `pharmacyApiClient.sendOrder()`
    - Calculate duration: `long duration = System.currentTimeMillis() - startTime;`
    - Convert response to JSON: `String responsePayload = JSON.toJSONString(apiResponse);`
    - If `apiResponse.isSuccess()` is true:
      * Call `apiCallLogService.updateLogSuccess(apiLog.getId(), responsePayload, 200, duration);`
    - _Requirements: 7.4, 7.5, 7.10_

  - [x] 6.5 Update log after failed API call
    - In the else block (when `apiResponse.isSuccess()` is false):
      * Extract error code: `String errorCode = String.valueOf(apiResponse.getErrorCode());`
      * Extract error message: `String errorMsg = apiResponse.getErrorMsg();`
      * Call `apiCallLogService.updateLogFailure(apiLog.getId(), responsePayload, 200, errorCode, errorMsg, duration);`
    - _Requirements: 7.6, 7.10_

  - [x] 6.6 Update log on exception
    - In the catch block:
      * Calculate duration: `long duration = System.currentTimeMillis() - startTime;`
      * Check if `apiLog != null` (it might be null if exception occurred before log creation)
      * If apiLog is not null, call `apiCallLogService.updateLogError(apiLog.getId(), e, duration);`
    - _Requirements: 7.7, 7.10_

  - [x] 6.7 Add null checks and error handling
    - Wrap all logging calls in try-catch blocks to prevent logging failures from affecting main workflow
    - Log any logging errors to console but don't throw exceptions
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Add necessary imports
  - [x] 7.1 Add imports to PharmacyOrderServiceImpl
    - Add `import com.alibaba.fastjson.JSON;` for JSON serialization
    - Add `import com.doctor.api.app.entity.PharmacyApiCallLog;`
    - Add `import com.doctor.api.app.service.PharmacyApiCallLogService;`
    - _Requirements: All_

- [ ] 8. Test the implementation
  - [ ] 8.1 Write unit tests for PharmacyApiCallLogServiceImpl
    - Create test class `PharmacyApiCallLogServiceImplTest.java` in `src/test/java/com/doctor/api/app/service/impl/`
    - Test `createLog()` method with valid inputs
    - Test `updateLogSuccess()` method
    - Test `updateLogFailure()` method
    - Test `updateLogError()` method
    - Use Mockito to mock `PharmacyApiCallLogMapper`
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 7.7, 7.10_

  - [ ] 8.2 Write integration test for pharmacy order push with logging
    - Create test class `PharmacyOrderServiceImplIntegrationTest.java`
    - Test end-to-end pharmacy order push
    - Verify log record is created in database
    - Verify log record contains correct data (prescription ID, order number, request/response payloads)
    - Test both success and failure scenarios
    - _Requirements: 7.1, 7.2, 7.8_

  - [ ] 8.3 Manual testing
    - Start the application
    - Create a prescription and submit for audit
    - Verify pharmacy order is pushed
    - Query `t_pharmacy_api_call_log` table to verify log record was created
    - Check log record contains all expected fields
    - _Requirements: All_

- [x] 9. Update OrderMainInfo model if needed
  - [x] 9.1 Check if OrderMainInfo has prescriptionId field
    - Open `internet-hospital/adinnet-doctor-api/src/main/java/com/doctor/api/app/model/internal/OrderMainInfo.java`
    - Check if `prescriptionId` field exists
    - If not, add `private String prescriptionId;` field with getter and setter
    - _Requirements: 7.2_

  - [x] 9.2 Update OrderMainInfoMapper.xml if needed
    - Open `internet-hospital/adinnet-doctor-api/src/main/resources/xml/OrderMainInfoMapper.xml`
    - Check if SQL query includes `prescription_id` column
    - If not, add `prescription_id` to the SELECT statement
    - Map it to `prescriptionId` property in result map
    - _Requirements: 7.2_

- [x] 10. Compile and verify
  - [x] 10.1 Compile the project
    - Run `mvn clean compile` in `internet-hospital/adinnet-doctor-api` directory
    - Fix any compilation errors
    - _Requirements: All_

  - [ ] 10.2 Run tests
    - Run `mvn test` to execute all tests
    - Verify all tests pass
    - Fix any failing tests
    - _Requirements: All_

  - [ ] 10.3 Build the project
    - Run `mvn clean package` to build the project
    - Verify build succeeds
    - _Requirements: All_

- [ ] 11. Documentation
  - [ ] 11.1 Document API call log table
    - Document table structure and field meanings
    - Provide query examples for common use cases
    - Document log retention policy (90 days)
    - _Requirements: 7.1, 7.8, 8.1, 8.2, 8.3, 8.4_

  - [ ] 11.2 Update README or developer documentation
    - Document the API call logging feature
    - Explain how to query logs for troubleshooting
    - Provide examples of useful queries
    - _Requirements: All_

- [ ] 12. Checkpoint - Verify implementation
  - Run all unit tests and verify they pass
  - Run integration tests and verify they pass
  - Manually test prescription submission and verify logs are created
  - Query database to verify log records contain correct data
  - Verify logging does not affect main workflow (audit still succeeds even if logging fails)
  - Ask the user if questions arise
