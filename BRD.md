# Business Requirements Document (BRD)
## GreyCats Analytics Platform

**Version:** 1.0  
**Date:** January 2025  
**Document Owner:** Product Team

---

## 1. Executive Summary

### 1.1 Purpose
GreyCats Analytics is a comprehensive multi-platform analytics and reporting platform designed to help agencies and businesses aggregate, visualize, and report on data from multiple marketing and e-commerce platforms in a unified dashboard.

### 1.2 Business Objectives
- **Centralize Data Sources**: Provide a single platform to connect and manage multiple data sources (Google Analytics, YouTube, Facebook, Shopify, WooCommerce, Meta Ads, Quora, Google Console)
- **Streamline Reporting**: Enable agencies to create professional, customizable reports for clients with drag-and-drop functionality
- **Improve Decision Making**: Provide real-time insights and visualizations across all connected platforms
- **Enhance Client Communication**: Facilitate automated report generation and scheduling for client delivery
- **Increase Efficiency**: Reduce time spent on manual data aggregation and report creation

### 1.3 Target Users
- **Primary**: Marketing agencies managing multiple client accounts
- **Secondary**: Businesses managing their own multi-platform marketing campaigns
- **Tertiary**: Data analysts and marketing professionals

---

## 2. Product Overview

### 2.1 Application Type
Web-based Single Page Application (SPA) built with React, TypeScript, and Vite

### 2.2 Core Value Proposition
"Unify your marketing data, automate your reporting, and deliver insights that drive results."

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

#### 3.1.1 User Authentication
- **FR-001**: Users must be able to register with email, password, and full name
- **FR-002**: Users must be able to login with email and password
- **FR-003**: Authentication tokens must be stored securely in browser storage
- **FR-004**: Protected routes must redirect unauthenticated users to login page
- **FR-005**: Authenticated users accessing login/signup pages must be redirected to dashboard
- **FR-006**: API requests must include Bearer token in Authorization header
- **FR-007**: 401 responses must clear authentication tokens and redirect to login

**Implementation Details:**
- JWT-based authentication
- Token stored in localStorage
- Route guards implemented via `AuthParentComp`
- Axios interceptors handle token injection and error handling

---

### 3.2 Data Source Integration

#### 3.2.1 Supported Platforms
The system must support integration with the following platforms:

1. **Google Analytics** (FR-008)
   - OAuth 2.0 authentication flow
   - Access to analytics data

2. **Google Search Console** (FR-009)
   - OAuth 2.0 authentication flow
   - Search performance data

3. **YouTube** (FR-010)
   - OAuth 2.0 authentication flow
   - Channel analytics and metrics

4. **Facebook** (FR-011)
   - OAuth 2.0 authentication flow
   - Page insights and ad performance

5. **WooCommerce** (FR-012)
   - API key-based authentication (Store URL, Consumer Key, Consumer Secret)
   - E-commerce data and sales metrics

6. **Shopify** (FR-013)
   - OAuth 2.0 authentication flow
   - Store URL collection required
   - E-commerce analytics

7. **Meta Ads** (FR-014)
   - OAuth 2.0 authentication flow
   - Advertising campaign data

8. **Quora** (FR-015)
   - Platform integration support
   - Advertising metrics

#### 3.2.2 Integration Management
- **FR-016**: Users must be able to view all connected integrations in a table format
- **FR-017**: Integration table must display: Integration name, Label, Identifier, Clients Connected, Status
- **FR-018**: Users must be able to connect new data sources via "Connect Data Source" button
- **FR-019**: Connection dialog must support filtering by: All, New, Popular
- **FR-020**: Connection dialog must display platform icons with platform-specific colors
- **FR-021**: Integration status must be displayed with appropriate color coding (Active, Inactive, Error, etc.)
- **FR-022**: OAuth flows must redirect to platform-specific callback handlers
- **FR-023**: API key-based integrations (WooCommerce) must validate credentials before connection
- **FR-024**: Connected integrations must be queryable via React Query for caching and state management

---

### 3.3 Dashboard

#### 3.3.1 Dashboard Overview
- **FR-025**: Dashboard must display key performance metrics in card format
- **FR-026**: Metrics cards must show: Title, Value, Change indicator (positive/negative), Comparison period
- **FR-027**: Default metrics include: Total Ad Spend, Total Clicks, Conversions, Average CPC
- **FR-028**: Dashboard must include interactive charts (Line charts, Pie charts)
- **FR-029**: Dashboard must have an "Edit Dashboard" button to customize layout
- **FR-030**: Dashboard must be responsive across desktop, tablet, and mobile devices

#### 3.3.2 Dashboard Customization
- **FR-031**: Users must be able to edit dashboard layout via drag-and-drop interface
- **FR-032**: Widget positioning must be saved and persist across sessions
- **FR-033**: Dashboard edit mode must use react-grid-layout for widget management

---

### 3.4 Report Builder

#### 3.4.1 Report Creation
- **FR-034**: Users must be able to create multi-slide reports
- **FR-035**: Reports must support multiple slides/pages
- **FR-036**: Users must be able to add slides dynamically
- **FR-037**: Each slide must have a title and optional date range display

#### 3.4.2 Widget System
The report builder must support the following widget types:

1. **Title Widget** (FR-038)
   - Customizable text content
   - Font size options (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
   - Text alignment (left, center, right)
   - Custom text and background colors

2. **Table Widget** (FR-039)
   - Customizable table title and caption
   - Configurable columns with width settings
   - Dynamic row data
   - Status badges with color coding

3. **Chart Widget** (FR-040)
   - Support for pie charts, line charts, and other chart types
   - Interactive chart rendering using Recharts

4. **Metric Widget** (FR-041)
   - Display single metric value
   - Optional unit display
   - Custom label

5. **Image Widget** (FR-042)
   - Image upload/URL input
   - Image fit options (contain, cover, etc.)
   - Custom background color

6. **Embed Widget** (FR-043)
   - Support for iframe embeds
   - YouTube, Google Sheets, and other embeddable content
   - Custom background color

7. **Map Widget** (FR-044)
   - Location display
   - Zoom level configuration

8. **Custom Widget** (FR-045)
   - Custom content display
   - Flexible content type

#### 3.4.3 Widget Management
- **FR-046**: Widgets must be draggable and resizable using react-grid-layout
- **FR-047**: Widgets must be droppable from sidebar onto report canvas
- **FR-048**: Widgets must be selectable for editing
- **FR-049**: Selected widgets must display configuration form in right sidebar
- **FR-050**: Widget configuration changes must update widget in real-time
- **FR-051**: Widgets must auto-resize based on content height
- **FR-052**: Grid layout must support 10 columns on desktop, 8 columns on tablet
- **FR-053**: Widget positioning (x, y, width, height) must be saved with report

#### 3.4.4 Report Elements Sidebar
- **FR-054**: Right sidebar must provide access to widget libraries:
   - Content Blocks (Stat, Textbox, Title, Table of Content, Tasks)
   - Images
   - Embeds
   - Custom Metrics
   - Benchmarks
   - Goals
   - Integrations

#### 3.4.5 Date Range Selection
- **FR-055**: Report builder must include date range picker
- **FR-056**: Selected date range must be displayed on each slide
- **FR-057**: Date range must be formatted as "MMM d, yyyy - MMM d, yyyy"

#### 3.4.6 PDF Export
- **FR-058**: Users must be able to export entire report to PDF
- **FR-059**: PDF export must include all slides
- **FR-060**: PDF must render all widget types correctly
- **FR-061**: PDF generation must use @react-pdf/renderer library
- **FR-062**: PDF must maintain layout and styling from report builder

---

### 3.5 Reports Management

#### 3.5.1 Reports List
- **FR-063**: Users must be able to view all reports in a table
- **FR-064**: Reports table must display:
   - Name
   - Client
   - Type
   - Created date
   - Schedule (Monthly, Weekly, etc.)
   - Schedule Status (Active, Paused)
   - Client Group
   - Last Sent date
   - Next Send Date
   - Awaiting Approval status
   - Last Sent Status (Delivered, Pending, etc.)

#### 3.5.2 Report Filtering
- **FR-065**: Users must be able to search reports by email/client
- **FR-066**: Users must be able to filter reports using dropdown filters

#### 3.5.3 Report Access
- **FR-067**: Users must be able to click on reports to open in Report Builder
- **FR-068**: Report URLs must support dynamic routing (e.g., /reports/:id)

---

### 3.6 Goals Management

#### 3.6.1 Goals Overview
- **FR-069**: Users must be able to view goals page
- **FR-070**: Empty state must display when no goals exist
- **FR-071**: Empty state must include "Create Goal" call-to-action
- **FR-072**: Goals page must provide guidance on goal tracking features

**Note**: Goals functionality is currently in placeholder state, ready for future implementation.

---

### 3.7 Alerts Management

#### 3.7.1 Alerts Overview
- **FR-073**: Users must be able to view alerts in table format
- **FR-074**: Alerts table must display:
   - Metric name
   - Client
   - Current Value
   - Trigger Value
   - Interval (Daily, Weekly)
   - Last Triggered timestamp

#### 3.7.2 Alert States
- **FR-075**: Empty state must display when no alerts exist
- **FR-076**: Empty state must include "Create Alert" call-to-action

**Note**: Alerts functionality currently displays sample data, ready for API integration.

---

### 3.8 Tasks Management

#### 3.8.1 Tasks Overview
- **FR-077**: Users must be able to view tasks page
- **FR-078**: Empty state must display when no tasks exist
- **FR-079**: Empty state must include "Create Task" call-to-action
- **FR-080**: Tasks page must provide guidance on task management features

**Note**: Tasks functionality is currently in placeholder state, ready for future implementation.

---

### 3.9 Settings & Account Management

#### 3.9.1 Account Setup
- **FR-081**: Users must be able to access account settings page
- **FR-082**: Settings page must be accessible via sidebar navigation
- **FR-083**: Settings must support user profile management

**Note**: Settings functionality is currently in placeholder state, ready for future implementation.

---

### 3.10 Navigation & User Interface

#### 3.10.1 Sidebar Navigation
- **FR-084**: Main sidebar must be visible on all protected routes
- **FR-085**: Sidebar must be collapsible on specific pages (Report Builder, Client Details, Edit Dashboard)
- **FR-086**: Sidebar must organize navigation into groups:
   - **Main**: Dashboard, Data Sources
   - **Work**: Goals, Tasks, Alerts
   - **Data**: Reports, Database
   - **Settings**: Account Setup

#### 3.10.2 Responsive Design
- **FR-087**: Application must be responsive across:
   - Desktop (1024px+)
   - Tablet (768px - 1023px)
   - Mobile (< 768px)
- **FR-088**: Grid layouts must adapt to screen size
- **FR-089**: Widget forms must be responsive
- **FR-090**: Dialog modals must be responsive with appropriate max-widths

#### 3.10.3 UI Components
- **FR-091**: Application must use shadcn/ui component library
- **FR-092**: Components must follow consistent design system
- **FR-093**: Toast notifications must be used for user feedback (success, error)
- **FR-094**: Loading states must be displayed during API calls
- **FR-095**: Skeleton loaders must be used for data fetching states

---

## 4. Technical Requirements

### 4.1 Technology Stack

#### 4.1.1 Frontend Framework
- **TR-001**: React 19.1.1
- **TR-002**: TypeScript 5.9.3
- **TR-003**: Vite 7.1.7 (build tool)

#### 4.1.2 State Management
- **TR-004**: React Query (TanStack Query) 5.90.10 for server state
- **TR-005**: React Hooks for local component state

#### 4.1.3 Routing
- **TR-006**: React Router DOM 7.9.5
- **TR-007**: Lazy loading for code splitting

#### 4.1.4 UI Libraries
- **TR-008**: Radix UI components (Dialog, Dropdown, Popover, etc.)
- **TR-009**: Tailwind CSS 3.4.14 for styling
- **TR-010**: Recharts 3.3.0 for data visualization
- **TR-011**: React Grid Layout 1.5.2 for drag-and-drop layouts

#### 4.1.5 Form Management
- **TR-012**: React Hook Form 7.66.1
- **TR-013**: Zod 4.1.12 for schema validation

#### 4.1.6 HTTP Client
- **TR-014**: Axios 1.13.2
- **TR-015**: Request/Response interceptors for authentication

#### 4.1.7 PDF Generation
- **TR-016**: @react-pdf/renderer 4.3.1
- **TR-017**: html2canvas 1.4.1
- **TR-018**: jspdf 3.0.3

#### 4.1.8 Utilities
- **TR-019**: date-fns 4.1.0 for date manipulation
- **TR-020**: Sonner 2.0.7 for toast notifications

---

### 4.2 API Integration

#### 4.2.1 API Configuration
- **TR-021**: API base URL must be configurable via environment variable (VITE_API_BASE_URL)
- **TR-022**: API timeout must be configurable (default: 10000ms)
- **TR-023**: All API requests must include JSON content type header
- **TR-024**: Authentication tokens must be included in Authorization header as Bearer token

#### 4.2.2 API Endpoints (Inferred)
Based on codebase analysis, the following API endpoints are expected:

**Authentication:**
- POST `/auth/login` - User login
- POST `/auth/register` - User registration

**Integrations:**
- GET `/integrations` - List all integrations
- POST `/integrations/youtube/connect` - Connect YouTube
- POST `/integrations/google/connect` - Connect Google Analytics
- POST `/integrations/google-console/connect` - Connect Google Console
- POST `/integrations/woocommerce/connect` - Connect WooCommerce
- POST `/integrations/shopify/connect` - Connect Shopify
- POST `/integrations/meta/connect` - Connect Meta Ads

**Reports:**
- GET `/reports` - List all reports
- GET `/reports/:id` - Get report details
- POST `/reports` - Create report
- PUT `/reports/:id` - Update report
- DELETE `/reports/:id` - Delete report

**Dashboard:**
- GET `/dashboard` - Get dashboard data
- PUT `/dashboard` - Update dashboard layout

---

### 4.3 Data Storage

#### 4.3.1 Client-Side Storage
- **TR-025**: Authentication tokens stored in localStorage
- **TR-026**: Storage keys must be defined in constants
- **TR-027**: Token removal must be supported for logout

#### 4.3.2 Server-Side Storage
- **TR-028**: User accounts and authentication data
- **TR-029**: Integration credentials and OAuth tokens
- **TR-030**: Report definitions and layouts
- **TR-031**: Dashboard configurations
- **TR-032**: Goals, Alerts, and Tasks data

---

### 4.4 Security Requirements

#### 4.4.1 Authentication Security
- **TR-033**: Passwords must be hashed on server side
- **TR-034**: JWT tokens must have expiration
- **TR-035**: Tokens must be validated on each API request
- **TR-036**: 401 responses must trigger token removal and logout

#### 4.4.2 OAuth Security
- **TR-037**: OAuth flows must use secure redirect URIs
- **TR-038**: OAuth state parameters must be validated
- **TR-039**: OAuth tokens must be stored securely

#### 4.4.3 API Security
- **TR-040**: API endpoints must require authentication (except public routes)
- **TR-041**: CORS must be properly configured
- **TR-042**: API keys (WooCommerce) must be encrypted in transit

---

### 4.5 Performance Requirements

#### 4.5.1 Load Time
- **TR-043**: Initial page load must be < 3 seconds
- **TR-044**: Code splitting must be implemented for route-based chunks
- **TR-045**: Lazy loading must be used for heavy components

#### 4.5.2 Runtime Performance
- **TR-046**: Dashboard must render smoothly with 20+ widgets
- **TR-047**: Report builder must handle 10+ slides efficiently
- **TR-048**: PDF export must complete within 30 seconds for typical reports

#### 4.5.3 API Performance
- **TR-049**: API responses must be cached using React Query
- **TR-050**: Query invalidation must be used for data freshness
- **TR-051**: Loading states must be shown during API calls

---

## 5. User Stories

### 5.1 Authentication
- **US-001**: As a user, I want to register for an account so that I can access the platform
- **US-002**: As a user, I want to login to my account so that I can access my dashboards and reports
- **US-003**: As a user, I want to be automatically logged out if my session expires

### 5.2 Data Sources
- **US-004**: As an agency, I want to connect multiple data sources so that I can aggregate all client data in one place
- **US-005**: As a user, I want to see all my connected integrations in one table so that I can manage them easily
- **US-006**: As a user, I want to connect YouTube via OAuth so that I can access channel analytics
- **US-007**: As a user, I want to connect WooCommerce with API keys so that I can access store data

### 5.3 Dashboard
- **US-008**: As a user, I want to see key metrics on my dashboard so that I can quickly assess performance
- **US-009**: As a user, I want to customize my dashboard layout so that I can prioritize the metrics I care about
- **US-010**: As a user, I want to see visual charts so that I can understand trends at a glance

### 5.4 Reports
- **US-011**: As an agency, I want to create custom reports so that I can present data to clients professionally
- **US-012**: As a user, I want to drag and drop widgets onto reports so that I can build them quickly
- **US-013**: As a user, I want to export reports to PDF so that I can share them with clients
- **US-014**: As a user, I want to schedule reports so that they are automatically sent to clients
- **US-015**: As a user, I want to see all my reports in a table so that I can manage them

### 5.5 Goals & Alerts
- **US-016**: As a user, I want to set goals so that I can track progress toward objectives
- **US-017**: As a user, I want to create alerts so that I am notified when metrics exceed thresholds

---

## 6. Use Cases

### 6.1 Use Case: User Registration and Login

**Use Case ID**: UC-001  
**Use Case Name**: User Registration and Authentication  
**Actor**: New User / Existing User  
**Preconditions**: User has access to the web application  
**Postconditions**: User is authenticated and redirected to dashboard

**Main Flow**:
1. User navigates to application URL
2. System displays login page
3. User clicks "Sign Up" link
4. System displays registration form
5. User enters email, password, and full name
6. User submits registration form
7. System validates input data
8. System creates user account
9. System stores authentication token
10. System redirects user to dashboard

**Alternative Flows**:
- **3a**: User already has account → proceeds to login
- **7a**: Validation fails → System displays error message, user corrects and resubmits
- **8a**: Email already exists → System displays error, user uses login instead

**Exception Flows**:
- **E1**: Network error → System displays error message, user can retry
- **E2**: Server error → System displays generic error, user contacts support

---

### 6.2 Use Case: Connect Data Source (OAuth Flow)

**Use Case ID**: UC-002  
**Use Case Name**: Connect Data Source via OAuth  
**Actor**: Authenticated User  
**Preconditions**: User is logged in and on Data Sources page  
**Postconditions**: Data source is connected and appears in integrations table

**Main Flow**:
1. User clicks "Connect Data Source" button
2. System displays connection dialog with platform options
3. User selects a platform (e.g., YouTube)
4. User clicks "Next"
5. System initiates OAuth flow
6. System redirects user to platform's authorization page
7. User grants permissions on platform
8. Platform redirects to callback URL with authorization code
9. System exchanges code for access token
10. System stores integration credentials
11. System displays success message
12. System refreshes integrations table
13. System closes connection dialog

**Alternative Flows**:
- **3a**: User selects WooCommerce → System displays API key form instead of OAuth
- **7a**: User denies permissions → System displays error, user can retry
- **9a**: Token exchange fails → System displays error, user can retry

**Exception Flows**:
- **E1**: OAuth callback error → System displays error, redirects to Data Sources page
- **E2**: Platform API unavailable → System displays error, user can retry later

---

### 6.3 Use Case: Connect WooCommerce (API Key Flow)

**Use Case ID**: UC-003  
**Use Case Name**: Connect WooCommerce Store  
**Actor**: Authenticated User  
**Preconditions**: User is logged in and on Data Sources page  
**Postconditions**: WooCommerce store is connected and appears in integrations table

**Main Flow**:
1. User clicks "Connect Data Source" button
2. System displays connection dialog
3. User selects "WooCommerce"
4. User clicks "Next"
5. System displays WooCommerce connection form
6. User enters Store URL
7. User enters Consumer Key
8. User enters Consumer Secret
9. User clicks "Connect"
10. System validates credentials with WooCommerce API
11. System stores integration credentials
12. System displays success message
13. System refreshes integrations table
14. System closes dialog

**Alternative Flows**:
- **10a**: Invalid credentials → System displays error, user corrects and resubmits
- **10b**: Store URL unreachable → System displays error, user verifies URL

**Exception Flows**:
- **E1**: WooCommerce API timeout → System displays error, user can retry
- **E2**: Network error → System displays error, user can retry

---

### 6.4 Use Case: Create Custom Report

**Use Case ID**: UC-004  
**Use Case Name**: Create Custom Report with Widgets  
**Actor**: Authenticated User  
**Preconditions**: User is logged in and has connected data sources  
**Postconditions**: Report is created and saved, accessible from Reports page

**Main Flow**:
1. User navigates to Reports page
2. User clicks "Create Report" (or navigates to Report Builder)
3. System displays Report Builder with default slide
4. User selects widget type from right sidebar (e.g., "Chart")
5. User drags widget onto report canvas
6. System places widget on canvas
7. User clicks widget to select it
8. System displays widget configuration form in right sidebar
9. User configures widget properties (chart type, data source, etc.)
10. System updates widget in real-time
11. User adds more widgets and configures them
12. User adds new slide using left sidebar
13. User repeats steps 4-11 for new slide
14. User selects date range using date picker
15. User clicks "Save Report"
16. System saves report configuration
17. System displays success message
18. System redirects to Reports page

**Alternative Flows**:
- **4a**: User selects "Title" widget → System displays text configuration form
- **4b**: User selects "Table" widget → System displays table configuration form
- **12a**: User deletes slide → System removes slide and all its widgets
- **15a**: User clicks "Download PDF" → System generates and downloads PDF

**Exception Flows**:
- **E1**: Save fails → System displays error, user can retry
- **E2**: Widget configuration invalid → System displays validation error

---

### 6.5 Use Case: Export Report to PDF

**Use Case ID**: UC-005  
**Use Case Name**: Export Report to PDF  
**Actor**: Authenticated User  
**Preconditions**: User is in Report Builder with at least one slide containing widgets  
**Postconditions**: PDF file is downloaded to user's device

**Main Flow**:
1. User is in Report Builder
2. User has configured report with multiple slides and widgets
3. User clicks "Download PDF" button
4. System displays loading indicator
5. System captures all slides as images/renders
6. System generates PDF document with all slides
7. System applies report styling to PDF
8. System creates downloadable PDF file
9. System triggers browser download
10. System displays success message
11. User receives PDF file in downloads folder

**Alternative Flows**:
- **5a**: Widget rendering fails → System displays error for specific widget, continues with others
- **6a**: PDF generation timeout → System displays error, user can retry

**Exception Flows**:
- **E1**: Browser doesn't support PDF generation → System displays error message
- **E2**: Insufficient memory → System displays error, suggests reducing report size

---

### 6.6 Use Case: View Dashboard Metrics

**Use Case ID**: UC-006  
**Use Case Name**: View Dashboard with Aggregated Metrics  
**Actor**: Authenticated User  
**Preconditions**: User is logged in and has connected at least one data source  
**Postconditions**: User views dashboard with metrics and charts

**Main Flow**:
1. User logs in
2. System redirects to Dashboard page
3. System fetches aggregated data from all connected integrations
4. System displays metric cards (Total Ad Spend, Clicks, Conversions, CPC)
5. System displays comparison indicators (vs last month)
6. System displays line chart with trend data
7. System displays pie chart with distribution data
8. User views metrics and charts
9. User can click "Edit Dashboard" to customize layout

**Alternative Flows**:
- **3a**: No integrations connected → System displays empty state with "Connect Data Source" CTA
- **4a**: Data fetch fails for one integration → System displays partial data with error indicator

**Exception Flows**:
- **E1**: All API calls fail → System displays error message, user can retry
- **E2**: Data is stale → System displays warning, user can refresh

---

### 6.7 Use Case: Customize Dashboard Layout

**Use Case ID**: UC-007  
**Use Case Name**: Edit Dashboard Layout  
**Actor**: Authenticated User  
**Preconditions**: User is on Dashboard page  
**Postconditions**: Dashboard layout is saved and persists across sessions

**Main Flow**:
1. User is on Dashboard page
2. User clicks "Edit Dashboard" button
3. System navigates to Edit Dashboard page
4. System displays current dashboard layout with widgets
5. User drags widget to new position
6. System updates widget position in real-time
7. User resizes widget
8. System updates widget size
9. User adds new widget from widget library
10. System adds widget to dashboard
11. User removes unwanted widget
12. System removes widget from dashboard
13. User clicks "Save" button
14. System saves dashboard layout configuration
15. System displays success message
16. System redirects to Dashboard page with updated layout

**Alternative Flows**:
- **13a**: User clicks "Cancel" → System discards changes, redirects to Dashboard
- **13b**: User clicks "Reset" → System restores default layout

**Exception Flows**:
- **E1**: Save fails → System displays error, user can retry
- **E2**: Widget configuration invalid → System displays validation error

---

### 6.8 Use Case: View and Manage Integrations

**Use Case ID**: UC-008  
**Use Case Name**: View Connected Integrations  
**Actor**: Authenticated User  
**Preconditions**: User is logged in  
**Postconditions**: User views list of all connected integrations

**Main Flow**:
1. User navigates to Data Sources page
2. System fetches list of integrations from API
3. System displays loading skeleton
4. System receives integration data
5. System displays integrations table with columns:
   - Integration (name and icon)
   - Label
   - Identifier
   - Clients Connected
   - Status
6. User views integration details
7. User can filter/search integrations
8. User can click on integration to view details

**Alternative Flows**:
- **2a**: No integrations exist → System displays empty state
- **4a**: API returns error → System displays error message

**Exception Flows**:
- **E1**: Network timeout → System displays error, user can retry
- **E2**: Authentication expired → System redirects to login

---

### 6.9 Use Case: Schedule Report

**Use Case ID**: UC-009  
**Use Case Name**: Schedule Automated Report Delivery  
**Actor**: Authenticated User  
**Preconditions**: User has created a report  
**Postconditions**: Report is scheduled for automatic delivery

**Main Flow**:
1. User navigates to Reports page
2. User selects a report from the table
3. User clicks "Schedule" or "Edit Schedule" button
4. System displays schedule configuration dialog
5. User selects frequency (Daily, Weekly, Monthly)
6. User selects recipients (email addresses)
7. User selects delivery time
8. User configures additional options (format, timezone)
9. User clicks "Save Schedule"
10. System saves schedule configuration
11. System updates report status to "Scheduled"
12. System displays success message
13. System updates Reports table with schedule information

**Alternative Flows**:
- **5a**: User selects "One-time" → System prompts for specific date/time
- **9a**: User clicks "Pause Schedule" → System pauses schedule, status changes to "Paused"

**Exception Flows**:
- **E1**: Invalid email addresses → System displays validation error
- **E2**: Schedule save fails → System displays error, user can retry

**Note**: This use case represents planned functionality, currently in development.

---

### 6.10 Use Case: Create Alert

**Use Case ID**: UC-010  
**Use Case Name**: Create Metric Alert  
**Actor**: Authenticated User  
**Preconditions**: User is logged in and has connected data sources  
**Postconditions**: Alert is created and active

**Main Flow**:
1. User navigates to Alerts page
2. User clicks "Create Alert" button
3. System displays alert creation form
4. User selects metric to monitor (e.g., Page Views, Conversion Rate)
5. User selects client/data source
6. User sets trigger condition (greater than, less than, equals)
7. User sets trigger value
8. User selects check interval (Daily, Weekly)
9. User enters notification email
10. User clicks "Create Alert"
11. System validates alert configuration
12. System creates alert
13. System displays success message
14. System adds alert to alerts table
15. System begins monitoring metric

**Alternative Flows**:
- **6a**: User selects "Percentage change" → System prompts for percentage threshold
- **10a**: User clicks "Test Alert" → System sends test notification

**Exception Flows**:
- **E1**: Invalid configuration → System displays validation error
- **E2**: Metric not available → System displays error, suggests alternative

**Note**: This use case represents planned functionality, currently in development.

---

## 7. User Flows

### 7.1 User Flow: First-Time User Onboarding

```
┌─────────────────┐
│  Landing Page   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Login Page    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Click Sign Up  │─────▶│ Registration Form │
└─────────────────┘      └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Enter Details   │
                         │  (Email, Name,   │
                         │   Password)      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Submit Form     │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Dashboard      │
                         │  (Empty State)   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Connect Data     │
                         │ Source Prompt    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Data Sources    │
                         │    Page         │
                         └─────────────────┘
```

---

### 7.2 User Flow: Connect Data Source (OAuth - YouTube Example)

```
┌─────────────────────┐
│  Data Sources Page  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Click "Connect      │
│  Data Source"       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Connection Dialog   │
│ - Platform List     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Select "YouTube"    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Click "Next"        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│ Initiate OAuth      │─────▶│ YouTube Auth     │
│ Request             │      │ Page (External)  │
└─────────────────────┘      └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │ User Grants      │
                             │ Permissions      │
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │ Redirect to     │
                             │ /youtube/callback│
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │ Exchange Code   │
                             │ for Token        │
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │ Save Integration│
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │ Success Message │
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │ Refresh         │
                             │ Integrations    │
                             │ Table           │
                             └──────────────────┘
```

---

### 7.3 User Flow: Connect WooCommerce (API Key Flow)

```
┌─────────────────────┐
│  Data Sources Page  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Click "Connect      │
│  Data Source"       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Connection Dialog   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Select "WooCommerce"│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Click "Next"        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ WooCommerce Form    │
│ - Store URL         │
│ - Consumer Key      │
│ - Consumer Secret   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Enter Credentials   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Click "Connect"     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│ Validate with       │─────▶│ WooCommerce API  │
│ WooCommerce API     │      │                  │
└──────────┬──────────┘      └────────┬─────────┘
           │                          │
           │                          │
           ▼                          ▼
┌─────────────────────┐      ┌──────────────────┐
│ Valid Credentials   │      │ Invalid           │
└──────────┬──────────┘      └────────┬─────────┘
           │                          │
           │                          ▼
           │                 ┌──────────────────┐
           │                 │ Display Error     │
           │                 │ User Retries      │
           │                 └───────────────────┘
           │
           ▼
┌─────────────────────┐
│ Save Integration    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Success Message     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Refresh Table       │
└─────────────────────┘
```

---

### 7.4 User Flow: Create and Export Report

```
┌─────────────────────┐
│   Reports Page      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Click "Create      │
│  Report" or Navigate│
│  to Report Builder  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Report Builder     │
│  - Default Slide    │
│  - Widget Sidebar   │
│  - Canvas           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Select Widget Type  │
│ from Sidebar        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Drag Widget to      │
│ Canvas              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Click Widget to     │
│ Select              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Configure Widget    │
│ in Right Sidebar    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Widget Updates      │
│ in Real-time        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│ Add More Widgets?   │─────▶│ Yes: Repeat      │
│ Add New Slide?       │      │ No: Continue     │
└──────────┬──────────┘      └────────┬─────────┘
           │                          │
           │                          │
           ▼                          ▼
┌─────────────────────┐      ┌──────────────────┐
│ Select Date Range    │      │ Configure Slide  │
└──────────┬──────────┘      └────────┬──────────┘
           │                          │
           │                          │
           └──────────┬───────────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Click "Save     │
             │  Report"        │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Report Saved     │
             └────────┬──────────┘
                      │
                      ▼
             ┌──────────────────┐      ┌──────────────────┐
             │ Export to PDF?   │─────▶│ Yes: Generate PDF│
             └────────┬──────────┘      └────────┬──────────┘
                      │                          │
                      │                          ▼
                      │                 ┌──────────────────┐
                      │                 │ Download PDF     │
                      │                 └──────────────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Return to       │
             │ Reports Page     │
             └──────────────────┘
```

---

### 7.5 User Flow: View Dashboard and Metrics

```
┌─────────────────────┐
│   User Logs In      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Dashboard Page     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Fetch Data from     │
│ All Integrations    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Display Metrics:    │
│ - Total Ad Spend    │
│ - Total Clicks      │
│ - Conversions       │
│ - Avg CPC           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Display Charts:     │
│ - Line Chart        │
│ - Pie Chart         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│ User Actions:       │─────▶│ Edit Dashboard?  │
│ - View Metrics      │      │ View Details?     │
│ - Analyze Trends    │      │ Refresh Data?     │
└─────────────────────┘      └──────────────────┘
```

---

### 7.6 User Flow: Edit Dashboard Layout

```
┌─────────────────────┐
│  Dashboard Page     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Click "Edit        │
│  Dashboard"        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Edit Dashboard Page│
│ - Current Layout    │
│ - Widget Library    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ User Actions:      │
│ - Drag Widgets     │
│ - Resize Widgets   │
│ - Add Widgets      │
│ - Remove Widgets   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│ Click "Save"       │─────▶│ Save Layout      │
│ Click "Cancel"     │      │ Discard Changes  │
└──────────┬──────────┘      └────────┬──────────┘
           │                          │
           │                          │
           ▼                          ▼
┌─────────────────────┐      ┌──────────────────┐
│ Success Message     │      │ Return to        │
│ Redirect to         │      │ Dashboard        │
│ Dashboard           │      │ (No Changes)     │
└─────────────────────┘      └──────────────────┘
```

---

### 7.7 User Flow: Authentication Error Handling

```
┌─────────────────────┐
│  User Makes API      │
│  Request             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ API Returns 401     │
│ (Unauthorized)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Axios Interceptor   │
│ Detects 401         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Clear Auth Token    │
│ from Storage        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Redirect to         │
│ Login Page          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ User Re-authenticates│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Redirect to         │
│ Original Page       │
└─────────────────────┘
```

---

### 7.8 User Flow: Report Builder Widget Configuration

```
┌─────────────────────┐
│  Report Builder     │
│  Canvas             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ User Clicks Widget │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Widget Selected    │
│ (Highlighted)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Right Sidebar      │
│ Opens with Form    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ User Configures:   │
│ - Widget Properties│
│ - Data Source      │
│ - Styling          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Changes Applied     │
│ in Real-time        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│ User Clicks        │─────▶│ Deselect Widget  │
│ Outside Widget     │      │ Close Sidebar    │
│ or Another Widget  │      └──────────────────┘
└─────────────────────┘
```

---

## 8. Non-Functional Requirements

### 6.1 Usability
- **NFR-001**: Application must be intuitive for users with basic technical knowledge
- **NFR-002**: Error messages must be clear and actionable
- **NFR-003**: Loading states must provide visual feedback
- **NFR-004**: Tooltips must be available for complex features

### 6.2 Reliability
- **NFR-005**: Application must handle API errors gracefully
- **NFR-006**: Network failures must not cause data loss
- **NFR-007**: OAuth callbacks must handle errors appropriately

### 6.3 Maintainability
- **NFR-008**: Code must follow TypeScript best practices
- **NFR-009**: Components must be modular and reusable
- **NFR-010**: API integration must be abstracted into hooks

### 6.4 Scalability
- **NFR-011**: Application must support 100+ connected integrations per user
- **NFR-012**: Reports must support 50+ widgets per slide
- **NFR-013**: Dashboard must handle 30+ widgets efficiently

### 6.5 Compatibility
- **NFR-014**: Application must work on Chrome, Firefox, Safari, and Edge (latest 2 versions)
- **NFR-015**: Application must be responsive on iOS and Android devices
- **NFR-016**: PDF exports must be compatible with standard PDF readers

---

## 7. Assumptions & Constraints

### 7.1 Assumptions
- **AS-001**: Users have stable internet connection
- **AS-002**: Users have valid accounts on third-party platforms (Google, Facebook, etc.)
- **AS-003**: Backend API is available and functional
- **AS-004**: OAuth applications are properly configured on third-party platforms
- **AS-005**: Users understand basic analytics concepts

### 7.2 Constraints
- **CO-001**: Application depends on third-party API availability
- **CO-002**: OAuth flows require proper redirect URI configuration
- **CO-003**: PDF export quality depends on browser rendering capabilities
- **CO-004**: Data refresh rates depend on third-party API rate limits
- **CO-005**: Some features (Goals, Tasks, Settings) are in placeholder state

---

## 9. Future Enhancements

### 8.1 Planned Features
- **FE-001**: Complete Goals management functionality
- **FE-002**: Complete Tasks management functionality
- **FE-003**: Complete Settings/Account Setup functionality
- **FE-004**: Database view for raw data access
- **FE-005**: Client management and grouping
- **FE-006**: Automated report scheduling and email delivery
- **FE-007**: Report approval workflow
- **FE-008**: Multi-user collaboration features
- **FE-009**: White-labeling options for agencies
- **FE-010**: Advanced analytics and insights

### 8.2 Integration Expansions
- **FE-011**: Additional e-commerce platforms (BigCommerce, Magento)
- **FE-012**: Additional social media platforms (Instagram, LinkedIn, Twitter)
- **FE-013**: Additional advertising platforms (Google Ads, Microsoft Advertising)
- **FE-014**: CRM integrations (Salesforce, HubSpot)

---

## 10. Success Metrics

### 9.1 User Adoption
- Number of registered users
- Number of active integrations per user
- Number of reports created per user

### 9.2 Engagement
- Average session duration
- Number of dashboard views
- Number of reports exported

### 9.3 Performance
- API response times
- Page load times
- PDF export success rate

---

## 11. Appendix

### 10.1 Glossary
- **Integration**: Connection to an external data source (e.g., Google Analytics, Shopify)
- **Widget**: A visual component in a dashboard or report (e.g., chart, table, metric)
- **Slide**: A page within a multi-page report
- **OAuth**: Authorization framework for third-party access
- **JWT**: JSON Web Token used for authentication

### 10.2 Acronyms
- **API**: Application Programming Interface
- **BRD**: Business Requirements Document
- **FR**: Functional Requirement
- **NFR**: Non-Functional Requirement
- **OAuth**: Open Authorization
- **JWT**: JSON Web Token
- **SPA**: Single Page Application
- **UI**: User Interface
- **UX**: User Experience

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| Business Analyst | | | |

---

**Document Status**: Draft  
**Last Updated**: January 2025  
**Next Review Date**: TBD


