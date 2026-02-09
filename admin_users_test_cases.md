# Manual Test Cases: Admin Users Management

**Module:** Admin Users
**Component:** `UsersListPage.tsx`, `UserDetailsPage.tsx`
**Pre-requisites:** Logged in as **Admin** or **Super Admin**. Navigate to `/admin/users`.

---

## 1. Unit Testing (UI/Logic)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AU-U01** | **Users List UI** | 1. Navigate to `/admin/users`. | - Table displayed with columns: User, Role, Status, Clients, Created, Actions.<br> - Pagination controls visible at bottom. |
| **AU-U02** | **Search Filtering** | 1. Type specific user name in Search. | - URL/State updates.<br> - Table reloads with filtered results (Debounced). |
| **AU-U03** | **Role Badges** | 1. Observe Role column. | - SUPER_ADMIN: Default/Primary color.<br> - ADMIN: Secondary color.<br> - USER: Outline style. |
| **AU-U04** | **Status Badges** | 1. Observe Status column. | - ACTIVE: Green text/border.<br> - SUSPENDED/INACTIVE: Red/Destructive style. |
| **AU-U05** | **User Details Layout** | 1. Click on a User row. | - Navigates to `/admin/users/:id`.<br> - Shows User Info Card, Status Actions, and Tabs (Clients, Subs). |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AU-U06** | **Search No Results** | 1. Search for "NonExistentUserXYZ". | - Table shows "No users found." row. |
| **AU-U07** | **Pagination Bounds** | 1. On page 1, try clicking Previous.<br>2. On last page, try clicking Next. | - Buttons disabled respectively. |

## 2. Integration Testing (Data Flow)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AU-I01** | **Change User Role** | 1. Click "..." > Change Role.<br>2. Select "ADMIN".<br>3. Save. | - Dialog closes.<br> - Success toast.<br> - User badge updates to ADMIN in list. |
| **AU-I02** | **Suspend User** | 1. Click "..." > Suspend User (or "Suspend" on details page). | - Status changes to SUSPENDED.<br> - Success toast.<br> - User cannot login (verify if possible). |
| **AU-I03** | **Activate User** | 1. Click "..." > Activate User on suspended user. | - Status changes to ACTIVE. |
| **AU-I04** | **Impersonate User** | 1. Click "..." > Impersonate (or "Impersonate" on details page). | - `impersonationToken` set in LocalStorage.<br> - Page reloads/redirects to User Dashboard.<br> - UI indicates Impersonation Mode. |
| **AU-I05** | **Delete User** | 1. Click "..." > Delete User.<br>2. Confirm Dialog. | - User removed from list.<br> - Associated data handled (cascading delete or soft delete check). |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AU-I06** | **API Failure (List)** | 1. Mock 500 error on `getUsers`. | - Toast "Failed to load users".<br> - Table shows empty or loading state stops. |
| **AU-I07** | **Self-Demotion Warning** | 1. Login as Admin.<br>2. Try to change OWN role to USER. | - Warning Dialog appears: "Warning: Self-Demotion".<br> - Explains logout consequence.<br> - Confirming triggers forced logout. |

## 3. Security Testing

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AU-S01** | **Impersonation Token Swap** | 1. Start Impersonation. | - `originalToken` saved in LocalStorage.<br> - `ANALYTICS_TOKEN_KEY` replaced with temp token.<br> - Verify `queryClient.clear()` prevented data leak. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AU-S02** | **Unauthorized Delete** | 1. Intercept `deleteUser` request.<br>2. Try as non-admin. | - 403 Forbidden. |

## 4. Full Functional (E2E Data)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AU-E2E-01** | **Client Drill-down** | 1. Go to User Details.<br>2. Click "Clients" tab.<br>3. Click "View" on a client. | - Navigates to Client Details page for that specific client. |
