# Requirements Document

## Introduction

This document defines the requirements for implementing a pharmacy order integration system that automatically pushes prescription drug orders to an external pharmacy system after payment completion. The system will map internal order data structures to the pharmacy system's API format, handle data transformations (currency conversion, field mapping), and ensure reliable order transmission with proper error handling.

## Glossary

- **System**: The pharmacy order integration service
- **Pharmacy API**: The external prescription center system API endpoint
- **Order Entity**: The internal drug order record (HosPreDrugOrder)
- **Prescription Entity**: The internal prescription record (HosPrescription)
- **Drug Entity**: The internal drug information record (Drug)
- **Patient Entity**: The internal patient user record (PatientUser)
- **Doctor Entity**: The internal doctor user record (DoctorUser)
- **Currency Unit**: Yuan (元) for internal storage, Fen (分) for pharmacy API
- **Order Number**: The unique identifier for a drug order (order_num)

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want the system to automatically push completed orders to the pharmacy system, so that inventory deduction and order fulfillment can be processed without manual intervention.

#### Acceptance Criteria

1. WHEN a drug order payment is completed THEN the System SHALL retrieve the complete order information from the database
2. WHEN retrieving order information THEN the System SHALL join data from Order Entity, Prescription Entity, Drug Entity, Patient Entity, and Doctor Entity tables
3. WHEN the order data is retrieved THEN the System SHALL validate that all required fields are present
4. IF any required field is missing THEN the System SHALL log an error and notify the administrator
5. WHEN all required data is available THEN the System SHALL proceed to data transformation

### Requirement 2

**User Story:** As a data integration developer, I want the system to correctly map internal data fields to pharmacy API fields, so that the pharmacy system receives properly formatted order information.

#### Acceptance Criteria

1. WHEN mapping order information THEN the System SHALL map Order Entity order_num to pharmacy API order_id field
2. WHEN mapping order information THEN the System SHALL map Prescription Entity total_price to pharmacy API order_price_fen field
3. WHEN mapping order information THEN the System SHALL map Prescription Entity total_price to pharmacy API order_origin_price_fen field
4. WHEN mapping order information THEN the System SHALL set pharmacy API order_express_fen field to zero
5. WHEN mapping contact information THEN the System SHALL map Order Entity name, mobile, province, city, district, and address fields to corresponding pharmacy API contact_info fields
6. WHEN mapping prescription information THEN the System SHALL map Prescription Entity prescription_num, img, name, sex, age, mobile, medical_certificate, and depart_name fields to corresponding pharmacy API pres_info fields
7. WHEN mapping doctor information THEN the System SHALL retrieve Doctor Entity name and hospital_name through doctor_user_id relationship
8. WHEN mapping patient birthday THEN the System SHALL retrieve Patient Entity birth_day through patient_user_id relationship
9. WHEN mapping drug information THEN the System SHALL retrieve Drug Entity msh_id through drug_id relationship for each prescription drug

### Requirement 3

**User Story:** As a data integration developer, I want the system to perform necessary data type conversions, so that the pharmacy API receives data in the correct format.

#### Acceptance Criteria

1. WHEN converting currency amounts THEN the System SHALL multiply Yuan values by 100 to convert to Fen
2. WHEN converting currency amounts THEN the System SHALL ensure the result is an integer value
3. WHEN converting sex field THEN the System SHALL convert internal value "1" to pharmacy API value "m"
4. WHEN converting sex field THEN the System SHALL convert internal value "0" to pharmacy API value "f"
5. WHEN converting drug quantity THEN the System SHALL convert string values to integer values
6. WHEN converting birthday format THEN the System SHALL ensure the format is YYYY-MM-DD
7. IF a conversion fails THEN the System SHALL log the error with the field name and original value

### Requirement 4

**User Story:** As a system administrator, I want the system to handle optional fields appropriately, so that orders can be processed even when some non-critical information is unavailable.

#### Acceptance Criteria

1. WHEN optional prescription fields are unavailable THEN the System SHALL set them to null or empty string
2. WHEN patient information is incomplete in Prescription Entity THEN the System SHALL attempt to retrieve from Patient Entity
3. WHEN patient birthday is unavailable THEN the System SHALL set birthday field to null
4. WHEN doctor information is unavailable THEN the System SHALL set doctor_name and hospital fields to null
5. WHEN prescription image URL is unavailable THEN the System SHALL set pres_img_url field to null

### Requirement 5

**User Story:** As a system administrator, I want the system to send properly formatted requests to the pharmacy API, so that orders are successfully created in the pharmacy system.

#### Acceptance Criteria

1. WHEN sending pharmacy API request THEN the System SHALL use POST method
2. WHEN sending pharmacy API request THEN the System SHALL include app_secret_key in the URL query parameter
3. WHEN sending pharmacy API request THEN the System SHALL format the request body with order_info, goods_list, contact_info, and pres_info sections
4. WHEN sending pharmacy API request THEN the System SHALL set appropriate HTTP headers including Content-Type
5. WHEN the pharmacy API returns error_code 0 THEN the System SHALL mark the order as successfully pushed
6. WHEN the pharmacy API returns error_code 1 THEN the System SHALL log the error_msg and mark the order as failed
7. IF the pharmacy API request times out THEN the System SHALL retry the request up to 3 times
8. IF all retry attempts fail THEN the System SHALL log the failure and notify the administrator

### Requirement 6

**User Story:** As a database administrator, I want the system to use optimized queries, so that order data retrieval does not impact system performance.

#### Acceptance Criteria

1. WHEN retrieving order data THEN the System SHALL use separate queries for order main information and drug list
2. WHEN retrieving order main information THEN the System SHALL execute a single query joining Order Entity, Prescription Entity, Patient Entity, and Doctor Entity
3. WHEN retrieving drug list THEN the System SHALL execute a separate query joining Prescription Drug Entity and Drug Entity
4. WHEN executing database queries THEN the System SHALL use indexed fields for join conditions
5. WHEN multiple orders need processing THEN the System SHALL use batch queries with IN clause

### Requirement 7

**User Story:** As a system administrator, I want the system to log all integration activities, so that I can monitor and troubleshoot order processing issues.

#### Acceptance Criteria

1. WHEN processing an order THEN the System SHALL log the order number and processing start time
2. WHEN data transformation occurs THEN the System SHALL log the transformation details for audit purposes
3. WHEN sending pharmacy API request THEN the System SHALL log the request payload
4. WHEN receiving pharmacy API response THEN the System SHALL log the response payload
5. WHEN an error occurs THEN the System SHALL log the error with stack trace and context information
6. WHEN order processing completes THEN the System SHALL log the completion status and duration

### Requirement 8

**User Story:** As a system administrator, I want the system to handle configuration parameters externally, so that I can modify settings without code changes.

#### Acceptance Criteria

1. WHEN the System starts THEN the System SHALL load pharmacy API URL from configuration
2. WHEN the System starts THEN the System SHALL load app_secret_key from configuration
3. WHEN the System starts THEN the System SHALL load retry count and timeout values from configuration
4. WHEN the System starts THEN the System SHALL load default values for optional fields from configuration
5. IF configuration values are missing THEN the System SHALL use sensible default values and log a warning
