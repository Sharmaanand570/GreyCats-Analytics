# Manual Test Cases: Admin Activity Feed

**Module:** Admin Activity Timeline
**Component:** `ActivityTimelinePage.tsx`
**Pre-requisites:** Logged in as **Admin**. Navigate to `/admin/activity`.

---

## 1. Unit Testing (UI/Logic)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AAF-U01** | **Timeline Rendering** | 1. Navigate to page. | - Timeline vertical line visible.<br> - Dots colored by severity (Blue=Info, Amber=Warning, Red=Error). |
| **AAF-U02** | **Log Details** | 1. Inspect a log entry. | - Shows Action, Timestamp, Details.<br> - Footer shows User Email (ID), IP Address, and relative time ("5 mins ago"). |
| **AAF-U03** | **Critical Badge** | 1. Find an "Error" severity log. | - "CRITICAL" badge displayed next to action title. |
| **AAF-U04** | **Search Filter** | 1. Type "login" in search box. | - List filters to show only login-related actions.<br> - "No activity found" if no match. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AAF-U05** | **Empty State** | 1. Mock API returning empty list. | - "No activity found" centered message displayed. |

## 2. Integration Testing (Data Flow)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AAF-I01** | **New Activity Propagation** | 1. Perform an Admin Action (e.g., Update User Role).<br>2. Refresh Activity Page. | - New entry appears at top of timeline.<br> - Action matches "Update User Role". |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AAF-I02** | **Load Failure** | 1. Mock 500 error on `getActivityLogs`. | - Console error logged.<br> - Skeleton loader disappears, potentially showing empty state or error toast (UI dependent). |

## 3. Security Testing

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AAF-S01** | **IP Address Logging** | 1. Verify log entry structure. | - `ipAddress` field is present and formatted correctly. |
| **AAF-S02** | **Read-Only Access** | 1. Verify UI. | - No edit/delete buttons available for logs (Audit logs must be immutable). |

## 4. Full Functional (E2E Data)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AAF-E2E-01** | **Cross-Module Auditing** | 1. In Client Module, Delete a Client.<br>2. Check Activity Feed. | - "Delete Client" action recorded with correct User ID and Client ID details. |
