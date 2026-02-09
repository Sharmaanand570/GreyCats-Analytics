# Manual Test Cases: Alerts Monitor

**Module:** Alerts Monitor
**Component:** `AlertsPage.tsx`, `AlertForm.tsx`
**Pre-requisites:** Logged in as Admin, Navigate to `/alerts`.

---

## 1. Unit Testing (UI/Logic)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AM-U01** | **Initial State (No Client)** | 1. Navigate to `/alerts`. | - Client Selector visible.<br> - Message "Please select a client to view alerts" displayed.<br> - "Create Alert" button disabled. |
| **AM-U02** | **Dashboard Layout** | 1. Select a Client.<br>2. Observe layout. | - Header shows Search, Notifications, Create button.<br> - Tabs: "All Monitors", "Critical", "Healthy".<br> - Critical alerts section (if any) at top with specific styling.<br> - Active monitors grid below. |
| **AM-U03** | **Critical Alert Visuals** | 1. Mock an alert with `status: critical`. | - Card displayed in "Critical Attention Needed" section.<br> - Red border/glow effect.<br> - Pulsing red dot animation visible.<br> - Value displayed prominently. |
| **AM-U04** | **Metric Categorization** | 1. Create alerts for Shopify, Google Analytics, and Meta Ads. | - Shopify icon color: Orange (Financial).<br> - Google Analytics icon color: Blue (System).<br> - Meta Ads icon color: Purple (Performance). |
| **AM-U05** | **Filter Tabs** | 1. Click "Critical" tab.<br>2. Click "Healthy" tab. | - List filters to show ONLY matching status.<br> - "All" shows both. |
| **AM-U06** | **Search Functionality** | 1. Type partial metric name in search. | - Grid filters real-time to show matching alerts only. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AM-U07** | **Form Validation (Empty Fields)** | 1. Open Create Modal.<br>2. Click "Create Alert" without filling data. | - Toast error "Please select an integration".<br> - Form does not submit. |
| **AM-U08** | **Form Validation (Missing Dependency)** | 1. Select Integration.<br>2. Do NOT select Account.<br>3. Try to select Metric. | - Metric dropdown disabled or empty.<br> - Warning text "Please select an account first" visible. |
| **AM-U09** | **Invalid Threshold Input** | 1. Enter non-numeric value in Threshold.<br>2. Enter negative value (if metric requires positive). | - Input rejects non-numeric characters.<br> - Or Form validation fails on submit. |

## 2. Integration Testing (Data Flow)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AM-I01** | **Cascading Dropdowns** | 1. Open Create Modal.<br>2. Select Integration (e.g. Google).<br>3. Check Account dropdown.<br>4. Select Account.<br>5. Check Metric dropdown. | - Account list loads ONLY for selected integration.<br> - Metric list loads ONLY for selected account.<br> - Changing Integration resets Account/Metric. |
| **AM-I02** | **Create Alert Flow** | 1. Fill Form (Google Sessions > 1000).<br>2. Click Create. | - Modal closes.<br> - Success toast appears.<br> - List refreshes (`invalidateQueries`).<br> - New card appears in grid. |
| **AM-I03** | **Update Alert Flow** | 1. Click Edit icon on card.<br>2. Change Threshold to 2000.<br>3. Update. | - Modal closes.<br> - Card updates immediately to show "Target: > 2000". |
| **AM-I04** | **Delete Alert Flow** | 1. Click Trash icon.<br>2. Confirm browser alert. | - Alert deleted via API.<br> - Card removed from grid.<br> - Success toast. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AM-I05** | **API Failure (Load)** | 1. Mock 500 error on `getAlerts`. | - Display Error State: "Failed to load alerts".<br> - Retry button / message visible. |
| **AM-I06** | **API Failure (Create/Update)** | 1. Mock 400 error on `createAlert` (e.g., Duplicate). | - Form remains open.<br> - Error toast displayed: "Failed to create alert". |
| **AM-I07** | **Metric Data Missing** | 1. Select Account with no synced metrics.<br>2. Check Metric dropdown. | - Dropdown empty.<br> - Message "No metrics available for this account" displayed. |

## 3. Security Testing

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AM-S01** | **Client Isolation** | 1. Select Client A.<br>2. Note alerts.<br>3. Select Client B. | - Alerts grid clears and reloads.<br> - ONLY Client B's alerts must be shown.<br> - Create Modal must bind new alert to Client B. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AM-S02** | **Unauthorized Access** | 1. Try to access `/alerts` without Admin token. | - Redirect to Login or 403 Forbidden. |
| **AM-S03** | **Cross-Client Creation** | 1. Intercept `createAlert` request.<br>2. Change `clientId` in payload to Client B's ID while logged in as Client A (if applicable) or just verify UI prevents it. | - Backend returns 403 Forbidden.<br> - Or UI ensures `clientId` is hardcoded from context, not user input. |

## 4. Full Functional (E2E Data)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AM-E2E-01** | **Threshold Triggering (Mocked)** | 1. Create Alert: "Sessions < 500".<br>2. Verify Current Value is 600 (Healthy).<br>3. (Mock Data update) Change Value to 400. | - Card moves to "Critical" section.<br> - Status badge changes.<br> - Visuals become red/pulsing. |
| **AM-E2E-02** | **Email Notification Lifecycle** | 1. Create Alert with "Email Notifications" ON.<br>2. Input valid email.<br>3. Trigger Critical State. | - Email payload sent to backend.<br> - (Verify if possible) Email received. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AM-E2E-03** | **Email Validation** | 1. Toggle "Email Notifications" ON.<br>2. Enter invalid email format (e.g. "test").<br>3. Try to Create. | - Browser/Form validation blocks submission.<br> - Error message "Please enter a valid email". |
