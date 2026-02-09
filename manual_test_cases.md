# Manual Test Cases: Authentication Module

This document outlines manual test cases for the GreyCats Analytics authentication module, covering Login, Signup, Forgot Password, and Profile Setup flows.

## 1. Login Page (`AuthPage.tsx`)

**Pre-requisites:**
- Application is running.
- User is on the Login page (`/auth/login`).
- A valid user account exists (e.g., `test@example.com` / `Password@123`).

### 1.1 Positive Scenarios

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **L-P01** | **Verify UI Rendering** | 1. Open Login page. | - "Welcome back" heading is visible.<br>- Email and Password fields are present.<br>- "Sign in with Email" button is disabled/enabled correctly.<br>- "Forgot Password?" link is visible. |
| **L-P02** | **Successful Login (User)** | 1. Enter valid Email.<br>2. Enter valid Password.<br>3. Click "Sign in". | - Toast/Success message (optional).<br>- Redirects to User Dashboard (`/`).<br>- User session is created. |
| **L-P03** | **Successful Login (Admin)** | 1. Enter valid Admin Email.<br>2. Enter valid Admin Password.<br>3. Click "Sign in". | - Redirects to Admin Dashboard (`/admin/dashboard`). |
| **L-P04** | **Password Visibility Toggle** | 1. Enter text in Password field.<br>2. Click "Eye" icon. | - Password text becomes visible.<br>- Icon changes to "EyeOff".<br>- Clicking again hides password. |
| **L-P05** | **Navigation to Signup** | 1. Click "Sign up" link at bottom. | - Redirects to Signup page.<br>- Heading changes to "Create an account". |
| **L-P06** | **Navigation to Forgot Password** | 1. Click "Forgot Password?" link. | - Redirects to `/auth/forgot-password`. |
| **L-P07** | **Enter Key Submission** | 1. Fill valid credentials.<br>2. Press "Enter" key. | - Form submits and logs user in. |
| **L-P08** | **Trim Whitespace** | 1. Enter Email with leading/trailing spaces.<br>2. Password with spaces (if allowed/disallowed). | - Email spaces should be trimmed automatically. Login succeeds. |

### 1.2 Negative Scenarios

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **L-N01** | **Empty Fields Submission** | 1. Leave Email & Password empty.<br>2. Click "Sign in". | - Validation errors under fields (e.g., "Email is required").<br>- Form does not submit. |
| **L-N02** | **Invalid Email Format** | 1. Enter `invalid-email` in Email field.<br>2. Enter valid Password.<br>3. Click "Sign in". | - Validation error: "Enter a valid email address". |
| **L-N03** | **Wrong Password** | 1. Enter valid Email.<br>2. Enter incorrect Password.<br>3. Click "Sign in". | - Error message: "Invalid email or password" (or specific API error). |
| **L-N04** | **Non-existent User** | 1. Enter unregistered Email.<br>2. Enter any Password.<br>3. Click "Sign in". | - Error message: "User not found" or "Invalid credentials". |
| **L-N05** | **SQL Injection Attempt** | 1. Enter `' OR '1'='1` in Email/Password.<br>2. Click "Sign in". | - Login fails. Application handles input safely. |
| **L-N06** | **XSS Attempt** | 1. Enter `<script>alert(1)</script>` in Email. | - Input is sanitized or rejected. No alert popup. |

---

## 2. Signup Page (`AuthPage.tsx`)

**Pre-requisites:**
- User is on the Signup page (`/auth/signup`).

### 2.1 Positive Scenarios

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **S-P01** | **Verify UI Rendering** | 1. Open Signup page. | - "Create an account" heading.<br>- Email, Full Name, Password fields.<br>- "Sign up with Email" button. |
| **S-P02** | **Successful Registration (Step 1)** | 1. Enter valid Email.<br>2. Enter valid Name.<br>3. Enter strong Password.<br>4. Click "Sign up". | - Loading state on button.<br>- Success message: "OTP sent".<br>- UI switches to OTP input step (`/auth/signup?step=OTP` concept). |
| **S-P03** | **Verify OTP (Step 2)** | 1. (After S-P02) Enter valid 6-digit OTP from email.<br>2. Click "Verify Email". | - Success message.<br>- Redirects to `/auth/signup-details`. |
| **S-P04** | **Resend OTP** | 1. (In OTP Step) Click "Resend OTP". | - "Sending..." state.<br>- Success message: "OTP sent successfully". |
| **S-P05** | **Switch to Login** | 1. Click "Log in" link at bottom. | - Redirects to Login page. |
| **S-P06** | **OTP Paste Functionality** | 1. Copy OTP from email.<br>2. Paste into OTP input. | - OTP field accepts the value correctly. |

### 2.2 Negative Scenarios

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **S-N01** | **Weak Password** | 1. Enter password `weak`. | - Validation error: "Password must be at least 8 characters...". |
| **S-N02** | **Invalid Name** | 1. Enter single letter `A` or numbers `123`. | - Validation error: "Name must be at least 2 characters...". |
| **S-N03** | **Existing Email** | 1. Enter already registered Email.<br>2. Submit form. | - Error message: "User already exists" (from API). |
| **S-N04** | **Invalid OTP** | 1. (In OTP Step) Enter wrong code.<br>2. Click Verify. | - Error message: "Invalid OTP". |
| **S-N05** | **Expired OTP** | 1. Wait for OTP expiry (if applicable).<br>2. Enter OTP. | - Error message: "OTP expired". |
| **S-N06** | **OTP Length Check** | 1. (In OTP Step) Try to enter more than 6 digits. | - Input should prevent typing > 6 characters. |

---

## 3. Forgot Password (`ForgotPassword.tsx`)

**Pre-requisites:**
- User is on Forgot Password page (`/auth/forgot-password`).

### 3.1 Positive Scenarios

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **FP-P01** | **UI Rendering (Step 1)** | 1. Open page. | - "Forgot Password" heading.<br>- Email input.<br>- "Back to Login" link. |
| **FP-P02** | **Send Reset OTP** | 1. Enter valid registered Email.<br>2. Click "Send OTP". | - Success message: "OTP sent".<br>- Advances to Step 2 (OTP Input). |
| **FP-P03** | **Verify Reset OTP** | 1. Enter valid 6-digit OTP.<br>2. Click "Verify OTP". | - Success message.<br>- Advances to Step 3 (New Password). |
| **FP-P04** | **Reset Password** | 1. Enter New Password.<br>2. Confirm Password.<br>3. Click "Reset Password". | - Success message: "Password updated".<br>- Redirects to Login after delay. |
| **FP-P05** | **Back to Login** | 1. Click "Back to Login" button. | - Redirects to Login page. |

### 3.2 Negative Scenarios

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **FP-N01** | **Unregistered Email** | 1. Enter unknown email.<br>2. Click Send. | - Error message: "User not found". |
| **FP-N02** | **Invalid OTP** | 1. Enter wrong OTP.<br>2. Click Verify. | - Error message: "Invalid OTP". |
| **FP-N03** | **Password Mismatch** | 1. (Step 3) Enter diverse passwords in New vs Confirm fields. | - Validation error: "Passwords do not match". |

---

## 4. Profile Setup (`SignupDetailsPage.tsx`)

**Pre-requisites:**
- User just completed Signup OTP verification.
- User is on `/auth/signup-details`.

### 4.1 Positive Scenarios

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **PD-P01** | **Step 1: Professional Info** | 1. Enter Job Title & Company Name.<br>2. Click "Continue". | - Saves data via API.<br>- Moves to Step 2 (Logo). |
| **PD-P02** | **Step 2: Upload Logo** | 1. Select valid image file (<5MB).<br>2. Upload. | - Success toast "Logo uploaded!".<br>- Moves to Step 3. |
| **PD-P03** | **Step 2: Skip Logo** | 1. Click "Skip for now". | - Moves to Step 3 without upload. |
| **PD-P04** | **Step 3: Address Details** | 1. Fill Website, Address, City, etc.<br>2. Click "Finish Setup". | - Success toast.<br>- Redirects to Dashboard (`/`). |
| **PD-P05** | **Step 3: Skip Address** | 1. Click "Skip". | - Redirects to Dashboard. |

### 4.2 Negative Scenarios

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **PD-N01** | **Step 1 Required Fields** | 1. Leave fields empty.<br>2. Click Continue. | - Validation errors: "Job Title is required", "Company Name is required". |
| **PD-N02** | **Large File Upload** | 1. (Step 2) Upload file > 5MB. | - Error toast: "File too large! Max 5MB". |
| **PD-N03** | **API Failure** | 1. Simulate network error on submit. | - Error toast: "Failed to save details". |
| **PD-N04** | **Invalid Website URL** | 1. (Step 3) Enter `invalid-url` in Website field. | - Validation error (if schema enforces URL format). |

---

## 5. End-to-End User Journeys (Full Functional)

These tests verify the complete user lifecycle and data integrity across sessions.

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **E2E-01** | **Full Signup to Logout** | 1. Register new user (Step 1-3).<br>2. Complete Profile setup (Step 1-3).<br>3. Land on Dashboard.<br>4. Verify user name in top right.<br>5. Click Logout.<br>6. Try to visit Dashboard again. | - Registration succeeds.<br>- Profile setup succeeds.<br>- Dashboard shows correct User Name.<br>- Logout redirects to Login.<br>- Dashboard access blocked after logout. |
| **E2E-02** | **Data Persistence Check** | 1. Complete Profile Setup with unique Company Name "TestCompXYZ".<br>2. Logout.<br>3. Login again.<br>4. Navigate to User Settings/Profile. | - "TestCompXYZ" should be visible in the profile settings.<br>- Data survives session restart. |
| **E2E-03** | **Password Reset Flow** | 1. User forgets password.<br>2. Uses "Forgot Password" to reset.<br>3. Tries to login with OLD password.<br>4. Tries to login with NEW password. | - Old password fails.<br>- New password succeeds. |
| **E2E-04** | **Admin Role Verification** | 1. Login as Admin.<br>2. Create a new User (if Admin can).<br>3. Verify new user appears in User List. | - New user is visible in list.<br>- Admin permissions functional. |

---

## 6. Session, Security & Edge Cases

These tests cover the broader authentication lifecycle and system security.

### 6.1 Route Protection & Session

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **SEC-01** | **Protected Route Access (Unauth)** | 1. Ensure user is logged OUT.<br>2. Try to access `/admin/dashboard` or `/`. | - User is redirected to `/auth/login`. |
| **SEC-02** | **Auth Page Access (Auth)** | 1. Ensure user is logged IN.<br>2. Try to access `/auth/login` or `/auth/signup`. | - User is redirected to Dashboard (User/Admin). |
| **SEC-03** | **Session Expiry** | 1. Log in.<br>2. Wait for token expiry (or manually clear token).<br>3. Refresh page/Perform action. | - "Session expired" message/toast.<br>- Redirects to Login. |
| **SEC-04** | **Browser Back Button** | 1. Log out.<br>2. Press Browser Back button. | - User should NOT be able to view protected pages. Redirects to Login. |

### 6.2 Security & Resilience

| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **SEC-05** | **Brute Force (Login)** | 1. Attempt invalid login 5-10 times rapidly. | - Account lock or "Too many requests" error (if rate limiting exists). |
| **SEC-06** | **Network Disconnect** | 1. Disconnect Internet.<br>2. Click "Sign in". | - Toast: "Network Error" or "Something went wrong". app crashes handled gracefully. |
| **SEC-07** | **Tab Duplication** | 1. Open App in Tab A (Logged in).<br>2. Open App in Tab B.<br>3. Log out from Tab A.<br>4. Refresh Tab B. | - Tab B should also redirect to Login. |
