import CompanyDetailsForm from "@/components/CompanyDetailsForm";
import SettingSideBar from "@/components/SettingSideBar";

function SettingsPage() {
  return (
    <div className="w-full h-screen flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        {/* Header */}
        <div className="w-full h-[4.8em] bg-white border-b flex justify-between items-center px-4 sm:px-5">
          <span className="font-medium text-lg sm:text-xl">Settings</span>
        </div>

        <div className="flex-1 relative h-full  flex">
          <SettingSideBar />
          <div className="w-full p-10 overflow-y-scroll">
            <CompanyDetailsForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
