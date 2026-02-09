# Manual Test Cases: Client Schedules

**Module:** Client Schedules
**Component:** `ReportSchedules.tsx`, `CreateScheduleModal.tsx`, `ScheduleDetails.tsx`
**Pre-requisites:** Logged in as Admin, Navigate to `/clients/:id?tab=schedules`.

---

## 1. Unit Testing (UI/Logic)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CS-U01** | **Schedule List UI** | 1. Open Schedules tab. | - Card grid displayed.<br> - Status indicator (Green/Grey).<br> - Next run time formatted correctly. |
| **CS-U02** | **No Schedules State** | 1. View client with 0 schedules. | - "No schedules yet" card displayed.<br> - "Create your first schedule" button visible. |
| **CS-U03** | **Dropdown Actions** | 1. Click "..." menu on card. | - Options: Edit, History, Pause/Resume, Delete.<br> - Correct icon/text for Pause vs Resume. |
| **CS-U04** | **Frequency Logic (Weekly)** | 1. Select "Weekly" in Create Modal. | - "Day of Week" dropdown appears.<br> - "Day of Month" hidden. |
| **CS-U05** | **Frequency Logic (Monthly)** | 1. Select "Monthly" in Create Modal. | - "Day of Month" dropdown appears.<br> - "Day of Week" hidden. |
| **CS-U06** | **Frequency Logic (Daily)** | 1. Select "Daily" in Create Modal. | - Both Day selectors hidden. |
| **CS-U07** | **Email Toggle Logic** | 1. Uncheck "Send Email Validation".<br>2. Check "Send Email Validation". | - Email fields hidden when unchecked.<br> - Email To, Subject, Body appear when checked.<br> - "Recipient Email" becomes required. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CS-U08** | **Form Validation (Missing Fields)** | 1. Click "Create Schedule".<br>2. Leave Report Template or Name empty.<br>3. Try to Save. | - Validation error (Required field).<br> - Form does not submit. |
| **CS-U09** | **Invalid Email Format** | 1. Enable Email Notification.<br>2. Enter "invalid-email" in Recipient.<br>3. Try to Save. | - Validation error "Invalid email address".<br> - Form does not submit. |
| **CS-U10** | **Past Date/Time (If Date Picker)** | 1. (If applicable) Try to set a "Start Date" in the past. | - Date picker disables past dates OR validation error on submit. |

## 2. Integration Testing (Data Flow)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CS-I01** | **Load Schedules** | 1. Load tab. | - `listReportSchedules(clientId)` called.<br> - Response filtered by `clientId` or `templateId`. |
| **CS-I02** | **Toggle Active Context** | 1. Click "Pause" in menu. | - `updateReportSchedule` mutation called (`isActive: false`).<br> - UI updates instantly (Optimistic or fast refetch).<br> - Toast success. |
| **CS-I03** | **Delete Schedule** | 1. Click Delete > Confirm. | - `deleteReportSchedule` called.<br> - Card removed from grid. |
| **CS-I04** | **Edit Schedule** | 1. Click Edit on "Schedule A".<br>2. Change Time to "10:00".<br>3. Save. | - Modal opens pre-filled.<br> - `updateReportSchedule` called.<br> - Card updates to show "10:00". |
| **CS-I05** | **History View** | 1. Click History on a schedule. | - `getReportSchedule` called.<br> - Modal opens showing Run Logs.<br> - Logs show Status (Success/Failed) and Date. |
| **CS-I06** | **Download Generated Report** | 1. Open History.<br>2. Find "Completed" run.<br>3. Click Download icon. | - File download triggers (PDF).<br> - Link constructed with correct `generated-reports/:id/download` URL. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CS-I07** | **API Failure (Create)** | 1. Mock 500 error on `createReportSchedule`.<br>2. Submit valid form. | - Form stays open.<br> - Error toast displayed: "Failed to create schedule". |
| **CS-I08** | **API Failure (History Load)** | 1. Click History.<br>2. Mock 500 error on `getReportSchedule`. | - Modal opens but displays Error state / "Failed to load history". |
| **CS-I09** | **Concurrent Edit Conflict** | 1. Open Edit Modal.<br>2. (Simulate) Another admin deletes schedule.<br>3. Click Save. | - Error toast "Schedule not found" or 404 handling.<br> - List refreshes to remove stale item. |

## 3. Security Testing

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CS-S01** | **Template Isolation** | 1. Open Create Modal.<br>2. Check "Report Template" dropdown. | - Dropdown MUST only show templates belonging to THIS client. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CS-S02** | **Email Injection** | 1. Enter multiple emails separated by commas/semicolons.<br>2. Enter invalid email format or script tags. | - Validator should accept valid lists (if allowed) or reject.<br> - Reject malformed emails/XSS vectors. |
| **CS-S03** | **Cross-Client Access (IDOR)** | 1. Intercept `updateReportSchedule` request.<br>2. Change ID to another client's schedule ID. | - Backend returns 403 Forbidden or 404 Not Found (access denied). |

## 4. Full Functional (E2E Data)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CS-E2E-01** | **Create & Verify Schedule** | 1. Create Schedule "Weekly Update".<br>2. Select Report A.<br>3. Set Weekly, Monday, 9AM.<br>4. Select Timezone "America/New_York".<br>5. Save. | - Schedule appears in list.<br> - "Next run" calculates correctly for NY time.<br> - Badge shows "New York". |
| **CS-E2E-02** | **Automation Lifecycle** | 1. (Mock backend trigger) Force scheduler run. | - Email received by recipient.<br> - "History" log updated with new entry. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CS-E2E-03** | **Invalid Template Reference** | 1. Create Schedule with a Template that is later deleted. | - Schedule run fails safely (Log shows "Template not found").<br> - System does not crash. |
