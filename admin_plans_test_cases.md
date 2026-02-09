# Manual Test Cases: Admin Plans

**Module:** Admin Plans
**Component:** `PlansPage.tsx`, `PlanModal.tsx`
**Pre-requisites:** Logged in as **Admin**. Navigate to `/admin/subscriptions/plans`.

---

## 1. Unit Testing (UI/Logic)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AP-U01** | **Plans List Layout** | 1. Navigate to page. | - Table columns: Plan Name, Price, Interval, Usage Limits, Status.<br> - Price formatted with Currency symbol. |
| **AP-U02** | **Create Modal UI** | 1. Click "Create Plan". | - Modal opens.<br> - Fields: Name, DisplayName, Price, Currency, Interval, Limits, Features.<br> - Switches for Features work. |
| **AP-U03** | **Custom Feature Addition** | 1. Type "AI Analysis" in custom feature input.<br>2. Click Plus/Enter. | - "AI Analysis" added to feature chips.<br> - Chip has remove (X) button. |
| **AP-U04** | **Currency Dropdown** | 1. Check Currency options. | - INR, USD, EUR, GBP available. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AP-U05** | **Form Validation (Required)** | 1. Clear "Internal ID" or "Price".<br>2. Click Save. | - HTML5 validation prevents submission.<br> - Input highlighted. |
| **AP-U06** | **Negative Price** | 1. Enter "-100" in Price. | - Input rejects or validation fails (Min 0). |

## 2. Integration Testing (Data Flow)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AP-I01** | **Create Plan** | 1. Fill Form (Pro Plan, $50, Monthly).<br>2. Save. | - API `createPlan` called.<br> - Modal closes.<br> - List refreshes with new plan. |
| **AP-I02** | **Update Plan** | 1. Edit "Pro Plan".<br>2. Change Price to $60.<br>3. Save. | - API `updatePlan` called.<br> - List shows $60. |
| **AP-I03** | **Archive Plan** | 1. Click "..." > Archive Plan. | - Status updates to "archived".<br> - Badge color changes (Grey/Secondary). |
| **AP-I04** | **Delete Plan** | 1. Click "..." > Delete Plan.<br>2. Confirm. | - Plan removed from list. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AP-I05** | **Backend Validation** | 1. Mock 400 error (e.g., Duplicate ID). | - Toast "Failed to save plan".<br> - Modal stays open. |

## 3. Security Testing

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AP-S01** | **Public Visibility** | 1. Create Plan with `isPublic: false`.<br>2. (Verify via API or User View). | - Plan exists but should NOT appear in public pricing pages (Out of scope for Admin UI, but setting is persisted). |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AP-S02** | **Unauthorized Creation** | 1. POST to `/admin/plans` without Admin token. | - 403 Forbidden. |

## 4. Full Functional (E2E Data)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AP-E2E-01** | **Plan Availability** | 1. Create "Enterprise Special".<br>2. Go to User Subscriptions > Assign.<br>3. Check Plan Dropdown. | - "Enterprise Special" is available for selection. |
