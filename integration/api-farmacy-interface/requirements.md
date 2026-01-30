# Requirements Document

## Introduction

This document defines the requirements for implementing a pharmacy order integration system that automatically pushes prescription drug orders to an external pharmacy system when a doctor submits a signed prescription for audit (at the `/pre/commit` endpoint). The system will be implemented in the **adinnet-doctor-api** module as part of the doctor service layer. The system will map internal order data structures to the pharmacy system's API format, handle data transformations (currency conversion, field mapping), and ensure reliable order transmission with proper error handling.

**Key Trigger Point**: The pharmacy order push is triggered when a prescription is submitted for audit (status changes from `SIGN` to `WAIT`), not after payment completion. This allows the pharmacy to begin preparing medications while the prescription undergoes the audit process, reducing overall fulfillment time.

## Glossary

- **System**: The pharmacy order integration service in adinnet-doctor-api module
- **Doctor API Module**: The adinnet-doctor-api Spring Boot application module
- **Pharmacy API**: The external prescription center system API endpoint
- **Prescription Entity**: The internal prescription record (HosPrescription)
- **Drug Entity**: The internal drug information record (Drug)
- **Patient Entity**: The internal patient user record (PatientUser)
- **Doctor Entity**: The internal doctor user record (DoctorUser)
- **Currency Unit**: Yuan (元) for internal storage, Fen (分) for pharmacy API
- **Order Number**: The unique identifier for a prescription order (order_num, P-prefixed)
- **Prescription Status**: The current state of a prescription (NOTSIGN, SIGN, WAIT, PASS, REJECT)
- **Audit Submission**: The action of submitting a signed prescription for pharmacist review via `/pre/commit` endpoint

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want the system to automatically push prescription orders to the pharmacy system when a doctor submits a signed prescription for audit, so that the pharmacy can begin preparing medications during the audit process.

#### Acceptance Criteria

1. WHEN a prescription audit is submitted via `/pre/commit` endpoint THEN the System SHALL trigger the pharmacy order push
2. WHEN the prescription status changes from SIGN to WAIT THEN the System SHALL retrieve the complete prescription information from the database
3. WHEN retrieving prescription information THEN the System SHALL join data from Prescription Entity, Drug Entity, Patient Entity, and Doctor Entity tables
4. WHEN the prescription data is retrieved THEN the System SHALL validate that all required fields are present
5. IF any required field is missing THEN the System SHALL log an error and continue with the audit submission
6. WHEN all required data is available THEN the System SHALL proceed to data transformation
7. WHEN a prescription is resubmitted after rejection (REJECT to WAIT) THEN the System SHALL trigger the pharmacy order push again

### Requirement 2

**User Story:** As a data integration developer, I want the system to correctly map internal data fields to pharmacy API fields, so that the pharmacy system receives properly formatted order information.

#### Acceptance Criteria

1. WHEN mapping order information THEN the System SHALL map Prescription Entity order_num to pharmacy API order_id field
2. WHEN mapping order information THEN the System SHALL map Prescription Entity total_price to pharmacy API order_price_fen field
3. WHEN mapping order information THEN the System SHALL map Prescription Entity total_price to pharmacy API order_origin_price_fen field
4. WHEN mapping order information THEN the System SHALL set pharmacy API order_express_fen field to zero
5. WHEN mapping contact information THEN the System SHALL map Prescription Entity name, mobile, province, city, district, and address fields to corresponding pharmacy API contact_info fields
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

**User Story:** As a system architect, I want the pharmacy integration service to be implemented in the doctor-api module, so that it can directly access doctor and prescription services and maintain architectural consistency.

#### Acceptance Criteria

1. WHEN implementing the pharmacy integration THEN the System SHALL be deployed in the adinnet-doctor-api module
2. WHEN implementing service classes THEN the System SHALL place them in the com.doctor.api.app.service package
3. WHEN implementing mapper classes THEN the System SHALL place them in the com.doctor.api.app.mapper package
4. WHEN implementing model classes THEN the System SHALL place them in the com.doctor.api.app.model package
5. WHEN implementing utility classes THEN the System SHALL place them in the com.doctor.api.app.util package
6. WHEN implementing configuration classes THEN the System SHALL place them in the com.doctor.api.app.config package
7. WHEN the System needs to access prescription data THEN the System SHALL use existing PrescriptionService
8. WHEN the System needs to access doctor data THEN the System SHALL use existing DoctorUserService

### Requirement 9

**User Story:** As a system administrator, I want the system to handle configuration parameters externally, so that I can modify settings without code changes.

#### Acceptance Criteria

1. WHEN the System starts THEN the System SHALL load pharmacy API URL from configuration
2. WHEN the System starts THEN the System SHALL load app_secret_key from configuration
3. WHEN the System starts THEN the System SHALL load retry count and timeout values from configuration
4. WHEN the System starts THEN the System SHALL load default values for optional fields from configuration
5. IF configuration values are missing THEN the System SHALL use sensible default values and log a warning

### Requirement 10

**User Story:** As a doctor, I want the prescription audit submission to succeed even if the pharmacy order push fails, so that my workflow is not disrupted by pharmacy system issues.

#### Acceptance Criteria

1. WHEN the pharmacy order push is triggered THEN the System SHALL execute it synchronously within the audit submission transaction
2. WHEN the pharmacy order push fails THEN the System SHALL log the error and continue with the audit submission
3. WHEN the pharmacy order push throws an exception THEN the System SHALL catch the exception and continue with the audit submission
4. WHEN the audit submission completes THEN the System SHALL return the same response format regardless of pharmacy push status
5. WHEN the pharmacy order push succeeds THEN the System SHALL log the success with order details
6. WHEN the pharmacy order push fails THEN the System SHALL log the failure with error details

### Requirement 11

**User Story:** As a system architect, I want the pharmacy order push to be integrated at the prescription audit submission point, so that the pharmacy can begin preparing medications during the audit process.

#### Acceptance Criteria

1. WHEN implementing the integration THEN the System SHALL modify the PrescriptionServiceImpl.commitPrescription() method
2. WHEN the prescription status is updated to WAIT THEN the System SHALL immediately trigger the pharmacy order push
3. WHEN triggering the pharmacy order push THEN the System SHALL pass the prescription ID and order number
4. WHEN the pharmacy order push is triggered THEN the System SHALL validate that the prescription ID is not null or empty
5. WHEN the pharmacy order push is triggered THEN the System SHALL validate that the order number is not null or empty
6. IF validation fails THEN the System SHALL log a warning and skip the pharmacy order push
7. WHEN a prescription is resubmitted after rejection THEN the System SHALL trigger the pharmacy order push again
