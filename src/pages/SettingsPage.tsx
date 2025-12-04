import CompanyDetailsForm from "@/components/CompanyDetailsForm";
import SettingSideBar from "@/components/SettingSideBar";

export default function SettingsPage() {
  return (
    <div className="w-full h-screen flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full my-4 bg-card text-card-foreground  flex flex-col shadow-sm">
        {/* Header */}
        <div className="h-[4em] border-b px-5 flex items-center justify-between">
          <span className="font-medium text-xl">Settings</span>
        </div>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar displays only on desktop */}
          <div className="hidden md:block">
            <SettingSideBar />
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
            <CompanyDetailsForm />
          </div>
        </div>
      </div>
    </div>
  );
}
