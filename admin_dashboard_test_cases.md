# Manual Test Cases: Admin Dashboard

**Module:** Admin Dashboard
**Component:** `AdminDashboard.tsx`
**Pre-requisites:** Logged in as **Admin** or **Super Admin**. Navigate to `/admin/dashboard`.

---

## 1. Unit Testing (UI/Logic)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AD-U01** | **Header Rendering** | 1. Load Dashboard. | - Welcome message shows user's first name.<br> - Subtext "Here's what's happening..." visible. |
| **AD-U02** | **Stats Cards Layout** | 1. Observe top grid. | - 4 Cards displayed: Total Users, Total Clients, Active Subscriptions, Monthly Revenue.<br> - Icons present for each. |
| **AD-U03** | **Activity Feed Table** | 1. Observe bottom section. | - Table headers: User, Action, Target, Date.<br> - Recent actions listed in reverse chronological order. |
| **AD-U04** | **Loading State** | 1. Hard refresh page. | - Skeletons displayed for Stats cards and Table rows during fetch. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AD-U05** | **Empty Activity Feed** | 1. Mock API returning `activities: []`. | - Table shows "No recent activity found." row.<br> - Layout remains stable. |

## 2. Integration Testing (Data Flow)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AD-I01** | **Stats Data Binding** | 1. Mock API `getStats` with specific values (e.g., Users: 123, MRR: 5000). | - Cards reflect exactly 123 Users and ₹5000 MRR. |
| **AD-I02** | **Activity Log Mapping** | 1. Trigger an action (e.g., Create User).<br>2. Refresh Dashboard. | - New action appears at top of Activity Feed.<br> - Action badge displayed (e.g., "CREATE"). |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AD-I03** | **API Failure (Partial)** | 1. Mock `getStats` success, `getActivityLogs` 500 Error. | - Stats load correctly.<br> - Activity section shows empty/error state or toast "Failed to load dashboard data."<br> - System generally usable. |
| **AD-I04** | **API Failure (Total)** | 1. Mock 500 Error for both endpoints. | - Dashboard loads but shows default/zero values or error message. |

## 3. Security Testing

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AD-S01** | **Role Access (Admin)** | 1. Login as `ADMIN`.<br>2. Access `/admin/dashboard`. | - Page loads successfully. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AD-S02** | **Role Access (User)** | 1. Login as `USER`.<br>2. Try to access `/admin/dashboard`. | - Redirected to 404 or Home page.<br> - Access Denied. |

## 4. Full Functional (E2E Data)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AD-E2E-01** | **Real-time Updates** | 1. On Dashboard, note "Total Users".<br>2. Open new tab, Sign Up a new user.<br>3. Refresh Dashboard. | - "Total Users" count increments by 1. |
