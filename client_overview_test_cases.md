# Manual Test Cases: Client Overview (Dashboard)

**Module:** Client Overview
**Component:** `Dashboard.tsx`, `ClientDetailPage.tsx`
**Pre-requisites:** Logged in as Admin, Navigate to `/clients/:id`.

---

## 1. Unit Testing (UI/Logic)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CO-U01** | **Initial Renfering** | 1. Open Client Overview tab.<br>2. Observe layout. | - Header shows Client Name & Logo.<br> - "Edit Client" & "Edit Layout" buttons visible.<br> - Date Picker defaults to "Last 7 Days".<br> - Widget grid loads (skeleton then content). |
| **CO-U02** | **Date Range Picker** | 1. Click Date Picker.<br>2. Select custom range (e.g., last month). | - Dashboard refreshes.<br> - API calls sent with new `startDate` and `endDate`.<br> - Widgets update data. |
| **CO-U03** | **Empty Dashboard State** | 1. Create new client with no dashboard.<br>2. View Overview. | - "Dashboard is Empty" message displayed.<br> - "Customize Dashboard" button visible and clickable. |
| **CO-U04** | **Widget Rendering (Metric Card)** | 1. Verify metric card display. | - Shows formatted number (e.g., "1.2K").<br> - Shows trend indicator (if valid).<br> - Shows label (e.g., "Impressions"). |
| **CO-U05** | **Widget Rendering (Charts)** | 1. Verify Line/Bar chart. | - Axes labeled correctly.<br> - Tooltip shows on hover.<br> - Legend visible. |
| **CO-U06** | **Navigation Buttons** | 1. Click "Edit Layout".<br>2. Click Back arrow. | - Redirects to `/clients/:id/edit-dashboard`.<br> - Redirects to Clients list (`/clients`). |

## 2. Integration Testing (Data Flow)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CO-I01** | **Fetch Dashboards** | 1. Load page. | - `listDashboards(clientId)` API called.<br> - Returns active dashboard layout. |
| **CO-I02** | **Fetch Unified Metrics** | 1. Load page with widgets. | - `fetchUnifiedMetric` called for EACH widget.<br> - Params include correct `integration`, `metricKey`, `accountId`, and `dateRange`. |
| **CO-I03** | **Meta Ads Data Handling** | 1. View Dashboard with Meta Ads widgets. | - Logic handles `act_` prefix correctly.<br> - Fetches data even if accountId is filtered in frontend. |
| **CO-I04** | **Error Handling (API Failure)** | 1. Mock 500 error for `listDashboards`. | - Error toast displays "Failed to load dashboards".<br> - Graceful UI failure (empty state or retry). |

## 3. Security Testing

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CO-S01** | **Client Isolation** | 1. View Client A Dashboard.<br>2. Modify URL API call to request Client B's metrics. | - Backend should reject or Frontend should not display Client B's data (if checking `clientId` in response). |
| **CO-S02** | **XSS in Widget Config** | 1. Inject `<script>` in widget title via API. | - Title renders as plain text in Dashboard.<br> - Script does NOT execute. |
| **CO-S03** | **Unauthenticated Access** | 1. Copy URL `/clients/:id`.<br>2. Logout.<br>3. Paste URL. | - Redirect to Login page. |

## 4. Full Functional (E2E Data)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CO-E2E-01** | **Dashboard Customization Flow** | 1. Click "Edit Layout".<br>2. Add "Facebook Impressions" widget.<br>3. Resize widget.<br>4. Click "Save Dashboard".<br>5. Return to Overview. | - New widget displayed.<br> - Size and position persist.<br> - Real data fetched and shown. |
| **CO-E2E-02** | **Data Consistency** | 1. Note value of "Spend" on Dashboard.<br>2. Navigate to "Data Sources" -> Meta Ads Manager.<br>3. Compare value. | - Values should match (within currency/rounding differences). |
