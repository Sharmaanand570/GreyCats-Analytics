# Manual Test Cases: Client Reports

**Module:** Client Reports
**Component:** `Reports.tsx`, `ReportBuilder.tsx`
**Pre-requisites:** Logged in as Admin, Navigate to `/clients/:id?tab=reports`.

---

## 1. Unit Testing (UI/Logic)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CR-U01** | **Report List Rendering** | 1. Open Reports tab. | - List of existing reports displayed.<br> - Columns: Name, Created, Actions. |
| **CR-U02** | **Search Functionality** | 1. Type partial report name in Search Bar. | - List filters in real-time.<br> - Shows only matching reports. |
| **CR-U03** | **Empty State** | 1. View client with no reports. | - "No report templates found" message.<br> - "Create Report" button available. |
| **CR-U04** | **Create Button Disabled State** | 1. Disconnect all data sources.<br>2. View Reports tab. | - "Create Report" button shows error toast on click: "You need to connect at least one data source...". |
| **CR-U05** | **Syncing State** | 1. Trigger data sync.<br>2. View Reports tab. | - "Create Report" button disabled.<br> - Button text shows "Syncing...".<br> - Report rows disabled actions. |

### Builder UI (New)
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CR-U06** | **Builder Layout** | 1. Open a Report. | - Left Sidebar: Slides list.<br> - Center: Canvas (Grid).<br> - Right Sidebar: Widget Tools.<br> - Header: Title, Date Picker, Export actions. |
| **CR-U07** | **Slide Management** | 1. Click "Add Slide".<br>2. Click "Delete Slide".<br>3. Drag to reorder slides. | - New slide appears empty.<br> - Slide removed.<br> - Slide order updates. |
| **CR-U08** | **Widget Drag & Drop** | 1. Drag "Metric" widget from sidebar to canvas. | - Widget snaps to grid.<br> - Config modal opens (if applicable). |
| **CR-U09** | **Resize Widget** | 1. Grab bottom-right corner of widget.<br>2. Resize. | - Widget resizes smoothly.<br> - Content adjusts (e.g., chart reflows). |

## 2. Integration Testing (Data Flow)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CR-I01** | **Fetch Reports** | 1. Load tab. | - `listReportTemplates(clientId)` API called.<br> - Response filtered client-side to ensure isolation. |
| **CR-I02** | **Delete Report** | 1. Click Trash icon on report.<br>2. Confirm. | - `deleteReportTemplate(id)` API called.<br> - List refreshes (`refetch` triggered).<br> - Success toast appears. |
| **CR-I03** | **Integration Check** | 1. Load tab. | - `useIntegrations` hook checks data sources.<br> - Determines if "Create Report" flow is allowed. |
| **CR-I04** | **Save Template** | 1. Make changes in Builder.<br>2. Click "Save". | - `updateReportTemplate` called with full JSON payload.<br> - Success toast. |
| **CR-I05** | **Fetch Unified Metrics (Builder)** | 1. Add "Meta Impressions" widget.<br>2. Set Date Range. | - `fetchUnifiedMetric` called.<br> - Data renders in widget. |

## 3. Security Testing

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CR-S01** | **Cross-Client Leakage** | 1. Mock API to return reports from Client B while viewing Client A. | - Frontend filter logic (`remoteClientId !== parsedClientId`) should hide Client B's reports. |
| **CR-S02** | **Unauthorized Deletion** | 1. Try to delete report ID belonging to another client via API tool. | - Backend returns 403 Forbidden / 404 Not Found. |
| **CR-S03** | **XSS in Custom Text** | 1. Add Text Widget.<br>2. Input `<script>alert(1)</script>`.<br>3. Save & Reload. | - Text rendered safely.<br> - Script does NOT execute. |

## 4. Full Functional (E2E Data)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CR-E2E-01** | **Create & View Report** | 1. Click "Create Report".<br>2. Add "Cover Slide" and "Metric Slide".<br>3. Save as "Monthly Q1".<br>4. Return to Reports list.<br>5. Click "Monthly Q1". | - Report saved successfully.<br> - Appears in list.<br> - Clicking opens Report Builder with saved slides. |
| **CR-E2E-02** | **Report Data Accuracy** | 1. Create Report with specific date range.<br>2. Check metric values in report view. | - Values match Overview/Data Source values for same period. |
| **CR-E2E-03** | **PDF Export** | 1. Open Report.<br>2. Click "Export PDF".<br>3. Wait for generation.<br>4. Download. | - PDF downloaded.<br> - Layout matches screen.<br> - Data is visible (no loading spinners). |
| **CR-E2E-04** | **Offline Mode Handling** | 1. Disconnect Internet.<br>2. Try to Save Report. | - Error toast "Failed to save".<br> - Retry available when online. |
