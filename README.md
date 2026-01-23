# GreyCats Analytics Platform

> **Unify your marketing data, automate your reporting, and deliver insights that drive results.**

GreyCats Analytics is a comprehensive multi-platform analytics and reporting platform designed to help agencies and businesses aggregate, visualize, and report on data from multiple marketing and e-commerce platforms in a unified dashboard.

## 🎯 Overview

GreyCats Analytics streamlines the process of collecting, analyzing, and reporting marketing data across multiple platforms. Built for marketing agencies and businesses managing multi-platform campaigns, it provides a centralized hub for all your analytics needs.

### Key Benefits

- **Centralize Data Sources** - Connect and manage multiple data sources in one platform
- **Streamline Reporting** - Create professional, customizable reports with drag-and-drop functionality
- **Real-time Insights** - Access live data visualizations across all connected platforms
- **Automated Delivery** - Schedule automated report generation and client delivery
- **Save Time** - Eliminate manual data aggregation and report creation

## ✨ Features

### 📊 Multi-Platform Integration

Connect seamlessly with major marketing and e-commerce platforms:

- **Google Analytics** - Website analytics and user behavior tracking
- **Google Search Console** - Search performance and SEO metrics
- **YouTube** - Channel analytics and video performance
- **Facebook** - Page insights and engagement metrics
- **Meta Ads** - Advertising campaign performance
- **Shopify** - E-commerce analytics and sales data
- **WooCommerce** - Store metrics and product performance
- **Quora** - Advertising metrics and campaign data

### 📈 Interactive Dashboards

- Customizable widget-based layouts
- Real-time metric cards with trend indicators
- Interactive charts (line, pie, column, area)
- Drag-and-drop dashboard customization
- Responsive design for all devices

### 📄 Advanced Report Builder

Create professional reports with:

- **Multi-slide presentations** with customizable layouts
- **Rich widget library** including:
  - Title blocks with custom styling
  - Data tables with configurable columns
  - Interactive charts (Recharts integration)
  - Metric cards with KPI tracking
  - Image and embed widgets
  - Map widgets for location data
- **Drag-and-drop interface** powered by React Grid Layout
- **PDF export** for client delivery
- **Date range selection** for time-based reporting
- **Real-time preview** of all changes

### 🎯 Goals & Alerts

- Set performance goals and track progress
- Create metric-based alerts with custom thresholds
- Configure notification intervals (daily, weekly, monthly)
- Monitor multiple clients and campaigns

### 🔐 Security & Authentication

- JWT-based authentication
- OAuth 2.0 integration for third-party platforms
- Secure API key management
- Protected routes and role-based access

## 🛠️ Technology Stack

### Core Framework
- **React** 19.1.1 - Modern UI library
- **TypeScript** 5.9.3 - Type-safe development
- **Vite** 7.1.7 - Lightning-fast build tool

### State Management
- **TanStack Query** 5.90.10 - Server state management and caching
- **Zustand** 5.0.8 - Lightweight client state management
- **React Hook Form** 7.66.1 - Performant form handling

### UI & Styling
- **Tailwind CSS** 3.4.14 - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautiful, customizable components
- **Lucide React** - Icon library

### Data Visualization
- **Recharts** 3.3.0 - Composable charting library
- **React Grid Layout** 1.5.2 - Drag-and-drop grid layouts

### Utilities
- **Axios** 1.13.2 - HTTP client with interceptors
- **Zod** 4.1.12 - Schema validation
- **date-fns** 4.1.0 - Date manipulation
- **React Router DOM** 7.9.5 - Client-side routing

### PDF Generation
- **@react-pdf/renderer** 4.3.1 - PDF document creation
- **html2canvas** 1.4.1 - HTML to canvas conversion
- **jspdf** 3.0.3 - PDF generation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API server (see backend repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd greycats-analytics-v1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm test` - Run test suite with Vitest

## 📁 Project Structure

```
greycats-analytics-v1/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components (Sidebar, Header)
│   │   └── ...             # Feature-specific components
│   ├── features/           # Feature-based modules
│   │   ├── auth/           # Authentication logic
│   │   ├── dashboard/      # Dashboard features
│   │   ├── reports/        # Report builder and management
│   │   ├── integrations/   # Data source integrations
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and helpers
│   ├── services/           # API service layer
│   ├── types/              # TypeScript type definitions
│   ├── pages/              # Page components
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── dist/                   # Production build output
├── BRD.md                  # Business Requirements Document
└── package.json            # Project dependencies
```

## 🔧 Configuration

### API Configuration

The application uses environment variables for API configuration:

```typescript
// .env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Tailwind Configuration

Custom Tailwind configuration is available in `tailwind.config.js` for theme customization.

### TypeScript Configuration

- `tsconfig.json` - Base TypeScript configuration
- `tsconfig.app.json` - Application-specific settings
- `tsconfig.node.json` - Node/Vite-specific settings

## 🧪 Testing

The project uses Vitest for unit and integration testing:

```bash
npm test              # Run tests
npm test -- --watch   # Run tests in watch mode
npm test -- --ui      # Run tests with UI
```

## 📦 Building for Production

1. **Create production build**
   ```bash
   npm run build
   ```

2. **Preview production build**
   ```bash
   npm run preview
   ```

The build output will be in the `dist/` directory, ready for deployment.

## 🔌 API Integration

The application communicates with a backend API for:

- User authentication and authorization
- Integration management (OAuth flows, API keys)
- Report CRUD operations
- Dashboard data aggregation
- Goals, alerts, and task management

Ensure the backend API is running and accessible at the URL specified in `VITE_API_BASE_URL`.

## 🎨 UI Components

The application uses shadcn/ui components built on Radix UI primitives. Components are located in `src/components/ui/` and can be customized via `components.json`.

To add new shadcn/ui components:
```bash
npx shadcn-ui@latest add <component-name>
```

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test your changes before submitting
5. Update documentation as needed

## 📝 Code Style

- **ESLint** - Enforces code quality and consistency
- **TypeScript** - Strict mode enabled for type safety
- **Prettier** - Code formatting (if configured)

Run linting:
```bash
npm run lint
```

## 🐛 Troubleshooting

### Common Issues

**Issue: API requests failing**
- Verify `VITE_API_BASE_URL` is correctly set in `.env`
- Ensure backend server is running
- Check browser console for CORS errors

**Issue: OAuth redirects not working**
- Verify redirect URIs are configured in platform settings
- Check that callback routes are properly defined

**Issue: Build errors**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

## 📚 Additional Resources

- [Business Requirements Document](./BRD.md) - Detailed feature specifications
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [TanStack Query Documentation](https://tanstack.com/query)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 📄 License

[Specify your license here]

## 👥 Support

For questions or issues, please contact the development team or create an issue in the repository.

---

**Built with ❤️ by the GreyCats Team**
