

interface SettingSideBarProps {
  activeTab: string;
  setActive: (tab: string) => void;
}

export default function SettingSideBar({ activeTab, setActive }: SettingSideBarProps) {

  const menuItems = [
    {
      category: "Account",
      items: [
        { id: "personal-info", label: "Personal Information" },
        { id: "company-details", label: "Company Details" },
      ]
    },
    {
      category: "Security",
      items: [
        { id: "security-settings", label: "Security Settings" },
      ]
    },
    {
      category: "Communication",
      items: [
        { id: "broadcast-settings", label: "Broadcast Channels" },
      ]
    },
  ];

  return (
    <>
      {/* ⭐ Mobile (top horizontal menu) */}
      <div className="md:hidden w-full border-b overflow-x-auto px-3 py-3 flex gap-6 whitespace-nowrap bg-card sticky top-0 z-40 text-foreground no-scrollbar">
        {menuItems.flatMap(group => group.items).map((item) => (
          <div
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`cursor-pointer font-medium pb-1 ${activeTab === item.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* ⭐ Desktop Sidebar */}
      <aside className="hidden md:block w-72 border-r h-full p-6 sticky top-0 bg-card text-card-foreground overflow-y-auto">

        {menuItems.map((group) => (
          <div key={group.category} className="mb-6">
            <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">{group.category}</div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors
                                ${activeTab === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                            `}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        ))}

      </aside>
    </>
  );
}
