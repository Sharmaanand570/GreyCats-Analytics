import { useUserStore } from "@/utils/useUserStore";
import { getProfileImageUrl } from "@/utils/imageUtils";

type SlideContainerProps = {
  title: string;
  containerRef: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
  id?: string;
  dateRange?: string;
};

export default function SlideContainer({ title, containerRef, children, id, dateRange }: SlideContainerProps) {
  const { user } = useUserStore();

  // Don't render anything if neither name nor logo is present


  return (
    <div
      id={id}
      ref={containerRef}
      className="w-full md:w-[95%] lg:w-[90%] h-auto my-4 md:my-6 lg:my-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] pb-8 md:pb-10 lg:pb-12 rounded-xl md:rounded-2xl bg-white/40 backdrop-blur-sm border border-black/[0.03] relative"
    >
      <div className="p-4 md:p-6 mb-2 md:mb-4 border-b border-black/[0.03]">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
          {title}
        </h1>
        {dateRange && (
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {dateRange}
          </p>
        )}
      </div>
      {children}

      {/* Company Footer */}
      {/* Greycats Footer (Bottom Left) */}
      <div className="absolute bottom-4 left-6 flex items-center gap-2 opacity-50 pointer-events-none">
        <img
          src="/src/assets/images/greycats-black-logo.png"
          alt="GreyCats Analytics"
          className="h-6 object-contain"
        />
      </div>

      {/* Company/User Footer (Bottom Right) */}
      <div className="absolute bottom-4 right-6 flex items-center gap-2 opacity-50 pointer-events-none">
        <span className="text-xs text-gray-400 font-medium">
          {user?.companyName || user?.fullName || "User"}
        </span>
        {user?.companyLogo ? (
          <img
            src={getProfileImageUrl(user.companyLogo)}
            alt={user.companyName || "Company Logo"}
            className="h-6 w-6 object-cover rounded-full"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium border border-gray-200">
            {(user?.companyName || user?.fullName || "U").charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
