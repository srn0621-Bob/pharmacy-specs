# Implementation Plan: Pharmacy Order Integration

## Overview

This implementation plan creates a pharmacy order integration system in the adinnet-doctor-api module. The system automatically pushes prescription drug orders to an external pharmacy system after payment completion.

**Current Status**: No implementation exists yet. All code needs to be created from scratch in the doctor-api module.

## Tasks

- [x] 1. Set up project structure and configuration
  - Create package structure: `com.doctor.api.app.config`, `com.doctor.api.app.util`, `com.doctor.api.app.model.pharmacy`, `com.doctor.api.app.model.internal`
  - Create PharmacyConfig class in `com.doctor.api.app.config` package with @ConfigurationProperties
  - Add pharmacy configuration to `application.properties` (base-url, secret-key, retry-count, timeout-seconds)
  - Verify RestTemplate bean is available or create RestTemplateConfig if needed
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3_

- [ ] 2. Implement data models
  - [x] 2.1 Create internal data models in `com.doctor.api.app.model.internal` package
    - Implement OrderMainInfo class with all order, contact, prescription, patient, and doctor fields
    - Implement DrugInfo class with mshId, number, price, drugName fields
    - Implement OrderPushResult class with success, orderNum, message, apiResponse fields
    - Add appropriate constructors, getters, and setters
    - _Requirements: 1.2, 2.9_

  - [x] 2.2 Create pharmacy API request models in `com.doctor.api.app.model.pharmacy.request` package
    - Implement PharmacyOrderRequest class with orderInfo, goodsList, contactInfo, presInfo
    - Implement OrderInfo class with orderId, orderPriceFen, orderOriginPriceFen, orderExpressFen, notex
    - Implement GoodsItem class with goodsId, num, originFen
    - Implement ContactInfo class with name, phone, province, city, country, address
    - Implement PrescriptionInfo class with all optional prescription fields
    - Add @JsonProperty annotations for field mapping
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 2.3 Create pharmacy API response model in `com.doctor.api.app.model.pharmacy.response` package
    - Implement PharmacyOrderResponse class with errorCode, errorMsg
    - Add @JsonProperty annotations
    - _Requirements: 5.5, 5.6_

- [ ] 3. Implement data conversion utilities
  - [x] 3.1 Create DataConverter component in `com.doctor.api.app.util` package
    - Implement convertYuanToFen method using BigDecimal for precision
    - Implement convertSex method ("1" → "m", "0" → "f")
    - Implement convertQuantity method (String → Integer)
    - Implement formatBirthday method (ensure YYYY-MM-DD format)
    - Add null and empty string handling for all methods
    - Add error logging for conversion failures
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 4. Implement database access layer
  - [x] 4.1 Create MyBatis mapper interfaces in `com.doctor.api.app.mapper` package
    - Create OrderMainInfoMapper interface with getOrderMainInfo(@Param("orderNum") String orderNum) method
    - Create DrugListMapper interface with getDrugList(@Param("orderNum") String orderNum) method
    - Add @Mapper annotation to both interfaces
    - _Requirements: 1.2, 6.2, 6.3_

  - [x] 4.2 Create MyBatis XML mapper files in `src/main/resources/xml/` directory
    - Create OrderMainInfoMapper.xml with SQL query joining t_hos_pre_drug_order, t_hos_prescription, t_patient_user, t_doctor_user
    - Create DrugListMapper.xml with SQL query joining t_hos_pre_drug_order, t_hos_prescription, t_hos_prescription_drug, t_drug
    - Use LEFT JOIN for optional relationships (patient, doctor)
    - Use INNER JOIN for required relationships (prescription, drugs)
    - Map results to OrderMainInfo and DrugInfo classes
    - _Requirements: 1.2, 6.1, 6.2, 6.3_

- [ ] 5. Implement data transformation layer
  - [x] 5.1 Create PharmacyOrderMapper component in `com.doctor.api.app.mapper` package
    - Implement mapToPharmacyOrder(OrderMainInfo, List<DrugInfo>) method
    - Implement private buildOrderInfo method
    - Implement private buildGoodsList method
    - Implement private buildContactInfo method
    - Implement private buildPrescriptionInfo method
    - Inject and use DataConverter for all data type conversions
    - Handle null patient information gracefully
    - Handle null doctor information gracefully
    - Handle null prescription image URL
    - Set appropriate default values for optional fields
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Implement pharmacy API client
  - [x] 6.1 Create PharmacyApiClient component in `com.doctor.api.app.util` package
    - Inject RestTemplate and PharmacyConfig
    - Implement buildApiUrl method that appends secret key as query parameter
    - Implement sendOrder method with HTTP POST
    - Set Content-Type: application/json header
    - Configure timeout from PharmacyConfig
    - Parse response to PharmacyOrderResponse
    - Implement retry logic with exponential backoff (max retries from config)
    - Handle HTTP client exceptions
    - Handle timeout exceptions
    - Handle JSON parsing exceptions
    - Log each retry attempt
    - Return appropriate error responses
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 8.1, 8.2, 8.3_

- [ ] 7. Implement main orchestration service
  - [x] 7.1 Create PharmacyOrderService interface and implementation in `com.doctor.api.app.service` package
    - Create PharmacyOrderService interface with pushOrderToPharmacy(String orderNum) method
    - Create PharmacyOrderServiceImpl in `com.doctor.api.app.service.impl` package
    - Inject OrderMainInfoMapper, DrugListMapper, PharmacyOrderMapper, PharmacyApiClient
    - Implement pushOrderToPharmacy orchestration method
    - Retrieve order data using mappers
    - Validate required fields are present
    - Transform data using PharmacyOrderMapper
    - Send to pharmacy API using PharmacyApiClient
    - Return OrderPushResult with status
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 7.2 Implement comprehensive logging in PharmacyOrderService
    - Log order processing start with order number
    - Log data retrieval completion with drug count
    - Log data transformation details
    - Log API request payload at debug level
    - Log API response payload at debug level
    - Log successful completion with duration
    - Log errors with full context and stack trace
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 7.3 Create custom exception classes in `com.doctor.api.app.exception` package
    - Create ErrorCategory enum (DATA_VALIDATION, DATABASE_ERROR, API_COMMUNICATION, BUSINESS_LOGIC)
    - Create PharmacyOrderException with category, orderNum, details fields
    - Add try-catch blocks in PharmacyOrderService
    - Categorize exceptions appropriately
    - Log exceptions with full context
    - Return appropriate error results
    - _Requirements: 1.4, 3.7, 5.8, 7.5_

- [ ] 8. Integrate with PrescriptionService
  - [x] 8.1 Update PrescriptionServiceImpl to call PharmacyOrderService
    - Locate the prescription commit method in PrescriptionServiceImpl
    - Inject PharmacyOrderService
    - Add call to pushOrderToPharmacy after successful payment
    - Handle OrderPushResult and log appropriately
    - Ensure pharmacy push doesn't block prescription commit
    - _Requirements: 1.1, 8.1_

- [ ] 9. Create database indexes
  - [x] 9.1 Create SQL script for database indexes
    - Create index on t_hos_pre_drug_order.order_num
    - Create index on t_hos_pre_drug_order.hos_prescription_id
    - Create index on t_hos_prescription_drug.hos_prescription_id
    - Create index on t_hos_prescription_drug.drug_id
    - Create index on t_hos_prescription.patient_user_id
    - Create index on t_hos_prescription.doctor_user_id
    - Document index creation in deployment guide
    - _Requirements: 6.4, 6.5_

- [ ] 10. Testing and validation
  - [ ] 10.1 Create unit tests for DataConverter
    - Test Yuan to Fen conversion with various decimal places
    - Test Yuan to Fen conversion with edge cases (null, empty, invalid)
    - Test sex conversion for valid and invalid codes
    - Test quantity conversion
    - Test birthday formatting
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 10.2 Create unit tests for PharmacyOrderMapper
    - Test mapping with complete data
    - Test mapping with missing optional fields
    - Test mapping with null values
    - Test goods list mapping with multiple items
    - Verify all data conversions are applied correctly
    - _Requirements: 2.1-2.9, 3.1-3.6, 4.1-4.5_

  - [ ] 10.3 Create unit tests for PharmacyApiClient
    - Mock RestTemplate responses
    - Test successful API call
    - Test API error response (error_code = 1)
    - Test timeout handling
    - Test retry logic with transient failures
    - Test retry exhaustion
    - Verify URL construction with secret key
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ] 10.4 Create unit tests for PharmacyOrderService
    - Mock all dependencies
    - Test successful order push workflow
    - Test handling of missing required fields
    - Test handling of data retrieval failures
    - Test handling of transformation failures
    - Test handling of API communication failures
    - Verify logging calls
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1-7.6_

  - [ ] 10.5 Manual integration testing
    - Test with real database data in test environment
    - Verify complete workflow from order number to API call
    - Test with orders having complete data
    - Test with orders having missing optional fields
    - Test with orders having multiple drugs
    - Verify logging output
    - Verify error handling paths
    - _Requirements: All_

- [ ] 11. Documentation
  - [ ] 11.1 Create deployment guide
    - Document required environment variables (PHARMACY_SECRET_KEY)
    - Document configuration properties
    - Document database index creation steps
    - Document how to enable/disable pharmacy integration
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3_

  - [ ] 11.2 Create operations runbook
    - Document common error scenarios and solutions
    - Document how to manually trigger order push
    - Document how to check order push status
    - Document rollback procedure
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

## Notes

- All code should be created in the `adinnet-doctor-api` module under `com.doctor.api.app.*` packages
- Follow existing code patterns in the doctor-api module
- Use existing MyBatis mapper patterns (XML files in `src/main/resources/xml/`)
- Configuration should be added to existing `application.properties` file
- Tests should be created in `src/test/java` directory (create if doesn't exist)
- The pharmacy integration should be triggered from PrescriptionServiceImpl after payment completion
