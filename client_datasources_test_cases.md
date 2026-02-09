# Manual Test Cases: Client Data Sources (Integrations)

**Module:** Client Data Sources
**Component:** `Integrations.tsx`, `ConnectDataSource.tsx`
**Pre-requisites:** Logged in as Admin, Navigate to `/clients/:id?tab=data-sources`.

---

## 1. Unit Testing (UI/Logic)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CD-U01** | **Integrations List** | 1. Open Data Sources tab. | - Table lists connected accounts.<br> - Headers: Integration, Label, Status, Action. |
| **CD-U02** | **Search Filter** | 1. Type "Meta" in search. | - Filters list to show only Meta integrations. |
| **CD-U03** | **Status Badges** | 1. Observe badges. | - "Connected" (Green).<br> - "Syncing" (Blue + Spinner animation). |
| **CD-U04** | **Connect Button** | 1. Click "Connect Data Source". | - Opens selection modal/dropdown for platforms. |
| **CD-U05** | **Sync Progress Header** | 1. Trigger sync. | - Blue alert banner appears at top.<br> - "Syncing X of Y integrations" text updates.<br> - Progress bar fills up. |
| **CD-U06** | **Connect Modal Search** | 1. Open Connect Modal.<br>2. Type "Shopify". | - List filters to show only Shopify.<br> - Other options hidden. |
| **CD-U07** | **Form Validation (WooCommerce)** | 1. Select WooCommerce.<br>2. Enter invalid URL (no http).<br>3. Enter invalid Key (no `ck_`). | - Validation errors displayed below fields.<br> - "Connect" button disabled. |
| **CD-U08** | **Form Validation (Shopify)** | 1. Select Shopify.<br>2. Leave URL empty. | - "Connect" button disabled. |

## 2. Integration Testing (Data Flow)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CD-I01** | **OAuth Flow (Google/Meta)** | 1. Select Platform (e.g. Google).<br>2. Click Connect. | - Redirects to OAuth provider.<br> - LocalStorage sets `pending_oauth_client_id`.<br> - On return, "Connection Successful" dialog appears. |
| **CD-I02** | **Manual Flow (WooCommerce)** | 1. Enter valid Store URL, Key, Secret.<br>2. Click Connect. | - API `connectWooCommerce` called.<br> - Success Dialog appears: "Syncing Data...".<br> - New row appears in list. |
| **CD-I03** | **Disconnect Flow** | 1. Click Disconnect button on a row.<br>2. **Confirm in Alert Dialog**. | - `removeAccount` mutation called.<br> - Row removed from table. |
| **CD-I04** | **Polling/Real-time Updates** | 1. Connect Shopify (async). | - `useShopifyPolling` hook checks status.<br> - Status updates from "Syncing" to "Connected" without manual refresh. |

## 3. Security Testing

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CD-S01** | **OAuth State Highjacking** | 1. Initiate OAuth on Client A.<br>2. Capture State param.<br>3. Try to use state for Client B. | - Oauth verification fails (state mismatch or invalid context). |
| **CD-S02** | **Disconnect Verification** | 1. Try to disconnect account via API without auth. | - 401 Unauthorized. |
| **CD-S03** | **Credential Exposure** | 1. Check Network tab during WooCommerce connect. | - Key/Secret sent over HTTPS only.<br> - Not logged in console. |

## 4. Full Functional (E2E Data)

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **CD-E2E-01** | **Full Integration Lifecycle** | 1. Connect Meta Ads.<br>2. Select Account "X".<br>3. Go to Overview.<br>4. Verify data from Account "X" shows.<br>5. Disconnect Meta Ads.<br>6. Go to Overview. | - Data from Account "X" disappears from Dashboard widgets. |
| **CD-E2E-02** | **Multi-Account Handling** | 1. Connect 2 different Google Ads accounts.<br>2. Verify both appear in list.<br>3. Verify both contribute data to "Unified" charts. | - Aggregation works correctly across multiple connected accounts of same type. |
| **CD-E2E-03** | **Sync Delay Feedback** | 1. Connect large account.<br>2. Check Success Dialog. | - Message warns: "Please allow up to 5 minutes...". |
