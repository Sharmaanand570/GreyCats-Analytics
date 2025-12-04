export default function SettingSideBar() {
  return (
    <>
      {/* ⭐ Mobile (top horizontal menu) */}
      <div className="md:hidden w-full border-b overflow-x-auto px-3 py-3 flex gap-6 whitespace-nowrap bg-card sticky top-0 z-40 text-foreground">
        <div className="font-medium text-primary border-b-2 border-primary pb-1">
          Company
        </div>
        <div className="text-muted-foreground">Profile</div>
        <div className="text-muted-foreground">Linked</div>
        <div className="text-muted-foreground">Security</div>
        <div className="text-muted-foreground">Data</div>
      </div>

      {/* ⭐ Desktop Sidebar */}
      <aside className="hidden md:block w-60 border-r h-full p-6 sticky top-0 bg-card text-card-foreground">

        <div className="font-semibold">Account</div>
        <div className="mt-3 space-y-2">
          <div className="px-2 py-2 text-sm cursor-pointer font-medium border-l-2 border-primary bg-accent/50">
            Company Details
          </div>
          <div className="px-2 py-2 text-sm cursor-pointer text-muted-foreground border-l-2 border-transparent hover:border-muted">
            User Profile
          </div>
          <div className="px-2 py-2 text-sm cursor-pointer text-muted-foreground border-l-2 border-transparent hover:border-muted">
            Linked Accounts
          </div>
        </div>

        <div className="font-semibold mt-6">Security</div>
        <div className="mt-3 space-y-2">
          <div className="px-2 py-2 text-sm cursor-pointer text-muted-foreground border-l-2 border-transparent hover:border-muted">
            Change Password
          </div>
        </div>

        <div className="font-semibold mt-6">Data</div>
        <div className="mt-3 space-y-2">
          <div className="px-2 py-2 text-sm cursor-pointer text-muted-foreground border-l-2 border-transparent hover:border-muted">
            Data Import
          </div>
        </div>

      </aside>
    </>
  );
}
