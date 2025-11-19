import { Routes, Route } from "react-router-dom";
import MainSideBar from "./components/MainSideBar";
import Dashboard from "./components/Dashboard";
// import Clients from "./components/Clients";
import Reports from "./components/Reports";
import ReportBuilder from "./components/ReportBuilder";
import Goals from "./pages/GoalsPage";
import AlertsPage from "./pages/AlertsPage";
import TasksPage from "./pages/TasksPage";
import AuthPage from "./features/Authantication/componenets/AuthPage";
import Integrations from "./components/Integrations";
import YouTubeCallbackHandler from "./components/YouTubeCallbackHandler";
import GoogleCallbackHandler from "./components/GoogleCallbackHandler";
import GoogleConsoleCallbackHandler from "./components/GoogleConsoleCallbackHandler";
import YouTubeDetailPage from "./pages/YouTubeDetailPage";

import EditDashboard from "./components/EditDashboard";
import SettingsPage from "./pages/SettingsPage";
import AuthParentComp from "./features/Authantication/componenets/AuthParentComp";
// import ClientDetailComponenet from "./components/ClientDetailComponenet";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainSideBar />}>
        <Route path="/">
          <Route index element={<Dashboard />} />
          <Route path="/edit-dashboard" element={<EditDashboard />} />
        </Route>

        <Route path="/auth" element={<AuthParentComp />}>
        <Route path="login" element={<AuthPage />} />
        <Route path="signup" element={<AuthPage />} />
        </Route>

        <Route path="/data-sources" element={<Integrations />} />
        <Route path="/data-sources/youtube" element={<YouTubeDetailPage />} />

        {/* <Route path="clients" >
          <Route index element={<Clients/>} />
          <Route path=":id" element={<ClientDetailComponenet/>} />
        </Route> */}

        <Route path="reports">
          <Route index element={<Reports />} />
          <Route path=":id" element={<ReportBuilder />} />
        </Route>

        
        <Route path="goals" element={<Goals />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="tasks" element={<TasksPage />} />

        <Route path="account-setup" element={< SettingsPage />} />
      </Route>

      {/*connections callback */}
      <Route path="/youtube/callback" element={<YouTubeCallbackHandler />} />
      <Route path="/google/callback" element={<GoogleCallbackHandler />} />
      <Route path="/google-console/callback" element={<GoogleConsoleCallbackHandler />} />
    </Routes>
  );
}

export default App;
