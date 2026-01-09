# Implementation Plan

- [x] 1. Set up project structure and configuration



  - Create package structure for pharmacy integration module
  - Add required dependencies (RestTemplate, Jackson, etc.)
  - Create PharmacyConfig class with configuration properties
  - Create application.yml configuration entries
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 2. Implement data models
- [x] 2.1 Create internal data models


  - Implement OrderMainInfo class with all required fields
  - Implement DrugInfo class
  - Add appropriate constructors, getters, and setters
  - _Requirements: 1.2, 2.9_

- [x] 2.2 Create pharmacy API request models


  - Implement PharmacyOrderRequest class
  - Implement OrderInfo class
  - Implement GoodsItem class
  - Implement ContactInfo class
  - Implement PrescriptionInfo class
  - Add JSON serialization annotations
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 2.3 Create pharmacy API response and result models


  - Implement PharmacyOrderResponse class
  - Implement OrderPushResult class
  - Add JSON deserialization annotations
  - _Requirements: 5.5, 5.6_

- [x] 2.4 Write unit tests for data models


  - Test model instantiation and field access
  - Test JSON serialization/deserialization
  - _Requirements: 2.1-2.9_

- [ ] 3. Implement data conversion utilities
- [x] 3.1 Create DataConverter component


  - Implement convertYuanToFen method with BigDecimal precision
  - Implement convertSex method for sex code transformation
  - Implement convertQuantity method for string to integer conversion
  - Implement formatBirthday method for date formatting
  - Add null and empty string handling for all methods
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3.2 Write unit tests for DataConverter


  - Test Yuan to Fen conversion with various decimal places
  - Test Yuan to Fen conversion with edge cases (null, empty, invalid)
  - Test sex conversion for valid codes ("1", "0")
  - Test sex conversion for invalid codes
  - Test quantity conversion with valid and invalid strings
  - Test birthday formatting with various date formats
  - Test error logging for conversion failures
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 4. Implement database access layer
- [x] 4.1 Create MyBatis mapper interfaces


  - Create OrderMainInfoMapper interface with selectByOrderNum method
  - Create DrugListMapper interface with selectByOrderNum method
  - _Requirements: 1.2, 6.2, 6.3_

- [x] 4.2 Create MyBatis XML mapper files


  - Implement SQL query for order main information retrieval
  - Implement SQL query for drug list retrieval
  - Use LEFT JOIN for optional relationships
  - Use INNER JOIN for required relationships
  - _Requirements: 1.2, 6.1, 6.2, 6.3_

- [x] 4.3 Create OrderDataRetriever component


  - Implement getOrderMainInfo method
  - Implement getDrugList method
  - Add null checking and error handling
  - _Requirements: 1.1, 1.2, 6.1, 6.2, 6.3_

- [x] 4.4 Write unit tests for OrderDataRetriever


  - Mock mapper responses
  - Test successful data retrieval
  - Test handling of null results
  - Test error handling for database exceptions
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 5. Implement data transformation layer
- [x] 5.1 Create PharmacyOrderMapper component


  - Implement mapToPharmacyOrder main method
  - Implement buildOrderInfo private method
  - Implement buildGoodsList private method
  - Implement buildContactInfo private method
  - Implement buildPrescriptionInfo private method
  - Inject and use DataConverter for all conversions
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 5.2 Implement optional field handling


  - Handle null patient information gracefully
  - Handle null doctor information gracefully
  - Handle null prescription image URL
  - Set appropriate default values for optional fields
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5.3 Write unit tests for PharmacyOrderMapper


  - Test mapping with complete data
  - Test mapping with missing optional fields
  - Test mapping with null values
  - Test goods list mapping with multiple items
  - Test goods list mapping with single item
  - Verify all data conversions are applied correctly
  - _Requirements: 2.1-2.9, 3.1-3.6, 4.1-4.5_

- [ ] 6. Implement pharmacy API client
- [x] 6.1 Create PharmacyApiClient component


  - Configure RestTemplate with timeout settings
  - Implement buildApiUrl method with secret key parameter
  - Implement sendOrder method with basic HTTP POST
  - Set appropriate HTTP headers (Content-Type: application/json)
  - Parse and return PharmacyOrderResponse
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.1, 8.2_

- [x] 6.2 Implement retry logic


  - Add retry mechanism for API communication failures
  - Implement exponential backoff between retries
  - Configure maximum retry count from PharmacyConfig
  - Log each retry attempt
  - _Requirements: 5.7, 5.8, 8.3_

- [x] 6.3 Implement error handling


  - Handle HTTP client exceptions
  - Handle timeout exceptions
  - Handle JSON parsing exceptions
  - Return appropriate error responses
  - _Requirements: 5.6, 5.7, 5.8_

- [x] 6.4 Write unit tests for PharmacyApiClient


  - Mock RestTemplate responses
  - Test successful API call
  - Test API error response (error_code = 1)
  - Test timeout handling
  - Test retry logic with transient failures
  - Test retry exhaustion
  - Verify URL construction with secret key
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 7. Implement main orchestration service
- [x] 7.1 Create PharmacyOrderService


  - Implement pushOrderToPharmacy main method
  - Orchestrate data retrieval, transformation, and API call
  - Implement validation for required fields
  - Handle and categorize exceptions
  - Return OrderPushResult with appropriate status
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 7.2 Implement comprehensive logging


  - Log order processing start with order number
  - Log data retrieval completion with drug count
  - Log data transformation details
  - Log API request payload (debug level)
  - Log API response payload (debug level)
  - Log successful completion with duration
  - Log errors with full context and stack trace
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 7.3 Write unit tests for PharmacyOrderService


  - Mock all dependencies
  - Test successful order push workflow
  - Test handling of missing required fields
  - Test handling of data retrieval failures
  - Test handling of transformation failures
  - Test handling of API communication failures
  - Verify logging calls
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1-7.6_

- [ ] 8. Create integration tests
- [ ] 8.1 Set up test database
  - Create test data for orders with complete information
  - Create test data for orders with missing optional fields
  - Create test data for orders with multiple drugs
  - Create test data for edge cases
  - _Requirements: 1.1, 1.2, 6.1, 6.2, 6.3_

- [ ] 8.2 Write database integration tests
  - Test OrderMainInfoMapper with real database
  - Test DrugListMapper with real database
  - Test OrderDataRetriever with real database
  - Verify query performance
  - _Requirements: 1.2, 6.1, 6.2, 6.3, 6.4_

- [ ] 8.3 Write API integration tests
  - Mock pharmacy API server
  - Test complete order push workflow
  - Test API success response handling
  - Test API error response handling
  - Test retry logic with mock failures
  - Test timeout scenarios
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 8.4 Write end-to-end tests
  - Test complete workflow from order number to API call
  - Test with various data scenarios
  - Verify logging output
  - Verify error handling paths
  - Test configuration loading
  - _Requirements: 1.1-1.5, 2.1-2.9, 3.1-3.7, 4.1-4.5, 5.1-5.8, 6.1-6.5, 7.1-7.6, 8.1-8.5_

- [ ] 9. Implement database indexes
  - Create index on t_hos_pre_drug_order.order_num
  - Create index on t_hos_pre_drug_order.hos_prescription_id
  - Create index on t_hos_prescription_drug.hos_prescription_id
  - Create index on t_hos_prescription_drug.drug_id
  - Create index on t_hos_prescription.patient_user_id
  - Create index on t_hos_prescription.doctor_user_id
  - Verify index creation and performance improvement
  - _Requirements: 6.4, 6.5_

- [ ] 10. Add error handling and monitoring
- [x] 10.1 Create custom exception classes


  - Create PharmacyOrderException with error categories
  - Create ErrorCategory enum
  - Add order number and details fields
  - _Requirements: 1.4, 7.5_

- [x] 10.2 Implement exception handling


  - Add try-catch blocks in PharmacyOrderService
  - Categorize exceptions appropriately
  - Log exceptions with full context
  - Return appropriate error results
  - _Requirements: 1.4, 3.7, 5.8, 7.5_

- [x] 10.3 Write tests for error handling


  - Test each error category
  - Test exception logging
  - Test error result generation
  - _Requirements: 1.4, 3.7, 7.5_

- [ ] 11. Documentation and deployment preparation
- [x] 11.1 Create API documentation


  - Document PharmacyOrderService public methods
  - Document configuration properties
  - Document error codes and messages
  - Create usage examples
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11.2 Create deployment guide


  - Document required environment variables
  - Document database index creation steps
  - Document configuration file setup
  - Document monitoring and alerting setup
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11.3 Create runbook for operations



  - Document common error scenarios and solutions
  - Document manual order push procedure
  - Document rollback procedure
  - Document monitoring dashboards
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 12. Final integration and testing
  - Deploy to test environment
  - Run full test suite
  - Verify all tests pass
  - Perform manual testing with real data
  - Verify logging and monitoring
  - Get stakeholder approval
  - _Requirements: All_
