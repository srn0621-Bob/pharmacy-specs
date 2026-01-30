# Requirements Document

## Introduction

This document specifies the requirements for integrating the pharmacy order service into the prescription audit workflow **in the backend system (internet-hospital/adinnet-doctor-api)**. The integration will automatically push prescription drug orders to the external pharmacy system when a prescription is submitted for audit (at the `/pre/commit` endpoint). This ensures that pharmacy orders are created immediately after the doctor submits a signed prescription for review, enabling the pharmacy to prepare medications while the prescription is being audited.

**Implementation Scope**: This specification covers **backend implementation only** in the `internet-hospital/adinnet-doctor-api` project. The Android doctor app (mshlwyy_doctor) already calls the `/pre/commit` endpoint and requires no changes. All pharmacy integration logic is handled transparently on the backend.

## Glossary

- **Prescription_System**: The hospital's backend prescription management system (internet-hospital/adinnet-doctor-api) that handles prescription creation, signing, and audit submission
- **Pharmacy_Order_Service**: The service component (`PharmacyOrderService`) that pushes prescription drug orders to the external pharmacy system
- **Prescription_Audit_Endpoint**: The `/pre/commit` API endpoint that triggers prescription audit submission
- **Prescription_Status**: The current state of a prescription (NOTSIGN, SIGN, WAIT, PASS, REJECT)
- **Order_Number**: The unique identifier for a prescription drug order (orderNum)
- **Prescription_ID**: The unique identifier for a prescription
- **Order_Push_Result**: The result object returned by the pharmacy order service containing success status and messages
- **API_Call_Log**: A database record that stores detailed information about each pharmacy API call
- **Request_Payload**: The complete request data sent to the pharmacy API
- **Response_Payload**: The complete response data received from the pharmacy API

## Requirements

### Requirement 1: Pharmacy Order Service Integration at Audit Trigger Point

**User Story:** As a system administrator, I want the pharmacy order service to be automatically invoked when a prescription is submitted for audit, so that the pharmacy can begin preparing medications immediately.

#### Acceptance Criteria

1. WHEN a prescription audit is submitted via `/pre/commit` endpoint, THE Prescription_System SHALL invoke the Pharmacy_Order_Service
2. WHEN the Pharmacy_Order_Service is invoked, THE Prescription_System SHALL pass the Order_Number associated with the prescription
3. WHEN the Pharmacy_Order_Service completes successfully, THE Prescription_System SHALL continue with the normal audit submission workflow
4. WHEN the Pharmacy_Order_Service fails, THE Prescription_System SHALL log the error and continue with the audit submission workflow
5. THE Prescription_System SHALL invoke the Pharmacy_Order_Service synchronously but ensure it does not block the audit submission

### Requirement 2: Order Number Retrieval

**User Story:** As a developer, I want to retrieve the correct order number from the prescription data, so that the pharmacy order service receives the correct order to process.

#### Acceptance Criteria

1. WHEN a prescription is submitted for audit, THE Prescription_System SHALL retrieve the associated Order_Number from the prescription data
2. IF the prescription has no associated Order_Number, THEN THE Prescription_System SHALL log a warning and skip the pharmacy order push
3. WHEN multiple orders are associated with a prescription, THE Prescription_System SHALL push each order to the pharmacy system
4. THE Prescription_System SHALL validate that the Order_Number is not null or empty before invoking the Pharmacy_Order_Service

### Requirement 3: Error Handling and Logging

**User Story:** As a system administrator, I want comprehensive error handling and logging for pharmacy order pushes, so that I can troubleshoot issues and monitor system health.

#### Acceptance Criteria

1. WHEN the Pharmacy_Order_Service is invoked, THE Prescription_System SHALL log the prescription ID and order number
2. WHEN the Pharmacy_Order_Service returns a successful result, THE Prescription_System SHALL log the success with order details
3. WHEN the Pharmacy_Order_Service returns a failure result, THE Prescription_System SHALL log the error message and order details
4. WHEN an exception occurs during pharmacy order push, THE Prescription_System SHALL catch the exception, log the error, and continue processing
5. THE Prescription_System SHALL include the prescription ID, order number, and timestamp in all log messages

### Requirement 4: Audit Workflow Independence

**User Story:** As a doctor, I want the prescription audit submission to succeed even if the pharmacy order push fails, so that my workflow is not disrupted by pharmacy system issues.

#### Acceptance Criteria

1. WHEN the Pharmacy_Order_Service fails, THE Prescription_System SHALL still complete the audit submission successfully
2. WHEN the Pharmacy_Order_Service times out, THE Prescription_System SHALL continue with the audit submission
3. THE Prescription_System SHALL not return an error to the client if only the pharmacy order push fails
4. WHEN the audit submission completes, THE Prescription_System SHALL return the same response format regardless of pharmacy push status

### Requirement 5: Service Integration Point

**User Story:** As a developer, I want to integrate the pharmacy order service at the correct location in the codebase, so that the integration is maintainable and follows existing patterns.

#### Acceptance Criteria

1. THE Prescription_System SHALL integrate the Pharmacy_Order_Service in the `/pre/commit` endpoint handler
2. THE Prescription_System SHALL inject the Pharmacy_Order_Service dependency using Spring's dependency injection
3. WHEN the prescription status changes to WAIT, THE Prescription_System SHALL trigger the pharmacy order push
4. THE Prescription_System SHALL follow existing service layer patterns for the integration

### Requirement 6: Data Validation

**User Story:** As a system administrator, I want the system to validate prescription data before pushing to the pharmacy, so that invalid data does not cause pharmacy system errors.

#### Acceptance Criteria

1. WHEN retrieving the order number, THE Prescription_System SHALL validate that the prescription ID is not null or empty
2. WHEN the order number is retrieved, THE Prescription_System SHALL validate that it is not null or empty
3. IF validation fails, THEN THE Prescription_System SHALL log a warning and skip the pharmacy order push
4. THE Prescription_System SHALL not throw exceptions for validation failures

### Requirement 7: API Call Logging and Audit Trail

**User Story:** As a system administrator, I want to record detailed information about each pharmacy API call, so that I can audit system behavior, troubleshoot issues, and analyze integration performance.

#### Acceptance Criteria

1. WHEN the Pharmacy_Order_Service is invoked, THE Prescription_System SHALL create an API_Call_Log record before making the API call
2. THE Prescription_System SHALL record the request timestamp, prescription ID, order number, and request URL in the API_Call_Log
3. WHEN the pharmacy API request is sent, THE Prescription_System SHALL store the complete Request_Payload in the API_Call_Log
4. WHEN the pharmacy API response is received, THE Prescription_System SHALL store the complete Response_Payload, response timestamp, and HTTP status code in the API_Call_Log
5. WHEN the pharmacy API call succeeds, THE Prescription_System SHALL record the success status and response time in the API_Call_Log
6. WHEN the pharmacy API call fails, THE Prescription_System SHALL record the failure status, error message, and error code in the API_Call_Log
7. WHEN an exception occurs during the API call, THE Prescription_System SHALL record the exception type and exception message in the API_Call_Log
8. THE Prescription_System SHALL persist the API_Call_Log to the database regardless of whether the API call succeeds or fails
9. THE Prescription_System SHALL include a unique call ID in each API_Call_Log record for traceability
10. THE Prescription_System SHALL record the duration of the API call in milliseconds in the API_Call_Log

### Requirement 8: API Call Log Data Retention

**User Story:** As a system administrator, I want to query historical pharmacy API call logs, so that I can analyze trends, investigate issues, and generate reports.

#### Acceptance Criteria

1. THE Prescription_System SHALL store API_Call_Log records in a dedicated database table
2. THE Prescription_System SHALL retain API_Call_Log records for at least 90 days
3. THE Prescription_System SHALL provide indexes on prescription ID, order number, and request timestamp for efficient querying
4. THE Prescription_System SHALL support querying API_Call_Log records by date range, prescription ID, order number, and status
5. WHERE API_Call_Log records are older than the retention period, THE Prescription_System MAY archive or delete them
