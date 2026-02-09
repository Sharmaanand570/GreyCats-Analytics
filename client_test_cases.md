# Manual Test Cases: Client Module

This document outlines manual test cases for the Client Management module in GreyCats Analytics, covering the entire lifecycle from creation to managing specific client features (Overview, Reports, Schedules, Data Sources).

**Pre-requisites:**
- Logged in as an Admin.
- Navigate to the Clients page (`/clients`).

---

## 1. Client Management (List & CRUD)

### 1.1 Create Client (`ClientFormModal`)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CL-C01** | **Create Client (Positive)** | 1. Click "Add Client".<br>2. Enter Name "Test Client".<br>3. Enter Description.<br>4. Click "Create Client". | - Modal closes.<br> - Redirects to Client Detail page (`/clients/:id`).<br> - Success toast appears. |
| **CL-C02** | **Create Client with Logo** | 1. Click "Add Client".<br>2. Upload valid image (<5MB).<br>3. Fill other fields & Submit. | - Client created with Logo.<br> - Logo visible in header/sidebar. |
| **CL-C03** | **Validation: Empty Name** | 1. Click "Add Client".<br>2. Leave Name empty.<br>3. Attempt Submit. | - "Create Client" button disabled or Validation error displayed.<br> - Form does not submit. |
| **CL-C04** | **Validation: Invalid Logo** | 1. Upload non-image file or >5MB file. | - Error toast: "Only image files allowed" or "Max 5MB".<br> - File input cleared. |

### 1.2 Edit & Delete Client

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CL-U01** | **Edit Client Details** | 1. Hover on Client Card > Click Edit Icon.<br>2. Change Name to "Updated Client".<br>3. Click "Update Client". | - Card updates immediately with new Name.<br> - Success toast appears. |
| **CL-U02** | **Remove Logo** | 1. Open Edit Modal for client with logo.<br>2. Click Trash icon next to logo.<br>3. Confirm removal (if prompt) or Update. | - Logo removed from client avatar. |
| **CL-D01** | **Delete Client (Positive)** | 1. Hover on Client Card > Click Trash Icon.<br>2. **Confirm** in Alert Dialog. | - Client removed from list.<br> - Data wiped (logical delete).<br> - Success toast apppears. |
| **CL-D02** | **Delete Client (Cancel)** | 1. Click Trash Icon.<br>2. Click **Cancel** in Alert Dialog. | - Client remains in list.<br> - No changes. |

### 1.3 List View Features

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CL-L01** | **Search Client** | 1. Type specific client name in Search Bar. | - List filters to show only matching clients. |
| **CL-L02** | **Filter by Status** | 1. Select "Healthy" in quick filters (if available via logic). | - Shows clients with >3 integrations. |
| **CL-L03** | **Sort List** | 1. Sort by "Name (Z-A)".<br>2. Sort by "Date (Newest)". | - List reorders correctly based on selection. |
| **CL-L04** | **Empty State** | 1. Search for non-existent string "XYZ123". | - Show "No matching clients" empty state.<br> - "Clear Filters" button works. |

---

## 2. Client Overview (`ClientDetailPage` - Overview Tab)

**Pre-requisites:**
- Open a specific client (`/clients/:id`).
- "Overview" tab is active.

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CO-01** | **Dashboard Rendering** | 1. Load Overview tab. | - Dashboard widgets render.<br> - Metrics load without error.<br> - "No data" states handled if new client. |
| **CO-02** | **Date Range Filter** | 1. Use Date Picker in header.<br>2. Select "Last 30 Days". | - Dashboard widgets refresh.<br> - Data reflects selected range. |
| **CO-03** | **Edit Layout** | 1. Click "Edit Layout". | - Redirects to `/clients/:id/edit-dashboard`.<br> - Widgets become draggable/resizable. |
| **CO-04** | **Edit Client (Header)** | 1. Click "Edit Client" button in header. | - Opens ClientFormModal with pre-filled steps. |

---

## 3. Data Sources (`ClientDetailPage` - Data Sources Tab)

**Pre-requisites:**
- "Data Sources" tab is active.

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **DS-01** | **Connect Integration** | 1. Click "Connect" on platform (e.g., Meta).<br>2. Complete OAuth flow.<br>3. Return to app. | - "Account Selection Modal" appears.<br> - Select accounts to link.<br> - Integration marks as "Connected". |
| **DS-02** | **Account Selection** | 1. In Account Selection, select specific Ad Accounts/Pages.<br>2. Save. | - Only selected accounts are linked to this client. |
| **DS-03** | **Disconnect Integration** | 1. Click "Disconnect" on active integration.<br>2. Confirm. | - Integration marks as "Disconnected".<br> - Related data stops syncing. |
| **DS-04** | **Persistent OAuth State** | 1. Start OAuth connection.<br>2. Complete external login.<br>3. Verify redirection back to specific client tab. | - User lands back on Client Details > Data Sources tab (handled by localStorage logic). |

---

## 4. Reports (`ClientDetailPage` - Reports Tab)

**Pre-requisites:**
- "Reports" tab is active.

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **RP-01** | **View Reports List** | 1. Open tab. | - List of existing reports for THIS client appears. |
| **RP-02** | **Create New Report** | 1. Click "Create Report".<br>2. Build report.<br>3. Save. | - New report appears in list.<br> - Associated with correct client ID. |
| **RP-03** | **View/Edit Report** | 1. Click on a report. | - Opens Report Builder/Viewer. |
| **RP-04** | **Duplicate Report** | 1. Click "Duplicate" on report action menu. | - Copy of report created. |

---

## 5. Schedules (`ClientDetailPage` - Schedules Tab)

**Pre-requisites:**
- "Schedules" tab is active.

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **SC-01** | **View Schedules** | 1. Open tab. | - List of active email schedules. |
| **SC-02** | **Create Schedule** | 1. Click "Add Schedule".<br>2. Select Report, Frequency (Weekly/Monthly), Recipients.<br>3. Save. | - Schedule created successfully.<br> - Active status enabled. |
| **SC-03** | **Delete Schedule** | 1. Delete an existing schedule. | - Schedule removed from list. |

---

## 6. End-to-End User Journeys (Full Functional)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **E2E-CL01** | **Full Onboarding Flow** | 1. Create Client "Alpha Corp".<br>2. Navigate to Data Sources.<br>3. Connect "Meta Business".<br>4. navigate to Overview.<br>5. Verify Dashboard shows Meta data.<br>6. Create Report "Alpha Monthly".<br>7. Schedule Report for 1st of month. | - All steps complete successfully without error.<br> - Data flows seamlessly from Integration to Dashboard to Report. |
| **E2E-CL02** | **Data Isolation** | 1. Create Client A and Client B.<br>2. Connect diff. Data Sources to each.<br>3. Verify Client A's Dashboard does NOT show Client B's data. | - Strict data separation verified. |

---

## 7. Security & Edge Cases

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **SEC-CL01** | **Invalid Client ID** | 1. Manually navigate to `/clients/999999`. | - Error page: "Failed to load client" or "Client not found".<br> - Button "Back to Clients" works. |
| **SEC-CL02** | **Unauthorized Access** | 1. Login as User with NO access to Client X.<br>2. Try to access Client X URL. | - Permission Denied / Redirect. (If granular permissions exist). |
| **SEC-CL03** | **XSS in Client Name** | 1. Create client with name `<script>alert(1)</script>`. | - Name renders as text.<br> - No script execution. |
| **SEC-CL04** | **Large Data Load** | 1. Load client with heavy data (many integrations). | - Loading skeleton/spinner appears.<br> - UI does not freeze.<br> - Graceful handling if timeout. |
