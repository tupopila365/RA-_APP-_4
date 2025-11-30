# Requirements Document

## Introduction

This document outlines the requirements for fixing and improving the Tenders Management screen in the admin panel. The Tenders screen allows administrators to create, view, edit, and delete tender opportunities. The current implementation has several areas that need improvement to ensure robust functionality, better user experience, and data integrity.

## Glossary

- **Admin Panel**: The web-based administrative interface for managing application content
- **Tender**: A formal invitation to bid on a project or contract opportunity
- **Reference Number**: A unique identifier for each tender (e.g., TND-2024-001)
- **Status**: The current state of a tender (open, closed, or upcoming)
- **Published**: A boolean flag indicating whether a tender is visible to mobile app users
- **PDF Document**: The official tender document file uploaded by administrators

## Requirements

### Requirement 1

**User Story:** As an administrator, I want to view a list of all tenders with filtering and search capabilities, so that I can efficiently manage tender opportunities.

#### Acceptance Criteria

1. WHEN the administrator navigates to the tenders list page THEN the system SHALL display all tenders in a paginated table format
2. WHEN the administrator enters text in the search field THEN the system SHALL filter tenders by title and reference number matching the search text
3. WHEN the administrator selects a status filter THEN the system SHALL display only tenders matching the selected status
4. WHEN the administrator selects a published filter THEN the system SHALL display only tenders matching the published state
5. WHEN the system fetches tenders THEN the system SHALL display a loading indicator until data is retrieved

### Requirement 2

**User Story:** As an administrator, I want to create new tenders with all required information, so that I can publish tender opportunities for bidders.

#### Acceptance Criteria

1. WHEN the administrator submits a tender form with all required fields THEN the system SHALL create a new tender record
2. WHEN the administrator attempts to create a tender with a closing date before the opening date THEN the system SHALL prevent creation and display a validation error
3. WHEN the administrator uploads a PDF document THEN the system SHALL validate the file type is PDF and size is under 10MB
4. WHEN the administrator creates a tender with a duplicate reference number THEN the system SHALL prevent creation and display an error message
5. WHEN a tender is successfully created THEN the system SHALL redirect to the tenders list page

### Requirement 3

**User Story:** As an administrator, I want to edit existing tenders, so that I can update tender information when requirements change.

#### Acceptance Criteria

1. WHEN the administrator clicks the edit button for a tender THEN the system SHALL navigate to the edit form with pre-populated data
2. WHEN the administrator updates tender fields and submits THEN the system SHALL save the changes and update the tender record
3. WHEN the administrator changes the PDF document THEN the system SHALL replace the old document URL with the new one
4. WHEN the administrator updates a tender with invalid data THEN the system SHALL display validation errors without saving
5. WHEN a tender is successfully updated THEN the system SHALL redirect to the tenders list page

### Requirement 4

**User Story:** As an administrator, I want to delete tenders that are no longer needed, so that I can maintain a clean and accurate tender list.

#### Acceptance Criteria

1. WHEN the administrator clicks the delete button for a tender THEN the system SHALL display a confirmation dialog
2. WHEN the administrator confirms deletion THEN the system SHALL remove the tender from the database
3. WHEN the administrator cancels deletion THEN the system SHALL close the dialog without deleting the tender
4. WHEN a tender is successfully deleted THEN the system SHALL refresh the tenders list to reflect the deletion
5. WHEN deletion fails THEN the system SHALL display an error message to the administrator

### Requirement 5

**User Story:** As an administrator, I want proper error handling and user feedback, so that I understand what actions are being performed and when issues occur.

#### Acceptance Criteria

1. WHEN any API request fails THEN the system SHALL display a user-friendly error message
2. WHEN a form submission is in progress THEN the system SHALL disable the submit button and show a loading state
3. WHEN a successful action completes THEN the system SHALL display a success message for 3 seconds
4. WHEN network errors occur THEN the system SHALL display a message indicating connectivity issues
5. WHEN validation errors occur THEN the system SHALL highlight the invalid fields with specific error messages

### Requirement 6

**User Story:** As an administrator, I want the PDF upload functionality to work reliably, so that I can attach tender documents without issues.

#### Acceptance Criteria

1. WHEN the administrator selects a PDF file THEN the system SHALL upload the file and return a valid URL
2. WHEN the administrator selects a non-PDF file THEN the system SHALL reject the upload and display an error
3. WHEN the file size exceeds 10MB THEN the system SHALL reject the upload and display a size limit error
4. WHEN the upload is in progress THEN the system SHALL display a progress indicator
5. WHEN the upload completes successfully THEN the system SHALL display the PDF preview or filename

### Requirement 7

**User Story:** As an administrator, I want date validation to prevent logical errors, so that tenders have valid opening and closing dates.

#### Acceptance Criteria

1. WHEN the administrator enters a closing date THEN the system SHALL validate it is after the opening date
2. WHEN the administrator enters an opening date after the closing date THEN the system SHALL display a validation error
3. WHEN dates are in invalid format THEN the system SHALL display a format error message
4. WHEN both dates are valid THEN the system SHALL allow form submission
5. WHEN editing a tender THEN the system SHALL pre-populate dates in the correct format for the date input fields

### Requirement 8

**User Story:** As an administrator, I want consistent data formatting in the tenders list, so that information is easy to read and understand.

#### Acceptance Criteria

1. WHEN displaying tender values THEN the system SHALL format them as currency in NAD
2. WHEN displaying dates THEN the system SHALL format them in a readable format (e.g., Jan 15, 2024)
3. WHEN displaying status THEN the system SHALL show colored chips with appropriate labels
4. WHEN displaying published state THEN the system SHALL show a chip indicating Published or Draft
5. WHEN a tender has no value THEN the system SHALL display a dash (-) instead of zero or null
