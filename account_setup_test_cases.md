# Manual Test Cases: Account Setup (Settings)

**Module:** Account Setup / Settings
**Component:** `SettingsPage.tsx`, `PersonalInformation.tsx`, `SecuritySettings.tsx`, `NotificationSettings.tsx`
**Pre-requisites:** Logged in as any user (Admin or Standard). Navigate to `/account-setup` (or Settings).

---

## 1. Personal Information (Profile)

### Unit Testing (UI/Logic)

#### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-P01** | **Profile Load** | 1. Navigate to Settings > Personal Info. | - Form populated with current user data (Name, Email, etc.).<br> - Profile picture displayed (or fallback initials). |
| **AS-P02** | **Update Details** | 1. Change Full Name and Job Title.<br>2. Click "Save Changes". | - Success toast "Profile updated".<br> - Page does not reload, data persists. |
| **AS-P03** | **Upload Picture** | 1. Click "Upload New Picture".<br>2. Select valid JPG/PNG (<5MB). | - Upload header shows "Uploading...".<br> - New image appears immediately.<br> - Success toast. |
| **AS-P04** | **Remove Picture** | 1. Click "Remove" button next to avatar. | - Image reverts to Initials fallback.<br> - Success toast. |

#### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-P05** | **Empty Name** | 1. Clear "Full Name".<br>2. Click Save. | - Validation error "Full Name is required".<br> - Request NOT sent. |
| **AS-P06** | **Large File Upload** | 1. Upload image > 5MB. | - Error toast "File too large! Max 5MB".<br> - Upload blocked. |

### Integration Testing (Email Change Flow)

#### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-P07** | **Email Change Init** | 1. Click "Change" next to Email.<br>2. Enter new valid email.<br>3. Click "Send Code". | - Modal switches to OTP input.<br> - Toast "OTP sent". |
| **AS-P08** | **Verify & Change** | 1. Enter valid 6-digit OTP.<br>2. Click "Verify & Change". | - Modal closes.<br> - Email field updates to new address.<br> - Success toast. |

#### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-P09** | **Same Email** | 1. Try to change email to CURRENT email. | - Toast "New email cannot be same as current". |
| **AS-P10** | **Invalid OTP** | 1. Enter wrong OTP.<br>2. Click Verify. | - Error toast "Invalid OTP" or API error message. |

---

## 2. Security Settings

### Unit Testing (UI/Logic)

#### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-S01** | **Password Visibility** | 1. Type in Password fields.<br>2. Click Eye icon. | - Text becomes visible/hidden toggled. |
| **AS-S02** | **Strong Password** | 1. Enter valid password (8+ chars, Upper, Lower, Number, Special). | - No validation errors shown. |

#### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-S03** | **Weak Password** | 1. Enter "password123". | - Validation error listing missing requirements (Special char, Uppercase, etc.). |
| **AS-S04** | **Mismatch Confirm** | 1. Enter "Pass123!@#" in New.<br>2. Enter "Pass123!@$" in Confirm. | - Error "Passwords do not match". |

### Integration Testing

#### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-S05** | **Change Password** | 1. Enter correct Current Password.<br>2. Enter valid New Password.<br>3. Update. | - Success toast "Password updated".<br> - Form resets. |

#### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-S06** | **Wrong Current** | 1. Enter wrong Current Password. | - API Error "Incorrect current password" (or similar). |

---

## 3. Notification Settings

### Unit Testing

#### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-N01** | **Toggle Updates** | 1. Go to "Notification Settings".<br>2. Toggle "Report Delivery" OFF.<br>3. Click Update. | - Success toast.<br> - Setting persists on reload. |
| **AS-N02** | **Alt Email** | 1. Enter "alt@example.com".<br>2. Update. | - Success toast. |

#### Negative Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-N03** | **Invalid Alt Email** | 1. Enter "invalid-email". | - Validation error "Invalid email address". |

---

## 4. Report Settings (Defaults)

### Unit Testing

#### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-R01** | **Update Defaults** | 1. Set Default Date Range to "Last 30 Days".<br>2. Set Format to "PDF".<br>3. Save. | - Success toast. |

### Functional (E2E)

#### Positive Test Cases
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AS-R02** | **Defaults Application** | 1. Set Default Freq to "Weekly" in Settings.<br>2. Go to Client > Create Report. | - "Frequency" dropdown in Report Builder defaults to "Weekly". |
