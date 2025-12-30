# Requirements Document

## Introduction

The backend service is unable to establish a connection to the RAG (Retrieval-Augmented Generation) service, resulting in "ECONNREFUSED" errors when attempting to query the chatbot functionality. The error indicates that the RAG service is either not running, not accessible at the expected network address (192.168.56.1:8081), or there are network connectivity issues preventing communication between the backend and RAG services. This prevents users from accessing chatbot functionality and document querying capabilities.

## Glossary

- **Backend Service**: The Node.js/TypeScript backend API that manages the Roads Authority application
- **RAG Service**: The Python FastAPI service that handles document indexing and chatbot queries using Retrieval-Augmented Generation
- **Connection Refused Error**: Network error indicating that no service is listening on the specified host and port
- **Service Discovery**: Process of determining the correct network address and port for service communication
- **Health Check**: Endpoint or mechanism to verify that a service is running and accessible
- **Network Configuration**: Settings that determine how services communicate across network interfaces
- **Service Startup**: Process of initializing and starting the RAG service with proper configuration

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to verify that the RAG service is running and accessible, so that I can diagnose connectivity issues.

#### Acceptance Criteria

1. WHEN I check the RAG service status THEN the system SHALL provide clear information about whether the service is running
2. WHEN the RAG service is running THEN it SHALL be accessible on the configured host and port
3. WHEN the RAG service is not running THEN the system SHALL provide instructions for starting it
4. WHEN there are network connectivity issues THEN the system SHALL identify the specific network configuration problems
5. WHEN I perform a health check THEN the RAG service SHALL respond with its operational status

### Requirement 2

**User Story:** As a system administrator, I want the RAG service to start automatically with correct network configuration, so that it can communicate with the backend service.

#### Acceptance Criteria

1. WHEN the RAG service starts THEN it SHALL bind to the correct network interface that allows backend communication
2. WHEN the RAG service is configured THEN it SHALL use the same host and port that the backend expects
3. WHEN network interfaces are available THEN the RAG service SHALL choose an interface accessible to the backend
4. WHEN the RAG service starts THEN it SHALL log the actual host and port it is listening on
5. WHEN there are port conflicts THEN the RAG service SHALL either resolve them or report clear error messages

### Requirement 3

**User Story:** As a developer, I want the backend service to handle RAG service connectivity failures gracefully, so that users receive helpful error messages.

#### Acceptance Criteria

1. WHEN the RAG service is unreachable THEN the backend SHALL return a user-friendly error message
2. WHEN connection attempts fail THEN the backend SHALL implement appropriate retry logic with exponential backoff
3. WHEN the RAG service becomes available THEN the backend SHALL automatically resume normal operation
4. WHEN connectivity issues persist THEN the backend SHALL log detailed diagnostic information
5. WHEN users attempt to use chatbot functionality THEN they SHALL receive clear feedback about service availability

### Requirement 4

**User Story:** As a system administrator, I want automated service discovery and configuration validation, so that services can find and communicate with each other reliably.

#### Acceptance Criteria

1. WHEN services start THEN they SHALL automatically discover each other's network addresses
2. WHEN network configuration changes THEN services SHALL adapt to the new configuration
3. WHEN there are configuration mismatches THEN the system SHALL detect and report them clearly
4. WHEN services are deployed THEN they SHALL validate their network connectivity during startup
5. WHEN multiple network interfaces exist THEN the system SHALL choose the correct interface for inter-service communication

### Requirement 5

**User Story:** As a system administrator, I want comprehensive diagnostic tools, so that I can quickly identify and resolve RAG service connectivity issues.

#### Acceptance Criteria

1. WHEN connectivity issues occur THEN the system SHALL provide diagnostic commands to test network connectivity
2. WHEN services fail to communicate THEN the system SHALL log detailed network configuration information
3. WHEN troubleshooting connectivity THEN the system SHALL provide step-by-step diagnostic procedures
4. WHEN network issues are resolved THEN the system SHALL verify that communication is restored
5. WHEN running diagnostics THEN the system SHALL test connectivity from both backend and RAG service perspectives

### Requirement 6

**User Story:** As a developer, I want the RAG service startup process to be reliable and well-documented, so that deployment and maintenance are straightforward.

#### Acceptance Criteria

1. WHEN starting the RAG service THEN it SHALL have clear startup scripts that handle all dependencies
2. WHEN the RAG service starts THEN it SHALL verify that all required services (Ollama, ChromaDB) are accessible
3. WHEN startup fails THEN the RAG service SHALL provide clear error messages indicating what went wrong
4. WHEN the environment is configured THEN the RAG service SHALL validate all required environment variables
5. WHEN the RAG service is ready THEN it SHALL signal successful startup to monitoring systems

### Requirement 7

**User Story:** As a system administrator, I want network configuration to be automatically detected and validated, so that manual configuration errors are minimized.

#### Acceptance Criteria

1. WHEN the system starts THEN it SHALL automatically detect available network interfaces
2. WHEN multiple IP addresses are available THEN the system SHALL choose the most appropriate one for inter-service communication
3. WHEN network configuration is invalid THEN the system SHALL provide specific guidance on how to fix it
4. WHEN services are on different network segments THEN the system SHALL detect and handle this scenario
5. WHEN firewall or network policies block communication THEN the system SHALL identify these restrictions
