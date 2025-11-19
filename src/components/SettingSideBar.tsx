function SettingSideBar() {
  return (
    <div className="w-60 sticky top-0 border-r left-0 bottom-0 bg-white h-screen p-6">
      <div className="">
        <div className="font-semibold">Account</div>
        <div className="mt-3">
          <div className="px-2 my-3 text-sm cursor-pointer hover:border-l-slate-300 hover:duration-300 font-medium border-l-2 border-blue-500">
            Company Details
          </div>
          <div className="px-2 my-3 cursor-pointer hover:border-l-slate-300 hover:duration-300 text-gray-600 text-sm font-normal border-l-2 border-white">
            User Profile
          </div>
          <div className="px-2 my-3 cursor-pointer hover:border-l-slate-300 hover:duration-300 text-gray-600 text-sm font-normal border-l-2 border-white">
            Linked Accounts
          </div>
        </div>

        <div className="font-semibold mt-6">Security</div>
        <div className="mt-3">
          <div className="px-2 my-3 cursor-pointer text-sm hover:border-l-slate-300 hover:duration-300 text-gray-600 font-normal border-l-2 border-white">
            Change Password
          </div>
        </div>




          <div className="font-semibold mt-6">Data</div>
        <div className="mt-3">
          <div className="px-2 my-3 cursor-pointer hover:border-l-slate-300 hover:duration-300 text-sm text-gray-600 font-normal border-l-2 border-white">
           Data Import
          </div>
        </div>


      </div>
    </div>
  );
}

export default SettingSideBar;
