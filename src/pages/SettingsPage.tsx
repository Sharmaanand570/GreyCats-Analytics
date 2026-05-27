import { useState } from "react";
import SettingSideBar from "@/components/SettingSideBar";

// Components
import CompanyDetailsForm from "@/components/CompanyDetailsForm";
import PersonalInformation from "@/components/settings/PersonalInformation";
import ReportSettings from "@/components/settings/ReportSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import { ProviderManager } from "@/features/broadcasts/components/ProviderManager";
import AISettings from "@/components/settings/AISettings";


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("personal-info");

  // Render the active component
  const renderContent = () => {
    switch (activeTab) {
      case "personal-info":
        return <PersonalInformation />;
      case "company-details":
        return <CompanyDetailsForm />;
      case "report-settings":
        return <ReportSettings />;
      case "security-settings":
        return <SecuritySettings />;
      case "broadcast-settings":
        return <ProviderManager />;
      case "ai-settings":
        return <AISettings />;
      default:
        return <PersonalInformation />;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full my-4 bg-card text-card-foreground  flex flex-col shadow-sm">
        {/* Header */}
        <div className="h-[4em] border-b px-8 flex items-center justify-between bg-card/50 backdrop-blur-sm">
          <span className="font-medium text-xl">Account Setup</span>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar */}
          <div>
            <SettingSideBar activeTab={activeTab} setActive={setActiveTab} />
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-muted/10">
            <div className="max-w-4xl mx-auto pb-20">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
