# Manual Test Cases: Admin Clients Management

**Module:** Admin Clients
**Component:** `ClientsListPage.tsx`, `ClientDetailsPage.tsx`
**Pre-requisites:** Logged in as **Admin**. Navigate to `/admin/clients`.

---

## 1. Unit Testing (UI/Logic)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AC-U01** | **Clients List UI** | 1. Navigate to `/admin/clients`. | - Table columns: Name, Status, Owner, Integrations, Users.<br> - Pagination controls visible.<br> - Status badges color-coded (Green for Active). |
| **AC-U02** | **Search Filtering** | 1. Enter client name in Search box. | - Table updates to show matches only.<br> - "No clients found" shown if no match. |
| **AC-U03** | **Ownership Transfer UI** | 1. Click "..." > Transfer Ownership. | - Modal opens.<br> - Dropdown lists potential new owners (Users).<br> - "Transfer" button triggers action. |
| **AC-U04** | **Client Details Header** | 1. Click on a Client row. | - Navigates to `/admin/clients/:id`.<br> - Header shows Client Name and ID.<br> - Edit button visible. |
| **AC-U05** | **Integrations List** | 1. In Details page, check "Client Information" card. | - Lists connected services (Shopify, Meta, etc.) or "No integrations connected". |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AC-U06** | **Empty Search Result** | 1. Search "InvalidClientName". | - Table shows empty state icon with "No clients found". |
| **AC-U07** | **Transfer Abuse** | 1. Open Transfer Modal.<br>2. Click Transfer without selecting user. | - Button disabled or validation error shown (if implemented).<br> - Request NOT sent. |

## 2. Integration Testing (Data Flow)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AC-I01** | **Owners List Population** | 1. Open Transfer Modal. | - `getUsers` API called.<br> - Dropdown populated with user list (FullName + Email). |
| **AC-I02** | **Execute Transfer** | 1. Select New Owner.<br>2. Confirm Transfer. | - API `transferClient` called.<br> - Success toast.<br> - List refreshes, Owner column updates `ownerName`. |
| **AC-I03** | **Delete Client** | 1. Click "..." > Delete Client.<br>2. Confirm Alert. | - API `deleteClient` called.<br> - Client removed from list.<br> - Success toast. |
| **AC-I04** | **Edit Client** | 1. Click Edit on Details page.<br>2. Change Name.<br>3. Save. | - Modal closes.<br> - Details page updates immediately. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AC-I05** | **API Failure (List)** | 1. Mock 500 error on `getClients`. | - Toast "Failed to load clients".<br> - List might show skeletons or empty state. |
| **AC-I06** | **Transfer Failure** | 1. Mock 500 on `transferClient`. | - Error toast "Failed to transfer client".<br> - Modal remains open or state reverts. |

## 3. Security Testing

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AC-S01** | **Ownership Validation** | 1. Check Owner dropdown in Transfer Modal. | - Should NOT list users who are already owners of this specific client (if such logic exists) or simply allow reassignment. |

### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AC-S02** | **Unauthorized Edit** | 1. Intercept `updateClient` request.<br>2. Send as non-admin user. | - 403 Forbidden. |

## 4. Full Functional (E2E Data)

### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AC-E2E-01** | **User-Client Link** | 1. Transfer Client C to User U.<br>2. Go to User U's Details Page. | - Client C appears in User U's "Managed Clients" tab. |
