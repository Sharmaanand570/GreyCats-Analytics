# Manual Test Cases: Admin System Health

**Module:** Admin System Health
**Component:** `SystemStatsPage.tsx`, `SystemConfigPage.tsx`, `IntegrationHealthPage.tsx`
**Pre-requisites:** Logged in as **Admin**.

---

## 1. Unit Testing (UI/Logic)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **ASH-U01** | **System Stats Dashboard** | 1. Navigate to `/admin/system/health`. | - "Operational" status indicator pulsing green.<br> - 4 Key Cards: Users, Clients, Integrations, Server Status. |
| **ASH-U02** | **Integration Health Table** | 1. Navigate to `/admin/system/integrations`. | - Table columns: Integration, Status, Connections, Error Rate, Avg Sync Time.<br> - Status Badges (Healthy/Degraded/Outage) visible. |
| **ASH-U03** | **Error Rate Visuals** | 1. Observe "Error Rate" column in Integration Health. | - Progress bar visualizes percentage.<br> - Red color if > 5%. |
| **ASH-U04** | **Config Tabs** | 1. Navigate to `/admin/system/config`.<br>2. Click tabs (Security, Monitoring). | - Content switches correctly.<br> - "Security" tab shows MFA toggle. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **ASH-U05** | **Empty Integration Data** | 1. Mock `getIntegrationHealth` returning empty array. | - Table shows "No integration data available." |
| **ASH-U06** | **Disabled Config** | 1. On Config Page, try to edit JSON or toggle MFA. | - Inputs are disabled (read-only state verification). |

## 2. Integration Testing (Data Flow)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **ASH-I01** | **Auto-Refresh** | 1. Stay on System Health page for 30s. | - `getSystemHealth` API call triggers automatically (Network tab). |
| **ASH-I02** | **Status Aggregation** | 1. Mock one integration as "Outage". | - "System Status" card on Integration Page updates to "Critical" (Red). |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **ASH-I03** | **API Failure** | 1. Mock 500 or Network Error on `getSystemHealth`. | - Toast "Failed to load system health". |

## 3. Security Testing

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **ASH-S01** | **Sensitive Config Hiding** | 1. Inspect System Config JSON response. | - Ensure API does NOT return secrets/keys in the frontend payload (even if UI hides them). |

## 4. Full Functional (E2E Data)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **ASH-E2E-01** | **Real-time Impact** | 1. Disconnect an integration in Client Portal.<br>2. Check Integration Health. | - "Active Connections" count decreases for that service. |
