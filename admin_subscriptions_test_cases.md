# Manual Test Cases: Admin Subscriptions

**Module:** Admin Subscriptions
**Component:** `UserSubscriptionsPage.tsx`, `AssignSubscriptionModal.tsx`
**Pre-requisites:** Logged in as **Admin**. Navigate to `/admin/subscriptions/users`.

---

## 1. Unit Testing (UI/Logic)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-U01** | **Subscriptions List** | 1. Navigate to page. | - Columns: User, Plan, Cost, Status, Dates, Actions.<br> - Dates formatted (MMM D, YYYY). |
| **AS-U02** | **Status Badges** | 1. Observe Status column. | - Active (Green), Past Due (Red), Trialing (Blue), Canceled (Grey). |
| **AS-U03** | **Filters** | 1. Change Status to "Active".<br>2. Change Plan to specific plan. | - `fetchSubs` triggers with params.<br> - List filters accordingly. |
| **AS-U04** | **Assign Modal dynamic price** | 1. Open Assign Modal.<br>2. Select Plan A (Price $10).<br>3. Select Plan B (Price $20). | - "Override Price" input auto-updates to match selected plan's default price. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-U05** | **Invalid Override Price** | 1. In Assign Modal, set Price to -50. | - Validation error (Min 0). |
| **AS-U06** | **Missing User Selection** | 1. Open Assign Modal.<br>2. Don't select user.<br>3. Try Assign. | - Button disabled or form validation error. |

## 2. Integration Testing (Data Flow)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-I01** | **Manual Assignment** | 1. Assign "Pro Plan" to User X.<br>2. Save. | - API `assignSubscription` called.<br> - List updates.<br> - User X shows "active" subscription. |
| **AS-I02** | **Extend Subscription** | 1. Click "..." > Extend (+30 days). | - API `extendSubscription` called.<br> - Success toast.<br> - "Ends" date pushes forward by 30 days. |
| **AS-I03** | **Cancel Subscription** | 1. Click "..." > Cancel.<br>2. Confirm. | - Status changes to "canceled" (or "active" until period end depends on logic).<br> - UI reflects cancellation state. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-I04** | **Assignment Conflict** | 1. Assign Plan to User who ALREADY has active plan. | - Backend handles conflict (either replaces or errors).<br> - If error, Toast "User already has a subscription". |

## 3. Security Testing

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-S01** | **User Scope** | 1. Check User Dropdown in Assign Modal. | - Should list all valid users (AdminUser type). |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-S02** | **Price Manipulation** | 1. Intercept `assignSubscription`.<br>2. Set price to 0 for a paid plan. | - Backend should ideally validate or accept as "Admin Override".<br> - If accepted, logs should reflect admin override. |

## 4. Full Functional (E2E Data)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-E2E-01** | **Subscription Effect** | 1. Assign "Pro Plan" to Free User.<br>2. Impersonate User.<br>3. Check User's Dashboard/Usage Limits. | - User now has access to Pro features (e.g., higher limits). |
